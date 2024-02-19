
import express = require('express')
import { checkAuth, getUserPermissions, hasRole, isOwner,} from './checkAuth'
import { deleteParentAndChildren } from './delete_and_then_notify'
import { addChild } from './family'
import { addNotifyCallback, notifyCallbacks, notifySpecific } from './notify'
import { SyncData } from './sync-data'
import { createUserIfDoesNotExist, getCurrentUser } from './users'
import * as EmailValidator from 'email-validator';
import { modelNames, restrictedAccessToModel } from './roles-and-models'


var channelName = 'abc'
var mongoose = require('mongoose');

function getModelName(referenceTo: string) {
    return referenceTo[0].toUpperCase() + referenceTo.substring(1)
}

export function registerRole(modelName: string, referenceTo: string, url: string) {
    // Run only once per modelName.
    addChild(getModelName(referenceTo), modelName, `${url}/${referenceTo}/:_id`)
    // We will also add User as a parent. But not yet. We need to allow multiple parents first.
    addNotifyCallback( modelName, doc => {return {channelName, url: `${url}/${referenceTo}/${doc[referenceTo]}`}})
}

export function getGetFunc(referenceTo: string, modelName: string) {

    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

        var referenceToModelName = getModelName(referenceTo)
        var model = modelNames[modelName]
        var reference_id = mongoose.Types.ObjectId(req.params._id) // competition_id or club_id
        var syncData = <SyncData>{}
        syncData.channelName = channelName
        syncData.rows = []

        try {

            if (await hasRole(req.user, referenceToModelName, reference_id, restrictedAccessToModel[referenceToModelName])) {
                syncData.rows = await model.find({ [referenceTo]: reference_id }).populate('user')
            }

            res.json(syncData)

        } catch (error) {
            next(error)
        }

    }
}


export function validateEmail(req: express.Request, res: express.Response, next: express.NextFunction) { 

    var email = req.body.email 
    if (EmailValidator.validate(email)) {
        next()
    } else {
        next(new Error('Invalid email address.'))
    }
}

export function getPostFuncs(modelName: string, referenceTo: string) {

    return [checkAuth(getModelName(referenceTo), 'body', `${referenceTo}_id`, true), 
            validateEmail,
            async (req: express.Request, res: express.Response, next: express.NextFunction) => {

                var model/*: Model*/ = modelNames[modelName]
                var referenceModel = modelNames[getModelName(referenceTo)]
                var email = req.body.email
                var reference_id = mongoose.Types.ObjectId(req.body[`${referenceTo}_id`])

                try {
                    // https://mongoosejs.com/docs/tutorials/findoneandupdate.html

                    var user = await createUserIfDoesNotExist(email)
                    var result = await model.findOneAndUpdate( {
                                                                user: user._id, [referenceTo]: reference_id
                                                            }, 
                                                            {
                                                                user: user._id
                                                            },
                                                            {
                                                                new: true,
                                                                upsert: true,
                                                                rawResult: true // Return the raw result from the MongoDB driver
                                                            })


                    var doc = result.value
                    if (!result.lastErrorObject.updatedExisting) {
                        var docPop = await model.findById(doc._id).populate('user')

                        var referenceDoc = await referenceModel.findById(reference_id)
                        notifyCallbacks(modelName, 'new', docPop)
                        var url = `api/permissions/${modelName.toLowerCase()}/${doc.user}`
                        notifySpecific(getModelName(referenceTo), 'new', referenceDoc, undefined, channelName, url)

                    }
                    res.json(doc)

                } catch (error) {
                    next(error)
                }
            }]
}


export function getDeleteFunc(modelName: string, referenceTo: string) {

    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

        var _id = mongoose.Types.ObjectId(req.params._id)
        var model = modelNames[modelName]

        var result = await getUserPermissions(req.user, modelName, _id)
        if (!result.authorized) {
            next(Error('Not authorized.'))
        }
        else {
            try {
                var user = await getCurrentUser()
                var doc = await model.findOne(_id)

                if (!user) {
                    next(Error('Not authorized.'))
                }

                else if (!doc) {
                    next(Error(`Could not find ${modelName.toLowerCase()}.`))
                }

                if (doc) {
                    await deleteParentAndChildren(modelName, _id)
                    var url = `api/permissions/${modelName.toLowerCase()}/${doc.user}`
                    notifySpecific(getModelName(referenceTo), 'delete', { _id: doc[referenceTo] }, undefined, channelName, url)

                    res.json({ _id })
                }

            } catch (error) {
                next(error)
            }
        }
    }
}