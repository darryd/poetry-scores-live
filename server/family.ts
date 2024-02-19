import { Types } from "mongoose";
import { modelNames } from "./roles-and-models";

import { Child } from './Child';
import { Generations } from './Generations'

var members: {[key: string]: string} = {}
var children :{[key: string]: Child[]} = {}
var parentsMultiple: {[key: string]: string[]} = {}

export function addMember(member: string, url: string) {
    members[member] = url
}

// A child will die if the parent dies. This might need clarification.
export function addChild(parent: string, child: string, url: string) {

    children[parent] = children[parent] || []
    children[parent].push({name: child, url})
    
    parentsMultiple[child] = parentsMultiple[child] || []
    parentsMultiple[child].push(parent)
}

export function getParents(child: string): string[] | undefined {
    return parentsMultiple[child]
}


export interface AllParents {
    name: string,
    isOmitted: boolean,
    parents?: AllParents[]
}

export interface ParentIds {
    name: string,
    _id: Types.ObjectId,
    parents?: any,
    objects?: any
}

export async function getAllParentIds(allParents: AllParents, _id: Types.ObjectId): Promise<ParentIds[]> {
    
    async function getParentIds(object: any, parents: AllParents[], objects?: any[]): Promise<any> {

        var result = []
        if (objects === undefined ) {
            objects = []
        }

        for (var i=0; i<parents.length; i++) {
            var p = parents[i]
            var fieldName = p.name.toLowerCase()
            var _id = object[fieldName]
            var parentObject = await getObject(p.name, object[fieldName])

            var isAlive = parentObject !== null && parentObject !== undefined

            objects.push({name: p.name, _id, isAlive})

            var resultParents
            if (p.parents && parentObject) {
                resultParents = (await getParentIds(parentObject, p.parents, objects)).result
            }

            result.push({name: p.name, _id, object: parentObject, isAlive, parents:  resultParents})
        }

        return {result, objects}
    }
    var result :ParentIds[] = []

    var object = await getObject(allParents.name, _id)

    if (object && allParents.parents) {
        var parentIds = await getParentIds(object, allParents.parents)
        result = result.concat(parentIds)

        return parentIds.objects
    }

    return []; // BOOKMARK Is this really an error?
}

export function getAllParents(child: string, omit?: string[]): AllParents {

    function isInOmit(c: string) {
        if (!omit) {
            return false
        }

        return omit.find(e => e === c) !== undefined
    }

    var isOmitted = isInOmit(child)
    var allParents: AllParents[] = []

    if (!isOmitted) {
        var parents = getParents(child)

        if (parents) {
            parents.forEach(p => {
                allParents.push(getAllParents(p, omit))
            })
        }
    }
    
    return {name: child, isOmitted, parents: isOmitted ? undefined : allParents}
}

export function getChildren(parent: string): Child[] {
    return children[parent] || []
}

export function getAllChildren(parent: string): Generations[] {
    
   var children = getChildren(parent)
   var generations = []
   
   for (var i=0; i<children.length; i++) {
       var kid = children[i]
       
       generations.push({kid, next: getAllChildren(kid.name)})
   }

   return generations
}


export async function getObject(modelName: string, _id: Types.ObjectId) {

    var model = modelNames[modelName]
    if (!model) {
        throw new Error(`Could not find ${modelName}`)
    }

    var object = await model.findById(_id)

    /*
    if (!object) {
        throw new Error(`modelName: ${modelName}. _id: ${_id}. No object found for _id = ${_id}`)
    }
    */

    return object
}


export async function getParentDocs(modelName: string, child: any) {
    var parentModelNames = getParents(modelName)

    if (!parentModelNames) {
        throw new Error(`Could not find ${parentModelNames}`)
    }

    var parentDocs = parentModelNames.map(async name => {

        return {modelName: name, object: await getObject(name, child[name.toLowerCase()])}
    })

    return parentDocs
}


export async function getAncestor(ancestorName: string, modelName: string, object: any)
:Promise<{
    modelName: string;
    object: any;
} | undefined> {

    var currentLevel = {modelName: modelName, object}

    if (currentLevel.modelName === undefined) {
        return undefined
    } else if (currentLevel.modelName === ancestorName) {
        return currentLevel
    } 

    var parentDocs = await getParentDocs(currentLevel.modelName, currentLevel.object)

    var ancestors = parentDocs.map(async parent => {
        var p = await parent
        return getAncestor(ancestorName, p.modelName, p.object)
    })

    return ancestors.find(r => r !== undefined)
}
