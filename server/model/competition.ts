import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'
import { getOrderValue } from '../order'

const title = 'title'
export const CompetitionUpdatableFields = [title]

var competitionSchema = createSchema({
    club: Type.objectId({ref: 'Club', index: true}),
    [title]: Type.string(),
    isLocked: Type.boolean({default: false}),
    order: Type.number({required: true, default: getOrderValue})
}, {timestamps: true})

var competitionModel = typedModel('Competition', competitionSchema)
export type CompetitionDoc = ExtractDoc<typeof competitionSchema>;
export { competitionModel }
