import { EmptyRepoRequest } from "./EmptyRepoRequest";

export class TemplateRepoRequest extends EmptyRepoRequest {

    constructor(name:string, isPrivate:boolean, templateOwner: string, templateName: string) {
        super(name, isPrivate)
        this.templateOwner = templateOwner;
        this.templateName = templateName;
    }
    
    public templateOwner:string;
    public templateName:string;
}