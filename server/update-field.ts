import express from "express"
import { getOldChanges } from "./changes"
import { notifyCallbacks } from "./notify"

export async function updateField (modelName: string, model: any, updatableFields: string[], req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const _id = req.body._id
        
        const field = req.body.field
        const value = req.body.value

        if (updatableFields.find(value => field === value) === undefined) {
            const error = `Unacceptable field ${field}` 
            res.status(500).json({error})
            return
        }

        var document
        if (modelName === 'Competition') {
            document = await model.findById(_id).populate('club')
        }
        else {
            document = await model.findById(_id)
        }

        if (document) {

            var oldDocument = document.toObject()
            document[field] = value
            await document.save()

            notifyCallbacks(modelName, 'update', document, oldDocument)
            res.json(document)
        } else {
            var error = `Could not find document ${_id}.`
            res.status(404).json({error})
        }
    }
    catch (error) {
        next(error)
    }
}