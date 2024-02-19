import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'

const AdminSchema = createSchema({
    user: Type.objectId({ref: 'User'}),
    club: Type.objectId({ref: 'Club'})
})

export const AdminModel = typedModel('Admin', AdminSchema)
export type AdminDoc = ExtractDoc<typeof AdminSchema>
