
const win = window as any;

export const languages = {
    // Data
    "main":{
        "skip":"스킵",
        "name":"숫자 쌍과 합이 10인 숫자 쌍을 찾으세요",
        "play":"지금 플레이",
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ko = languages;
