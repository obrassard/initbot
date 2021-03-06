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
const rest_1 = __importDefault(require("@octokit/rest"));
const configstore_1 = __importDefault(require("configstore"));
const clui_1 = __importDefault(require("clui"));
const Spinner = clui_1.default.Spinner;
const chalk_1 = __importDefault(require("chalk"));
const InquirerService_1 = require("./InquirerService");
const TranslationService_1 = require("./TranslationService");
const t = TranslationService_1.TranslationService.getTranslations();
const config = new configstore_1.default('initbot');
class GithubService {
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.getStoredGithubToken();
            if (token != null) {
                const spin = new Spinner(t.authenticating);
                spin.start();
                try {
                    let octokit = new rest_1.default({
                        auth: token.token
                    });
                    yield octokit.users.getAuthenticated();
                    spin.stop();
                    return octokit;
                }
                catch (error) {
                    spin.stop();
                    console.log(chalk_1.default.red(t.invalidToken));
                    return yield this.requestNewToken();
                }
            }
            else {
                return yield this.requestNewToken();
            }
        });
    }
    static _basicAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials = yield InquirerService_1.InquirerService.askGithubCredentials();
            const spin = new Spinner(t.authenticating);
            try {
                let octokit = new rest_1.default({
                    auth: {
                        username: credentials.username,
                        password: credentials.password,
                        on2fa() {
                            return __awaiter(this, void 0, void 0, function* () {
                                spin.stop();
                                let twofa = yield InquirerService_1.InquirerService.askGithub2Fa();
                                spin.start();
                                return twofa.code;
                            });
                        }
                    }
                });
                spin.start();
                yield octokit.users.getAuthenticated();
                spin.stop();
                return octokit;
            }
            catch (error) {
                spin.stop();
                if (error.status == 401) {
                    console.log(chalk_1.default.red(t.invalidGHCredentials));
                }
                else if (error.status == 422) {
                    console.log(chalk_1.default.red(t.errorCannotCreateToken));
                }
                process.exit(1);
            }
        });
    }
    static requestNewToken() {
        return __awaiter(this, void 0, void 0, function* () {
            let octokit = yield this._basicAuth();
            const spin = new Spinner(t.authenticating);
            spin.start();
            try {
                const response = yield octokit.oauthAuthorizations.createAuthorization({
                    scopes: ['repo'],
                    note: "Initbot CLI"
                });
                const token = {
                    token: response.data.token,
                    id: response.data.id
                };
                if (response.data.token) {
                    config.set('github.token', token);
                    spin.stop();
                    return octokit;
                }
                else {
                    spin.stop();
                    console.log(chalk_1.default.red(t.errorMissingToken));
                    process.exit(1);
                }
            }
            catch (_a) {
                spin.stop();
                console.log(chalk_1.default.red(t.errorUnexpectedGH));
                process.exit(1);
            }
        });
    }
    static getStoredGithubToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return config.get('github.token');
        });
    }
    static destroyToken() {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.getStoredGithubToken();
            if (token != null) {
                console.log(chalk_1.default.blue(t.loginToDeleteToken));
                let octokit = yield this._basicAuth();
                try {
                    config.delete('github.token');
                    const response = yield octokit.oauthAuthorizations.deleteAuthorization({
                        authorization_id: token.id
                    }).catch(e => {
                        console.log(e);
                    });
                    if (response) {
                        console.log(chalk_1.default.green(t.logoutSuccess));
                    }
                    return false;
                }
                catch (error) {
                    console.error(error);
                    console.log(chalk_1.default.red(t.errorLogoutUnexpected));
                    process.exit(1);
                }
            }
            else {
                console.log(t.notAuthentified);
            }
        });
    }
}
exports.GithubService = GithubService;
//# sourceMappingURL=GithubService.js.map