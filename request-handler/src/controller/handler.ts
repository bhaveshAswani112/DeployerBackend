import { Request, Response } from "express"
import { downloadSourceCode } from "../utils/helper"
import * as AWS from "aws-sdk"
import { ACCESS_KEY_ID,SECRET_ACCESS_KEY,S3_URL,dirname } from "../constant.js";
import * as path from "path"
import fs from "fs"


const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})


export const requestHandler = async (req : Request, res : Response) : Promise<any> => {
        try {
            const host = req.hostname
            const id = host.split(".")[0]
            let filePath = req.path
            console.log(filePath)
            filePath = filePath.startsWith("/") ? filePath.substring(1) : filePath
            const contents = await s3Client.getObject({
                Bucket : "react-bucket",
                Key : `output/${id}/dist/${filePath}`
            }).promise()
            const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
            res.set("Content-Type", type);
            res.send(contents.Body)
        } catch (error) {
            console.log(error)
            return res.status(500).json({

            })
        }
}