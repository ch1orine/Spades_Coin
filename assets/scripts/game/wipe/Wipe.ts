import {
  _decorator,
  Component,
  Node,
  Vec3,
  resources,
  SpriteFrame,
  Animation,
  Color,
} from "cc";
import { gameConfig } from "../../common/GameConfig";
import { EventBus } from "../../event/EventBus";
import { BlockManagerEvent } from "../manager/BlockManagerEvent";
const { ccclass } = _decorator;

@ccclass("Wipe")
export class Wipe extends Component {
  private _animation!: Animation;

  private _colorTrack!: any;

  protected onLoad(): void {
    this._animation = this.node.getComponent(Animation);
    this._colorTrack = this._animation.clips[0].tracks[1];
    this._animation.on(Animation.EventType.FINISHED, () => {
      this.node.active = false;
    });
    this.modifyColorAtTime(
      this._colorTrack,
      0,
      Color.fromHEX(new Color(), gameConfig.getColor())
    );
  }

  public playWipeEffect() {
    this.node.active = true;
    this._animation.play("wipe");
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

  onDrawGrid() {
    const col = Math.round(this.node.position.x / 85 + 3.5);
    const row = Math.round(6 - this.node.position.y / 85);
    EventBus.instance.emit(BlockManagerEvent.onWipeComplete, col, row);
  }
}
