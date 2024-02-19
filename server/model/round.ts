import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'
import { getOrderValue } from '../order'

const title = 'title'
const numJudges = 'numJudges'
const removeMinAndMaxScores = 'removeMinAndMaxScores'
const previousRound = 'previousRound'
const isCumulative = 'isCumulative'
const incomingRank = 'incomingRank'
const timeLimit = 'timeLimit'
const grace = 'grace'

export const RoundUpdatableFields = [title, numJudges, removeMinAndMaxScores, previousRound,isCumulative, incomingRank, timeLimit, grace]

var roundSchema = createSchema({
    //created: Type.date({default: Date.now}),
    order: Type.number({default: getOrderValue}),
    competition: Type.objectId({ref: 'Competition', index: true}),
    [title]: Type.string(),
    [numJudges]: Type.number({default: 5, required: true, max: 10}),
    [removeMinAndMaxScores]: Type.boolean(),
    [isCumulative]: Type.boolean(),
    [previousRound]: Type.objectId({ref: 'Round'}),
    [incomingRank]: Type.number(),
    [timeLimit]: Type.number(),
    [grace]: Type.number()
}, {timestamps: true})

var roundModel = typedModel('Round', roundSchema) 

export type RoundDoc = ExtractDoc<typeof roundSchema>;
export { roundModel }
