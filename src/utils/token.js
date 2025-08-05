import jwt from "jsonwebtoken"
import { env } from "./env.js"

export const generateAccessToken=(user)=>{
    console.log(env)
    return jwt.sign({id:user.id,email:user.email,role:user.role,fullName:user.fullName},env.JWT_ACCESS_SECRET,{expiresIn:env.ACCESS_TOKEN_EXPIRY})
}

export const generateRefreshToken = (user) => {
    return jwt.sign({id:user.id,email:user.email,role:user.role,fullName:user.fullName}, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });
};