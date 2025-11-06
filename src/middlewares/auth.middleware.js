// root/src/middleware/auth.middleware.js

// root/src/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import { env } from "../utils/env.js";

export const verifyAccessToken = (req, res, next) => {
  // const authHeader = req.headers["authorization"];
  const token = req.cookies.accessToken

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalid" });
    console.log(user,"user")
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
};