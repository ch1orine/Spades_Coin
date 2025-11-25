import { _decorator, Component, instantiate, Prefab, resources } from "cc";
import { BlockManager } from "./game/manager/BlockManager";
import { gameConfig } from "./common/GameConfig";
import { Sound } from "./sound/Sound";
import super_html_playable from "./common/super_html_playable";
import { EventBus } from "./event/EventBus";
const { ccclass } = _decorator;

@ccclass("Main")
export class Main extends Component {
  
  onLoad() {
    //加载游戏数据
    gameConfig.loadConfig().then(() => {
      this.adaptPlayable();
      this.init();
    });    
    EventBus.instance.on(EventBus.GameOver,()=>{
      this.node.pauseSystemEvents(true);
    });
  }

  adaptPlayable() {
    //适配playable广告
    super_html_playable.set_google_play_url(gameConfig.getConfigValue<string>("URL_GOOGLE_PLAY") || "");
    super_html_playable.set_app_store_url(gameConfig.getConfigValue<string>("URL_APPSTORE") || "");
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
      const manager = new BlockManager();
      manager.init();
    });
  }
}
