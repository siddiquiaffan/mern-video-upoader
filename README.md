# Video Uploader (MERN)
----

This is MERN test project which let's users upload videos from web interface, uploads it to S3 bucket and triggers a lmbda function which generates the thumbnail from the video, saves the thumbnail to another bucket and also saves the `thumbnail_url` and `video_url` to mongodb.

----

## Build (Client & Server)
```bash
npm i
node build.js --install --start
```

##### Build Arguments
```bash
--install   Installs the packages in both client and server before building it
--start     Starts the application
--zip       Creates a production zip folder 
```

## Build (Lambda Function)
Pre-requisites: AWS CLI and AWS SAM CLI
```bash
npm i
sam build
sam deploy
```