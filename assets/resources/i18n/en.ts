
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"SKIP",
        "name":"Find pairs and sum of 10"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
