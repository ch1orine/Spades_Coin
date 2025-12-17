import { _decorator, Component, instantiate, Node, Prefab, resources,find, v3, Vec3 } from 'cc';
import { CubeManager } from '../CubeManager';
import { Cube } from '../../cube/Cube';
const { ccclass, property } = _decorator;

@ccclass('CubeManagerBll')
export class CubeManagerBll extends Component {

    /** 创建麻将实体 
     * @param e CubeManager实例
     * @param data 麻将数据
    */
    public createCube(e:CubeManager, data:any){
        resources.load(`cube/cube`, Prefab, (err, prefab) => {
            if(err){
                console.error(err);
                return;
            }
            // console.log(data);
            const node = instantiate(prefab);
            node.name = `cube_${data.row * 8 + data.col}`;
            const cube = node.getComponent(Cube);
            node.parent = find("gui/game/LayerGame");
            cube.model.id = data.id;
            cube.model.row = data.row;
            cube.model.col = data.col;
            cube.load(find("gui/game/LayerGame"), v3((data.col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE, (e.CubeManagerModel.OFFSET_ROW - data.row) * e.CubeManagerModel.SIZE, 0));
            e.CubeManagerModel.cubes.push(cube);
        });
    }

    /** 检查麻将是否可移动
     * @param e CubeManager实例
     * @param cube 需要检查的麻将
     * @param callback 回调函数，返回可移动方向
    */
    public checkCubeMovable(e:CubeManager, node: Node, callback:(data: any)=>void){        
        const cube = node.getComponent(Cube);
        const col = cube.model.col;
        const row = cube.model.row;
        const val = cube.model.id;
        const res =  this.getMaxReachableInDirections(e, row, col);
        console.log("检查麻将可移动方向", res);   
        
        callback(col);
    }

    
   /** 计算四个方向可到达的最远点
   * @param row 当前行位置
   * @param col 当前列位置
   * @returns 对象，包含四个方向的信息
   *   - up/down/left/right: { distance: 能到达的最远距离（空位数量）, pushCount: 连续可推动的cube数量, reachable: 是否可达 }
   */
  getMaxReachableInDirections(e:CubeManager,row: number, col: number): {
    up: { distance: number; pushCount: number };
    down: { distance: number; pushCount: number };
    left: { distance: number; pushCount: number };
    right: { distance: number; pushCount: number };
  } {
    const calculateDirection = (rowDelta: number, colDelta: number) => {
      let pushCount = 0;
      let distance = 0;
      let currentRow = row + rowDelta;
      let currentCol = col + colDelta;

      // 第一阶段：统计连续的cube
      while (true) {
        const value = e.CubeManagerModel.getMapValue(currentRow, currentCol);
        
        if (value === -1) {
          // 越界，cube到头了
          return { distance: 0, pushCount};
        }
        
        if (value === 0) {
          // 遇到空位，cube连续段结束，进入第二阶段
          break;
        }
        
        // 是cube，计数
        pushCount++;
        currentRow += rowDelta;
        currentCol += colDelta;
      }

      // 第二阶段：从空位开始统计可到达的距离
      while (true) {
        const value = e.CubeManagerModel.getMapValue(currentRow, currentCol);
        
        if (value === -1) {
          // 越界
          break;
        }
        
        if (value === 0) {
          // 空位，计入距离
          distance++;
          currentRow += rowDelta;
          currentCol += colDelta;
        } else {
          // 遇到非空（另一个cube或其他），停止
          break;
        }
      }

      const reachable = distance > 0;
      return { distance, pushCount};
    };

    return {
      up: calculateDirection(-1, 0),      // 上：row - 1
      down: calculateDirection(1, 0),     // 下：row + 1
      left: calculateDirection(0, -1),    // 左：col - 1
      right: calculateDirection(0, 1)     // 右：col + 1
    };
  }


  public getCubeReachablePos(e:CubeManager, row: number, col: number, direction: number, distance: number): Vec3 {
    let targetRow = row;
    let targetCol = col;
    return this.getPosByRowCol(e, targetRow, targetCol);
}

  private getPosByRowCol(e:CubeManager, row: number, col: number) :Vec3 {
    return v3((col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE, (e.CubeManagerModel.OFFSET_ROW - row) * e.CubeManagerModel.SIZE, 0);
  }
}

