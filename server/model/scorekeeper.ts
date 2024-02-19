import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'

const ScorekeeperSchema = createSchema({
    user: Type.objectId({ref: 'User', required: true}),
    competition: Type.objectId({ref: 'Competition', required: true})
})

export const ScorekeeperModel = typedModel('Scorekeeper', ScorekeeperSchema)
export type ScorekeeperDoc = ExtractDoc<typeof ScorekeeperSchema>