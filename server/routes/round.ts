import express = require('express')
import { Router} from 'express'
var router = Router()
import { roundModel, RoundUpdatableFields } from '../model/round'
import { addNotifyCallback, notifyCallbacks } from '../notify'
import { competitionModel } from '../model/competition'
import { callFuncBeforeDeleting, deleteParentAndChildren } from '../delete_and_then_notify'
import { SyncData } from '../sync-data'
import { updateField } from '../update-field'
import { checkAuth } from '../checkAuth'
import { performanceModel } from '../model/performance'
import { Types } from 'mongoose'
import { scoreModel } from '../model/score'
import { getOrderValue, switchPositions } from '../order'
import { addChild, getAncestor } from '../family'

var mongoose = require('mongoose');


var channelName = 'abc'

module.exports = router

callFuncBeforeDeleting('Round', async (round) => {

    try {
        var subsequentRounds = await roundModel.find({ previousRound: round._id })

        if (subsequentRounds) {

            subsequentRounds.forEach(async round => {
                round.previousRound = undefined
                round.incomingRank = undefined

                await round.save()
                notifyCallbacks('Round', 'update', round)
            })
        }
    } catch (error) {
        console.error(error)
    }
})

addNotifyCallback('Round', round => { return {channelName, url:`api/round/competition/${round.competition}`}})
addChild('Competition', 'Round', 'api/round/competition/:_id')
router.get('/competition/:_id', async (req: express.Request, res: express.Response, next) => {

    var syncData = <SyncData> {}
    syncData.channelName = channelName

    try {
        var competition_id = req.params['_id']

        var competition = await competitionModel.findById(competition_id)

        if (competition) {
            var rounds = await roundModel.find({competition: competition_id})

            syncData.rows = rounds
            res.json(syncData)
        }
        else {
            next(new Error(`Could not find competition with id ${competition_id}.`))
        }

    } catch (error) {
        next(error)
    }
})

async function checkPreviousRound(competition_id: Types.ObjectId, previousRound_id: Types.ObjectId, round_id?: Types.ObjectId) {

    console.log('checkPreviousRound()')

    console.log('competition_id', competition_id)
    console.log('previousRound_id', previousRound_id)
    console.log('round_id?', round_id)

    if (!previousRound_id) {
        return {result: true}
    }

    var previousRound = await roundModel.findById(previousRound_id)
    if (!previousRound) {
        return {result: false, reason: 'Previous round must exist.'}
    }

    if (previousRound.competition === competition_id) {
        return {result: false, reason: 'The previous Round must belong to the same competition.'}
    }

    if (round_id) {
        while (previousRound) {
            if (previousRound._id === round_id) {
                return {result: false, reason: 'No circular routes. A previous round (or any of its previous rounds) cannot have the current round as a previous round.'}
            }
            if (previousRound.previousRound) {
                previousRound = await roundModel.findById(previousRound.previousRound)
            }
            else {
                break
            }
        }
    }

    return {result: true}
}


router.post('/', checkAuth('Competition', 'body', 'competition_id'), async (req: express.Request, res: express.Response, next ) => {

    try {
        var round = new roundModel()
        round.competition = req.body.competition_id
        round.title = req.body.title
        round.numJudges = req.body.numJudges
        round.removeMinAndMaxScores = req.body.removeMinAndMaxScores
        round.isCumulative = req.body.isCumulative
        round.previousRound = req.body.previousRound
        round.timeLimit = req.body.timeLimit
        round.grace = req.body.grace

        if (round.previousRound && round.competition) {
            var result = await checkPreviousRound(round.competition, round.previousRound)

            if (!result.result) {
                next(Error(result.reason))
            }
        }

        await round.save()
        notifyCallbacks('Round', 'new', round)
        res.json(round)
    } catch (error) {
        next(error)
    }
})

router.patch('/', checkAuth('Round', 'body', '_id'), async (req: express.Request, res: express.Response, next) => {

    if (req.body.value === 'undefined') {
        req.body.value = undefined
    }

    if (req.body.field === 'previousRound' && req.body.value !== undefined) {

        var competition = await getAncestor('Competition', 'Round', await roundModel.findById(req.body._id))

        if (competition) {
            var result = await checkPreviousRound(competition.object._id, req.body.value, req.body._id)
            if (!result.result) {
                console.error('Error Error', result)
                return next (new Error(result.reason))
            }
        }
        else {
            return next(new Error('Could not find competition.'))
        }
    }

    updateField('Round', roundModel, RoundUpdatableFields , req, res, next)
})

async function adjustNumberJudgesForPerformances(round_id: Types.ObjectId) {

    var round = await roundModel.findById(round_id)

    if (round) {
        var numJudges = round.numJudges
        var performances = await performanceModel.find({ round: round_id })

        performances.map(async performance => {

            var scores = await scoreModel.find({ performance: performance._id })
            for (var i=0; i<Math.max(scores.length, numJudges); i++) {

                if (i > numJudges - 1) {
                    var score = scores[i]
                    deleteParentAndChildren('Score', score._id)
                } else if (i > scores.length - 1) {
                    var score = new scoreModel()
                    score.performance = performance._id
                    score.order = getOrderValue() + i
                    await score.save()
                    notifyCallbacks('Score', 'new', score)
                }
            }
        })
    }
}

router.patch('/numJudges', checkAuth('Round', 'body', '_id'), async (req: express.Request, res: express.Response, next) => {
    try {

        var round = await roundModel.findById(req.body._id)
        if (round) {
            console.log(req.body)
            round.numJudges = req.body.value
            await round.save()
            notifyCallbacks('Round', 'update', round)
            adjustNumberJudgesForPerformances(req.body._id)
            res.json(round)
        }
        else {
            next(new Error(`Couldn't find round with _id === ${req.body._id}.`))
        }

    } catch(error) {
        next(error)
    }
})

router.patch('/switch', checkAuth('Round', 'body', 'id_1'), checkAuth('Round', 'body', 'id_2'), 
                        async (req: express.Request, res: express.Response, next) => {
    try {
        const id_1 = req.body.id_1
        const id_2 = req.body.id_2

        const rounds = await switchPositions(roundModel, id_1, id_2)
        res.json(rounds)
        rounds.forEach(round => notifyCallbacks('Round', 'update', round))

    } catch (error) {
        next(error)
    }
})
router.delete('/:_id', checkAuth('Round', 'params', '_id'), async (req: express.Request, res: express.Response, next) => {
    try {
        const _id = mongoose.Types.ObjectId(req.params._id)
        await deleteParentAndChildren('Round', _id)
        res.json({_id})
    } catch (error) {
        next(error)
    }
})