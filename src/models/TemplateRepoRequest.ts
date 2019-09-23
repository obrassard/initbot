import { EmptyRepoRequest } from "./EmptyRepoRequest";

export class TemplateRepoRequest extends EmptyRepoRequest {

    constructor(name:string, isPrivate:boolean, templateOwner: string, templateName: string, withDevelop: boolean, withBranchProtection: boolean) {
        super(name, isPrivate, withDevelop, withBranchProtection)
        this.templateOwner = templateOwner;
        this.templateName = templateName;
    }
    
    public templateOwner:string;
    public templateName:string;
}