import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose'

var signupSchema = createSchema({
    poet: Type.string({required: true}),
    competition: Type.objectId({ref: 'Competition', index: true})
}, {timestamps: true})

var SignupModel = typedModel('Signup', signupSchema)
export type SignupDoc = ExtractDoc<typeof signupSchema>
export { SignupModel } 