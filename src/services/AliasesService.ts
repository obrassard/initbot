import { AliasRequest } from "../models/AliasRequest";
import Configstore from "configstore";
import chalk from "chalk";

export class AliasesService {
    public static setAlias(alias: AliasRequest) {
        const config = new Configstore('initbot');
        let aliasConfig: any = config.get("aliases");

        if (aliasConfig != undefined && alias.alias in aliasConfig) {
            console.log(chalk.red("There is already a template alias named " + alias.alias ));
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
        console.log(chalk.green(`@${alias.alias} is now mapped to ${alias.owner}/${alias.template}`))
    }

    public static resolveAlias(alias: string) {

        if (alias.startsWith("@")) {
            alias = alias.substring(1)
        }

        const config = new Configstore('initbot');
        let aliasConfig: any = config.get("aliases");
        
        if (aliasConfig == undefined || !(alias in aliasConfig)) {
            console.log(chalk.red("Error : This template alias doesn't exists"));
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
            console.log(chalk.red("Error : This template alias doesn't exists"));
            process.exit(1);
        }

        delete aliasConfig[alias];
        console.log(chalk.green(`The alias @${alias} has been deleted.`))
    }

    public static clearAllAliases() {
        const config = new Configstore('initbot');
        config.delete("aliases");
        return true;
    }
}