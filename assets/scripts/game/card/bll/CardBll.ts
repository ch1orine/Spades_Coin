import { _decorator, Component, EventTouch, Node, tween, Tween, v3, Vec3 } from 'cc';
import { Card } from '../Card';
const { ccclass, property } = _decorator;

@ccclass('CardBll')
export class CardBll extends Component {
    

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    /**
     * 移动到指定位置
     * @param tX 目标x
     * @param tY c
     */
    public moveto(tx: number, ty: number, fn: Function = null) {   
        Tween.stopAllByTarget(this.node);             
        tween(this.node)
            .to(0.5, { position: v3(tx, ty), angle: 0 }, { easing: "smooth" })
            .call(() => {
                if (fn) fn();
            })
            .start();
    }

    /*

    */
    public getPos(angle: number){
        if (angle === 0 || angle === 180) {
            return new Vec3(0, 360, 0);
        } else if( angle === 90){
            return new Vec3(50, 220, 0);
        } else {
            return new Vec3(-50, 220, 0);
        }        
    }


    private onTouchStart(event: EventTouch) {
        console.log("card touch start");
    }
    private onTouchEnd(event: EventTouch) {
        console.log("card touch end");
    }
}

