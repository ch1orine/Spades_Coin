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

  private _row: number = 0;
  private _col: number = 0;

  protected onLoad(): void {
    const baseColor = Color.fromHEX(new Color(), gameConfig.getWipeColor());
    // const brightenedColor = this.brightenColor(baseColor, 30);    
    this._animation = this.node.getComponent(Animation);
    this._colorTrack = this._animation.clips[0].tracks[1];
    this._animation.on(Animation.EventType.FINISHED, () => {
      this.node.active = false;
    });
    this.modifyColorAtTime(
      this._colorTrack,
      0,
      baseColor
    );
  }

  public playWipeEffect(row: number, col: number) {
    this.node.active = true;
    this._animation.play("wipe");
    this._row = row;
    this._col = col;
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
    EventBus.instance.emit(BlockManagerEvent.onWipeComplete, this._col, this._row);
  }


   /**
   * 将颜色变亮
   * @param color 原始颜色
   * @param amount 增加的亮度百分比 (0-100)
   * @returns 变亮后的颜色
   */
  private brightenColor(color: Color, amount: number): Color {
    const hsl = this.rgbToHsl(color.r, color.g, color.b);
    
    // 增加亮度,确保不超过100
    hsl.l = Math.min(100, hsl.l + amount);
    hsl.s = Math.min(100, hsl.s + 2*amount); // 适当增加饱和度
    
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return new Color(rgb.r, rgb.g, rgb.b, color.a);
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
}