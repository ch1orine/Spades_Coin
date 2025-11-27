
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"SALTA",
        "name":"Trova coppie o numeri che sommano 10"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.it = languages;
