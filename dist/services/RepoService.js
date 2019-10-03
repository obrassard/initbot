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
const TranslationService_1 = require("./TranslationService");
const t = TranslationService_1.TranslationService.getTranslations();
const InquirerService_1 = require("./InquirerService");
const GithubService_1 = require("./GithubService");
class RepoService {
    createEmptyRepo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return GithubService_1.GithubService.getInstance().then((github) => __awaiter(this, void 0, void 0, function* () {
                if (github != undefined) {
                    const status = new Spinner(t.creatingRemoteRepo);
                    status.start();
                    let data = {
                        name: req.name,
                        private: req.private,
                        description: req.description || ""
                    };
                    try {
                        const response = yield github.repos.createForAuthenticatedUser(data);
                        let repo = response.data;
                        console.log(chalk_1.default.green(t.repoCreateSuccess.replace('%', repo.html_url)));
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
                            console.log(chalk_1.default.red(t.errorRepoExists.replace('%', data.name)));
                        }
                        else {
                            console.log(chalk_1.default.red(t.errorUnexpected));
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
                    let status = new Spinner(t.creatingRemoteRepo);
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
                        console.log(chalk_1.default.green(t.repoCreateSuccess.replace('%', repo.html_url)));
                        if (req.collaborators != undefined) {
                            status = new Spinner(t.addingCollaborator);
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
                            console.log(chalk_1.default.red(t.errorRepoExists.replace('%', data.name)));
                        }
                        else if (err.start == 404) {
                            //template not found
                            console.log(chalk_1.default.red(t.errorTemplateNotFound.replace('%', `${data.template_owner}/${data.template_repo}`)));
                        }
                        else {
                            console.log(err);
                            console.log(chalk_1.default.red(t.errorUnexpected));
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
                    console.log(chalk_1.default.green(t.userInvited.replace('%', repo.owner.login)));
                }
                catch (_a) {
                    console.log(chalk_1.default.red(t.errorCollaboratorNotFound.replace('%', user)));
                }
            }
        });
    }
    createDevelopBranch(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            let spin = new Spinner(t.creatingDevelop);
            try {
                spin.start();
                const git = require('simple-git')(`./${repo.name}`);
                yield git.checkoutLocalBranch('develop').push('origin', 'develop');
                spin.stop();
                console.log(chalk_1.default.green(t.developCreated));
                spin.stop();
            }
            catch (e) {
                console.log(e);
                console.log(chalk_1.default.yellow(t.warningBranchCreationError));
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
            let spin = new Spinner(t.protectingBranches);
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
                console.log(chalk_1.default.green(t.branchProtectionSuccess));
            }
            catch (e) {
                spin.stop();
                console.log(chalk_1.default.yellow(t.warningBranchProtection));
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
                console.log(chalk_1.default.green(t.repoCloneSuccess.replace('%', `${process.cwd()}/${name}`)));
                return true;
            }
            catch (err) {
                console.log(chalk_1.default.red(t.errorSshClone));
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
            const status = new Spinner(t.initializingRepo);
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
                console.log(chalk_1.default.red(t.errorSshPush));
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
            console.log(chalk_1.default.red(t.errorRepoInit.replace('%', name)));
            process.exit(1);
        }
    }
}
exports.RepoService = RepoService;
//# sourceMappingURL=RepoService.js.map