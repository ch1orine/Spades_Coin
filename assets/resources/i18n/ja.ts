
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"スキップ",
        "name":"ペアや10になる組み合わせを見つけよう"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ja = languages;
