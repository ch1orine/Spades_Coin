import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockModel')
export class BlockModel extends Component {
    /** 砖块编号 */
    id: number = -1;

    /** 砖块位置{x,y} */
    x: number = 0;

    y: number = 0;



    
    reset(){
        this.id = -1;

        this.x = 0;
        this.y = 0;
    }
}

