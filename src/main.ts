#!/usr/bin/env node

import { RepoService } from "./services/RepoService";
import { InquirerService } from "./services/InquirerService";
import { EmptyRepoRequest } from "./models/EmptyRepoRequest";
import { AppInputs } from "./models/AppInputs";
import chalk from "chalk";
import { AliasRequest } from "./models/AliasRequest";
import { AliasesService } from "./services/AliasesService";
import { TemplateRepoRequest } from "./models/TemplateRepoRequest";
import { GithubService } from "./services/GithubService";

async function launchInteractiveMode(): Promise<AppInputs>{
    let args:any = await InquirerService.askRepoDetails();

    let input = new AppInputs();

    input.appMode = "git";
    input.createDevelop = args.createDevelop;
    input.description = args.description;
    input.name = args.name;
    input.private = args.visibility == "private";
    input.protectBranches = args.protectBranches;
    input.useTemplate = false;

    if (args.collaborators.length){
        input.collaborators = parseCollaborators(args.collaborators);
    }

    if (args.template){
        input.useTemplate = true;

        let template = parseRepoTemplate(args.template)
        input.templateOwner = template.owner;
        input.templateName = template.name;
    } 

    return input;
}

function parseCollaborators(collaboratorsString:string){
    let collaborators:string[] = [];
    collaboratorsString.split(',').forEach(x => {
        collaborators.push(x.trim());
    })

    return collaborators;
}

function parseRepoTemplate(template:string){
    let temp:string[] = template.split('/');

    if (template.startsWith('@')) {
       return AliasesService.resolveAlias(template);
    }
    else if (temp.length < 2) {
        console.log(chalk.red('Invalid template : ' + template));
        process.exit(1);
        return {
            name: temp[1].trim(),
            owner: temp[0].trim()
        };
    }
}

function parseArguments(){
    const args = require('minimist')(process.argv.slice(2));

    let input = new AppInputs();

    if ('help' in args) {
        input.appMode = "help";
    } else if ('logout' in args) {
        input.appMode = "logout";
    } else if ('alias' in args ) {
        input.appMode = "alias";
        input.alias = new AliasRequest(args.alias);
    } else if ('rm' in args) {
        input.appMode = "rmalias";
        if (typeof args.rm != "string"){
            console.log(chalk.red("Missing arguments for --rm mode, please refer to the docs. (initbot --help)"));
            process.exit(1);
        }
        input.aliasName = args.rm;
    } else {
        input.appMode = "git";
        if (args._.length == 0) {
            return null;
        }

        input.name = args._[0];
        input.createDevelop = !("b" in args);
        input.description = args.d || "";
        input.private = !("p" in args);
        input.protectBranches = !("u" in args);
        input.useTemplate = ("t" in args);

        if (input.useTemplate) {

            if (typeof args.t != "string"){
                console.log(chalk.red("Missing arguments for -t, please refer to the docs. (initbot --help)"));
                process.exit(1);
            }

            if (args.t.startsWith('@')) {
                let alias = AliasesService.resolveAlias(args.t);
                input.templateOwner = alias.owner;
                input.templateName = alias.name;
            } else {
                let template = parseRepoTemplate(args.t)
                input.templateOwner = template.owner;
                input.templateName = template.name;
            }
        }

        if ("c" in args && args.c.length > 0){
            input.collaborators = parseCollaborators(args.c);
        }
    }

    return input;
}

async function main() {

    let args = parseArguments();
    if (args == null) {
        args =  await launchInteractiveMode();
    }

    if (args.appMode == "alias") {
        AliasesService.setAlias(args.alias!);
    } else if (args.appMode == "rmalias") {
        AliasesService.removeAlias(args.aliasName!);
    } else if (args.appMode == "help") {
        //TODO Help manual
        console.log('HELP TEXT');
    } else if (args.appMode == "logout") {
        await GithubService.destroyToken();
    } else {

        if (args.useTemplate) {
            let req = new TemplateRepoRequest(args.name!, args.private!, args.templateOwner!,
                                              args.templateName!, args.createDevelop!, args.protectBranches!);
            req.collaborators = args.collaborators;
            req.description = args.description;
            
            let service = new RepoService();
            await service.createTemplateRepo(req);
            
        } else {
            let req = new EmptyRepoRequest(args.name!, args.private!, args.createDevelop!, args.protectBranches!);
            req.collaborators = args.collaborators;
            req.description = args.description;

            let service = new RepoService();
            await service.createEmptyRepo(req);
        }
    }
    
    console.log("Thanks for using initbot");

}

main();