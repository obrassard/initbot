"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileService_1 = require("./FileService");
const inquirer_1 = __importDefault(require("inquirer"));
class InquirerService {
    static askGithubCredentials() {
        const questions = [
            {
                name: 'username',
                type: 'input',
                message: 'Enter your Github username or e-mail address:',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return 'Please enter your username or e-mail address.';
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your password:',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return 'Please enter your password.';
                    }
                }
            }
        ];
        return inquirer_1.default.prompt(questions);
    }
    static askGithub2Fa() {
        const question = [{
                name: 'code',
                type: 'input',
                message: 'Enter your Github 2FA code:',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return 'Please enter your code.';
                    }
                }
            }];
        let code = inquirer_1.default.prompt(question);
        return code;
    }
    static askRepoDetails() {
        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for the repository:',
                default: FileService_1.FileService.getCurrentDirectoryBase(),
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return 'Please enter a name for the repository.';
                    }
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Optionally enter a description of the repository:'
            },
            {
                type: 'list',
                name: 'visibility',
                message: 'Public or private:',
                choices: ['public', 'private'],
                default: 'private'
            },
            {
                type: 'input',
                name: 'collaborators',
                message: 'Add collaborators ? (Usernames separated by commas):',
            },
            {
                type: 'input',
                name: 'template',
                message: 'Optionally enter a template repo [owner/repo]:',
            },
            {
                type: 'confirm',
                name: 'createDevelop',
                message: 'Create develop branch [yes, no]:',
                default: true
            },
            {
                type: 'confirm',
                name: 'protectBranches',
                message: 'Protect master and develop branches [yes,no]:',
                default: true
            },
        ];
        return inquirer_1.default.prompt(questions);
    }
    static askIgnoreFiles(filelist) {
        const questions = [
            {
                type: 'checkbox',
                name: 'ignore',
                message: 'Select the files and/or folders you wish to ignore:',
                choices: filelist,
                default: ['node_modules', 'bower_components']
            }
        ];
        return inquirer_1.default.prompt(questions);
    }
}
exports.InquirerService = InquirerService;
;
//# sourceMappingURL=InquirerService.js.map