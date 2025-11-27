
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"PASSER",
        "name":"Trouvez les paires et les sommes de 10"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.fr = languages;
