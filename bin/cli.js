#!/user/bin/node

const { execSync } = require('child_process')

const runCommand = command => {
    try {

        execSync(`${command}`, { stdio: 'inherit' })

    } catch (err) {
        console.error(`Failed to run command ${command}`, err)
        return false;
    }
}

const repoName = process.argv[2]
const gitCheckoutCommand = `git clone --depth 1 https://github.com/boiler-plates-harsh/node-express-ts.git ${repoName}`
const installDepsCommand = `cd ${repoName} && npm install`

console.log(`Cloning the repository with name ${repoName}`)
const checkedOut = runCommand(gitCheckoutCommand)
if (!checkedOut) process.exit(-1)

console.log(`Installing dependencies for ${repoName}`)
const installDeps = runCommand(installDepsCommand)
if (!installDeps) process.exit(-1)

console.log(`Congratulations! you are ready to run my (Harshu) express-ts boilerplate!`);
console.log(`cd ${repoName} && npm run app`)
