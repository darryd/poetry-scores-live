import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'
import { getOrderValue } from '../order';

var scoreSchema = createSchema({
    created: Type.date({default: Date.now}),
    performance: Type.objectId({ref: 'Performance', index: true}),
    order: Type.number({required: true, default: getOrderValue}),
    score: Type.number()
}, {timestamps: true})

var scoreModel = typedModel('Score', scoreSchema)
export type ScoreDoc = ExtractDoc<typeof scoreSchema>;
export { scoreModel }