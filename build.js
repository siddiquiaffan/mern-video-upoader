const shell = require('shelljs')
const archiver = require('archiver')
const fs = require('fs')
const path = require('path')

const install = process.argv.includes('--install')
const start = process.argv.includes('--start')
const zip = process.argv.includes('--zip')

// Define the paths
const productionFolderPath = path.join(__dirname, 'production')
const clientBuildFolderPath = path.join(__dirname, 'client', 'dist')
const serverBuildFolderPath = path.join(__dirname, 'server', 'build')

// Check if the production folder already exists, if not, create it
if (!fs.existsSync(productionFolderPath)) shell.mkdir(productionFolderPath)

// clean the production folder
shell.rm('-rf', productionFolderPath + '/*')


// Build the client application
shell.echo('Building client application...')
shell.cd('client')
if(install) shell.exec('npm install')
shell.exec('npm run build')
shell.cd('..')

// Build the server application
shell.echo('Building server application...')
shell.echo('Cleaning server build folder...')
shell.cd('server')
shell.rm('-rf', 'build')
if(install) shell.exec('npm install')
shell.exec('npm run build')
shell.cd('..')


// Copy server & client build files to the production folder
shell.echo('Copying build files...')

// copy client dist to server build
shell.cp('-R', clientBuildFolderPath , serverBuildFolderPath)
shell.cp('-R', serverBuildFolderPath + '/*', productionFolderPath)


// also copy required files from server to production
shell.cp('-R', path.join(serverBuildFolderPath, '..', 'package.json'), productionFolderPath)
shell.cp('-R', path.join(serverBuildFolderPath, '..', '.env'), productionFolderPath)

// Zip the production folder
if(zip) {
    const output = fs.createWriteStream('mern-app.zip')
    const archive = archiver('zip', {
        zlib: { level: 9 }
    })
    output.on('close', () => {
        console.log('Project successfully zipped.')
    })
    archive.on('error', (err) => {
        throw err
    })
    archive.pipe(output)
    archive.directory('production', false)
    archive.finalize()
}


// // if --start is passed, start the server
if (start) {
    shell.cd('server')
    shell.exec('Set NODE_ENV=production && node build/index.js')
}