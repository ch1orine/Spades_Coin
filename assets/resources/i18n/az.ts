
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"Alta",
        "name":"Tapılan ədədlərin cütlərini və cəmi 10 olan ədədləri tapın",
        "play":"İndi Oyna",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.az = languages;
