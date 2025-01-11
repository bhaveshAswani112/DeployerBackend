import express from "express"
import cors from "cors"
import uploadRouter from "./routes/upload.route.js"


const app = express()
app.use(express.json())

app.use(cors({
    origin : "*"
}))

app.use("/",uploadRouter)

 export default app