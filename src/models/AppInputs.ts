import { AliasRequest } from "./AliasRequest";

export class AppInputs {

    // App mode [git,alias, rmalias, help]
    public appMode:string = "git";

    // General
    public alias?:AliasRequest;
    public aliasName?: string;
    public useTemplate?: boolean;
    public name?:string;
    public description?:string;
    public collaborators?:string[];
    public private?:boolean;
    public templateOwner?:string;
    public templateName?:string;
    public createDevelop?:boolean;
    public protectBranches?:boolean ;
    public settingFile?:string;
}