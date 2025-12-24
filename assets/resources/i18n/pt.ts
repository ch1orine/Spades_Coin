
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"PULAR",
        "name":"Encontre pares e soma de 10",
        "play":"JOGAR AGORA",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.pt = languages;
