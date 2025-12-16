import { _decorator, Camera, Color, Component, instantiate, Label, Prefab, resources } from "cc";
import { BlockManager } from "./game/manager/BlockManager";
import { gameConfig } from "./common/GameConfig";
import { Sound } from "./sound/Sound";
import super_html_playable from "./common/super_html_playable";
import { EventBus } from "./event/EventBus";
import { GuideManager } from "./game/guide/GuideManager";
import { GuideEvent } from "./game/guide/GuideEven";
import * as i18n from 'db://i18n/LanguageData';
import { CubeManager } from "./game/manager/CubeManager";
const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {

  private _currentTime: number = 0;

  private _intervalTime: number = 2000; //2秒检查一次时间

  private _begin:boolean = false;

  @property(Camera)
  camera: Camera;

  private readonly URL_APPSTORE= "https://apps.apple.com/us/app/number-match-fun-puzzle-game/id6473832648";
  private readonly URL_GOOGLE_PLAY= "https://play.google.com/store/apps/details?id=daily.number.match.free.puzzle"

  onLoad() {
    //配置playable数据
    this.adaptPlayable();
    //配置游戏数据
    gameConfig.loadConfig().then(() => {      
      this.init();
      i18n.init(gameConfig.getSimplifiedLanguage()); // 设置为配置语言      
    });

    EventBus.instance.on(EventBus.UpdateTimer, this.checkTimer, this);
    EventBus.instance.on(EventBus.GameOver, this.onGameOver, this);
  }

  adaptPlayable() {
    super_html_playable.set_app_store_url(this.URL_APPSTORE);
    super_html_playable.set_google_play_url(this.URL_GOOGLE_PLAY);
    //适配playable广告    
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
      // node.children[2].children[0].getComponent(Label).color = Color.fromHEX(new Color(), gameConfig.getTitleColor());
      EventBus.instance.on(EventBus.GameOver, () => {
        node.pauseSystemEvents(true);
      });
      const manager = new CubeManager();
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

    this.camera.clearColor = Color.fromHEX(new Color(), gameConfig.getBGColor());
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
