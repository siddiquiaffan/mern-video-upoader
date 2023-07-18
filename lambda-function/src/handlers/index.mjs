import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import path from "path";
import {fileURLToPath} from 'url';

import dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ffmpeg static binary build is saved in ffmpeg-static folder in the root directory
ffmpeg.setFfmpegPath(path.join(__dirname, '..', '..', 'ffmpeg-static/ffmpeg'))
ffmpeg.setFfprobePath(path.join(__dirname, '..', '..', 'ffmpeg-static/ffprobe'))

const s3 = new S3Client({
    region: 'ap-south-1',
})
  
// Define the S3 bucket names
const videoUploadsBucket = 'video-uploads-01';
const thumbnailStorageBucket = 'thumbnails-01';

const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

/**
 * A Lambda function that returns a static string
 */
export const generateThumbnail = async (event) => {

    try {
        // Get the bucket name and object key from the S3 event
        const bucketName = event.Records[0].s3.bucket.name;
        const objectKey = event.Records[0].s3.object.key;

        if (bucketName !== videoUploadsBucket) {
            throw new Error('Invalid bucket name');
        }

        // Create a unique object key for the thumbnail image
        const thumbnailKey = `${objectKey.split('.')[0]}.jpg`;

        // Define the local paths for the video and thumbnail
        const videoPath = `/tmp/${path.basename(objectKey)}`;
        const thumbnailPath = `/tmp/${objectKey.split('.')[0] + '.jpg'}`;
        const thumbnailName = objectKey.split('.')[0] + '.jpg';

        // Download the video from S3 to the local filesystem
        const response = await s3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        }));

        const fileStream = fs.createWriteStream(videoPath);

        await new Promise((resolve, reject) => {
            response.Body.pipe(fileStream)
              .on('error', reject)
              .on('close', resolve);
          });

        if(!fs.existsSync(videoPath)) {
            throw new Error('Video could not be downloaded');
        }
        console.log('Video downloaded successfully')

        

        // ===================== Generate a thumbnail image using ffmpeg ===================== //
        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
              .outputOptions(['-movflags faststart'])
              .on('end', resolve)
              .on('error', function(err, stdout, stderr) {
                console.log('An error occurred: ' + err.message, err, stderr);
                reject(err);
               })
              .screenshots({
                count: 1,
                filename: thumbnailName,
                folder: '/tmp',
              });
          });
          
 
          
          // verify that the thumbnail was created
        if (!fs.existsSync(thumbnailPath)) {
            throw new Error('Thumbnail was not created');
        }
            
        // console.log('Thumbnail generated successfully')

        // Upload the thumbnail image to the destination bucket and save the video_url and thumbnail_url in the database
        await s3.send(new PutObjectCommand({
            Bucket: thumbnailStorageBucket,
            Key: thumbnailKey,
            Body: fs.createReadStream(thumbnailPath),
            ACL: 'public-read',
        })),

        await client.connect(),
        await client.db("video").collection("videos").updateOne(
            { video_url: `https://${videoUploadsBucket}.s3.amazonaws.com/${objectKey}` }, 
            { $set: { thumbnail_url: `https://${thumbnailStorageBucket}.s3.amazonaws.com/${thumbnailKey}` } }, 
            {upsert: true}
        )

        console.log('Saved to db')

        // Delete the video and thumbnail from the local filesystem
        try {
            fs.unlinkSync(videoPath);
            fs.unlinkSync(thumbnailPath);
        } catch (error) {}

        return 'Thumbnail generated successfully'
    } catch (error) {
        console.error(error);
        return 'Error generating thumbnail'
    }

}
