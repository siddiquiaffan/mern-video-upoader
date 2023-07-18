import express, { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import { readdirSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config();

const app = express();
app.use(express.json());

// allow cors
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.ORIGIN : "http://localhost:5173",
  // origin: '*',
}));

app.use(express.static(path.join(__dirname, "./dist")));


// read all routes fom routes folder and use them in app. Base url is /api
const routes = readdirSync(path.join(__dirname, "./routes")).map((file) => require(`./routes/${file}`).default);
routes.forEach((route) => {
  app.use("/api", route);
});


app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "./dist", 'index.html'));
});

app.listen(8000, () => console.log("Server running on port 8000"));

// 4dee2cbba3bb e1f2fb7ddd4b

