
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"ÜBERSPRINGEN",
        "name":"Finde Paare oder Zahlen, die zusammen 10 ergeben",
        "play":"JETZT SPIELEN",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.de = languages;
