
import ms from "ms";
import User from "../models/user.models.js";
import { env } from "../utils/env.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    const {
        type, fullName, specialization, phone, bio, email, password, terms,
        education = [], professional = [], achievements = [], socialLinks = {}, visible = true
    } = req.body;

    if (!type || !fullName || !specialization || !phone || !email || !password || terms !== true) {
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
    console.log(email,password)

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
            return res.status(401).json({ message: "Invalid credentials" }); // Use a generic message for security
        }

        // Advocate status checks
        if (user.role === "advocate") {
            if (user.block) {
                return res.status(403).json({ message: "Advocate is blocked. Contact admin.", success: false });
            }
            if (!user.isApproved) {
                return res.status(403).json({ message: "Advocate is not approved yet.", success: false });
            }
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken; // Update the user's refresh token
        // Ensure you have a 'save' method on your User model (e.g., Mongoose .save())
        let loggedUser = await user.save();
        console.log("Logged User is :", loggedUser);
        loggedUser.password = undefined;

        if (loggedUser.block) {
            return res.status(200).json({ message: "User is blocked" });
        }
        console.log("User logged in:", loggedUser.email);

        const maxAge = ms(env.REFRESH_TOKEN_EXPIRY); // Make sure 'ms' and 'env' are correctly defined

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
    console.log("loggin out user", req.user)
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken: token });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.sendStatus(204);
};

export { login, register, refreshToken, logout }