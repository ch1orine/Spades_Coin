
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"CКИП",
        "name":"Найдите пары или числа, которые дают 10"
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ru = languages;
