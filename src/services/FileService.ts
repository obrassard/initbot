import fs from 'fs';
import path from 'path';

export class FileService {

    public static getCurrentDirectoryBase() {
        return path.basename(process.cwd());
    }

    public static directoryExists(filePath: string) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    }
};
