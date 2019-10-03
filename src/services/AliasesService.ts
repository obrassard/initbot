import { AliasRequest } from "../models/AliasRequest";
import Configstore from "configstore";
import chalk from "chalk";
import { TranslationService } from "./TranslationService";
const t = TranslationService.getTranslations();

export class AliasesService {
    public static setAlias(alias: AliasRequest) {
        const config = new Configstore('initbot');
        let aliasConfig: any = config.get("aliases");

        if (aliasConfig != undefined && alias.alias in aliasConfig) {
            console.log(chalk.red(t.aliasExists.replace('%',alias.alias)));
            process.exit(1);
        } 

        if (aliasConfig == undefined ){
            aliasConfig = {};
        }

        aliasConfig[alias.alias] = {
            name : alias.template,
            owner : alias.owner
        }

        config.set("aliases",aliasConfig);
        console.log(chalk.green(`@${alias.alias} ${t.nowMappedTo} ${alias.owner}/${alias.template}`))
    }

    public static resolveAlias(alias: string) {

        if (alias.startsWith("@")) {
            alias = alias.substring(1)
        }

        const config = new Configstore('initbot');
        let aliasConfig: any = config.get("aliases");
        
        if (aliasConfig == undefined || !(alias in aliasConfig)) {
            console.log(chalk.red(t.errorAliasNotFound));
            process.exit(1);
        } 

        return aliasConfig[alias];
    }

    public static removeAlias(alias: string) {
        const config = new Configstore('initbot');
        let aliasConfig: any = config.get("aliases");

        if (alias.startsWith("@")) {
            alias = alias.substring(1)
        }

        if (aliasConfig == undefined || !(alias in aliasConfig)) {
            console.log(chalk.red(t.errorAliasNotFound));
            process.exit(1);
        }

        delete aliasConfig[alias];
        config.set("aliases",aliasConfig);
        console.log(chalk.green(t.aliasSuccessDelete.replace('%',alias)))
    }

    public static getAllAliases() : string[][] {
        const config = new Configstore('initbot');
        let aliases: any = config.get("aliases");
        if (aliases){
            let aliasList = Object.keys(aliases).map((key) => {
                return [`@${key}`, `${aliases[key].owner}/${aliases[key].name}`]
            })
            return aliasList;
        } 
        return [];
    }

    public static clearAllAliases() {
        const config = new Configstore('initbot');
        config.delete("aliases");
        return true;
    }
}