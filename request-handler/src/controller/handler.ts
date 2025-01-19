import { Request, Response } from "express"
import { downloadSourceCode } from "../utils/helper"
import * as AWS from "aws-sdk"
import { ACCESS_KEY_ID,SECRET_ACCESS_KEY,S3_URL,dirname } from "../constant.js";


const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})


export const requestHandler = async (req : Request, res : Response) : Promise<any> => {
        try {
            const host = req.hostname
            const id = host.split(".")[0]
            
            let filePath = req.path==="/" ? "index.html" : req.path 
            console.log(filePath)
            filePath = filePath.startsWith("/") ? filePath.substring(1) : filePath
            let contents = await s3Client.getObject({
                Bucket : "react-bucket",
                Key : `output/${id}/dist/${filePath}`
            }).promise()
            if(!contents) {
                contents = await s3Client.getObject({
                    Bucket : "react-bucket",
                    Key : `output/${id}/build/${filePath}`
                }).promise()
            }
            console.log(contents)
            res.set("Content-Type", contents.ContentType);
            res.send(contents.Body)
        } catch (error) {
            console.log(error)
            return res.status(500).json({

            })
        }
}