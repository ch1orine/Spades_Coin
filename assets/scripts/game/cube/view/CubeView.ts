import {
  _decorator,
  Component,
  EventTouch,
  math,
  Node,
  Sprite,
  tween,
  UITransform,
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

  private _originalWorldPos: Vec3; //记录初始世界位置

  private _siblingIndex: number = 0;

  private _moveTolerance: number = 40; //拖动容差距离

  private readonly BOUND_OFFSET: number = 50; //触摸点超出cube边界的容差距离

  private _xDis: number = 0;

  private _yDis: number = 0;

  private _lockedDirection: "horizontal" | "vertical" | null = null; //锁定的移动方向

  private _angleThreshold: number = 30; //角度阈值（度），小于此角度判定为横向，大于90-此角度判定为纵向

  private _maxDis: any; //允许的最大偏移距离

  public get candrag(): boolean {
    return this._canDrag;
  }

  public set candrag(value: boolean) {
    this._canDrag = value;
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
    this._lockedDirection = null; // 重置锁定方向
    this._xDis = 0;
    this._yDis = 0;
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    EventBus.instance.emit(CubeEvent.onCubeClick, this, (data: any) => {
      this._maxDis = data;
    });
  }

  private onTouchMove(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }
    const touchPos = event.getUILocation();
    const startPos = event.getUIStartLocation();
    const dis = Vec2.squaredDistance(startPos, touchPos);

    // 实时更新移动距离
    this._xDis = Math.abs(startPos.x - touchPos.x);
    this._yDis = Math.abs(startPos.y - touchPos.y);

    // 检查是否回到原始位置，如果回到则重置锁定方向
    const currentWorldPos = this.node.getWorldPosition();
    const distToOrigin = Vec3.squaredDistance(
      currentWorldPos,
      this._originalWorldPos
    );
    if (distToOrigin < 25 && this.isTouchInCubeBounds(touchPos)) {
      // 回到原始位置附近，重置锁定方向以允许改变运动方向
      this._lockedDirection = null;
      EventBus.instance.emit(CubeEvent.onCubeReturn);
    }

    // 超过容差才开始移动
    if (dis > this._moveTolerance) {
      // 首次超过容差时，锁定移动方向
      if (!this._lockedDirection) {
        const deltaX = touchPos.x - startPos.x;
        const deltaY = touchPos.y - startPos.y;
        const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI);

        // 根据角度判断方向
        // 0-30度或150-180度：横向
        // 60-120度：纵向
        // 30-60度和120-150度：根据距离判断
        if (
          angle < this._angleThreshold ||
          angle > 180 - this._angleThreshold
        ) {
          this._lockedDirection = "horizontal";
        } else if (
          angle > 90 - this._angleThreshold &&
          angle < 90 + this._angleThreshold
        ) {
          this._lockedDirection = "vertical";
        } else {
          //模糊区域，使用距离比较
          this._lockedDirection =
            this._xDis >= this._yDis ? "horizontal" : "vertical";
        }
      }
      // 根据锁定方向移动
      if (this._lockedDirection === "horizontal") {
        const clampedX = math.clamp(touchPos.x, this._maxDis.left, this._maxDis.right);
        this.node.setWorldPosition(clampedX, this._originalWorldPos.y, 0);
        const currentWorldPos = this.node.getWorldPosition();
        const deltaX = currentWorldPos.x - this._originalWorldPos.x;
        EventBus.instance.emit(CubeEvent.onFollowCube, {node:this.node, isHorizontal:true, delta:deltaX});
      } else if (this._lockedDirection === "vertical") {
        const clampedY = math.clamp(touchPos.y, this._maxDis.down, this._maxDis.up);
        this.node.setWorldPosition(this._originalWorldPos.x, clampedY, 0);
        const currentWorldPos = this.node.getWorldPosition();
        const deltaY = currentWorldPos.y - this._originalWorldPos.y;
        EventBus.instance.emit(CubeEvent.onFollowCube, {node:this.node, isHorizontal:false, delta:deltaY});
      }      
    } else {
      this._xDis = 0;
      this._yDis = 0;
      this._lockedDirection = null;
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

    if (dis > this._moveTolerance) {
      // 触摸移动距离超过容差，视为拖动操作
      EventBus.instance.emit(CubeEvent.onCubeDragEnd, this.node);
      //匹配失败，回弹
      // this.rePosAnim();
    } else {
      this.node.setSiblingIndex(this._siblingIndex);
      EventBus.instance.emit(CubeEvent.onShakeCube, this.node);
    }

    // 重置状态
    this._xDis = 0;
    this._yDis = 0;
    this._lockedDirection = null;
  }

  private onTouchCancel(event: EventTouch) {
    this._isDragging = false;
    this._lockedDirection = null;
    this._xDis = 0;
    this._yDis = 0;    
    this.rePosAnim();
  }

  public rePosAnim() {
    tween(this.node)
      .to(0.1, { position: this._originalPosition })
      .call(() => {
        this.node.setSiblingIndex(this._siblingIndex);
      })
      .start();
  }

  /** 检查触摸点是否在cube范围内
   * @param touchPos UI坐标系中的触摸位置
   * @returns 触摸点是否在cube范围内
   */
  private isTouchInCubeBounds(touchPos: Vec2): boolean {
    const cubeSize = this.node.getComponent(UITransform)?.contentSize;
    if (!cubeSize) {
      return true; // 如果无法获取大小，默认返回true允许移动
    }

    const cubeWorldPos = this.node.getWorldPosition();
    const cubeScale = this.node.scale;

    // 计算cube的实际宽高
    const halfWidth = (cubeSize.width * cubeScale.x) / 2 + this.BOUND_OFFSET;
    const halfHeight = (cubeSize.height * cubeScale.y) / 2 + this.BOUND_OFFSET;

    // 检查触摸点是否在cube范围内
    const offsetX = Math.abs(touchPos.x - cubeWorldPos.x);
    const offsetY = Math.abs(touchPos.y - cubeWorldPos.y);

    return offsetX <= halfWidth && offsetY <= halfHeight;
  }

  public initOriginalPos() {
    this._originalPosition = this.node.position.clone();
    this._originalWorldPos = this.node.getWorldPosition().clone();
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }
}
