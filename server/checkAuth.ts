import express from "express";
import { Types } from "mongoose";
import { getAncestor, getObject, getParentDocs } from "./family";
import { AdminModel } from "./model/admin";
import { clubModel } from "./model/club";
import { scoreModel } from "./model/score";
import { ScorekeeperModel } from "./model/scorekeeper";
import { userModel } from "./model/user";
import { accessToModel, restrictedAccessToModel } from "./roles-and-models";
import * as EmailValidator from 'email-validator';

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

if (doesGodExist()) {
    console.log(`God: ${process.env.GOD}`)
}

export function checkAuth(modelName: string, _idIsInBodyOrParams: 'body' | 'params', _idFieldName: string, restricted: boolean = false) {

    return async function (req: express.Request, _res: express.Response, next: express.NextFunction) {

        var _id = (_idIsInBodyOrParams === 'body' ? req.body : req.params)[_idFieldName]

        var email = req.user
        var result = await getUserPermissions(email, modelName, _id, restricted)

        console.log(result)
        var isLocked = false;

        try {

            // We need to fix this!!!!!

            console.log('debugging...')
            console.log(`modelName  ${modelName}`)

             console.log('----------------------------------------------------------------')
             console.log(`is ${modelName} locked: result: ${await getIsLocked(modelName, await getObject(modelName, _id))}`)
             console.log('----------------------------------------------------------------')

             isLocked = await getIsLocked(modelName, await getObject(modelName, _id))
        } catch(error) {
            console.log(error)
        }

        if (result.authorized && !isLocked) {
            next()
        }
        else {
            console.error('Not authorized.')
            next(new Error('Not authorized.'))
        }
    }                            
}

// Precondition: the model is a Competiton or offspring.
async function isScoreKeeper(userStr: string, modelName: string, _id: Types.ObjectId) {


    var user = await userModel.findOne({email: userStr})
    var object = await getObject(modelName, _id)
    var competition = await getAncestor('Competition', modelName, object)

    // Check if this is the Demo Competition. Everyone one is a scorekeeper.
    if (competition) {
        var club = await getAncestor('Club', 'Competition', competition.object)

        if (club && club.object.name === 'demo') {
            return true
        }
    }

    if (user && competition) {
        var scorekeeper =  await ScorekeeperModel.findOne({competition: competition.object._id, user: user._id})
        return scorekeeper !== null
    }
    else {
        return false
    }
}


export async function isAdmin(email: string, modelName: string, _id: Types.ObjectId) {

    var user = await userModel.findOne({ email })
    var object = await getObject(modelName, _id)
    var club = await getAncestor('Club', modelName, object)

    if (user && club) {
        var admin = await AdminModel.findOne({club: club.object._id, user: user._id})

        return admin !== null
    }
    else {
        return false
    }
}

function doesGodExist() {
    return process.env.GOD !== undefined && EmailValidator.validate(process.env.GOD)
}

export function isThisGod(email: string) {
    return doesGodExist() && process.env.GOD === email
}

export async function isOwner(email: string, modelName: string, _id: Types.ObjectId) {

    if (isThisGod(email)) {
        return true
    }

    var object = await getObject(modelName, _id)

    var user = await userModel.findOne({ email })
    var club = await getAncestor('Club', modelName, object)
    if (club && user) {

        var cl = await clubModel.findOne({user: user._id, _id: club.object._id})
        return cl !== null
    } 
    return false
}

export async function getUserPermissions(email: string, modelName: string, _id: Types.ObjectId, restricted: boolean = false) {

    var checkRoles = {
        'scorekeeper': isScoreKeeper,
        'admin': isAdmin,
        'owner': isOwner
    }

    var roles = restricted ? restrictedAccessToModel[modelName] : accessToModel[modelName]
    var permissions : string[] = []

    await Promise.all(roles.map(async role => {

        if (await checkRoles[role](email, modelName, _id)) {
            permissions.push(role)
        }

        return permissions 
    }))

    return {authorized: permissions.length > 0, email, permissions}
}

export async function hasRole(email: string, modelName: string, _id: Types.ObjectId, roles: string[]) {

    if (email === undefined) {
        return false
    }

    var permissions = await getUserPermissions(email, modelName, _id)

    if (!permissions.authorized) {
        return false
    }

    return roles.map(role => permissions.permissions.find(r => r === role)).filter(hasRole => hasRole).length > 0
}

export async function getIsLocked(modelName: string, child: any) {
    if (child.isLocked) {
        return true
    }

    var result = await getParentDocs(modelName, child)

    for (var i=0; i<result.length; i++) {

        var r = await result[i]

        if (r.object.isLocked) 
            return true
    }

    return false
}

(async function(){


    var score = await scoreModel.findOne({})

    if (score) {

        var george = await userModel.findOne({email: 'george@gmail.com'})
        if (!george) {
            george = new userModel()
            george.email = 'george@gmail.com'
            await george.save()

            var competition = await getAncestor('Competition', 'Score', score)
            if (competition) {
                var scorekeeper = new ScorekeeperModel()
                scorekeeper.user = george._id
                scorekeeper.competition = competition.object._id
                await scorekeeper.save()
            }
        }
        var mike = await userModel.findOne({email: 'mike@gmail.com'})
        if (!mike) {
            mike = new userModel()
            mike.email = 'mike@gmail.com'
            await mike.save()

            var club = await getAncestor('Club', 'Score', score)
            if (club) {
                var admin = new AdminModel()
                admin.club = club.object._id
                admin.user = mike._id
                await admin.save()
            }
        }

        console.log('------------------------------------------------------')
        var result = await getUserPermissions('darry.d@gmail.com', 'Score', score._id)
        console.log(result)
        console.log('------------------------------------------------------')
        var result = await getUserPermissions('george@gmail.com', 'Score', score._id)
        console.log(result)
        console.log('------------------------------------------------------')
        var result = await getUserPermissions('mike@gmail.com', 'Score', score._id)
        console.log(result)
        console.log('------------------------------------------------------')
        var result = await getUserPermissions('cips@vancouverpoetryhouse.com', 'Score', score._id)
        console.log(result)
        console.log('------------------------------------------------------')
    }

    



})/*()*/