
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"OMITIR",
        "name":"Encuentra pares y suma de 10"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.es = languages;
