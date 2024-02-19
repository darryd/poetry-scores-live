
import express = require('express')
import { Admin } from '../roles-and-models'
import { registerRole, getGetFunc, getPostFuncs, getDeleteFunc } from '../roles'

const router = express.Router()
module.exports = router

registerRole(Admin, 'club', 'api/admin')
router.get('/club/:_id', getGetFunc('club', Admin))
router.post('/', getPostFuncs(Admin, 'club'))
router.delete('/:_id', getDeleteFunc(Admin, 'club'))