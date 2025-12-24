
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"Пропустити",
        "name":"Знайдіть пари чисел, сума яких дорівнює 10",
        "play":"Грати зараз",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.uk = languages;
