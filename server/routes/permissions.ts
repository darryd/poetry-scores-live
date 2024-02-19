import express = require('express')
import { clubModel } from '../model/club'
import { ScorekeeperModel } from '../model/scorekeeper'
import { SyncData } from '../sync-data'
import { AdminModel } from '../model/admin'
import { addNotifyCallback, ChannelNameUrl, notifyCallbacks, notifySpecific } from '../notify'
import { getUser } from '../getUser'
import { competitionModel } from '../model/competition'
import { getCurrentUser } from '../users'
import { isThisGod } from '../checkAuth'
import { getDemoCompetition } from '../demo'
const router = express.Router()
module.exports = router

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}


var channelName = 'abc'

router.get('/user_id', async (req: express.Request, res: express.Response, next) => {

    try {

        var user = await getUser(req)


        console.log('---------------------------------')
        console.log('req.user', req.user)
        console.log('user', user)
        console.log('---------------------------------')


        if (user) {
            res.json({_id: user._id})
        }
        else {
            res.json({_id: undefined})
        }

    } catch (error) {
        next(error)
    }
})

addNotifyCallback('Club', async (club) => {

    var url
    var user = await getCurrentUser()

    if (user && club.user.equals(user._id)) {
        url = `api/permissions/owner/${user._id}`
    }
    
    return { channelName, url}
})

// TODO: Perhaps verify that _id is the same as the user that is logged in.
router.get('/owner/:_id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        var syncData = <SyncData>{}
        syncData.channelName = channelName

        try {
            var result: any[] = []
            var user = await getUser(req)

            if (isThisGod(req.user)) {
                result = await clubModel.find({})
            }
            else if (user) {
                result = await clubModel.find({ user: user._id })
            }

            syncData.rows = result
            res.json(syncData)
        } catch (error) {
            next(error)
        }
    })

/* 
addNotifyCallback('Competition', async (competition) => {
    url = '/api/permissions/scorekeeper'
    return { channelName, url }
})
*/

// You may only check clubs belonging to yourself.
// TODO: Perhaps verify that _id is the same as the user that is logged in.
router.get('/scorekeeper/:_id', async (req: express.Request, res: express.Response, next) => {
    var syncData = <SyncData> {}
    syncData.channelName = channelName

    try {
        var competitions: any[] = []
        var demoCompetition = await getDemoCompetition()

        if (demoCompetition) {
            competitions.push(demoCompetition)
        }

        var user = await getUser(req)
        console.log('user', user)
        if (user) {
            var scorekeepers
            scorekeepers = await ScorekeeperModel.find({ user: user._id })

            if (scorekeepers) {
                var promises = scorekeepers.map(async scorekeeper => {
                    var slams = await competitionModel.find({ _id: scorekeeper.competition })
                    competitions = competitions.concat(slams)
                })

                await Promise.all(promises)
            }
        }

        syncData.rows = competitions
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})

// TODO: should return clubs
// TODO: Perhaps verify that _id is the same as the user that is logged in.
router.get('/admin/:_id', async (req: express.Request, res: express.Response, next) => {
    var syncData = <SyncData> {}
    syncData.channelName = channelName

    try {
        var admins: any[] = []
        var clubs: any[] = []
        var user = await getUser(req)
        console.log('user', user)
        if (user) {
            admins = await AdminModel.find({ user: user._id })
            if (admins) {
                var promises = admins.map(async admin => {
                    var c = await clubModel.find({ _id: admin.club })
                    clubs = clubs.concat(c)
                })

                await Promise.all(promises)
            }
        }

        syncData.rows = clubs
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})