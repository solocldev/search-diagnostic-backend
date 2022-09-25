import mongoose from 'mongoose';

const object = new mongoose.Schema(
    {
        email: { type: String, required: true },
        details: { type: Array, required: true },
        response: { type: Array, required: true }
    },
    { timestamps: true }
)

const email = new mongoose.Schema(
    {
        email: { type: String, required: true }
    },
    { timestamps: true }
)

const responseObject = new mongoose.Schema(
    {
        email: { type: String, required: true },
        response: { type: Array, required: true }
    }
)

export const Object = mongoose.model('objects', object)
export const Email = mongoose.model('emails', email)
export const ResponseObject = mongoose.model('responseObjects', responseObject)