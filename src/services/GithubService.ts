import Octokit from '@octokit/rest';
import Configstore from 'configstore';
import CLI from 'clui';
const Spinner = CLI.Spinner;
import chalk from 'chalk';
import { InquirerService } from './InquirerService';
import { TranslationService } from "./TranslationService";

const t = TranslationService.getTranslations();
const config = new Configstore('initbot');

export class GithubService {

	public static async getInstance() {
		let token:any = await this.getStoredGithubToken();
		if (token != null) {
			const spin = new Spinner(t.authenticating);
			spin.start();
			try {
				let octokit = new Octokit({
					auth: token.token
				})
				await octokit.users.getAuthenticated()
				spin.stop();
				return octokit;
			} catch (error) {
				spin.stop();
				console.log(chalk.red(t.invalidToken));
				return await this.requestNewToken();
			}
		} else {
			return await this.requestNewToken();
		}
	}

	private static async _basicAuth() {
		let credentials:any = await InquirerService.askGithubCredentials();
		const spin = new Spinner('Authenticating you, please wait...');
		try {
			let octokit = new Octokit({
				auth: {
					username: credentials.username,
					password: credentials.password,
					async on2fa() {
						spin.stop();
						let twofa:any = await InquirerService.askGithub2Fa();
						spin.start();
						return twofa.code
					}
				}
			});
			spin.start();
			await octokit.users.getAuthenticated()
			spin.stop();
			return octokit;
		} catch (error) {
			spin.stop();
			if (error.status == 401) {
				console.log(chalk.red("Votre nom d'utilisateur ou votre mot de passe est incorrect, veuillez réésayer."))
			} else if (error.status == 422) {
				console.log(chalk.red('Impossible to create a new GitHub Token, you may delete the existing "Initbot CLI" token from your account (https://github.com/settings/tokens) and try again.'));
			}
			process.exit(1);
		}
	}

	private static async requestNewToken() {
		let octokit = await this._basicAuth();

		const spin = new Spinner('Authenticating you, please wait...');
		spin.start();
		try {
			const response = await octokit!.oauthAuthorizations.createAuthorization({
				scopes: ['repo'],
				note: "Initbot CLI"
			})

			const token = {
				token: response.data.token,
				id: response.data.id
			}

			if (response.data.token) {
				config.set('github.token', token);
				spin.stop();
				return octokit;
			} else {
				spin.stop();
				console.log(chalk.red("Missing Token", "Github token was not found in the response."));
				process.exit(1);
			}
		} catch {
			spin.stop();
			console.log(chalk.red("Sorry, an error occured. Please visit https://github.com/settings/tokens to delete the Initbot CLI token and try again."))
			process.exit(1);
		}
	}

	public static async getStoredGithubToken() {
		return config.get('github.token');
	}

	public static async destroyToken() {
		let token:any = await this.getStoredGithubToken();
		
		if (token != null) {
			console.log(chalk.blue("You must login with your username/password in order to rempve the authentication token from your GH accournt :"))
			let octokit = await this._basicAuth();
			try {
				config.delete('github.token')

				const response = await octokit!.oauthAuthorizations.deleteAuthorization({
					authorization_id: token.id
				}).catch( e => {
					console.log(e)
				});

				if (response) {
					console.log(chalk.green('You\'ve been successfully disconnected and the auth token have been removed from your account.'));
				}
				return false;

			} catch (error) {
				console.error(error);
				console.log(chalk.red("An unexpected error occured", "You've been disconnected, but their was an error while deleting your Github token."));
				process.exit(1);
			}
		} else {
			console.log('You are not authentified.')
		}
	}
}