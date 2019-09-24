#!/usr/bin/env node
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
const RepoService_1 = require("./services/RepoService");
const InquirerService_1 = require("./services/InquirerService");
const EmptyRepoRequest_1 = require("./models/EmptyRepoRequest");
const AppInputs_1 = require("./models/AppInputs");
const chalk_1 = __importDefault(require("chalk"));
const AliasRequest_1 = require("./models/AliasRequest");
const AliasesService_1 = require("./services/AliasesService");
const TemplateRepoRequest_1 = require("./models/TemplateRepoRequest");
const GithubService_1 = require("./services/GithubService");
function launchInteractiveMode() {
    return __awaiter(this, void 0, void 0, function* () {
        let args = yield InquirerService_1.InquirerService.askRepoDetails();
        let input = new AppInputs_1.AppInputs();
        input.appMode = "git";
        input.createDevelop = args.createDevelop;
        input.description = args.description;
        input.name = args.name;
        input.private = args.visibility == "private";
        input.protectBranches = args.protectBranches;
        input.useTemplate = false;
        if (args.collaborators.length) {
            input.collaborators = parseCollaborators(args.collaborators);
        }
        if (args.template) {
            input.useTemplate = true;
            let template = parseRepoTemplate(args.template);
            input.templateOwner = template.owner;
            input.templateName = template.name;
        }
        return input;
    });
}
function parseCollaborators(collaboratorsString) {
    let collaborators = [];
    collaboratorsString.split(',').forEach(x => {
        collaborators.push(x.trim());
    });
    return collaborators;
}
function parseRepoTemplate(template) {
    let temp = template.split('/');
    if (template.startsWith('@')) {
        return AliasesService_1.AliasesService.resolveAlias(template);
    }
    else if (temp.length < 2) {
        console.log(chalk_1.default.red('Invalid template : ' + template));
        process.exit(1);
        return {
            name: temp[1].trim(),
            owner: temp[0].trim()
        };
    }
}
function parseArguments() {
    const args = require('minimist')(process.argv.slice(2));
    let input = new AppInputs_1.AppInputs();
    if ('help' in args) {
        input.appMode = "help";
    }
    if ('logout' in args) {
        input.appMode = "logout";
    }
    else if ('alias' in args) {
        input.appMode = "alias";
        input.alias = new AliasRequest_1.AliasRequest(args.alias);
    }
    else if ('rm' in args) {
        input.appMode = "rmalias";
        if (typeof args.rm != "string") {
            console.log(chalk_1.default.red("Missing arguments for --rm mode, please refer to the docs. (initbot --help)"));
            process.exit(1);
        }
        input.aliasName = args.rm;
    }
    else {
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
            if (typeof args.t != "string") {
                console.log(chalk_1.default.red("Missing arguments for -t, please refer to the docs. (initbot --help)"));
                process.exit(1);
            }
            if (args.t.startsWith('@')) {
                let alias = AliasesService_1.AliasesService.resolveAlias(args.t);
                input.templateOwner = alias.owner;
                input.templateName = alias.name;
            }
            else {
                let template = parseRepoTemplate(args.t);
                input.templateOwner = template.owner;
                input.templateName = template.name;
            }
        }
        if ("c" in args && args.c.length > 0) {
            input.collaborators = parseCollaborators(args.c);
        }
    }
    return input;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let args = parseArguments();
        if (args == null) {
            args = yield launchInteractiveMode();
        }
        if (args.appMode == "alias") {
            AliasesService_1.AliasesService.setAlias(args.alias);
        }
        else if (args.appMode == "rmalias") {
            AliasesService_1.AliasesService.removeAlias(args.aliasName);
        }
        else if (args.appMode == "help") {
            //TODO Help manual
            console.log('HELP TEXT');
        }
        else if (args.appMode == "logout") {
            yield GithubService_1.GithubService.destroyToken();
        }
        else {
            if (args.useTemplate) {
                let req = new TemplateRepoRequest_1.TemplateRepoRequest(args.name, args.private, args.templateOwner, args.templateName, args.createDevelop, args.protectBranches);
                req.collaborators = args.collaborators;
                req.description = args.description;
                let service = new RepoService_1.RepoService();
                yield service.createTemplateRepo(req);
            }
            else {
                let req = new EmptyRepoRequest_1.EmptyRepoRequest(args.name, args.private, args.createDevelop, args.protectBranches);
                req.collaborators = args.collaborators;
                req.description = args.description;
                let service = new RepoService_1.RepoService();
                yield service.createEmptyRepo(req);
            }
        }
        console.log("Thanks for using initbot");
    });
}
main();
