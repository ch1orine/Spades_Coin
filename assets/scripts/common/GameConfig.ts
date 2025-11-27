import { resources, JsonAsset } from 'cc';

export default class GameConfig {
    private configData: any | null = null;

    /**
     * 加载配置文件
     * @returns Promise 配置数据Promise
     */
    public loadConfig(): Promise<any> {
        if (this.configData) {
            return Promise.resolve(this.configData);
        }
        return new Promise((resolve, reject) => {
            resources.load('GameConfig', JsonAsset, (err: Error | null, asset: JsonAsset) => {
                if (err) {
                    console.error('配置文件加载失败:', err);
                    reject(err);
                    return;
                }
                this.configData = asset.json as any;
                resolve(this.configData);
            });
        });
    }

    /** 获取配置数据，未加载则返回null */
    public getConfig(): any | null {
        return this.configData;
    }

    /** 根据键获取配置值 */
    public getConfigValue<T = any>(key: string): T | null {
        return this.configData ? (this.configData[key] as T) : null;
    }

    /** 是否三步就跳转下载链接 */
    public getThreeSteps(): boolean {
        return this.configData && typeof this.configData.threeStepS === 'boolean'
            ? this.configData.threeStepS
            : false;
    }

    /** 获取测试选择值 */
    public getStepsToJump(): number {
        return this.configData && typeof this.configData.stepsToJump === 'number'
            ? this.configData.stepsToJump
            : 0;
    }

    /** 获取测试字符串值 */
    public getTestStr(): string {
        return this.configData && typeof this.configData.testStr === 'string'
            ? this.configData.testStr
            : '';
    }


    public getColor(): string {
        return this.configData && typeof this.configData.color === 'string'
            ? this.configData.color
            : '#FFFFFF';
    }

    /** 
     * 获取浏览器语言
     * @returns 浏览器语言代码，如 'zh-CN', 'en-US' 等
     */
    public  getBrowserLanguage(): string {
        // 优先使用 navigator.language
        if (typeof navigator !== 'undefined' && navigator.language) {
            return navigator.language;
        }
        
        // 降级使用 navigator.languages 数组的第一个
        if (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length > 0) {
            return navigator.languages[0];
        }
        
        // 兼容旧版浏览器
        if (typeof navigator !== 'undefined' && (navigator as any).userLanguage) {
            return (navigator as any).userLanguage;
        }
        
        // 默认返回英语
        return 'en-US';
    }

    /**
     * 获取简化的语言代码（只保留主语言部分）
     * @returns 简化的语言代码，如 'zh', 'en' 等
     */
    public  getSimplifiedLanguage(): string {
        const fullLang = this.getBrowserLanguage();
        // 提取语言主代码（连字符或下划线之前的部分）
        return fullLang.split(/[-_]/)[0].toLowerCase();
    }
    
    public getURL_APP_STORE(): string {
        return this.configData && typeof this.configData.URL_APPSTORE === 'string'
            ? this.configData.URL_APPSTORE
            : '';
    }

    public getURL_GOOGLE_PLAY(): string {
        return this.configData && typeof this.configData.URL_GOOGLE_PLAY === 'string'
            ? this.configData.URL_GOOGLE_PLAY
            : '';
    }
}

// 单例并暴露到全局，兼容旧代码 window.gameConfig 的用法
export const gameConfig = new GameConfig();
(globalThis as any).gameConfig = gameConfig;




