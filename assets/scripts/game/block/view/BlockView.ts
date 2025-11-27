import {
  _decorator,
  Component,
  EventTouch,
  Node,
  Sprite,  
  tween,
  Vec3,
} from "cc";
import { EventBus } from "../../../event/EventBus";
import { BlockEvent } from "../BlockEvent";
import { GuideEvent } from "../../guide/GuideEven";
const { ccclass, property } = _decorator;

@ccclass("BlockView")
export class BlockView extends Component {
  @property({ type: Sprite, tooltip: "方块图片" })
  sprite!: Sprite;

  private _canDrag: boolean = false; //是否可以拖拽

  private _isDragging: boolean = false; //是否正在拖拽

  private _originalPosition: Vec3; //记录初始位置

  public get candrag(): boolean {
    return this._canDrag;
  }

  public set candrag(value: boolean) {
    this._canDrag = value;
  }

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    // this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
  }

  private OnTouchStart(event: EventTouch) {
    if (!this._canDrag) {
      return;
    }
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    this._isDragging = true;    
    this._originalPosition = this.node.position.clone();
    EventBus.instance.on(BlockEvent.InvalidDrag, this.inValidHandler, this);
    EventBus.instance.on(BlockEvent.ValidDrag, this.validHandler, this);
  }

  private OnTouchMove(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }
    EventBus.instance.emit(BlockEvent.CheckPosValid, this.node.position, this._originalPosition);
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    const touchPos = event.getUILocation();
    this.node.setWorldPosition(touchPos.x, touchPos.y, 0);
  }

  private OnTouchEnd(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }

    this._isDragging = false;
    this.inValidHandler();
    this.node.off(BlockEvent.InvalidDrag, this.inValidHandler, this);
    this.node.off(BlockEvent.ValidDrag, this.validHandler, this);

    EventBus.instance.emit(EventBus.UpdateTimer);
  }

  /** 位置不合理 block回归原位置（属于表现层） */
  private inValidHandler() {
    console.log("玩家取消拖动or位置不合理，回归原位置");
    this._isDragging = false;
    tween(this.node).to(0.2, { position: this._originalPosition }).start();
  }

  /** 位置合理 block停留在当前位置，执行特效、粒子等（属于表现层） */
  private validHandler() {
    console.log("位置合理，停止拖动，通知bll执行后续逻辑");
    // e._canDrag = false;
    // this.node.destroy();
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

    this.node.off(BlockEvent.InvalidDrag, this.inValidHandler, this);
    this.node.off(BlockEvent.ValidDrag, this.validHandler, this);
  }
}
