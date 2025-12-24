
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"ข้าม",
        "name":"ค้นหาคู่ตัวเลขและผลรวมเป็น 10",
        "play":"เล่นตอนนี้",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.th = languages;
