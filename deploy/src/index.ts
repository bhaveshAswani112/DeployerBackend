import { createClient } from 'redis';
import * as AWS from "aws-sdk";
import { ACCESS_KEY_ID,SECRET_ACCESS_KEY,S3_URL } from "./constant";
import * as path from "path"
import fs from "fs"
import {  exec } from 'child_process';



const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})


async function downloadSourceCode(id : string) {
        try {
           const allFiles = await s3Client.listObjectsV2({
                Bucket : "react-bucket",
                Prefix : `output/${id}`

           }).promise()
           if(!allFiles || !allFiles.Contents)return
           allFiles.Contents?.map(async (obj) => {
                const finalOutputPath = path.join(__dirname, obj.Key as string);
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

const getPaths = async (dir : string) : Promise<string[]> => {
    try {
        const paths  = await fs.promises.readdir(dir)
        const allPaths = []
        for(const file of paths) {
            const filePath = path.resolve(dir,file)
            const stat = await fs.promises.stat(filePath)
            if(stat.isDirectory()) {
                // console.log(filePath)
                const subPaths = await getPaths(filePath)
                allPaths.push(...subPaths)
            }
            else {
                allPaths.push(filePath)
            }
        }
        // console.log(allPaths)
        return allPaths
    } catch (error) {
        console.log(error)
        return []
    }
}

export const uploadToS3 = async (fileName : string, filePath : string) => {
    try {
        const type = filePath.endsWith("html") ? "text/html" :
             filePath.endsWith("css") ? "text/css" :
             filePath.endsWith("js") ? "application/javascript" :
             filePath.endsWith("svg") ? "image/svg+xml" :
             filePath.endsWith("jpg") || filePath.endsWith("jpeg") ? "image/jpeg" :
             filePath.endsWith("png") ? "image/png" :
             "application/octet-stream"; 
        const command : AWS.S3.Types.PutObjectRequest = {
            Bucket : "react-bucket",
            Key : fileName,
            Body : fs.readFileSync(filePath),
            ContentType : type
        }
        const response = await s3Client.upload(command).promise()
    } catch (error) {
        console.log("Error in uploading file to S3")
        console.log(error)
    }
}

async function buildProject(id: string) {
    return new Promise((resolve,reject) => {
            try {
                const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`);
                child.stdout?.on("data", (data) => {
                    console.log(`stdout: ${data}`);
                });
                child.stderr?.on("data", (data) => {
                    console.error(`stderr: ${data}`);
                });
                child.on("close", (code) => {
                    if (code === 0) {
                        console.log("Build process completed successfully.");
                        resolve("");
                    } else {
                        console.error(`Build process exited with code ${code}.`);
                        reject(new Error(`Build process failed with exit code ${code}`));
                    }
                });
            } catch (error) {
                console.error("Error while building the project.");
                console.error(error);
                reject(error);
            }
    })
}





async function main() {
    try {
        const subscriber = await createClient({
            url: 'redis://localhost:6379'
        }).connect()
        const publisher = await createClient({
            url: 'redis://localhost:6379'
        }).connect()
        while (true) {
            const id : string | null = await subscriber.rPop("build-queue")
            // console.log(__dirname)
            if(id){
                console.log(id)
                await downloadSourceCode(id)
                await buildProject(id)
                console.log("Build completed")
                let paths = await getPaths(path.join(__dirname,`output/${id}/dist`))
                if(!paths) {
                    paths = await getPaths(path.join(__dirname,`output/${id}/build`))
                }
                // console.log(paths)
                paths.map(async (path) => {
                    const fileName = path.replace(__dirname, "").replace(/\\/g, "/").startsWith("/") ? path.replace(__dirname, "").replace(/\\/g, "/").substring(1) : path.replace(__dirname, "").replace(/\\/g, "/")
                    await uploadToS3(fileName,path)
                    console.log("upload completed")
                })
                console.log("All files uploaded successfully")
                publisher.hSet("status",id,"deployed")
            }
        }
    } catch (error) {
        console.log("Error in main function of deploy service")
        console.log(error)
    }
}


main()