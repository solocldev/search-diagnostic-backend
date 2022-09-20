import mongoose from 'mongoose';

const object = new mongoose.Schema(
    {
        details: { type: Array, required: true },
        response: { type: Array, required: true }
    },
    { timestamps: true }
)

export const Object = mongoose.model('objects', object)