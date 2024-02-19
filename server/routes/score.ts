import express = require('express')
import { checkAuth } from '../checkAuth'
import { performanceModel } from '../model/performance'
import { scoreModel } from '../model/score'
import { addNotifyCallback, notifyCallbacks } from '../notify'
import { addChild } from '../family'
import { SyncData } from '../sync-data'
const router = express.Router()

module.exports = router

var channelName = 'abc'

addNotifyCallback('Score', async (score) => {

  try {
    var performance = await performanceModel.findById(score.performance)
    if (performance) {
      return {
                channelName,
                url: `api/score/performance/${performance._id}`
             }
    } else {
      return { channelName, url: ''} //TODO what to do here?
    }

  } catch (error) {
    console.log(error)
    return { channelName, url: ''} //TODO what to do here?
  }
})
addChild('Performance', 'Score', 'api/score/performance/:_id')
router.get('/performance/:_id', async (req: express.Request, res: express.Response, next) => {

  var syncData = <SyncData> {}
  syncData.channelName = channelName

  try {
    const performance_id = req.params._id
    var scores = await scoreModel.find({performance: performance_id})

    syncData.rows = scores
    res.json(syncData)
  } catch (error) {
    next(error)
  }
})

router.put('/', checkAuth('Score', 'body', 'score_id'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const _id = req.body.score_id
    const value = req.body.score

    const score = await scoreModel.findById(_id)

    if (!score) {
        const error = 'Score not found.'
        res.status(404).json({error})
        //notify('error', error)
        return
    }

    if (value !== undefined) {
      score.score = Number(value)
    } else {
      score.score = undefined
    }
    await score.save()

    res.json(score)
    notifyCallbacks('Score', 'update', score)

  }  catch (error) {
      next(error)
  }
})
