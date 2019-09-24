"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const clui_1 = __importDefault(require("clui"));
const touch_1 = __importDefault(require("touch"));
const chalk_1 = __importDefault(require("chalk"));
require("../extensions/stringExtension");
const Spinner = clui_1.default.Spinner;
const InquirerService_1 = require("./InquirerService");
const GithubService_1 = require("./GithubService");
class RepoService {
    createEmptyRepo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return GithubService_1.GithubService.getInstance().then((github) => __awaiter(this, void 0, void 0, function* () {
                if (github != undefined) {
                    const status = new Spinner('Creating remote repository...');
                    status.start();
                    let data = {
                        name: req.name,
                        private: req.private,
                        description: req.description || ""
                    };
                    try {
                        const response = yield github.repos.createForAuthenticatedUser(data);
                        let repo = response.data;
                        console.log(chalk_1.default.green(`Your new repo was successfully created : ${repo.html_url}`));
                        if (req.collaborators != undefined) {
                            yield this.addCollaborators(github, repo, req.collaborators);
                        }
                        status.stop();
                        yield this.initRepo(repo.ssh_url, repo.name);
                        if (req.createDevelop) {
                            yield this.createDevelopBranch(repo);
                        }
                        if (req.protectBranch) {
                            yield this.protectBaseBranches(github, repo, req.createDevelop);
                        }
                        status.stop();
                        return response.data;
                    }
                    catch (err) {
                        status.stop();
                        if (err.status == 422) {
                            console.log(chalk_1.default.red(`You already have a repo called ${data.name}`));
                        }
                        else {
                            console.log(chalk_1.default.red("An error occured, please try again."));
                        }
                        process.exit(1);
                    }
                }
            }));
        });
    }
    createTemplateRepo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return GithubService_1.GithubService.getInstance().then((github) => __awaiter(this, void 0, void 0, function* () {
                if (github != undefined) {
                    let status = new Spinner('Creating remote repository...');
                    status.start();
                    let data = {
                        name: req.name,
                        private: req.private,
                        description: req.description || "",
                        template_owner: req.templateOwner,
                        template_repo: req.templateName
                    };
                    try {
                        const response = yield github.repos.createUsingTemplate(data);
                        let repo = response.data;
                        status.stop();
                        console.log(chalk_1.default.green(`Your new repo was successfully created : ${repo.html_url}`));
                        if (req.collaborators != undefined) {
                            status = new Spinner('Adding collaborators');
                            yield this.addCollaborators(github, repo, req.collaborators);
                            status.stop();
                        }
                        yield this.cloneRepo(repo.ssh_url, repo.name);
                        if (req.createDevelop) {
                            yield this.createDevelopBranch(repo);
                        }
                        if (req.protectBranch) {
                            yield this.protectBaseBranches(github, repo, req.createDevelop);
                        }
                        status.stop();
                        return response.data;
                    }
                    catch (err) {
                        status.stop();
                        if (err.status == 422) {
                            console.log(chalk_1.default.red(`You already have a repo called ${data.name}`));
                        }
                        else if (err.start == 404) {
                            //template not found
                            console.log(chalk_1.default.red(`The specified template (${data.template_owner}/${data.template_repo}) doesn't exist.`));
                        }
                        else {
                            console.log(err);
                            console.log(chalk_1.default.red("An unexpected error occured, please try again."));
                        }
                        process.exit(1);
                    }
                }
            }));
        });
    }
    addCollaborators(github, repo, collaborators) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let user of collaborators) {
                try {
                    yield github.repos.addCollaborator({
                        owner: repo.owner.login,
                        repo: repo.name,
                        username: user
                    });
                    console.log(chalk_1.default.green(`${repo.owner.login} has been invited to collaborate to your repo`));
                }
                catch (_a) {
                    console.log(chalk_1.default.red(`Impossible to add this colaborator : ${user}`));
                }
            }
        });
    }
    createDevelopBranch(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            let spin = new Spinner('Creating develop branch...');
            try {
                spin.start();
                const git = require('simple-git')(`./${repo.name}`);
                yield git.checkoutLocalBranch('develop').push('origin', 'develop');
                spin.stop();
                console.log(chalk_1.default.green(`Branch develop succesfully created`));
                spin.stop();
            }
            catch (e) {
                console.log(e);
                console.log(chalk_1.default.yellow("Warning", "Couldn't create develop on remote"));
            }
        });
    }
    createGitignore(dirname) {
        return __awaiter(this, void 0, void 0, function* () {
            const filelist = ["node_modules", ".vscode", "./idea"];
            const answers = yield InquirerService_1.InquirerService.askIgnoreFiles(filelist);
            if (answers.ignore.length) {
                console.log('Create file');
                fs_1.default.writeFileSync(`./${dirname}/.gitignore`, answers.ignore.join('\n'));
            }
            else {
                touch_1.default(`./${dirname}/.gitignore`);
            }
        });
    }
    createReadme(projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            fs_1.default.writeFileSync(`./${projectName}/readme.md`, `# ${projectName.capitalize()}`);
        });
    }
    protectBaseBranches(github, repo, develop) {
        return __awaiter(this, void 0, void 0, function* () {
            let spin = new Spinner('Protecting branches...');
            try {
                spin.start();
                yield github.repos.updateBranchProtection({
                    owner: repo.owner.login,
                    repo: repo.name,
                    branch: "master",
                    required_status_checks: null,
                    enforce_admins: true,
                    required_pull_request_reviews: {
                        dismissal_restrictions: undefined,
                        dismiss_stale_reviews: undefined
                    },
                    restrictions: null
                });
                if (develop) {
                    yield github.repos.updateBranchProtection({
                        owner: repo.owner.login,
                        repo: repo.name,
                        branch: "develop",
                        required_status_checks: null,
                        enforce_admins: true,
                        required_pull_request_reviews: {
                            dismissal_restrictions: undefined,
                            dismiss_stale_reviews: undefined
                        },
                        restrictions: null
                    });
                }
                spin.stop();
                console.log(chalk_1.default.green(`Branches succesfully protected on remote.`));
            }
            catch (e) {
                spin.stop();
                console.log(chalk_1.default.yellow("Warning : An error occured while protecting branches"));
            }
        });
    }
    cloneRepo(ssh_url, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = new Spinner('Cloning repo...');
            status.start();
            try {
                let git = require('simple-git')('./');
                yield git.clone(ssh_url, `./${name}`);
                status.stop();
                console.log(chalk_1.default.green('Repository was cloned at ' + process.cwd() + '/' + name));
                return true;
            }
            catch (err) {
                console.log(chalk_1.default.red('Could not clone the repo. Please ensure that you have an SSH key configured with your GitHub account'));
                console.log(err);
                process.exit(1);
            }
            finally {
                status.stop();
            }
        });
    }
    initRepo(ssh_url, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = new Spinner('Initializing local repository and pushing to remote...');
            try {
                status.start();
                this.createDirectory(name);
                let git = require('simple-git')(`./${name}`);
                status.stop();
                yield this.createGitignore(name);
                yield this.createReadme(name);
                status.start();
                yield git
                    .init()
                    .add('.gitignore')
                    .add('readme.md')
                    .add('./*')
                    .commit('Initial commit')
                    .addRemote('origin', ssh_url)
                    .push('origin', 'master');
                return true;
            }
            catch (err) {
                console.log(chalk_1.default.red('Could not push to the remote repo. Please ensure that you have an SSH key configured with your GitHub account'));
                console.log(err);
                process.exit(1);
            }
            finally {
                status.stop();
            }
        });
    }
    createDirectory(name) {
        let fs = require('fs');
        let dir = './' + name;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        else {
            console.log(chalk_1.default.red(`Cannot init repo. There is already a directory named ${name}`));
            process.exit(1);
        }
    }
}
exports.RepoService = RepoService;
