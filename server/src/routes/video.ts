import express, { Request, Response } from 'express'
import { MulterError } from 'multer'
import dotenv from 'dotenv'
dotenv.config();
import { upload } from '../lib'

const router = express.Router();

// post /videos - upload a video
router.post("/videos", async (req: Request, res: Response) => {

  try {

    const file : any = await new Promise((resolve, reject) => {
      upload(req, res, async err => {
        if (err) reject(err);
        resolve(req.file);
      });
    })

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = {
      video_url: file.location,
      key: file.key
    };

    return res.status(200).json(result);

  } catch (err) {
    if (err instanceof MulterError) 
      return res.status(500).json({ 
        error: 
          err.code === "LIMIT_UNEXPECTED_FILE" 
            ? "Too many files uploaded" 
            : "Something went wrong" 
      });

    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }

})

export default router;