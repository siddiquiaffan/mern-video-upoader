import multer from 'multer'
import { S3Client } from '@aws-sdk/client-s3'
import multerS3 from 'multer-s3'
import dotenv from 'dotenv'
dotenv.config();

const s3 = new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})
  
const upload = multer({
    storage: multerS3({
        s3: s3 as any,
        bucket: "video-uploads-01",
        acl: "public-read",
        key: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
        }
    })
}).single("video");
  

export { upload }