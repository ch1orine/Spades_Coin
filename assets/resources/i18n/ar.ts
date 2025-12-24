
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"تخطي",
        "name":"ابحث عن أزواج ومجموع 10",
        "play":"العب الآن",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ar = languages;
