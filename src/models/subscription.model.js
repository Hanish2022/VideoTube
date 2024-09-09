import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,//jo subscribe kr rha
        ref:"User"
    },
    channel: {
         type: Schema.Types.ObjectId,//jisko subscribe kr rha
        ref:"User"
    }
}, { timestamps: true })

export const Subscription=mongoose.model("Subscription",subscriptionSchema)