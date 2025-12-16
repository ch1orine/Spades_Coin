import { find, instantiate, Prefab, resources, tween, v3, Vec3 } from "cc";
import { Block } from "../../block/Block";
import { BlockManager } from "../BlockManager";
import { EventBus } from "../../../event/EventBus";
import { BlockEvent } from "../../block/BlockEvent";
import { JumpEvent } from "../../jump/JumpEvent";
import { BlockManagerEvent } from "../BlockManagerEvent";
import { GuideEvent } from "../../guide/GuideEven";
import { Sound } from "../../../sound/Sound";

export class BlockManagerBll {
  /** 创建砖块对象 */
  public createBlock(e: BlockManager, data: any) {
    resources.load("prefabs/block", Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      const node = instantiate(prefab);
      node.name = `block_${data.row * 8 + data.col}`;
      const block = node.getComponent(Block);
      node.parent = find("gui/game/LayerGame");
      block.model.id = data.id;
      block.model.row = data.row;
      block.model.col = data.col;
      block.load(find("gui/game/LayerGame"), v3((data.col - 3.5) * 85, (6 - data.row) * 85, 0));
      block.view.candrag = data.drag === 1 ? true : false;
      e.BlockManagerModel.blocks.push(block);
    });
  }


  /** 检查当前坐标位置是否合理
   * @param e BlockManager实例
   * @param pos 当前坐标
   * @param originPos 初始坐标   
   */
  public checkPositionValid(e: BlockManager,pos: Vec3, originPos: Vec3) {
    const col = Math.round(pos.x / 85 + 3.5);
    const row = Math.round(6 - pos.y / 85);
    
    const selfCol = Math.round(originPos.x / 85 + 3.5);
    const selfRow = Math.round(6 - originPos.y / 85);
    const pass = e.BlockManagerModel.barrier[row]?.[col];
    const val = e.BlockManagerModel.map[row]?.[col];
    const originVal = e.BlockManagerModel.map[selfRow]?.[selfCol];    
    if (col == selfCol && row == selfRow){
      return;
    }
    if (col < 0 || col >= 8 || row < 0 || row >= 13) {      
      return;
    }   
    
    //为通路时继续移动，不处理
    if(pass === 1 && val === 0){
      return;
    }

    //首先为通路，然后同行或同列，最后值相等或加和为10
    if (pass === 1 && (row === selfRow || col === selfCol) && this.checkPassable(e, row, col, selfRow, selfCol) && (val == originVal || val + originVal === 10) ) {
      EventBus.instance.emit(JumpEvent.onJump);
      EventBus.instance.emit(BlockManagerEvent.onWipe, {row,col});
      e.BlockManagerModel.updateMapValue(selfRow, selfCol);
      e.BlockManagerModel.updateMapValue(row, col);
      const b1 = e.BlockManagerModel.getBlock(selfRow, selfCol);
      const b2 = e.BlockManagerModel.getBlock(row, col);
      b1.wipeEffect();
      b2.wipeEffect();  
      b1.stopResponse();
      b2.stopResponse();
      Sound.ins.playOneShot(Sound.effect.wipe);
      EventBus.instance.emit(EventBus.UpdateTimer);
    }
    else {
      EventBus.instance.emit(BlockEvent.InvalidDrag);
    }
  }

  public onWipeHandler(e:BlockManager, col: number, row: number) {              
      const minCol = Math.max(0, col - 1);
      const maxCol = Math.min(7, col + 1);
      const minRow = Math.max(0, row - 1);
      const maxRow = Math.min(12, row + 1);
      
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          e.BlockManagerModel.updateBarrierValue(r, c);
          const block = e.BlockManagerModel.getBlock(r, c);
          if (block) {
            block.view.candrag = true;
          }
        }
      }
  }


  private checkPassable(e: BlockManager, row: number, col: number, originRow: number, originCol: number): boolean {
      if (row === originRow){
        if(Math.abs(col - originCol) <= 1){
          return true;
        }  
        const [minC, maxC] = col < originCol ? [col, originCol] : [originCol, col];
        for (let c = minC + 1; c < maxC; c++) {
          const pass = e.BlockManagerModel.map[row]?.[c];
          if (pass !== 0) {
            return false;
          }
        }
      }else{
         if(Math.abs(row - originRow) <= 1){
          return true;
        }    
        const [minR, maxR] = row < originRow ? [row, originRow] : [originRow, row];
        for (let r = minR + 1; r < maxR; r++) {
          const pass = e.BlockManagerModel.map[r]?.[col];
          if (pass !== 0) {
            return false;
          }
        }
      }
      return true;
  }


  /**
   * 查找所有可通行且可消除的方块组合
   * 规则：
   * 1. barrier[row][col] === 1 且 map[row][col] !== 0
   * 2. 检查下方和右方相邻位置
   * 3. 相邻位置也满足 barrier === 1 && map !== 0
   * 4. 且值相等或相加为10
   */
  public getPassableBlocks(e: BlockManager): Vec3[] {
    const passableBlocks: Vec3[] = [];
    
    for (let row = e.BlockManagerModel.barrier.length - 1; row > 0; row--) {
      for (let col = 0; col < e.BlockManagerModel.barrier[0].length; col++) {
        // 检查当前位置：barrier为1且map不为0
        if (e.BlockManagerModel.barrier[row][col] === 1 && e.BlockManagerModel.map[row][col] !== 0) {
          const currentValue = e.BlockManagerModel.map[row][col];
          const currentBlock = e.BlockManagerModel.getBlock(row, col);
          
          if (!currentBlock) continue;
          
          // 检查右方位置 (row, col + 1)
          if (col + 1 < e.BlockManagerModel.barrier[0].length) {
            if (this.checkAdjacentMatch(e, row, col + 1, currentValue)) {
              const adjacentBlock = e.BlockManagerModel.getBlock(row, col + 1);
              if (adjacentBlock && !passableBlocks.includes(currentBlock.node.position)&& !passableBlocks.includes(adjacentBlock.node.position)) {
                passableBlocks.push(currentBlock.node.position);
                passableBlocks.push(adjacentBlock.node.position);                
                return passableBlocks;
              }           
            }
          }

          // 检查下方位置 (row + 1, col)
          if (row + 1 < e.BlockManagerModel.barrier.length) {
            if (this.checkAdjacentMatch(e, row - 1, col, currentValue)) {
              const adjacentBlock = e.BlockManagerModel.getBlock(row - 1, col);
              if (adjacentBlock && !passableBlocks.includes(currentBlock.node.position)&& !passableBlocks.includes(adjacentBlock.node.position)) {
                passableBlocks.push(adjacentBlock.node.position);
                passableBlocks.push(currentBlock.node.position);                
                return passableBlocks;
              }
            }
          }                   
        }
      }
    }
    
    return passableBlocks;
  }
  
  /**
   * 检查相邻位置是否匹配消除条件
   * @param e BlockManager实例
   * @param row 相邻位置的行
   * @param col 相邻位置的列
   * @param currentValue 当前位置的值
   * @returns 是否匹配
   */
  private checkAdjacentMatch(e: BlockManager, row: number, col: number, currentValue: number): boolean {
    const barrier = e.BlockManagerModel.barrier[row]?.[col];
    const mapValue = e.BlockManagerModel.map[row]?.[col];
    
    // barrier为1 且 map不为0 且 (值相等 或 相加为10)
    return barrier === 1 && 
           mapValue !== 0 && 
           (mapValue === currentValue || mapValue + currentValue === 10);
  }
}
