
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"跳過",
        "name":"找出數字對與和為10的數字對"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;
