// Ref: https://www.ably.io/tutorials/jwt-authentication

import * as express from 'express'
import { Types } from 'mongoose';
var router = express.Router()
import { getAllParents, getChildren, getAllChildren, getAllParentIds, getObject } from '../family'
import { clubModel } from '../model/club';

import { prefix } from '../notify'

module.exports = router;

var jwt = require('jsonwebtoken')

router.get('/children/:parent', (req: express.Request, res: express.Response) => {
    var parent = req.params.parent
    var children = getChildren(parent)
    res.json(children)
})

router.get('/allChildren/:parent', async (req: express.Request, res: express.Response, next) => {
    
    var parent = req.params.parent
    var kids = getAllChildren(parent)
    
    res.json(kids)
})


router.get('/prefix', (req: express.Request, res: express.Response) => {
    res.json({prefix})
})

router.get('/allParents/:child', (req: express.Request, res: express.Response) => {

    var child = req.params.child
    var allParents = getAllParents(child)

    res.json(allParents)
})

router.post('/allParents', (req: express.Request, res: express.Response, next: express.NextFunction) => {

    function isAnArrayOfStrings(omit: any) {
        if (!Array.isArray(omit)) {
            return false
        }
        return omit.find(e => typeof(e) !== 'string') === undefined
    }

    var child = req.body.child
    var omit = req.body.omit

    if (omit && !isAnArrayOfStrings(omit)) {
        next(new Error('Omit needs to be an array of strings.'))
    } else {
        try { 
            var allParents = getAllParents(child, omit)
            res.json(allParents)
        } catch (error) {
            next(error)
        }
    }
})

// checks if object is alive. sets boolean field in req.body.isAlive 
async function isAlive (req: express.Request, res: express.Response, next: express.NextFunction) {

    try {
    var object = await getObject(req.body.child, req.body.child_id)

    if (object) {
        req.body.isAlive = true
    }
    else {
        req.body.isAlive = false
    }

        next()
    } catch (err) {
        next(err)
    }

}


async function handleNonIdField (req: express.Request, res: express.Response, next: express.NextFunction) {
    
    if (req.body.child === 'Club' && req.body.idField === 'name') {

        var club = await clubModel.findOne({name: req.body.child_id})
        if (club) {
            req.body.child_id = club._id
        }
    }
    
    next()
}

router.post('/allParentIds', handleNonIdField, isAlive, async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    function isAnArrayOfStrings(omit: any) {
        if (!Array.isArray(omit)) {
            return false
        }
        return omit.find(e => typeof(e) !== 'string') === undefined
    }

    var child = req.body.child

    if (Types.ObjectId.isValid(req.body.child_id)) {
        var child_id = Types.ObjectId(req.body.child_id)

        var omit = req.body.omit

        if (omit && !isAnArrayOfStrings(omit)) {
            next(new Error('Omit needs to be an array of strings.'))
        } else {

            try {

                var allParents = getAllParents(child, omit)
                var parentIDs = await getAllParentIds(allParents, child_id)

                res.json({child: {name: child, _id: child_id, isAlive: req.body.isAlive}, parents: parentIDs})
            } catch (error) {
                next(error)
            }
        }

      } else {
        // child_id is not a valid ObjectId
        res.json({body: req.body, error: 'Invalid child_id.'})
      }
})

router.get('/auth', (_req, res) => {

    var appId, keyId, keySecret
    var apiKey = process.env['ABLY_API_KEY'];

    if (apiKey) {
        appId = apiKey.split(':')[0].split('.')[0]
        keyId = apiKey.split(':')[0].split('.')[1]
        keySecret = apiKey.split(':')[1]
    }
    var ttlSeconds = 60

    var jwtPayload =
    {
        //'x-ably-capability': JSON.stringify({ '*': ['publish', 'subscribe'] })
        'x-ably-capability': JSON.stringify({ '*': ['subscribe'] })
    }

    var jwtOptions =
    {
        expiresIn: ttlSeconds,
        keyid: `${appId}.${keyId}`
    }

    jwt.sign(jwtPayload, keySecret, jwtOptions, function (err: any, tokenId: any) {
        if (err) {
            console.trace()
            return
        }
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(tokenId));
    })
});