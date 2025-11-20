import {
  _decorator,
  Component,
  Node,
  Vec3,
  Prefab,
  instantiate,
  resources,
  v3,
  SpriteFrame,
} from "cc";
import { BlockModel } from "./model/BlockModel";
import { BlockView } from "./view/BlockView";
import { BlockBll } from "./bll/BlockBll";
const { ccclass, property } = _decorator;

@ccclass("Block")
export class Block extends Component {
  //   @property(BlockModel)
  model!: BlockModel;

  //   @property(BlockView)
  view!: BlockView;

  //   @property(BlockBll)
  bll!: BlockBll;

  protected onLoad(): void {    
    this.model = this.addComponent(BlockModel);
    this.bll = this.addComponent(BlockBll);

    
  }

  load(parent: Node, pos: Vec3 = Vec3.ZERO) {
    resources.load(`blocks/0${this.model.id}/spriteFrame`, SpriteFrame, (err, sf) => {
      if (err) {
        console.error(err);
        return;
      }
      this.view = this.getComponent(BlockView);
      this.view.sprite.spriteFrame = sf;
      this.node.parent = parent;
      this.node.setPosition(pos);
    });
  }
}
