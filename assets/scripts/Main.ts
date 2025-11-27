import { _decorator, Component, instantiate, Prefab, resources } from "cc";
import { BlockManager } from "./game/manager/BlockManager";
import { gameConfig } from "./common/GameConfig";
import { Sound } from "./sound/Sound";
import super_html_playable from "./common/super_html_playable";
import { EventBus } from "./event/EventBus";
import { GuideManager } from "./game/guide/GuideManager";
import { GuideEvent } from "./game/guide/GuideEven";
import * as i18n from 'db://i18n/LanguageData';
const { ccclass } = _decorator;

@ccclass("Main")
export class Main extends Component {

  private _currentTime: number = 0;

  private _intervalTime: number = 2000; //2秒检查一次时间

  private _begin:boolean = false;

  onLoad() {
    //加载游戏数据
    gameConfig.loadConfig().then(() => {
      this.adaptPlayable();
      this.init();
      i18n.init(gameConfig.getSimplifiedLanguage()); // 设置为配置语言
    });

    EventBus.instance.on(EventBus.UpdateTimer, this.checkTimer, this);
    EventBus.instance.on(EventBus.GameOver, this.onGameOver, this);
  }

  adaptPlayable() {
    //适配playable广告
    super_html_playable.set_google_play_url(
      gameConfig.getConfigValue<string>("URL_GOOGLE_PLAY") || ""
    );
    super_html_playable.set_app_store_url(
      gameConfig.getConfigValue<string>("URL_APPSTORE") || ""
    );
    // （ 解决ironsource移动广告平台声音问题，Only : ironsource ） 游戏开始时，获取声音状态以决定是否将音量设置为0。
    if (super_html_playable.is_audio()) Sound.ins.volume = 1;
    else Sound.ins.volume = 0;
  }

  init() {
    resources.load("prefabs/game", Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      const node = instantiate(prefab);
      node.parent = this.node;
      node.setSiblingIndex(0);
      EventBus.instance.on(EventBus.GameOver, () => {
        node.pauseSystemEvents(true);
      });
      const manager = new BlockManager();
      manager.init();
      const guide = new GuideManager();
      // guide.init();
    });

    resources.load("prefabs/skip", Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      const node = instantiate(prefab);
      node.parent = this.node;
      node.setSiblingIndex(1);
    });
  }

  private checkTimer(){
    this._currentTime = Date.now();
    this._begin = true;
  }

  protected update(dt: number): void {
    if (this._begin && Date.now() - this._currentTime >= this._intervalTime){
      this._begin = false;
      EventBus.instance.emit(GuideEvent.GetGuideBlocks); 
    }
  }

  private onGameOver(){
    console.log("游戏结束");
    this._begin = false;
    EventBus.instance.off(EventBus.UpdateTimer, this.checkTimer, this);
  }
}
