export class EmptyRepoRequest {

    constructor(name:string, isPrivate:boolean) {
        this.name = name;
        this.private = isPrivate;
    }

    public name:string;
    public description?:string;
    public collaborators?:string[];
    public private:boolean;
}