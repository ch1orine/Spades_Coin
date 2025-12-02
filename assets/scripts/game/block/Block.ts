import {
  _decorator,
  Component,
  Node,
  Vec3,
  resources,
  SpriteFrame,
  v3,
  tween,
  Color,
  game,
} from "cc";
import { BlockModel } from "./model/BlockModel";
import { BlockView } from "./view/BlockView";
import { BlockBll } from "./bll/BlockBll";
import { gameConfig } from "../../common/GameConfig";
const { ccclass } = _decorator;

@ccclass("Block")
export class Block extends Component {
  //   @property(BlockModel)
  model!: BlockModel;

  //   @property(BlockView)
  view!: BlockView;

  //   @property(BlockBll)
  bll!: BlockBll;//not use but keep for structure consistency

  protected onLoad(): void {
    this.model = this.addComponent(BlockModel);
    this.bll = this.addComponent(BlockBll);
    this.view = this.getComponent(BlockView);
  }

  /** 加载显示图并初始化位置
   * @param parent 父节点
   * @param pos 位置
   */
  load(parent: Node, pos: Vec3 = Vec3.ZERO) {
    resources.load(
      `blocks/${this.model.id}/spriteFrame`,
      SpriteFrame,
      (err, sf) => {
        if (err) {
          console.error(err);
          return;
        }

        this.view.sprite.spriteFrame = sf;
        this.view.sprite.color = Color.fromHEX(new Color(), gameConfig.getNumberColor());
        this.node.parent = parent;
        this.node.setPosition(pos);
      }
    );
  }

  /** 消除动画 */
  wipeEffect() {
    tween(this.node)
      .to(0.2, { scale: v3(2, 2, 2) })
      .call(() => {
        this.node.active = false;
      })
      .start();
  }

  /** 停止响应 */
  stopResponse() {
    this.view.candrag = false;
  }
}
