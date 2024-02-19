import { Document, Model, model, Types, Schema, Query } from "mongoose"

var randomNumberSchema = new Schema({
    created: {type: Number, default: Date.now},
    value: {type: Number, default: () => {
        return Math.round(Math.random() * 1000)
    }} 
})

const randomNumberModel = model('RandomNumber', randomNumberSchema)
export { randomNumberModel }