"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class AliasRequest {
    constructor(rawalias) {
        if (typeof rawalias != "string") {
            console.log(chalk_1.default.red("Missing arguments, please refer to the docs. (initbot --help)"));
            process.exit(1);
        }
        let parts = rawalias.split("=");
        if (parts.length < 2) {
            console.log(chalk_1.default.red('Invalid syntax : ' + rawalias));
            process.exit(1);
        }
        let template = parts[1].split('/');
        if (template.length < 2) {
            console.log(chalk_1.default.red('Invalid syntax : ' + rawalias));
            process.exit(1);
        }
        this.alias = parts[0].trim();
        this.owner = template[0].trim();
        this.template = template[1].trim();
    }
}
exports.AliasRequest = AliasRequest;
