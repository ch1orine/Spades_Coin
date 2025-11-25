import {
  _decorator,
  instantiate,
  Node,
  Prefab,
  resources,
  tween,
  UIOpacity,
  Vec3,
  Animation,
  Color,
  director,
} from "cc";
import { Sound } from "../sound/Sound";
import { EventBus } from "../event/EventBus";
const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {
  private _container: Node = null;

  private _highlightNode: Node = null;

  private 

  private static _ins: EffectManager;
  public static get ins(): EffectManager {
    if (this._ins == null) {
      this._ins = new EffectManager();
    }
    return this._ins;
  }

  constructor() {    
    this._container = new Node("EffectContainer");
    director.getScene().addChild(this._container);
    director.addPersistRootNode(this._container);
    resources.load(`prefabs/wipe`, Prefab, (err, prefab) => {
      if (err) {
        console.error("预加载擦除特效失败:", err);
        return;
      }
      // this._wipe = instantiate(prefab) as Node;
    });

    this._highlightNode = this._container.children[0];
  }

  public Highlight() {
    this._highlightNode.active = true;
    const opacity =
      this._highlightNode.getComponent(UIOpacity) ||
      this._highlightNode.addComponent(UIOpacity);
    // 确保初始值为不透明（如果需要）
    opacity.opacity = 0;
    let embedTween = tween(opacity)
      .tag(2)
      .to(0.5, { opacity: 255 }, { easing: "linear" })
      .to(0.7, { opacity: 0 }, { easing: "linear" });

    tween(opacity)
      .repeat(20, embedTween)
      // .repeatForever(embedTween)
      .call(() => {
        this._highlightNode.active = false;
      })
      .start();
  }

  public ClearHighlight() {
    this._highlightNode.active = false;
  }

  public ShowWipeEffect(pos: Vec3, colorHex: string, count: number = 0) {
    resources.load(`prefabs/wipe`, Prefab, (err, prefab) => {
      if (err) {
        console.error("加载擦除特效失败:", err);
        return;
      }
      let wipeEffect = instantiate(prefab) as Node;
      this._container.addChild(wipeEffect);
      wipeEffect.setPosition(pos);

      for (let i = 1; i <= count; i++) {
        let wipeEffect = instantiate(prefab) as Node;
        this._container.addChild(wipeEffect);
        wipeEffect.setPosition(new Vec3(pos.x, pos.y - i * 83, pos.z));
        const anim = wipeEffect.getComponent(Animation);
        anim.on(Animation.EventType.FINISHED, () => {
          wipeEffect.removeFromParent();
          wipeEffect.destroy();
        });
      }

      Sound.ins.playOneShot(Sound.effect.wipe); //播放音效
      const anim = wipeEffect.getComponent(Animation);
      const colorTrack = anim.clips[0].tracks[2];
      let c = new Color();
      Color.fromHEX(c, colorHex);
      this.modifyColorAtTime(colorTrack, 0, c); // 红色
      anim.on(Animation.EventType.FINISHED, () => {
        wipeEffect.removeFromParent();
        wipeEffect.destroy();
        EventBus.instance.emit(EventBus.WipeEffectDone);
        EventBus.instance.emit(EventBus.StartInteract);
      });
    });
  }

  private modifyColorAtTime(colorTrack: any, time: number, newColor: Color) {
    const colorValues = [newColor.r, newColor.g, newColor.b, newColor.a];
    const channels = colorTrack.channels();
    for (let i = 0; i < 4; i++) {
      const curve = channels[i].curve;
      const timeIndex = curve._times.indexOf(time);

      if (timeIndex !== -1) {
        // 时间点存在，修改对应的值
        curve._values[timeIndex].value = colorValues[i];
      } else {
        console.warn(`时间点 ${time} 不存在于通道 ${i}`);
      }
    }
  }
}
