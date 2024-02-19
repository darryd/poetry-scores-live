import { createSchema, Type, typedModel, ExtractDoc } from 'ts-mongoose';
import uniqueValidator from 'mongoose-unique-validator'

const title = 'title'
const name = 'name'

export const ClubUpdatableFields = [title, name]

function validateClubName (clubName: string) {
    console.log('clubName', clubName)
    return clubName.match(/[^a-zA-Z0-9]/) === null
}

// The name field should really have been called url.
const clubSchema = createSchema ({
    title: Type.string({unique: true, required: true}),
    // owner: Type.objectId({ref: 'User', required: true}), 
    user: Type.objectId({ref: 'User', required: false}), // Demo has no owner.
    name: Type.string({ validate: { validator: validateClubName, message: 'name must be only letters or numbers.'},
                        required: true,
                        unique: true, 
                        index: true}),
    rate: Type.number(),
}, {timestamps: true})


const clubModel = typedModel('Club', clubSchema)
export type ClubDoc = ExtractDoc<typeof clubSchema>;
export { clubModel }

clubSchema.plugin(uniqueValidator)