import express = require('express')
import { Scorekeeper } from '../roles-and-models'
import { registerRole, getGetFunc, getPostFuncs, getDeleteFunc } from '../roles'

const router = express.Router()
module.exports = router

registerRole(Scorekeeper, 'competition', 'api/scorekeeper')
router.get('/competition/:_id', getGetFunc('competition', Scorekeeper))
router.post('/', getPostFuncs(Scorekeeper, 'competition'))
router.delete('/:_id', getDeleteFunc(Scorekeeper, 'competition'))