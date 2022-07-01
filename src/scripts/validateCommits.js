import commandLineArgs from "command-line-args";
import {fetchRemoteBranch, getCurrentBranch, getFirstMissingCommit, isRemoteBranch} from "../utils/git.js";
import {validateCommits} from "../utils/commit.js";
import {getExecutingProjectDirectory} from "../utils/path.js";

const currentBranch = getCurrentBranch();

const definitions = [
    {
        name: 'branch',
        alias: 'b',
        defaultValue: currentBranch
    },
];

const { branch } = commandLineArgs(definitions, { stopAtFirstUnknown: true });
const isRemote = isRemoteBranch(branch);

if (!branch || branch === "master" || !isRemote) {
    console.info(`Skipped commit validation on branch '${branch}'.`);
    process.exit(0);
}

console.info("Fetching commits available on the master branch...");
fetchRemoteBranch("master");

const from = getFirstMissingCommit("master", branch);

if (!from) {
    console.info('All commit messages on this branch have already been validated.');
    process.exit(0);
}

console.info(`Validating commit messages on branch '${branch}'...\n`);
const projectDir = getExecutingProjectDirectory();
const config = `${projectDir}/commitlint.config.js`;

try {
    validateCommits({ from, config });
} catch (e) {
    process.exit(1);
}

console.info('All commit messages successfully validated.');
