import {
  _decorator,
  instantiate,
  Node,
  Prefab,
  resources,  
  Vec3,
  find,
  Graphics,
  v3,
  sp,  
} from "cc";
import { Sound } from "../sound/Sound";
import { EventBus } from "../event/EventBus";

import { EffectEvent } from "./EffectEvent";

import { DrawLine } from "./DrawLine";
const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {

  // private _lines: ConnectLine[] = []; //连接线

  private _line: DrawLine;

  constructor() {    
    resources.load(`effect/boom`, Prefab, (err, prefab) => {
    });
    EventBus.instance.on(EffectEvent.ShowBlade, this.showBlade, this);

  }

  




  showBlade(fnc?: Function){
    console.log('showBlade');
    Sound.ins.playOneShot(Sound.effect.win);
    // setTimeout(() => {
    //   // Sound.ins.playOneShot(Sound.effect.blade);
    //   fnc && fnc();
    // }, 1000);
    // return;
    const node = instantiate(resources.get(`effect/boom`, Prefab));
    node.parent = find("gui/game/LayerEffect");
    // node.setWorldPosition(Vec3.ZERO);
    node.setPosition(v3(0,0,0));
    const spine = node.getComponent(sp.Skeleton);
    spine.setCompleteListener(() => {
      node.destroy();    
      fnc && fnc();  
    });
  }
}
