import { FileService } from './FileService';
import inquirer from 'inquirer';
import { TranslationService } from "./TranslationService";

const t = TranslationService.getTranslations();

export class InquirerService {

	public static askGithubCredentials() {
		const questions = [
			{
				name: 'username',
				type: 'input',
				message: t.inquirerGhUsername,
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
						return t.inquirerGhUsernameValidation;
					}
				}
			},
			{
				name: 'password',
				type: 'password',
				message: t.inquirerPassword,
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
						return t.inquirerPasswordValidation;
					}
				}
			}
		];
		return inquirer.prompt(questions);
	}

	public static askGithub2Fa() {
		const question = [{
			name: 'code',
			type: 'input',
			message: 'Enter your Github 2FA code:',
			validate: function (value: string) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your code.';
				}
			}
		}];
		let code = inquirer.prompt(question);
		return code;
	}

	public static askRepoDetails() {

		const questions = [
			{
				type: 'input',
				name: 'name',
				message: t.inquirerRepoName,
				default: FileService.getCurrentDirectoryBase(),
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
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
		return inquirer.prompt(questions);
	}

	public static askIgnoreFiles(filelist: string[]) {
		const questions = [
			{
				type: 'checkbox',
				name: 'ignore',
				message: t.inquirerIgnoreFiles,
				choices: filelist,
				default: ['node_modules', 'bower_components']
			}
		];
		return inquirer.prompt(questions);
	}

};
