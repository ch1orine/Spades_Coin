import {
  resources,
  director,
  Node,
  Prefab,
  instantiate,
  sp,
  Color,
  Animation,
} from "cc";
import { EventBus } from "../../../event/EventBus";
import { BlockManagerEvent } from "../BlockManagerEvent";
import { Wipe } from "../../wipe/Wipe";
export class BlockManagerView {

  private _wipe!: Node;

  private _color!: Color;



  spine!: sp.Skeleton;

  /**
   *
   */
  constructor() {
    const effectNode = new Node(); //创建一个节点作为 audioMgr
    effectNode.name = "EffectNode";
    director.getScene().children[0].addChild(effectNode); //添加节点到场景

    resources.load(`prefabs/wipe`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
        return;
      }
      this._wipe = instantiate(prefab);
      this._wipe.active = false;
      this._wipe.parent = effectNode;
    });

    EventBus.instance.on(BlockManagerEvent.onWipe, this.showWipeEffect, this);
    // Color.fromHEX(this._color, "#FFFFFF");
  }

  public showWipeEffect(pos: { row: number; col: number }) {
    if (!this._wipe) return;
    this._wipe.setPosition(pos.col * 85-3.5 * 85 + 10, (6- pos.row) * 85, 0);
    const wipe = this._wipe.getComponent(Wipe); 
    setTimeout(() => {    
        wipe.playWipeEffect(pos.row, pos.col);
    }, 200);      //明天添加字体放大效果
  }


}
