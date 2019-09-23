export class EmptyRepoRequest {

    constructor(name:string, isPrivate:boolean, withDevelop: boolean, withBranchProtection: boolean) {
        this.name = name;
        this.private = isPrivate;
        this.protectBranch = withBranchProtection;
        this.createDevelop = withDevelop;
    }

    public name:string;
    public description?:string;
    public collaborators?:string[];
    public private:boolean;
    public createDevelop:boolean;
    public protectBranch:boolean;
}