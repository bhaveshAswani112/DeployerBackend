import * as AWS from "aws-sdk"
import { ACCESS_KEY_ID,SECRET_ACCESS_KEY,S3_URL,dirname } from "../constant.js";
import * as path from "path"
import fs from "fs"


const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})


export async function downloadSourceCode(id : string) {
    try {
       const allFiles = await s3Client.listObjectsV2({
            Bucket : "react-bucket",
            Prefix : `output/${id}/dist`

       }).promise()
       if(!allFiles || !allFiles.Contents)return
       allFiles.Contents?.map(async (obj) => {
            const finalOutputPath = path.join(dirname, obj.Key as string);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3Client.getObject({
                Bucket: "react-bucket",
                Key : obj.Key as string
            }).createReadStream().pipe(outputFile)
       })
    } catch (error) {
        console.log("Error in downloadSourceCode")
        console.log(error)
    }
}