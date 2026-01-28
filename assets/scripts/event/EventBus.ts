//自定义事件总线
import { Event, Node, EventTarget } from "cc";
export class EventBus extends EventTarget {

  public static UpdateTimer = "UpdateTimer";

  public static StopTimer = "StopTimer";

  public static GameOver = "GameOver";

  public static PayScoreStartEvent = "PayScoreStartEvent";

  public static OnePayScoreEvent = "OnePayScoreEvent";

  public static PayScoreCompleteEvent = "PayScoreCompleteEvent";

  private static _instance: EventBus;
  public static get instance(): EventBus {
    if (EventBus._instance == null) {
      EventBus._instance = new EventBus();
    }
    return EventBus._instance;
  }
}
