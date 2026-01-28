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

const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {

  private _boomPrefab: Prefab;

  constructor() {    
    resources.load(`effect/boom`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
        return;
      }
      this._boomPrefab = prefab;
    });
    EventBus.instance.on(EffectEvent.ShowBlade, this.showBlade, this);

  }
  
  showBlade(fnc?: Function){
    // console.log('showBlade');
    if (!this._boomPrefab) return;
    Sound.ins.playOneShot(Sound.effect.win);
    const node = instantiate(this._boomPrefab);
    node.parent = find("gui/game/LayerEffect");
    
    node.setPosition(v3(0,0,0));
    const spine = node.getComponent(sp.Skeleton);
    spine.setCompleteListener(() => {
      node.destroy();    
      fnc && fnc();  
    });
  }
}
