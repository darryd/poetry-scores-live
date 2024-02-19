import express = require('express')
const router = express.Router()
import { addNotifyCallback, notifyCallbacks, notifySpecific } from '../notify'
import { clubModel } from '../model/club'
import { deleteParentAndChildren } from '../delete_and_then_notify'

import { SyncData } from '../sync-data'
import { checkAuth } from '../checkAuth'
import { getUser } from '../getUser'
import { getWatchers, Watchers } from '../number-of-viewers'
import { createUserIfDoesNotExist } from '../users'

module.exports = router

var channelName = 'abc'

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

addNotifyCallback('Club', _club =>  { return {channelName, url: '/api/club'}})
router.get('/', async (req: express.Request, res: express.Response, next) => {
    try {
        var syncData = <SyncData> {}
        syncData.channelName = channelName

        var clubs = await clubModel.find({name: 'demo'})
        clubs = clubs.concat(await clubModel.find({name: {$ne: 'demo'}}).select('-user -__v'))

        syncData.rows = clubs
        res.json(syncData)
    } 
    catch (error) {
        next(error)
    }    
})
 
addNotifyCallback('Club', club => {return {channelName, url: `/api/club/${club.name}`}})
router.get('/:name', async (req: express.Request, res: express.Response, next) => {

    try {
        var syncData = <SyncData> {}
        syncData.channelName = channelName

        var name = req.params.name
        var club = await clubModel.findOne({name}).select('-user -__v')
        
        if (club) {
            syncData.rows = [club]
            res.json(syncData)
        }
        else {
            next(new Error(`Could not find club with name ${name}.`))
        }
    }
    catch (error) {
        next(error)
    }

})

addNotifyCallback('Watchers', (watchers: Watchers) => {return {channelName, url: `api/club/watchers/${watchers.clubName}`}})
router.get('/watchers/:name', async (req: express.Request, res: express.Response, next) => {
    try {
        var syncData = <SyncData> {}
        syncData.channelName = channelName
        var name = req.params.name

        syncData.rows = await getWatchers(name)
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})

/* For now, only darry can create a club for free. */
router.post('/', async (req: express.Request, res: express.Response, next) => {


    var email = req.user
    var user = await getUser(req)

    if (email !== 'darry.d@gmail.com') {
        return next(new Error('Only darry can do this.'))
    }

    if (!req.user || !user) {
        next(new Error('User must be logged in to create a club.'))
        return
    }

    try {
        var club = new clubModel()
        club.user = user._id
        club.title = req.body.title
        club.name = req.body.name

        console.log('club', club)

        await club.save()
        res.json(club)
        notifyCallbacks('Club', 'new', club)
        
    } catch (error) {
        next(error)
    }
})

router.patch('/owner', checkAuth('Club', 'body', '_id', true), async (req: express.Request, res: express.Response, next) => {
    
    function notifyNewOwner(club: any) {
        var url = `api/permissions/owner/${club.user}`
        notifySpecific('Club', 'new', club, undefined, channelName, url)
    }

    function notifyPreviousOwner(oldClub: any) {
        var url = `api/permissions/owner/${oldClub.user}`
        notifySpecific('Club', 'delete', oldClub, undefined, channelName, url)
    }
    
    try {
        var club_id = req.body._id
        var newOwnerEmail = req.body.value

        if (newOwnerEmail === req.user) {
            return res.json(club_id)
        }

        var club = await clubModel.findById(club_id)

        if (!club) {
            next(new Error('Could not find club.'))
        } else {
            var user = await createUserIfDoesNotExist(newOwnerEmail)

            var oldClub = club.toObject()
            club.user = user._id
            await club.save()
            
            res.json(club)

            notifyNewOwner(club)
            notifyCallbacks('Club', 'update', club, oldClub)
            notifyPreviousOwner(oldClub)
        }
    } catch (error) {
        next(error)
    }
})


router.delete('/', checkAuth('Club', 'body', 'club_id'), async (req: express.Request, res: express.Response, next) =>{
    try {
        const club_id = req.body.club_id
        await deleteParentAndChildren('Club', club_id)
        res.json({club_id})
    } catch (error) {
        next(error)
    }
})

router.put('/', checkAuth('Club', 'body', 'club_id'), async (req: express.Request, res: express.Response, next) => {
    try {
        const club_id = req.body.club_id
        const title = req.body.title

        const club = await clubModel.findById(club_id).select('-user -__v')

        if (club) {
            club.title = title
            await club.save()
            res.json(club)
            notifyCallbacks('Club', 'update', club)
        } else {
            const error = new Error(`Could not find club ${club_id}`)
            next(error)            
        }

    } catch (error) {
        next(error)
    }
})