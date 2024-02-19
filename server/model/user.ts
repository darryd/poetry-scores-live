import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'

var userSchema = createSchema({
    email: Type.string({required: true, unique: true}),
    verified: Type.boolean({required: true, default: false})
}, {timestamps: true})

var userModel = typedModel('User', userSchema)
export type UserDoc = ExtractDoc<typeof userSchema>
export { userModel }