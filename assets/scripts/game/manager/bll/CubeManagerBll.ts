import {
  _decorator,
  Component,
  instantiate,  
  Prefab,
  resources,
  Node,
  find,
  v3,
  Vec3,
  view,
} from "cc";
import { CubeManager } from "../CubeManager";
import { Cube } from "../../cube/Cube";
const { ccclass, property } = _decorator;

@ccclass("CubeManagerBll")
export class CubeManagerBll extends Component {

  private _movedCubes: Cube[] = [];

  /** 创建麻将实体
   * @param e CubeManager实例
   * @param data 麻将数据
   */
  public createCube(e: CubeManager, data: any) {
    resources.load(`cube/cube`, Prefab, (err, prefab) => {
      if (err) {
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
      cube.load(
        find("gui/game/LayerGame"),
        v3(
          (data.col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE,
          (e.CubeManagerModel.OFFSET_ROW - data.row) * e.CubeManagerModel.SIZE,
          0
        )
      );
      e.CubeManagerModel.cubes.push(cube);
    });
  }

  /** 检查麻将是否可移动
   * @param e CubeManager实例
   * @param cube 需要检查的麻将
   * @param callback 回调函数，返回可移动方向
   */
  public checkCubeMovable(
    e: CubeManager,
    node: Node,
    callback: (data: any) => void
  ) {
    const cube = node.getComponent(Cube);
    const col = cube.model.col;
    const row = cube.model.row;
    const val = cube.model.id;
    const dirs = this.getMaxReachableInDirections(e, row, col);
    // console.log("检查麻将可移动方向", dirs);
    const res = this.getCubeReachablePos(e, row, col, dirs);
    callback(res);
  }

  /** 计算四个方向可到达的最远点
   * @param row 当前行位置
   * @param col 当前列位置
   * @returns 对象，包含四个方向的信息
   *   - up/down/left/right: { distance: 能到达的最远距离（空位数量）, pushCount: 连续可推动的cube数量, reachable: 是否可达 }
   */
  getMaxReachableInDirections(
    e: CubeManager,
    row: number,
    col: number
  ): {
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
          return { distance: 0, pushCount };
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
      return { distance, pushCount };
    };

    return {
      up: calculateDirection(-1, 0), // 上：row - 1
      down: calculateDirection(1, 0), // 下：row + 1
      left: calculateDirection(0, -1), // 左：col - 1
      right: calculateDirection(0, 1), // 右：col + 1
    };
  }

  /** 获取麻将在四个方向上可到达的坐标位置
   * @param e CubeManager实例
   * @param row 麻将当前行位置
   * @param col 麻将当前列位置
   * @param data 四个方向的可达信息
   * @returns 包含四个方向坐标位置的对象
   */
  public getCubeReachablePos(
    e: CubeManager,
    row: number,
    col: number,
    data: any
  ): { up: number; down: number; left: number; right: number } {
    return {
      up: this.convertWorldPos(
        this.getPosByRowCol(e, row - data.up.distance, col)
      ).y,
      down: this.convertWorldPos(
        this.getPosByRowCol(e, row + data.down.distance, col)
      ).y,
      left: this.convertWorldPos(
        this.getPosByRowCol(e, row, col - data.left.distance)
      ).x,
      right: this.convertWorldPos(
        this.getPosByRowCol(e, row, col + data.right.distance)
      ).x,
    };
  }

  private getPosByRowCol(e: CubeManager, row: number, col: number): Vec3 {
    return v3(
      (col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE,
      (e.CubeManagerModel.OFFSET_ROW - row) * e.CubeManagerModel.SIZE,
      0
    );
  }

  // 将以屏幕中心为原点的坐标转换为以屏幕左下角为原点的坐标
  private convertWorldPos(pos: Vec3): Vec3 {
    const size = view.getVisibleSize();
    return v3(pos.x + size.width / 2, pos.y + size.height / 2, pos.z);
  }

  public followCube(e: CubeManager, node: Cube, isHorizontal: boolean, delta: number) {
    const cube = node.getComponent(Cube);
    const col = cube.model.col;
    const row = cube.model.row;
    // const val = cube.model.id;
    const res = this.getMaxReachableInDirections(e, row, col);
    if (isHorizontal) {
      if (delta > 0) {
        // 向右移动
        for (let i = 0; i < res.right.pushCount; i++) {
          e.CubeManagerModel.getCube(row, col + i + 1).node.setWorldPosition(
            e.CubeManagerModel.getCube(row, col).node.getWorldPosition().x + e.CubeManagerModel.SIZE * (i + 1),e.CubeManagerModel.getCube(row, col).node.getWorldPosition().y,0);
            // e.CubeManagerModel.getCube(row, col+i+1).node.setParent(node);
        }        
      } else {
        // 向左移动
        for (let i = 0; i < res.left.pushCount; i++) {
          e.CubeManagerModel.getCube(row, col - i - 1).node.setWorldPosition( e.CubeManagerModel.getCube(row, col).node.getWorldPosition().x - e.CubeManagerModel.SIZE * (i + 1),e.CubeManagerModel.getCube(row, col).node.getWorldPosition().y,0);
            // e.CubeManagerModel.getCube(row, col-i-1).node.setParent(node);
        }        
      }
    }else{
      if (delta > 0) {
        // 向上移动
        for (let i = 0; i < res.up.pushCount; i++) {
          e.CubeManagerModel.getCube(row - i - 1, col).node.setWorldPosition( e.CubeManagerModel.getCube(row, col).node.getWorldPosition().x,e.CubeManagerModel.getCube(row, col).node.getWorldPosition().y + e.CubeManagerModel.SIZE * (i + 1),0);
            // e.CubeManagerModel.getCube(row-i-1, col).node.setParent(node);
        }        
      } else {
        // 向下移动 // 向左移动
        for (let i = 0; i < res.down.pushCount; i++) {
          e.CubeManagerModel.getCube(row + i + 1, col).node.setWorldPosition( e.CubeManagerModel.getCube(row, col).node.getWorldPosition().x,e.CubeManagerModel.getCube(row, col).node.getWorldPosition().y - e.CubeManagerModel.SIZE * (i + 1),0);
            // e.CubeManagerModel.getCube(row+i+1, col).node.setParent(node);
        }        
      }
    }
  }


  public checkMovedCubes(e: CubeManager) {
    
  }

  public returnOrigin(){
    
  }

}
