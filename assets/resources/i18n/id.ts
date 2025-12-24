
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"Lewati",
        "name":"Temukan pasangan angka dan jumlah 10",
        "play":"Main sekarang",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.id = languages;
