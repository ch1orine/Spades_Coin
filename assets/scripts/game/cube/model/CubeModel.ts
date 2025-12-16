import { _decorator, Component} from 'cc';
const { ccclass } = _decorator;

@ccclass('CubeModel')
export class CubeModel extends Component {
    /** 麻将编号 */
    id: number = -1;

    /** 麻将位置{row,col} */
    row: number = 0;
    col: number = 0;
    
    reset(){
        this.id = -1;
        this.row = 0;
        this.col = 0;
    }
}

