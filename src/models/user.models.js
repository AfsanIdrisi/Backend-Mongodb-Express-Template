// root/src/models/user.models.js

import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        fullName:{ type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user","editor"], default: "user" },
        refreshToken: { type: String, default: null },
        accessToken: { type: String, default: null },
        phone: { type: String, default: "" },
        block: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = model("User", UserSchema);
export default User;