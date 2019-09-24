"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_locale_1 = __importDefault(require("os-locale"));
class TranslationService {
    // TODO : Translate strings
    /**
     * Get the translation object based on the os language
     */
    static getTranslations() {
        if (this._currentTrad == null) {
            let locale = this._getLocale();
            if (locale.toLowerCase().startsWith('fr')) {
                this._loadTranslations('fr');
            }
            else {
                this._loadTranslations('en');
            }
        }
        return this._currentTrad;
    }
    /**
     * Get the translation object based on a language key
     * @param language The language key
     */
    static getTranslationFor(language) {
        return this._loadTranslations(language);
    }
    static _loadTranslations(key) {
        try {
            this._currentTrad = require(`../../i18n/${key}.json`);
        }
        catch (_a) {
            try {
                // Using en as fallback language.
                this._currentTrad = require(`../../i18n/en.json`);
            }
            catch (_b) {
                throw new Error('Unexpected error. Cannot find translations.');
            }
        }
    }
    static _getLocale() {
        return os_locale_1.default.sync();
    }
}
TranslationService._currentTrad = null;
exports.TranslationService = TranslationService;
