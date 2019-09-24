"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmptyRepoRequest_1 = require("./EmptyRepoRequest");
class TemplateRepoRequest extends EmptyRepoRequest_1.EmptyRepoRequest {
    constructor(name, isPrivate, templateOwner, templateName, withDevelop, withBranchProtection) {
        super(name, isPrivate, withDevelop, withBranchProtection);
        this.templateOwner = templateOwner;
        this.templateName = templateName;
    }
}
exports.TemplateRepoRequest = TemplateRepoRequest;
