"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileService_1 = require("./FileService");
const inquirer_1 = __importDefault(require("inquirer"));
const TranslationService_1 = require("./TranslationService");
const t = TranslationService_1.TranslationService.getTranslations();
class InquirerService {
    static askGithubCredentials() {
        const questions = [
            {
                name: 'username',
                type: 'input',
                message: t.inquirerGhUsername,
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return t.inquirerGhUsernameValidation;
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: t.inquirerPassword,
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return t.inquirerPasswordValidation;
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
                message: t.inquirerRepoName,
                default: FileService_1.FileService.getCurrentDirectoryBase(),
                validate: function (value) {
                    if (value.length) {
                        return true;
                    }
                    else {
                        return t.inquirerRepoNameValidation;
                    }
                }
            },
            {
                type: 'input',
                name: 'description',
                message: t.inquirerDesc
            },
            {
                type: 'list',
                name: 'visibility',
                message: t.inquirerPublicPrivate,
                choices: ['public', 'private'],
                default: 'private',
            },
            {
                type: 'input',
                name: 'collaborators',
                message: t.inquirerColaborators,
            },
            {
                type: 'input',
                name: 'template',
                message: t.inquirerTemplate,
            },
            {
                type: 'confirm',
                name: 'createDevelop',
                message: t.inquirerDevelop,
                default: true
            },
            {
                type: 'confirm',
                name: 'protectBranches',
                message: t.inquirerProtectBranches,
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
                message: t.inquirerIgnoreFiles,
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