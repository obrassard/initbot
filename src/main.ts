import { GithubService } from "./services/GithubService";
import Octokit = require("@octokit/rest");

async function main() {
    let github:Octokit|undefined = await GithubService.getInstance()
    if (github != undefined) {
        github.repos.create
        let res = await github.users.getAuthenticated();
        console.log(res);
    }
}

main();