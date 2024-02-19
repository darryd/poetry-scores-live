import express = require('express')
const router = express.Router();

import { competitionModel, CompetitionUpdatableFields } from '../model/competition'
import { addNotifyCallback, notifyCallbacks } from '../notify';
import { clubModel } from '../model/club';
import { SyncData } from '../sync-data';
import { checkAuth, isOwner } from '../checkAuth';
import { addChild, getObject } from '../family';
import { notifyChangeWatchers } from '../number-of-viewers';
import { deleteParentAndChildren } from '../delete_and_then_notify';
import { updateField } from '../update-field';
import { Club, Competition } from '../roles-and-models';

var mongoose = require('mongoose');
module.exports = router

var channelName = 'abc'

addChild(Club, Competition, 'api/competition/:_id')
addNotifyCallback('Competition', async (competition) => {
    try {
        var club = await clubModel.findById(competition.club)
        if (club) {
            return { 
                    channelName,
                    url: `api/competition/club/${club['name']}`
                    }
        }
        else {
            console.error(`Could not find club for competition.`)
            return { channelName, url: ''} //TODO what to do here?
        }
    } catch (error) {
        console.error(error)
        return { channelName, url: ''}  //TODO what to do here?
    }
})
router.get('/club/:name', async (req: express.Request, res: express.Response, next) => {

    var syncData = <SyncData> {}
    syncData.channelName = channelName

    var name = req.params['name']
    try {
        var clubs = await clubModel.find({name})

        if (clubs.length > 0) {
            var club = clubs[0]
            var competitions = await competitionModel.find({club: club._id})

            syncData.rows = competitions
            res.json(syncData)
        }
        else {
            res.json([])
        }

    } catch(error) {
        next(error)
    }
})

//addChild('Club', 'Competition', 'api/competition/:_id') // Do we need a parameter dieIFParentDies?
addNotifyCallback('Competition', (competition) => {
    return { 
                channelName,
                url: `api/competition/${competition._id}` 
           }
})
router.get('/:_id', async (req: express.Request, res: express.Response, next) => {

    var syncData = <SyncData> {}
    syncData.channelName = channelName

    const _id = req.params['_id']

    try {
        const competition = await competitionModel.findById(_id).populate('club')
        syncData.rows = [competition]
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})

router.post('/', checkAuth('Club', 'body', 'club_id'), async (req: express.Request, res: express.Response, next) => {

    try {
        var competition = new competitionModel()
        competition.title = req.body.title
        competition.club = req.body.club_id

        var club = await clubModel.findById(competition.club)
        if (club) {
            await competition.save()
            res.json(competition)
            notifyCallbacks('Competition', 'new', competition)
            notifyChangeWatchers(competition._id, 'new')
        }
        else {
            next(new Error('Could not find club.'))            
        }
    } catch (error) {
        next(error)
    }
})

router.patch('/', checkAuth('Competition', 'body', '_id', true), async (req: express.Request, res: express.Response, next) => {

    if (req.body.value === 'undefined') {
        req.body.value = undefined
    }

    updateField('Competition', competitionModel, CompetitionUpdatableFields , req, res, next)
})

async function lock(req: express.Request, res: express.Response, isLocked: boolean) {

    var competition_id = req.body._id
    if (await isOwner(req.user, Competition ,competition_id)) {

        //var competition = await getObject(Competition, competition_id)

        var competition = await competitionModel.findById(competition_id).populate('club')

        if (competition) {
            competition.isLocked = isLocked
            await competition.save()
            res.json(competition)
            notifyCallbacks(Competition, 'update', competition)
        }
    }
    // TODO what if not the owner? error handling
}

router.patch('/lock', async(req: express.Request, res: express.Response) => {

    lock(req, res, true)
})

router.patch('/unlock', async(req: express.Request, res: express.Response) => {
    lock(req, res, false)
})

router.delete('/:_id', checkAuth('Competition', 'params', '_id', true), async (req: express.Request, res: express.Response, next) => {
    try {
        const _id = mongoose.Types.ObjectId(req.params._id)
        await deleteParentAndChildren('Competition', _id)
        res.json({_id})
    } catch (error) {
        next(error)
    }
})