import express = require('express')
const router = express.Router();
import { Types } from 'mongoose'

import { competitionModel } from '../model/competition'
import { addNotifyCallback, notifyCallbacks } from '../notify';
import { addChild } from '../family'
import { SyncData } from '../sync-data';
import { SignupModel } from '../model/signup'
import { checkAuth } from '../checkAuth';
import { deleteParentAndChildren } from '../delete_and_then_notify';

module.exports = router

var channelName = 'abc'

addNotifyCallback('Signup', (signup) => {
    return { 
                channelName,
                url: `api/signup/competition/${signup.competition}` 
           }
})
addChild('Competition', 'Signup', 'api/signup/competition/:_id')
router.get('/competition/:_id', async (req: express.Request, res: express.Response, next) => {

    try {
        var syncData = <SyncData> {}
        syncData.channelName = channelName

        var _id = req.params._id
        var signups = await SignupModel.find({competition: _id})

        syncData.rows = signups
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})


router.post('/', checkAuth('Competition', 'body', 'competition_id'), async (req: express.Request, res: express.Response, next ) => {
  
    try {

        var poet = req.body.poet
        var competition_id = req.body.competition_id 

        var signup = await SignupModel.findOne({poet, competition: competition_id})
        if (signup) {
            res.json(signup)
        } else {

            if (await competitionModel.findById(competition_id)) {
                var newSignup = new SignupModel()
                newSignup.poet = poet
                newSignup.competition = competition_id

                await newSignup.save()
                res.json(newSignup)
                notifyCallbacks('Signup', 'new', newSignup)
            }
            else {
                next(new Error('Could not find competition.'))
            }
        }
    } catch (error) {
        next(error)
    }
})

router.delete('/:_id', checkAuth('Signup', 'params', '_id'), async (req: express.Request, res: express.Response, next) => {
    try {

        const _id = Types.ObjectId(req.params._id)
        await deleteParentAndChildren('Signup', _id)
        res.json({_id})
    } catch (error) {
        next(error)
    }
})