import express, { RequestHandler } from "express"
import cors from "cors"
import { requestHandler } from "./controller/handler.js"

const app = express()

app.use(cors())

app.get("/*",requestHandler)

export default app