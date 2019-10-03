import _ from 'lodash';
import fs from 'fs';
import CLI from 'clui';
import touch from 'touch';
import chalk from 'chalk';
import '../extensions/stringExtension';
const Spinner = CLI.Spinner;
import { TranslationService } from "./TranslationService";
const t = TranslationService.getTranslations();
import { InquirerService } from './InquirerService';
import { GithubService } from './GithubService';
import { EmptyRepoRequest } from '../models/EmptyRepoRequest';
import { TemplateRepoRequest } from '../models/TemplateRepoRequest';
import Octokit from '@octokit/rest';

export class RepoService {

    public async createEmptyRepo(req : EmptyRepoRequest) {
        return GithubService.getInstance().then(async (github) => {
            if (github != undefined) {

                const status = new Spinner(t.creatingRemoteRepo);
                status.start();

                let data: any = {
                    name: req.name,
                    private: req.private,
                    description: req.description || ""
                };

                try {
                    const response = await github.repos.createForAuthenticatedUser(data);
                    let repo = response.data;

                    console.log(chalk.green(t.repoCreateSuccess.replace('%',repo.html_url)));

                    if (req.collaborators != undefined) {
                        await this.addCollaborators(github,repo, req.collaborators);
                    }

                    status.stop();

                    await this.initRepo(repo.ssh_url, repo.name);

                    if (req.createDevelop) {
                        await this.createDevelopBranch(repo);
                    }

                    if (req.protectBranch) {
                        await this.protectBaseBranches(github,repo,req.createDevelop);
                    }

                    status.stop();
                    return response.data;
                } catch (err) {
                    status.stop();
                    if (err.status == 422) {
                        console.log(chalk.red(t.errorRepoExists.replace('%',data.name)));
                    } else {
                        console.log(chalk.red(t.errorUnexpected));
                    }
                    process.exit(1);
                } 
            }
        })
    }

    public async createTemplateRepo(req : TemplateRepoRequest) {
        return GithubService.getInstance().then(async (github) => {
            if (github != undefined) {

                let status = new Spinner(t.creatingRemoteRepo);
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
                    console.log(chalk.green(t.repoCreateSuccess.replace('%',repo.html_url)));

                    if (req.collaborators != undefined) {
                        status = new Spinner(t.addingCollaborator)
                        await this.addCollaborators(github,repo, req.collaborators);
                        status.stop();
                    }

                    await this.cloneRepo(repo.ssh_url, repo.name);

                    if (req.createDevelop) {
                        await this.createDevelopBranch(repo);
                    }

                    if (req.protectBranch) {
                        await this.protectBaseBranches(github,repo,req.createDevelop);
                    }

                    status.stop();
                    return response.data;
                } catch (err) {
                    status.stop();
                    if (err.status == 422) {
                        console.log(chalk.red(t.errorRepoExists.replace('%',data.name)));
                    } else if (err.start == 404){ 
                        //template not found
                        console.log(chalk.red(t.errorTemplateNotFound.replace('%',`${data.template_owner}/${data.template_repo}`)));
                    } else {
                        console.log(err);
                        console.log(chalk.red(t.errorUnexpected));
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
                console.log(chalk.green(t.userInvited.replace('%', repo.owner.login)));

            } catch {
                console.log(chalk.red(t.errorCollaboratorNotFound.replace('%',user)))
            }
        }
    }

    private async createDevelopBranch(repo: any){

        let spin = new Spinner(t.creatingDevelop);

        try {
            spin.start();
            const git = require('simple-git')(`./${repo.name}`)

            await git.checkoutLocalBranch('develop').push('origin', 'develop');

            spin.stop();
            console.log(chalk.green(t.developCreated));
            spin.stop();
        } catch  (e) {
            console.log(e);
            console.log(chalk.yellow(t.warningBranchCreationError));
        }

    }

    public async createGitignore(dirname:string) {
        const filelist = ["node_modules", ".vscode", "./idea"];

        const answers: any = await InquirerService.askIgnoreFiles(filelist);
        if (answers.ignore.length) {
            console.log('Create file')
            fs.writeFileSync(`./${dirname}/.gitignore`, answers.ignore.join('\n'));
        } else {
            touch(`./${dirname}/.gitignore`);
        }
    }

    public async createReadme(projectName:string) {
        fs.writeFileSync(`./${projectName}/readme.md`, `# ${projectName.capitalize()}`);
    }

    public async protectBaseBranches(github: Octokit, repo:any, develop: boolean) {
        let spin = new Spinner(t.protectingBranches);
        
        try {
            spin.start();
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
            console.log(chalk.green(t.branchProtectionSuccess));
        
        } catch (e) {
            spin.stop()
            console.log(chalk.yellow(t.warningBranchProtection));
        }
    }

    public async cloneRepo(ssh_url: string, name:string) {
        const status = new Spinner('Cloning repo...');
        status.start();
        try {
            let git = require('simple-git')('./');
            await git.clone(ssh_url, `./${name}`);
            status.stop();
            console.log(chalk.green(t.repoCloneSuccess.replace('%',`${process.cwd()}/${name}`)))
            return true;
        } catch (err) {
            console.log(chalk.red(t.errorSshClone))
            console.log(err);
            process.exit(1);
        } finally {
            status.stop();
        }
    }

    public async initRepo(ssh_url: string, name:string) {
        const status = new Spinner(t.initializingRepo);
        try {
            status.start();
            this.createDirectory(name);
            let git = require('simple-git')(`./${name}`);
            status.stop()
            await this.createGitignore(name);
            await this.createReadme(name);
            status.start();
            await git
                .init()
                .add('.gitignore')
                .add('readme.md')
                .add('./*')
                .commit('Initial commit')
                .addRemote('origin', ssh_url)
                .push('origin', 'master');
            return true;
        } catch (err) {
            console.log(chalk.red(t.errorSshPush))
            console.log(err);
            process.exit(1);
        } finally {
            status.stop();
        }
    }

    public createDirectory(name:string){
        let fs = require('fs');
        let dir = './'+name;

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        } else {
            console.log(chalk.red(t.errorRepoInit.replace('%',name)));
            process.exit(1);
        }
    }
}