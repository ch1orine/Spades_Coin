
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"Bỏ qua",
        "name":"Tìm các cặp số và tổng bằng 10",
        "play":"Chơi ngay",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.vi = languages;
