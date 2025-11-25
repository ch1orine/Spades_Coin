import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('BlockModel')
export class BlockModel extends Component {
    /** 砖块编号 */
    id: number = -1;

    /** 砖块位置{row,col} */
    row: number = 0;
    col: number = 0;
    
    reset(){
        this.id = -1;
        this.row = 0;
        this.col = 0;
    }
}

