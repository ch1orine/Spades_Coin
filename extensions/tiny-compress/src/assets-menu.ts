import { AssetInfo } from "./cocos";
import { compress } from './tinypng';

declare const Editor: {
    Selection: {
        getSelected(type: string): string[];
    };
    Message: {
        request(packageName: string, method: string, ...args: any[]): Promise<any>;
    };
};

async function getSelectedAssetInfos(fallback: AssetInfo): Promise<AssetInfo[]> {
    if (!Editor || !Editor.Selection || !Editor.Message) {
        return [fallback];
    }
    const uuids = Editor.Selection.getSelected('asset') || [];
    if (uuids.length === 0) {
        return [fallback];
    }
    const infos = await Promise.all(
        uuids.map(uuid => Editor.Message.request('asset-db', 'query-asset-info', uuid))
    );
    return infos.filter(Boolean);
}

/**
 * 资源面板右键菜单
 */
export function onAssetMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'i18n:tinypng-compress.compress',  // "图片压缩"
            async click() {
                const assets = await getSelectedAssetInfos(assetInfo);
                for (const asset of assets) {
                    console.log(`[TinyPNG] 开始压缩: ${asset.file}`);
                    await compress(asset.file);
                }
            }
        }
    ];
}