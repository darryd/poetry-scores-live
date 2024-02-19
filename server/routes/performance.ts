import express = require('express')
import { checkAuth } from '../checkAuth'
import { deleteParentAndChildren } from '../delete_and_then_notify'
import { addChild } from '../family'
import { PerformanceDoc, performanceModel as model, performanceModel, PerformanceUpdatableFields } from '../model/performance'
import { roundModel } from '../model/round'
import { ScoreDoc, scoreModel } from '../model/score'
import { addNotifyCallback, notifyCallbacks } from '../notify'
import { getOrderValue, switchPositions } from '../order'
import { SyncData } from '../sync-data'
import { updateField } from '../update-field'

var mongoose = require('mongoose');


var router = express.Router()

module.exports = router

var channelName = 'abc'

interface PerfomanceSwitch {
    doc1: PerformanceDoc,
    doc2: PerformanceDoc
}

function checkField(req: express.Request, res: express.Response, next: express.NextFunction) {
    const acceptableFields : {[id:string] : boolean}= {poet: true, minutes: true, seconds: true, penalty: true}
    const field = req.body.field

    if (acceptableFields[field]) {
        next()
    } else {
        const error = `Unacceptable field ${field}` 
        res.status(500).json({error})
        //notify('error', error)
    }
}

addChild('Round', 'Performance', 'api/performance/round/:_id')
addNotifyCallback('Performance', async (performance) => {

    var round = await roundModel.findById(performance.round)
    if (round) {
        return {
            channelName,
            url: `api/performance/round/${round._id}`
        }
    } else {
        return { channelName, url: ''} // TODO what to do here ?
    }
})
router.get('/round/:_id', async (req: express.Request, res: express.Response, next) => {
    var syncData = <SyncData> {}
    syncData.channelName = channelName

    try {
        var _id = req.params._id
        var performances = await model.find({round: _id})

        syncData.rows = performances
        res.json(syncData)
    } catch (error) {
        next(error)
    }
})


router.patch('/', checkAuth('Performance', 'body', '_id'), checkField, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    updateField('Performance', performanceModel, PerformanceUpdatableFields, req, res, next)
})

router.patch('/switch', checkAuth('Performance', 'body', 'id_1'), checkAuth('Performance', 'body', 'id_2'), 
                        async (req: express.Request, res: express.Response, next) => {
    try {
        const id_1 = req.body.id_1
        const id_2 = req.body.id_2

        const performances = await switchPositions(model, id_1, id_2)
        res.json(performances)
        performances.forEach(performance => notifyCallbacks('Performance', 'update', performance))

    } catch (error) {
        next(error)
    }
})

async function createScores(performance: PerformanceDoc) {
    
    const round_id = performance.round  
    const round = await roundModel.findById({_id: round_id})
    const scores: ScoreDoc[] = []

    if (round) {
        const numJudges = round.numJudges
        for (var i=0; i<numJudges; i++) {
            var score = new scoreModel()
            score.performance = performance._id
            score.order = getOrderValue() + i
            await score.save()
            scores.push(score)
        }
    }
    return scores
}

router.post('/', checkAuth('Round', 'body', 'round_id'), async (req: express.Request, res: express.Response, next) => {
    try {
        var performance = new model()
        performance.round = req.body.round_id
        performance.poet = req.body.poet
        performance.save()

        const scores = await createScores(performance)

        res.json({performance, scores})
        notifyCallbacks('Performance', 'new', performance)
        scores.forEach(score => notifyCallbacks('Score', 'new', score))
    }
    catch (error) {
        next(error)
    }
})

router.delete('/:_id', checkAuth('Performance', 'params', '_id'), async (req: express.Request, res: express.Response, next) => {
    try {
        const _id = mongoose.Types.ObjectId(req.params._id)
        await deleteParentAndChildren('Performance', _id)
        res.json({_id})
    } catch (error) {
        next(error)
    }
})
