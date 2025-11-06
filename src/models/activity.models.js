import { Schema, model } from "mongoose";

const ActivitySchema = new Schema(
    {
        activityName: { type: String, required: true },
        role: { type: String, required: true },
        userId: { type: String, required: true },
        name: { type: String, required: true },
    },
    { timestamps: true }
);

export default model("Activity", ActivitySchema);