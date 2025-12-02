import { _decorator, Component, Input, resources, Sprite, SpriteFrame, tween, v3} from "cc";
import super_html_playable from "../../common/super_html_playable";
import { EventBus } from "../../event/EventBus";
import { JumpEvent } from "./JumpEvent";
import { gameConfig } from "../../common/GameConfig";
import { GuideEvent } from "../guide/GuideEven";
const { ccclass } = _decorator;

@ccclass("Jump")
export class Jump extends Component {  

  private _steps: number = 0;
  
  protected onLoad(): void {    
    resources.load(`playnow/playnow_${gameConfig.getSimplifiedLanguage()}/spriteFrame`, 
    SpriteFrame, (err, sprite) => {
      if (err) {
        console.error(err);
        return;
      }
      this.getComponent(Sprite).spriteFrame = sprite;
    });


    tween(this.node)       
        .repeatForever(
            tween()
            .to(1, { scale: v3(0.8,0.8,0.8) } )
            .to(1, { scale: v3(0.9,0.9,0.9) } )
        )
        .start();

    EventBus.instance.on(JumpEvent.onJump, this.onStep, this);
    this.node.on(Input.EventType.TOUCH_START, this.onHandler, this);
  }

  onStep() {
    this._steps++;    
    if (this._steps >= gameConfig.getStepsToJump()) {
      this.onHandler();
      super_html_playable.game_end() //用插件跳转商店下载页
      EventBus.instance.emit(EventBus.GameOver); //游戏结束 
    }
  }

  onHandler() {    
    super_html_playable.download(); //用插件跳转商店下载页      
  }
}
