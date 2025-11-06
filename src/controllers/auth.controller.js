// root/src/controllers/auth.controller.js

// root/src/controllers/auth.controller.js

import ms from "ms";
import User from "../models/user.models.js";
import { env } from "../utils/env.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import Activity from "../models/activity.models.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload; // contains the object you pasted
}
const register = async (req, res) => {
    const {
        type, fullName, specialization, phone, bio, email, password, terms,
        education = [], professional = [], achievements = [], socialLinks = {}, visible = true
    } = req.body;

    console.log(type, fullName, specialization, phone, bio, email, password, terms, education, professional, achievements, socialLinks, visible)
    if (!type || !fullName || !email || !password || terms !== true) {
        return res.status(400).json({ message: "All fields except bio are required and terms must be accepted", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists", success: false });
    }

    const user = await User.create({
        email, password, role: type, fullName, specialization, phone, bio: bio || "",
        id: uuid(), terms, education, professional, achievements, socialLinks, visible
    });

    const accessToken = generateAccessToken(user);
    console.log("Access Token Generated:", accessToken);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save()

    console.log(user.role)
    await Activity.create({
        activityName: `User Registered`,
        userId: user.id,
        name: user.fullName,
        role: user.role
    })
    const maxAge = ms(env.REFRESH_TOKEN_EXPIRY);



    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.IsProduction, // Set to true in production
        sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
        maxAge: maxAge
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.IsProduction, // Set to true in production
        sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
        maxAge: maxAge
    });
    res.status(201).json({
        success: true,
        accessToken,
        user
    });
}

import bcrypt from 'bcryptjs'; // Or 'bcrypt' if you prefer, 'bcryptjs' is pure JS

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        console.log("Attempting login for user:", { email });

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" }); // Use a generic message for security
        }

        // --- IMPORTANT: Password Verification Logic ---
        // Assuming user.password is the hashed password stored in your database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Password mismatch for user:", { email });
            return res.status(401).json({ success: false, message: "Invalid email or password." }); // Use a generic message for security
        }

        // Advocate status checks
        if (user.role === "advocate") {
            if (user.status == "blocked") {
                return res.status(403).json({ message: "Advocate is blocked. Contact admin.", success: false });
            }
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken; // Update the user's refresh token
        // Ensure you have a 'save' method on your User model (e.g., Mongoose .save())
        let loggedUser = await user.save();
        loggedUser.password = undefined;

        if (loggedUser.block) {
            return res.status(200).json({ message: "User is blocked" });
        }

        const maxAge = ms(env.REFRESH_TOKEN_EXPIRY); // Make sure 'ms' and 'env' are correctly defined

        await Activity.create({
            activityName: "User Logged In",
            userId: user.id,
            name: user.fullName,
            role: user.role
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.json({
            accessToken,
            success: true,
            message: "Login successful",
            user: loggedUser
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};






const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token found" });

    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid refresh token" });

        }
        const newAccestoken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        const maxAge = ms(env.REFRESH_TOKEN_EXPIRY);

        await user.save();
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: maxAge
        })
        res.json({ accessToken: newAccestoken })
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
}




const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204); // No token means already logged out
    // const user = await User.findOne({ email: req.user.email });
    // if (user) {
    //     user.refreshToken = null;
    //     await user.save();
    // }

    const cookieOptions = {
        httpOnly: true,
        secure: env.IsProduction, // true in production
        sameSite: env.IsProduction ? "None" : "Lax",
        path: "/",
    };

 

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);
    res.sendStatus(204);
};

export const googleRegister = async (req, res) => {
    try {
        const { tokenId, role } = req.body
        if (!tokenId) return res.status(400).json({ message: "Token id is required" })
        const maxAge = ms(env.REFRESH_TOKEN_EXPIRY);
        const payload = await verifyGoogleToken(tokenId);
        const userData = {
            id:uuid(),
            email: payload?.email,
            fullName: payload?.name,
            profileImage: payload?.picture,
            bio: "I am an advocate",
            role,
        };
        let user = await User.findOne({ email: userData.email });
        if (user) {
        
            return res.status(200).json({ success: false, message: "User Already Exist Try Logging In", user });
        }

        user = await User.create(userData);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;
        await user.save()

        await Activity.create({
            activityName: `User Registered`,
            userId: user.id,
            name: user.fullName,
            role: user.role
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.status(201).json({
            success: true,
            accessToken,
            user
        });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }


}

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const payload = await verifyGoogleToken(idToken);
        // Extract user info
        const userData = {
            email: payload?.email,
            name: payload?.name,
            profileImage: payload?.picture,
        };
        console.log(userData)

        // Save or login user
        let user = await User.findOne({ email: userData.email });
        if (!user) {
            return res.status(200).json({ success: false, message: "User not exist please try Sign Up" });
            // user = await User.create(userData);
        }


        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken; // Update the user's refresh token
        // Ensure you have a 'save' method on your User model (e.g., Mongoose .save())
        let loggedUser = await user.save();
        loggedUser.password = undefined;

        if (loggedUser.block) {
            return res.status(200).json({ message: "User is blocked" });
        }

        const maxAge = ms(env.REFRESH_TOKEN_EXPIRY); // Make sure 'ms' and 'env' are correctly defined

        await Activity.create({
            activityName: "User Logged In",
            userId: user.id,
            name: user.fullName,
            role: user.role
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: env.IsProduction, // Set to true in production
            sameSite: env.IsProduction ? "None" : "Lax", // Consider 'Lax' or 'None' for cross-site if needed
            maxAge: maxAge
        });
        res.json({
            accessToken,
            success: true,
            message: "Login successful",
            user: loggedUser
        });

        return res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid token", error: err.message });
    }
}

export { login, register, refreshToken, logout }