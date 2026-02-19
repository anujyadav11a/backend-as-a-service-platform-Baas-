import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
const app = express();


const Options={
    origin:process.env.CORS_ORIGIN,
    Credential:true
}



app.use(cors(Options))

 app.use(express.json({limit:"10kb"}))
 app.use(express.urlencoded({limit:"10kb"}))
 app.use(express.static("public"))
 app.use(cookieParser())
 


 export default app