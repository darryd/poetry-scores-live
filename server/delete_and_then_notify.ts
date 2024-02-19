import { Types } from 'mongoose'
import { notify, notifyCallbacks } from './notify'
import { getChildren } from './family'
import { modelNames } from './roles-and-models'


var funcBeforeDelete : {[key: string]: (object: any) => void | Promise<void>} = {}

export function callFuncBeforeDeleting(modelName: string, func: (object: any) => void | Promise<void>) {
    funcBeforeDelete[modelName] = func
}

export async function deleteParentAndChildren(modelName: string, _id: Types.ObjectId, isNotify=true) {

    var children = getChildren(modelName)
    var promises: Promise<any>[] = []

    promises = children.map(async child => {
        var promises: Promise<any>[] = []

        var model = modelNames[child.name];
        var filter = {[modelName.toLocaleLowerCase()]: _id}
        var childDocs = await model.find(filter)

        promises = childDocs.map(async (doc: any) => {
            await deleteParentAndChildren(child.name, doc._id, false)
        })
        
        await Promise.all(promises)
    })

    await Promise.all(promises)
    var model = modelNames[modelName]
    var doc = await model.findById(_id)
    if (doc) {
        // Run any pre-remove function
        if (funcBeforeDelete[modelName]) {
            await funcBeforeDelete[modelName](doc)
        }
        await doc.remove()
        if (isNotify) {
            notifyCallbacks(modelName, 'delete', doc)
            notify('obituary', {modelName, _id})
        }
    }
    else {
        console.log(`couldn't find ${modelName} ${_id}`)

    }
}