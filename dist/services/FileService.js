"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileService {
    static getCurrentDirectoryBase() {
        return path_1.default.basename(process.cwd());
    }
    static directoryExists(filePath) {
        try {
            return fs_1.default.statSync(filePath).isDirectory();
        }
        catch (err) {
            return false;
        }
    }
}
exports.FileService = FileService;
;
