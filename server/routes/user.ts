import express = require('express')
const router = express.Router()
import { userModel } from '../model/user'

module.exports = router

/* TODO Requires authentication. Only website owner can do this. */
/*
router.get('/', async (req: express.Request, res: express.Response, next) => {

    try {
        var users = await userModel.find()     
        res.json(users)
    } 
    catch (error) {
        next(error)
    }    
})

router.post('/', async (req: express.Request, res: express.Response, next) => {

    var email = req.body['email']

    try {
        var user :any = new userModel()
        user['email'] = email

        await user.save()
        res.json(user)
        notify('user', {event: 'new', email})
        
    } catch (error) {
        next(error)
    }
})

router.get('/test', async (req: express.Request, res: express.Response, next) => {

    const OktaJwtVerifier = require('@okta/jwt-verifier');
    const oktaJwtVerifier = new OktaJwtVerifier({
        issuer: 'https://dev-576524.okta.com/oauth2/default'
    });

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);


    console.log('match', match)

    if (!match) {
        res.status(401);
        return next('Unauthorized');
    }

    const accessToken = match[1];
    try {
        var jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default')
        console.log('jwt', jwt)
        res.json(jwt)
    } catch (error) {
        console.log(error)
        res.status(401).send(error.message)
    }
})
*/