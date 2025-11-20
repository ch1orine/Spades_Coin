import { _decorator, Component, Node, EventTouch, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("BlockBll")
export class BlockBll extends Component {
  private _canDrag: boolean = true; //是否可以拖拽

  private _isDragging: boolean = false; //是否正在拖拽

  private _originalPosition: Vec3; //记录初始位置

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
  }

  private OnTouchStart(event: EventTouch) {
    console.log("Touch Start");
  }

  private OnTouchMove(event: EventTouch) {
    console.log("Touch Move");
  }

  private OnTouchEnd(event: EventTouch) {
    console.log("Touch End");
  }
}
