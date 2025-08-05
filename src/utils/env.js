import dotenv from "dotenv";
dotenv.config({path:"./.env"})

export const env = {
    MONGOURI:process.env.MONGO_DB_URI,
    PORT:process.env.PORT,
    SERVER:process.env.SERVER,
    APISERVER:process.env.API_SERVER,
    dbName:process.env.DB_NAME,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRY:process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY:process.env.REFRESH_TOKEN_EXPIRY,
    IsProduction:process.env.NODE_ENV === "production",
}
