import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        this.node.on(Node.EventType.MOUSE_ENTER,this.onEnter,this);
        this.node.on(Node.EventType.MOUSE_LEAVE,this.onLeave,this)
        this.node.on(Node.EventType.TOUCH_START, this.onTouch2, this);
    }



    onEnter() {
        console.log("enter");
        this.node.setScale(v3(1.2,1.2,1));
    }

    onLeave() {
        this.node.setScale(v3(1,1,1));
    }

    onTouch(){
        // this.node.shake(0.5,10);
        tween(this.node)
        .to(0.1,{angle:6})
        .to(0.1,{angle:-6})
        .to(0.1,{angle:0})
        .start();
    }

    
     onTouch2(){
        // this.node.shake(0.5,10);
        this.node.setScale(v3(0.8,0.8,1));
    }


    update(deltaTime: number) {
        
    }
}   

