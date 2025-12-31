import { _decorator, instantiate, Node, Prefab, resources, Tween, tween, v3, find} from "cc";
import { GuideEvent } from "./GuideEvent";
import { EventBus } from "../../event/EventBus";
import { Cube } from "../cube/Cube";
import { EffectEvent } from "../../effect/EffectEvent";
const { ccclass } = _decorator;

@ccclass("Guide")
export class GuideManager {
  private _hand!: Node;

  constructor() {
    resources.load(`hand/guide`, Prefab, (err, prefab) => {
        if (err) {
            console.error(err);
            return;
        }
        this._hand = instantiate(prefab);
        this._hand.parent = find("gui/game");
        this._hand.setPosition(-200,-4,0);
        this._hand.active = false;           
      });

    EventBus.instance.on(GuideEvent.ShowHand, this.showGuide, this);    
    EventBus.instance.on(GuideEvent.StopShowGuide, this.stopGuideShow, this);
  }

  public showGuide(){ 
   const cube = find("gui/game/LayerGame/cube_8")?.getComponent(Cube);
   const cube2 = find("gui/game/LayerGame/cube_17")?.getComponent(Cube);
   const cube3 = find("gui/game/LayerGame/cube_26")?.getComponent(Cube);
     
   this._hand.setPosition(v3(-200, 120, 0)); 
   this._hand.active = true;  
    //   //播放动画
      tween(this._hand)
        .tag(0)
        .repeatForever(
          tween()
          .parallel(
            tween()
              .call(() => {
                EventBus.instance.emit(EffectEvent.Line);
                cube.activeMask(true);  // 0s 时显示 cube mask            
              })
              .delay(0.5)
              .call(() => {
                cube2.activeMask(true);  // 0.5s 时显示 cube2 mask
              })
              .delay(0.5)
              .call(() => {
                cube3.activeMask(true);  // 1s 时显示 cube3 mask
              }),
            tween()
              .to(1.5, { position: v3(15, -105, 0) })  // 0s~1.5s 手移动动画
          )
          .delay(1)            
          .call(() => {
            this._hand.setPosition(v3(-200, 120, 0)); 
            cube?.activeMask(false);
            cube2?.activeMask(false);
            cube3?.activeMask(false);      
            EventBus.instance.emit(EffectEvent.LineRemove);               
          })   
        )                
        .start();        
  }

  public stopGuideShow(){        
    this._hand.active = false;    
    const cube = find("gui/game/LayerGame/cube_8")?.getComponent(Cube);
    const cube2 = find("gui/game/LayerGame/cube_17")?.getComponent(Cube);
    const cube3 = find("gui/game/LayerGame/cube_26")?.getComponent(Cube);
    cube?.activeMask(false);
    cube2?.activeMask(false);
    cube3?.activeMask(false);
    Tween.stopAllByTag(0);    
  }  
}
