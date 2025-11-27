import { _decorator, Component, Input, Node } from 'cc';
import  super_html_playable  from '../../common/super_html_playable';
const { ccclass, property } = _decorator;

@ccclass('Skip')
export class Skip extends Component {
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onHandler, this);
    }

    onHandler() {    
        super_html_playable.download(); //用插件跳转商店下载页      
      }
}

