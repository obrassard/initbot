import chalk from "chalk";

export class AliasRequest {

    constructor(rawalias: string) {

        if (typeof rawalias != "string"){
            console.log(chalk.red("Missing arguments, please refer to the docs. (initbot --help)"));
            process.exit(1);
        }

        let parts = rawalias.split("=");
        if (parts.length < 2) {
            console.log(chalk.red('Invalid syntax : ' + rawalias));
            process.exit(1);
        }

        let template = parts[1].split('/');
        if (template.length < 2) {
            console.log(chalk.red('Invalid syntax : ' + rawalias));
            process.exit(1);
        }

        this.alias = parts[0].trim();
        this.owner = template[0].trim();
        this.template = template[1].trim();
    }

    public alias: string;
    public owner: string;
    public template: string;
}