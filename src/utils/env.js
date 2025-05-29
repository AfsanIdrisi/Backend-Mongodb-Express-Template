import dotenv from "dotenv";
dotenv.config({path:"./.env"})

export const env = {
    MONGOURI:process.env.MONGO_DB_URI,
    PORT:process.env.PORT,
    SERVER:process.env.SERVER,
    APISERVER:process.env.API_SERVER
}
