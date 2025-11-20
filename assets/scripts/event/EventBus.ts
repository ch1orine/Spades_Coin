//自定义事件总线
import { Event, Node, EventTarget } from "cc";
export class EventBus extends EventTarget {
  public static AdvJumpEvent = "advJumpEvent"; //跳转广告事件

  public static GameStart = "gameStart"; //游戏开始事件

  public static GameOver = "gameOver"; //游戏结束事件

  public static GuideShow = "guideShow"; //新手引导显示事件
  
  public static GuideHide = "guideHide"; //新手引导隐藏事件

  public static GuideOver = "guideOver"; //新手引导完成事件

  public static PlayerStepCord = "playerStepCord"; //步数跳转广告事件

  public static LoadComplete = "loadComplete"; //资源加载完成事件

  public static SlotBlockUsed = "slotBlockUsed"; //槽位方块被使用事件

  public static CheckAndClear = "checkAndClear"; //消除方块特效事件

  public static WipeEffectDone = "wipeEffectDone"; //擦除特效完成事件
  
  public static HighlightBlock = "highlightBlock"; //高亮方块事件

  public static Closelight = "hideHighlightBlock"; //隐藏高亮方块事件

  public static StopInteract = "stopInteract"; //停止交互事件
  
  public static StartInteract = "startInteract"; //开始交互事件

  public static AddScore = "addScore"; //增加分数事件

  public static Combine = "combine"; //组合方块事件

  
  private static _instance: EventBus;
  public static get instance(): EventBus {
    if (EventBus._instance == null) {
      EventBus._instance = new EventBus();
    }
    return EventBus._instance;
  }
}
