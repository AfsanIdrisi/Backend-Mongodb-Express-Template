import { app } from "./app.js";
import connectDB from "./src/db/db.js";
import {env} from "./src/utils/env.js";
connectDB().then(()=>{












    app.listen(env.PORT,()=>{console.log("server is running on port 8080")})
}).catch((err)=>{console.log(err)})