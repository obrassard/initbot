import assert from "assert";
import { AliasesService } from '../services/AliasesService'
import { AliasRequest } from "../models/AliasRequest";

describe("AliasesService test suite", () => {
    before((done) => {
        AliasesService.clearAllAliases();
        done();
    })

    after((done) => {
        AliasesService.clearAllAliases();
        done();
    })

    it('should resolve existing alias', (done) => {
        let req = new AliasRequest("aliasName=owner/repo");
        AliasesService.setAlias(req);

        let alias1 = AliasesService.resolveAlias("aliasName");
        let alias2 = AliasesService.resolveAlias("@aliasName");

        assert.equal(alias1.name, 'repo');
        assert.equal(alias2.name, 'repo');
        assert.equal(alias1.owner, 'owner');
        assert.equal(alias2.owner, 'owner');
        done();
    })

    // it('should be able to delete existing alias', () => {
    //     let req = new AliasRequest("aliasName=owner/repo");
    //     AliasesService.setAlias(req);

    //     let alias1 = AliasesService.resolveAlias("aliasName");
    //     assert.equal(alias1.name, 'repo');

    //     AliasesService.removeAlias(alias1.name);
    //     assert.throws(AliasesService.resolveAlias("aliasName"))
    // })
});