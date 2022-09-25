import mongoose from 'mongoose';

const object = new mongoose.Schema(
    {
        email: { type: String, required: true },
        link: { type: String, required: true },
        response: { type: Array, required: true }
    },
    { timestamps: true }
)

const link = new mongoose.Schema(
    {
        link: { type: String, required: true }
    },
    { timestamps: true }
)

const responseObject = new mongoose.Schema(
    {
        link: { type: String, required: true },
        response: { type: Array, required: true }
    }
)

export const Object = mongoose.model('objects', object)
export const Link = mongoose.model('links', link)
export const ResponseObject = mongoose.model('responseObjects', responseObject)