import {
  _decorator,
  Component,
  Node,
  resources,
  sp,
  Sprite,
  SpriteFrame,
  tween,
  Vec2,
  Vec3,
  EventTouch,
  Texture2D,
  Tween,
} from "cc";
import { ESuit } from "../model/CardModel";
import { EventBus } from "../../../event/EventBus";
import { CardEvent } from "../CardEvent";
import { Card } from "../Card";
import { Sound } from "../../../sound/Sound";
const { ccclass, property } = _decorator;

@ccclass("CardView")
export class CardView extends Component {
  @property({ type: Sprite, tooltip: "卡牌图片" })
  sprite!: Sprite;

  @property({ type: Sprite, tooltip: "卡牌遮罩" })
  mask!: Sprite;

  @property({ type: sp.Skeleton, tooltip: "卡牌动画" })
  spine!: sp.Skeleton;

  @property(Node)
  highLight!: Node;

  private _angle: number = 0;

  private _parent: Node;

  protected onLoad(): void {
    this.node.position.subtract(new Vec3(0, 400, 0));
    this._angle = this.node.parent.parent.angle; // 记录父节点的角度
    this._parent = this.node.parent.parent; // 记录父节点
  }

  moveUp(targetY: number = 0) {
    tween(this.node)
      .to(0.6, { y: targetY }, { easing: "quadOut" }) // 移动到目标位置
      .start();
  }

  updateCardUI(data: Vec2) {
    resources.load(
      `card/texture/${this.getSuit(data.x)}_${data.y}/spriteFrame`,
      SpriteFrame,
      (err, sf) => {
        if (err) {
          console.error(err);
          return;
        }
        this.sprite.spriteFrame = sf;
      },
    );
  }

  turnOver(e:Card) {   
    if (e.model.canPlay === false) return;
    Sound.ins.playOneShot(Sound.effect.click);
    this.node.parent = this._parent;
    var pos = e.bll.getPos(this._angle);
    Tween.stopAllByTarget(this.node);
    tween(this.node)
    .parallel(
      tween().to(0.4, { angle: -this._angle }, { easing: "quadInOut" }),
      tween().to(0.4, { position: pos }, { easing: "quadOut" }), // 移动到中间位置
      tween().to(0.4, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "quadOut" }) // 缩放到1.2倍
    )
    .call(() => {
      EventBus.instance.emit(CardEvent.Click, e);
    })
    .start();
    if(this._angle === 0) return;  
    this.sprite.node.active = false;  
    this.spine.node.active = true;
    const anim = pos.y < 300 ? "up" : "left+right";
    this.spine.setAnimation(0, anim, false);        
    this.changeSlot("default", "shuzi", `${this.getSuit(e.model.suit).toLowerCase()}_${e.model.rank}`);    
    // this.spine.setCompleteListener(() => {
      
    // });    
  }

  private getSuit(index: number) {
    return ESuit[index];
  }

  private changeSlot(skinName: string, slotName: string, targetAttaName: string) {
    let SkeletonData = this.spine.skeletonData.getRuntimeData();
    let skin: sp.spine.Skin = SkeletonData.findSkin(skinName);
    let targetSkinSlotIndex = SkeletonData.findSlotIndex(slotName);        
    let atta = skin.getAttachment(targetSkinSlotIndex, targetAttaName);    
    let slot = this.spine.findSlot(slotName);
    slot && slot.setAttachment(atta);
  }

  private replaceSoltByTexture2D(ske: sp.Skeleton, slotName: string, imgPath: string): void {
        resources.load(`${imgPath}/texture`, Texture2D, (err: any, texture: Texture2D) => {
            ske.setSlotTexture(slotName, texture);
        });
  }

  public highLightCard(): void {
    this.highLight.active = true;
    
    // 闪烁4次（显示->隐藏为一次闪烁）
    tween(this.highLight)
      .call(() => {
        this.highLight.active = true;
      })
      .to(0.4, { scale: new Vec3(1.1, 1.1, 1.1) })
      .to(0.4, { scale: new Vec3(1, 1, 1) })
      .union()
      .repeat(100)
      .call(() => {
        this.highLight.active = false;
      })
      .start();
  }
}
