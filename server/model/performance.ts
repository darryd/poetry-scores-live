import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'
import { getOrderValue } from '../order';

const poet = 'poet'
const minutes = 'minutes'
const seconds = 'seconds'
const penalty = 'penalty'

export const PerformanceUpdatableFields = [poet, minutes, seconds, penalty]

var performanceSchema = createSchema({
    order: Type.number({required: true, default: getOrderValue}),
    [poet]: Type.string(),
    [minutes]: Type.number(),
    [seconds]: Type.number({type: Number, min: 0, max: 59}),
    [penalty]: Type.number(),
    round: Type.objectId({ref: 'Round', index: true})
}, {timestamps: true})

var performanceModel = typedModel('Performance', performanceSchema)
export type PerformanceDoc = ExtractDoc<typeof performanceSchema>;
export { performanceModel }