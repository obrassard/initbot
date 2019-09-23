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

                    await this.initRepo(repo.ssh_url);

                    if (req.createDevelop) {
                        await this.createDevelopBranch(github,repo);
                    }

                    if (req.protectBranch) {
                        await this.protectBaseBranches(github,repo,req.createDevelop);
                    }

                    status.stop();
                    return response.data;
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

                let status = new Spinner('Creating remote repository...');
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

                    status.stop();
                    console.log(chalk.green(`Your new repo was successfully created : ${repo.html_url}`));

                    if (req.collaborators != undefined) {
                        status = new Spinner('Adding collaborators')
                        await this.addCollaborators(github,repo, req.collaborators);
                        status.stop();
                    }

                    await this.cloneRepo(repo.ssh_url, repo.name);

                    if (req.createDevelop) {
                        await this.createDevelopBranch(github,repo);
                    }

                    if (req.protectBranch) {
                        await this.protectBaseBranches(github,repo,req.createDevelop);
                    }

                    status.stop();
                    return response.data;
                } catch (err) {
                    status.stop();
                    if (err.status == 422) {
                        console.log(chalk.red(`You already have a repo called ${data.name}`));
                    } else if (err.start == 404){ 
                        //template not found
                        console.log(chalk.red(`The specified template (${data.template_owner}/${data.template_repo}) doesn't exist.`));
                    } else {
                        console.log(err);
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
                console.log(chalk.green(`${repo.owner.login} has been invited to collaborate to your repo`));

            } catch {
                console.log(chalk.red(`Impossible to add this colaborator : ${user}`))
            }
        }
    }

    private async createDevelopBranch(github: Octokit, repo: any){

        let spin = new Spinner('Creating develop branch...');

        try {
            spin.start();
            const gitDir = require('simple-git')(`./${repo.name}`)

            await gitDir.checkoutLocalBranch('develop').push('origin', 'develop');

            spin.stop();
            console.log(chalk.green(`Branch develop succesfully created`));
            spin.stop();
        } catch  (e) {
            console.log(e);
            console.log(chalk.yellow("Warning", "Couldn't create develop on remote"));
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

    public async protectBaseBranches(github: Octokit, repo:any, develop: boolean) {
        let spin = new Spinner('Protecting branches...');
        
        try {

            await github.repos.updateBranchProtection({
                owner: repo.owner.login,
                repo: repo.name,
                branch : "master",
                required_status_checks : null,
                enforce_admins : true,
                required_pull_request_reviews: {
                    dismissal_restrictions : undefined,
                    dismiss_stale_reviews : undefined
                },
                restrictions : null
            })

            if (develop) {
                await github.repos.updateBranchProtection({
                    owner: repo.owner.login,
                    repo: repo.name,
                    branch : "develop",
                    required_status_checks : null,
                    enforce_admins : true,
                    required_pull_request_reviews: {
                        dismissal_restrictions : undefined,
                        dismiss_stale_reviews : undefined
                    },
                    restrictions : null
                }) 
            }

            spin.stop();
            console.log(chalk.green(`Branches succesfully protected on remote.`));
        
        } catch (e) {
            spin.stop()
            console.log(chalk.yellow("Warning : An error occured while protecting branches"));
        }
    }

    public async cloneRepo(ssh_url: string, name:string) {
        const status = new Spinner('Cloning repo...');
        status.start();
        try {
            await git.clone(ssh_url, `./${name}`);
            status.stop();
            console.log(chalk.green('Repository was cloned at ' + process.cwd() + '/' + name))
            return true;
        } catch (err) {
            throw err;
        } finally {
            status.stop();
        }
    }

    public async initRepo(ssh_url: string) {
        const status = new Spinner('Initializing local repository and pushing to remote...');
        status.start();

        try {
            await this.createGitignore();
            await git
                .init()
                .add('.gitignore')
                .add('./*')
                .commit('Initial commit')
                .addRemote('origin', ssh_url)
                .push('origin', 'master');
            return true;
        } catch (err) {
            throw err;
        } finally {
            status.stop();
        }
    }
}