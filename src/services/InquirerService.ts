import { FileService } from './FileService';
import inquirer from 'inquirer';


export class InquirerService {

	public static askGithubCredentials() {
		const questions = [
			{
				name: 'username',
				type: 'input',
				message: 'Enter your Github username or e-mail address:',
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter your username or e-mail address.';
					}
				}
			},
			{
				name: 'password',
				type: 'password',
				message: 'Enter your password:',
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter your password.';
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
				message: 'Enter a name for the repository:',
				default: FileService.getCurrentDirectoryBase(),
				validate: function (value: string) {
					if (value.length) {
						return true;
					} else {
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
		return inquirer.prompt(questions);
	}

	public static askIgnoreFiles(filelist: string[]) {
		const questions = [
			{
				type: 'checkbox',
				name: 'ignore',
				message: 'Select the files and/or folders you wish to ignore:',
				choices: filelist,
				default: ['node_modules', 'bower_components']
			}
		];
		return inquirer.prompt(questions);
	}

};
