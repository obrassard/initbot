"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configstore_1 = __importDefault(require("configstore"));
const chalk_1 = __importDefault(require("chalk"));
class AliasesService {
    static setAlias(alias) {
        const config = new configstore_1.default('initbot');
        let aliasConfig = config.get("aliases");
        if (aliasConfig != undefined && alias.alias in aliasConfig) {
            console.log(chalk_1.default.red("There is already a template alias named " + alias.alias));
            process.exit(1);
        }
        if (aliasConfig == undefined) {
            aliasConfig = {};
        }
        aliasConfig[alias.alias] = {
            name: alias.template,
            owner: alias.owner
        };
        config.set("aliases", aliasConfig);
        console.log(chalk_1.default.green(`@${alias.alias} is now mapped to ${alias.owner}/${alias.template}`));
    }
    static resolveAlias(alias) {
        if (alias.startsWith("@")) {
            alias = alias.substring(1);
        }
        const config = new configstore_1.default('initbot');
        let aliasConfig = config.get("aliases");
        if (aliasConfig == undefined || !(alias in aliasConfig)) {
            console.log(chalk_1.default.red("Error : This template alias doesn't exists"));
            process.exit(1);
        }
        return aliasConfig[alias];
    }
    static removeAlias(alias) {
        const config = new configstore_1.default('initbot');
        let aliasConfig = config.get("aliases");
        if (alias.startsWith("@")) {
            alias = alias.substring(1);
        }
        if (aliasConfig == undefined || !(alias in aliasConfig)) {
            console.log(chalk_1.default.red("Error : This template alias doesn't exists"));
            process.exit(1);
        }
        delete aliasConfig[alias];
        console.log(chalk_1.default.green(`The alias @${alias} has been deleted.`));
    }
}
exports.AliasesService = AliasesService;
