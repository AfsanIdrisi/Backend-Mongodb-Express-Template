import express from "express";
import cors from "cors"
import cookieParser from 'cookie-parser';
const app =express();
app.use(cors(
    {
        origin:["http://localhost:5173","https://legal-connnect.vercel.app"],
        credentials:true
    }
));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

export {app}