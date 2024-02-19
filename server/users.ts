import express from 'express'
import { UserDoc, userModel } from "./model/user";

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

var globalUser: any
export function getCurrentUser() {
  return globalUser
}

export async function createUserIfDoesNotExist(email: string) {
// This should probably been replaced with upsert.
  var user = await userModel.findOne({email})
  if (!user) {
    user = new userModel({email})
    await user.save()
    console.log('New User:', user)
  }
  return user
}

async function markUserAsVerified(user: UserDoc) {
    if (!user.verified) {
        user.verified = true
        user.save()
    }
}

export async function getCurrentUserFromHttpHeaders (req: express.Request, _res: express.Response, next: express.NextFunction) {
  const OktaJwtVerifier = require('@okta/jwt-verifier');
  const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-576524.okta.com/oauth2/default'
  });

  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (match) {
    const accessToken = match[1];
    try {
      var jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default')
      req.user = jwt.claims.sub
      var user = await createUserIfDoesNotExist(req.user)
      globalUser = user
      await markUserAsVerified(user)
    } catch (error) {
      console.log('------------------------------------------')
      console.log('Error:')
      console.error(error)
      console.log('------------------------------------------')
    }
  }
  next()
}