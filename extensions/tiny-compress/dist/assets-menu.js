"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAssetMenu = void 0;
const tinypng_1 = require("./tinypng");
async function getSelectedAssetInfos(fallback) {
    if (!Editor || !Editor.Selection || !Editor.Message) {
        return [fallback];
    }
    const uuids = Editor.Selection.getSelected('asset') || [];
    if (uuids.length === 0) {
        return [fallback];
    }
    const infos = await Promise.all(uuids.map(uuid => Editor.Message.request('asset-db', 'query-asset-info', uuid)));
    return infos.filter(Boolean);
}
/**
 * 资源面板右键菜单
 */
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'i18n:tinypng-compress.compress',
            async click() {
                const assets = await getSelectedAssetInfos(assetInfo);
                for (const asset of assets) {
                    console.log(`[TinyPNG] 开始压缩: ${asset.file}`);
                    await (0, tinypng_1.compress)(asset.file);
                }
            }
        }
    ];
}
exports.onAssetMenu = onAssetMenu;
