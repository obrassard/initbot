import _ from 'lodash';
import fs from 'fs';
import CLI from 'clui';
import touch from 'touch';
import chalk from 'chalk';

const git = require('simple-git')();
const Spinner = CLI.Spinner;

import { InquirerService } from './InquirerService';
import { GithubService } from './GithubService';
import { EmptyRepoRequest } from '../models/EmptyRepoRequest';
import { TemplateRepoRequest } from '../models/TemplateRepoRequest';
import Octokit from '@octokit/rest';

export class RepoService {

    public async createEmptyRepo(req : EmptyRepoRequest) {
        return GithubService.getInstance().then(async (github) => {
            if (github != undefined) {

                const status = new Spinner('Creating remote repository...');
                status.start();

                let data: any = {
                    name: req.name,
                    private: req.private,
                    description: req.description || ""
                };

                try {
                    const response = await github.repos.createForAuthenticatedUser(data);
                    let repo = response.data;

                    console.log(chalk.green(`Your new repo was successfully created : ${repo.html_url}`));

                    if (req.collaborators != undefined) {
                        await this.addCollaborators(github,repo, req.collaborators);
                    }

                    status.stop();
                    return response.data.html_url;
                } catch (err) {
                    status.stop();
                    if (err.status == 422) {
                        console.log(chalk.red(`You already have a repo called ${data.name}`));
                    } else {
                        console.log(chalk.red("An error occured, please try again."));
                    }
                    process.exit(1);
                } 
            }
        })
    }

    public async createTemplateRepo(req : TemplateRepoRequest) {
        return GithubService.getInstance().then(async (github) => {
            if (github != undefined) {

                const status = new Spinner('Creating remote repository...');
                status.start();

                let data: any = {
                    name: req.name,
                    private: req.private,
                    description: req.description || "",
                    template_owner: req.templateOwner,
                    template_repo: req.templateName
                };

                try {
                    const response = await github.repos.createUsingTemplate(data);
                    let repo = response.data;

                    console.log(chalk.green(`Your new repo was successfully created : ${repo.html_url}`));

                    if (req.collaborators != undefined) {
                        await this.addCollaborators(github,repo, req.collaborators);
                    }

                    status.stop();
                    return response.data.html_url;
                } catch (err) {
                    status.stop();
                    if (err.status == 422) {
                        console.log(chalk.red(`You already have a repo called ${data.name}`));
                    } else if (err.start == 404){ 
                        //template not found
                        console.log(chalk.red(`The specified template (${data.template_owner}/${data.template_repo}) doesn't exist.`));
                    } else {
                        console.log(chalk.red("An unexpected error occured, please try again."));
                    }
                
                    process.exit(1);
                } 
            }
        })
    }

    private async addCollaborators(github: Octokit, repo: any, collaborators : string[]){
        for (let user of collaborators) {
            try {
                await github.repos.addCollaborator({
                    owner: repo.owner.login,
                    repo: repo.name,
                    username: user
                })
                console.log(chalk.green(`${repo.html_url} has been invited to collaborate to your repo`));

            } catch {
                console.log(chalk.red(`Impossible to add this colaborator : ${user}`))
            }
        }
    }

    public async createGitignore() {
        const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

        if (filelist.length) {
            const answers: any = await InquirerService.askIgnoreFiles(filelist);
            if (answers.ignore.length) {
                fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
            } else {
                touch('.gitignore');
            }
        } else {
            touch('.gitignore');
        }
    }

    public async setupRepo(url: string) {
        const status = new Spinner('Initializing local repository and pushing to remote...');
        status.start();

        try {
            await git
                .init()
                .add('.gitignore')
                .add('./*')
                .commit('Initial commit')
                .addRemote('origin', url)
                .push('origin', 'master');
            return true;
        } catch (err) {
            throw err;
        } finally {
            status.stop();
        }
    }
}