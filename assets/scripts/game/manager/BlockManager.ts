import {
  _decorator,
  Vec3,  
} from "cc";
import { Block } from "../block/Block";
import { BlockManagerModel } from "./model/BlockManagerModel";
import { BlockManagerBll } from "./bll/BlockManagerBll";
import { BlockManagerView } from "./view/BlockManagerView"
import { BlockEvent } from "../block/BlockEvent";
import { EventBus } from "../../event/EventBus";
import { GridEvent } from "../grid/GridEvent";
import { BlockManagerEvent } from "./BlockManagerEvent";

export class BlockManager {
  //数据层
  BlockManagerModel!: BlockManagerModel;

  //业务层
  BlockManagerBll!: BlockManagerBll;

  //视图层
  BlockManagerView!: BlockManagerView;

  constructor() {
    this.BlockManagerModel = new BlockManagerModel();
    this.BlockManagerBll = new BlockManagerBll();
    this.BlockManagerView = new BlockManagerView();
  }

  init() {
    this.generateBoardLayout();
    this.addEvents();
  }

  private addEvents(){
    EventBus.instance.on(BlockEvent.CheckPosValid, this.checkPositionValid, this);
    EventBus.instance.on(BlockManagerEvent.onWipeComplete, this.onWipeCompleteHandler, this);
  }

  private checkPositionValid(pos: Vec3, originPos:Vec3) {      
      this.BlockManagerBll.checkPositionValid(this, pos, originPos);
  }

  /** 生成棋盘布局 */
  public generateBoardLayout() {
    for (let r = 0; r < this.BlockManagerModel.map.length; r++) {
      for (let c = 0; c < this.BlockManagerModel.map[r].length; c++) {
        this.BlockManagerBll.createBlock(this, {id: this.BlockManagerModel.map[r][c],row:r,col:c,drag:this.BlockManagerModel.getBarrierValue(r,c)});
      }      
    }    
  }

  /** 设置砖块响应 */
  public setBlockCanDrag(block: Block, canDrag: boolean = true) {
    block.view.candrag = canDrag;
  }
 

  public onWipeCompleteHandler(col: number, row: number) {        
    EventBus.instance.emit(GridEvent.WipeGrid, row, col);
    const minCol = Math.max(0, col - 1);
    const maxCol = Math.min(7, col + 1);
    const minRow = Math.max(0, row - 1);
    const maxRow = Math.min(12, row + 1);
    
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        this.BlockManagerModel.updateBarrierValue(r, c);
        const block = this.BlockManagerModel.getBlock(r, c);
        if (block) {
          block.view.candrag = true;          
        }
      }
    }
  }
}
