import locale from 'os-locale'; 

export class TranslationService {

    // TODO : Translate strings

    /**
     * Get the translation object based on the os language
     */
    public static getTranslations() {
        if (this._currentTrad == null) {
            let locale = this._getLocale();
            if (locale.toLowerCase().startsWith('fr')){
                this._loadTranslations('fr');
            } else {
                this._loadTranslations('en');
            }
        }
        return this._currentTrad;
    }

    /**
     * Get the translation object based on a language key
     * @param language The language key
     */
    public static getTranslationFor(language: string) {
        return this._loadTranslations(language);
    }

    private static _currentTrad: any = null;

    private static _loadTranslations(key: string) {
        try { 
            this._currentTrad = require(`../../i18n/${key}.json`);
        } catch {
            try {
                // Using en as fallback language.
                this._currentTrad = require(`../../i18n/en.json`);
            }
            catch {
                throw new Error('Unexpected error. Cannot find translations.');
            }
        }
    }

    private static _getLocale() {
        return locale.sync();
    }
}

