import express = require('express');
import { userModel } from './model/user';

export async function getUser(req: express.Request) {

    var email = req.user;

    if (!email) {
        return null;
    }

    return await userModel.findOne({ email });
}
