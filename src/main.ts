import { RepoService } from "./services/RepoService";
import { EmptyRepoRequest } from "./models/EmptyRepoRequest";
import { TemplateRepoRequest } from "./models/TemplateRepoRequest";

async function main() {
    
    let service = new RepoService();
    // let request = new EmptyRepoRequest('testRepo2',true)
    // request.description = 'test descriptions';
    // request.collaborators = ["obrassard-test"]
    // let url = await service.createEmptyRepo(request);

}

main();