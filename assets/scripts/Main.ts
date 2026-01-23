import { _decorator, Camera, Color, Component, instantiate, Prefab, resources } from "cc";
import { gameConfig } from "./common/GameConfig";
import { Sound } from "./sound/Sound";
import super_html_playable from "./common/super_html_playable";
import { EventBus } from "./event/EventBus";
import { GuideEvent } from "./game/guide/GuideEvent";
import * as i18n from 'db://i18n/LanguageData';
import { EffectManager } from "./effect/EffectManager";
import { GameManager } from "./game/manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {

  private _currentTime: number = 0;

  private _intervalTime: number = 2000; //2秒检查一次时间

  private _begin:boolean = false;

  @property(Camera)
  camera: Camera;

  private readonly URL_APPSTORE = "https://play.google.com/store/apps/details?id=com.bigcake.android.spadesclassic";
  private readonly URL_GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=com.bigcake.android.spadesclassic"

  onLoad() {
    //配置playable数据
    this.adaptPlayable();
    //配置游戏数据
    gameConfig.loadConfig().then(() => {      
      this.init();
      i18n.init(gameConfig.getSimplifiedLanguage()); // 设置为配置语言,默认为英文 
      this.checkTimer();     
    });

    EventBus.instance.on(EventBus.UpdateTimer, this.checkTimer, this); //恢复计时
    EventBus.instance.on(EventBus.StopTimer, this.stopTimer, this);   //阻断计时
    EventBus.instance.on(EventBus.GameOver, this.onGameOver, this);
  }

  adaptPlayable() {
    super_html_playable.set_app_store_url(this.URL_APPSTORE);
    super_html_playable.set_google_play_url(this.URL_GOOGLE_PLAY);
    //适配playable广告    
    // （ 解决ironsource移动广告平台声音问题，Only : ironsource ） 游戏开始时，获取声音状态以决定是否将音量设置为0。
    if (super_html_playable.is_audio()) Sound.ins.volume = 1;
    else Sound.ins.volume = 0;
    Sound.ins.play(Sound.music.bgm);
  }

  init() {
    const manager = new GameManager();
    manager.init();
    
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
      // const manager = new GameManager();
      // manager.init();
      const effect = new EffectManager();      
      // const guide = new GuideManager();      
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

  private stopTimer(){
    this._begin = false;
  }

  protected update(dt: number): void {
    if (this._begin && Date.now() - this._currentTime >= this._intervalTime){
      this._begin = false;
      EventBus.instance.emit(GuideEvent.ShowHand); 
      // console.log("发出显示手指事件");
    }
  }

  private onGameOver(){
    console.log("游戏结束");
    this._begin = false;
    EventBus.instance.off(EventBus.UpdateTimer, this.checkTimer, this);
  }
}
