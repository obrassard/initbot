"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmptyRepoRequest {
    constructor(name, isPrivate, withDevelop, withBranchProtection) {
        this.name = name;
        this.private = isPrivate;
        this.protectBranch = withBranchProtection;
        this.createDevelop = withDevelop;
    }
}
exports.EmptyRepoRequest = EmptyRepoRequest;
