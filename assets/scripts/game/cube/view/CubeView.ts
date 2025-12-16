import {
  _decorator,
  Component,
  EventTouch,
  Node,
  Sprite,
  tween,
  Vec2,
  Vec3,
} from "cc";
import { EventBus } from "../../../event/EventBus";
import { CubeEvent } from "../CubeEvent";
import { GuideEvent } from "../../guide/GuideEven";
const { ccclass, property } = _decorator;

@ccclass("CubeView")
export class CubeView extends Component {
  @property({ type: Sprite, tooltip: "麻将图片" })
  sprite!: Sprite;

  private _canDrag: boolean = true; //是否可以拖拽

  private _isDragging: boolean = false; //是否正在拖拽

  private _originalPosition: Vec3; //记录初始位置

  private _siblingIndex: number = 0;

  private _moveDirection: number = 0; //二进制 3横竖 2横 1竖 0都不能

  public get candrag(): boolean {
    return this._canDrag;
  }

  public set candrag(value: boolean) {
    this._canDrag = value;
  }

  public get moveDirection(): number {
    return this._moveDirection;
  }

  public set moveDirection(value: number) {
    this._moveDirection = value;
  }

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    this._siblingIndex = this.node.getSiblingIndex();
  }

  private onTouchStart(event: EventTouch) {
    if (!this._canDrag) {
      return;
    }
    this._isDragging = true;
    this._originalPosition = this.node.position.clone();
    this.node.setSiblingIndex(999);
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    EventBus.instance.emit(CubeEvent.onCubeClick, (dir: number) => {
      this._moveDirection = dir;
    });

    // console.log((this._moveDirection >> 1) & 1);
    // console.log((this._moveDirection >> 0) & 1);
  }

  private onTouchMove(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }
    const touchPos = event.getUILocation();
    const dis = Vec2.squaredDistance(event.getUIStartLocation(), touchPos);
    if (dis > 40) {
      if (this._moveDirection === 2) {
        //不能纵向移动
        this.node.setWorldPosition(touchPos.x, this.node.worldPosition.y, 0);
      } else if (this._moveDirection === 1) {
        //不能横向移动
        this.node.setWorldPosition(this.node.worldPosition.x, touchPos.y, 0);
      }
    }
  }

  private onTouchEnd(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }
    event.getUIStartLocation();
    event.getUILocation();
    this._isDragging = false;
    const dis = Vec2.squaredDistance(
      event.getUIStartLocation(),
      event.getUILocation()
    );
    if (dis > 0) {
      console.log("拖动了");
      this.rePosAnim();
    } else {
      console.log("点击，没有拖动");
      this.node.setSiblingIndex(this._siblingIndex);
      EventBus.instance.emit(CubeEvent.onShakeCube, this.node);
      //test only
      this.shakeAnim();
    }
  }

  private onTouchCancel(event: EventTouch) {
    this._isDragging = false;
    this.rePosAnim();
  }
  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private rePosAnim() {
    tween(this.node)
      .to(0.2, { position: this._originalPosition })
      .call(() => {
        this.node.setSiblingIndex(this._siblingIndex);
      })
      .start();
  }

  //test only
  private shakeAnim() {
    tween(this.node)
      .to(0.1, { angle: 8 })
      .to(0.1, { angle: -8 })
      .to(0.1, { angle: 0 })
      .start();
  }
}
