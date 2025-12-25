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
import { EventBus } from "../../../event/EventBus";
import { EffectEvent } from "../../../effect/EffectEvent";
import { Sound } from "../../../sound/Sound";
import { CubeEvent } from "../../cube/CubeEvent";
const { ccclass, property } = _decorator;

@ccclass("CubeManagerBll")
export class CubeManagerBll extends Component {
  
  private _hLCubes: Cube[] = [];
  private _hRCubes: Cube[] = [];
  
  private _vUCubes: Cube[] = [];
  private _vDCubes: Cube[] = [];

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
      cube.view.candrag = false;
      if (node.name === "cube_16"){
        cube.view.candrag = true;        
      }
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
  public checkCubeMovable(e: CubeManager, node: Node, callback: (data: any) => void
  ) {
    const cube = node.getComponent(Cube);
    const col = cube.model.col;
    const row = cube.model.row;    
    const data = this.getMaxReachableInDirections(e, row, col);        
    const res = this.getCubeReachablePos(e, row, col, data);
    callback(res);
  }

  /** 计算四个方向可到达的最远点
   * @param row 当前行位置
   * @param col 当前列位置
   * @returns 对象，包含四个方向的信息
   *   - up/down/left/right: { distance: 能到达的最远距离（空位数量）, pushCount: 连续可推动的cube数量, reachable: 是否可达 }
   */
  getMaxReachableInDirections(e: CubeManager,row: number,col: number): {
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
  public getCubeReachablePos(e: CubeManager,row: number,col: number,data: any): 
  { up: number; down: number; left: number; right: number } {
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


  /** 麻将跟随移动
   * @param e CubeManager实例
   * @param node 被移动的麻将节点
   * @param isHorizontal 是否水平移动
   * @param newPos 移动的坐标值（x或y）
   */
  public followCube(e: CubeManager, node: Node, isHorizontal: boolean, newPos: number) {    
    const cube = node.getComponent(Cube);
    const col = cube.model.col;
    const row = cube.model.row;
    // const val = cube.model.id;
    const res = this.getMaxReachableInDirections(e, row, col);        
    if (isHorizontal) {
      // console.log(this._hLCubes[0]);
      this._vUCubes.forEach(cube => {
        cube.rePosAnim();
      });
      this._vDCubes.forEach(cube => {
        cube.rePosAnim();
      });
      this._vUCubes = [];
      this._vDCubes = [];      
      node.setWorldPosition(newPos, cube.view.originWorldPos.y, 0);
      if (newPos - cube.view.originWorldPos.x > 0) {
        // 向右移动 
        this._hRCubes = [];
        this._hLCubes.forEach(cube => {
          cube.rePosAnim();
        });
        this._hLCubes = [];        

        for (let i = 0; i < res.right.pushCount; i++) {
          const movedCube = e.CubeManagerModel.getCube(row, col + i + 1);          
          this._hRCubes.push(movedCube);          
          movedCube.node.setWorldPosition(
            newPos + e.CubeManagerModel.SIZE * (i + 1), movedCube.node.getWorldPosition().y, 0);            
          }               
      } else {
        // 向左移动
        this._hLCubes = [];
        this._hRCubes.forEach(cube => {
          cube.rePosAnim();
        });
        this._hRCubes = [];

        for (let i = 0; i < res.left.pushCount; i++) {
          const movedCube = e.CubeManagerModel.getCube(row, col - i - 1);          
          this._hLCubes.push(movedCube);          
          movedCube.node.setWorldPosition(newPos - e.CubeManagerModel.SIZE * (i + 1), movedCube.node.getWorldPosition().y,0);            
        }                
      }
    } 
    else {
      this._hLCubes.forEach(cube => {
        cube.rePosAnim();
      });
      this._hRCubes.forEach(cube => {
        cube.rePosAnim();
      });
      this._hLCubes = [];
      this._hRCubes = [];
      // this._vCubes = [];
      node.setWorldPosition(cube.view.originWorldPos.x, newPos, 0);
      if (newPos - cube.view.originWorldPos.y > 0) {
        // 向上移动
        this._vUCubes = [];
        this._vDCubes.forEach(cube => {
          cube.rePosAnim();
        });
        this._vDCubes = [];
        for (let i = 0; i < res.up.pushCount; i++) {
          const movedCube = e.CubeManagerModel.getCube(row - i - 1, col);
          this._vUCubes.push(movedCube);
          movedCube.node.setWorldPosition(movedCube.node.getWorldPosition().x, newPos + e.CubeManagerModel.SIZE * (i + 1), 0);
        }                  
      } else {
        // 向下移动
        this._vDCubes = [];
        this._vUCubes.forEach(cube => {
          cube.rePosAnim();
        });
        this._vUCubes = [];
        for (let i = 0; i < res.down.pushCount; i++) {
          const movedCube = e.CubeManagerModel.getCube(row + i + 1, col);
          this._vDCubes.push(movedCube);
          movedCube.node.setWorldPosition(movedCube.node.getWorldPosition().x, newPos - e.CubeManagerModel.SIZE * (i + 1), 0);            
        }                
      }
    }
    
  }

  /** 配对麻将
   * @param e CubeManager实例
   * @param node 被移动的麻将节点
   */
  public pairCube(e: CubeManager, node: Node, click: boolean = false) {

    const cube = node.getComponent(Cube);
    const h = cube.view.originWorldPos.y == node.getWorldPosition().y;    
    var bclick = Vec3.squaredDistance(cube.view.originWorldPos, node.getWorldPosition()) < e.CubeManagerModel.MOVE_TOLERANCE;
    if(click){
      bclick = true;
    }
    const row = Math.round(e.CubeManagerModel.OFFSET_ROW - node.getPosition().y / e.CubeManagerModel.SIZE);
    const col = Math.round(node.getPosition().x / e.CubeManagerModel.SIZE + e.CubeManagerModel.OFFSET_COL);
    const newPos = this.getPosByRowCol(e, row, col);
    const val = cube.model.id;
    const rowDelta = row - cube.model.row;
    const colDelta = col - cube.model.col;
    const res = this.getReachablePos(e, row, col);    
    //滑动配对
    if (!bclick) {
      if (h) {          
          if (e.CubeManagerModel.getMapValue(row - res.up, col) === val ){   
              cube.activeMask(true);                         
              e.CubeManagerModel.getCube(row - res.up, col).activeMask(true);
              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);

              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row - res.up, col));

              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row - res.up, col);
       
              // EventBus.instance.emit(EffectEvent.Line, {start: startP, endP:  Vec3.ZERO});
              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row - res.up, col);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              Sound.ins.playOneShot(Sound.effect.pair); 
              // if(e.CubeManagerModel.checkIsBar(val)){}
              // else{
              //   cube.destroyAnim();
              //   e.CubeManagerModel.getCube(row - res.up, col).destroyAnim();
              // }

              this._hLCubes.forEach(cube => {
                  this.cubeupdate(e, cube, 0, colDelta);
                  this.pairCube(e, cube.node,true);
                });
              this._hRCubes.forEach(cube => {
                  this.cubeupdate(e, cube, 0, colDelta);
                  this.pairCube(e, cube.node,true);
                });
                           
          } 
          else if (e.CubeManagerModel.getMapValue(row + res.down, col) === val) {  
              cube.activeMask(true);            
              e.CubeManagerModel.getCube(row + res.down, col).activeMask(true);
              // node.active = false;
              // e.CubeManagerModel.getCube(row + res.down, col).node.active = false;
              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row + res.down, col));

              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row + res.down, col);

              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row + res.down, col);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              Sound.ins.playOneShot(Sound.effect.pair); 
              // if(e.CubeManagerModel.checkIsBar(val)){}
              // else{
              //   cube.destroyAnim();
              //   e.CubeManagerModel.getCube(row + res.down, col).destroyAnim();
              // }

              this._hLCubes.forEach(cube => {
                  this.cubeupdate(e, cube, 0, colDelta);
                  this.pairCube(e, cube.node,true);
                });
              this._hRCubes.forEach(cube => {
                  this.cubeupdate(e, cube, 0, colDelta);  
                  this.pairCube(e, cube.node,true);
                });
               
          }
          else{  
            cube.rePosAnim();
            cube.activeMask(false);
            if (cube.node.name === "cube_16" ) {
            EventBus.instance.emit(EventBus.UpdateTimer);
            }
          }
      }
      else{
          if (e.CubeManagerModel.getMapValue(row, col - res.left) === val){            
            cube.activeMask(true);           
            e.CubeManagerModel.getCube(row, col - res.left).activeMask(true); 
              // node.active = false;
              // e.CubeManagerModel.getCube(row, col - res.left).node.active = false;
              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row, col - res.left));
              
              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row, col - res.left);

              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row, col - res.left);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              Sound.ins.playOneShot(Sound.effect.pair); 
              // if(e.CubeManagerModel.checkIsBar(val)){}
              // else{
              //   cube.destroyAnim();
              //   e.CubeManagerModel.getCube(row, col - res.left).destroyAnim();
              // }

              this._vUCubes.forEach(cube => {
                  this.cubeupdate(e, cube, rowDelta, 0);
                  this.pairCube(e, cube.node,true);
                });
              this._vDCubes.forEach(cube => {
                  this.cubeupdate(e, cube, rowDelta, 0);
                  this.pairCube(e, cube.node,true);
                })
              
          } 
          else if (e.CubeManagerModel.getMapValue(row, col + res.right) === val) {   
              cube.activeMask(true);           
              e.CubeManagerModel.getCube(row, col + res.right).activeMask(true);            
              // node.active = false;
              // e.CubeManagerModel.getCube(row, col + res.right).node.active = false;
              node.setPosition(newPos); 
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row, col + res.right));

              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row, col + res.right);  
              
              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row, col + res.right);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              Sound.ins.playOneShot(Sound.effect.pair); 
              this._vUCubes.forEach(cube => {
                  this.cubeupdate(e, cube, rowDelta, 0);
                  this.pairCube(e, cube.node,true);
                });
              this._vDCubes.forEach(cube => {
                  this.cubeupdate(e, cube, rowDelta, 0);
                  this.pairCube(e, cube.node,true);
                })                        
          }
          else{
            cube.rePosAnim();
            cube.activeMask(false);
            if (cube.node.name === "cube_16" ) {
            EventBus.instance.emit(EventBus.UpdateTimer);
            }
          }
      }
    } else {
      // console.log("点击，直接配对");
      if (e.CubeManagerModel.getMapValue(row - res.up, col) === val ){
              cube.activeMask(true); 
              e.CubeManagerModel.getCube(row - res.up, col).activeMask(true);
              

              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row - res.up, col);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);

              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row - res.up, col));

              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row - res.up, col);
     
      } 
      else if (e.CubeManagerModel.getMapValue(row + res.down, col) === val) {
              cube.activeMask(true);
              e.CubeManagerModel.getCube(row + res.down, col).activeMask(true);    
              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row + res.down, col);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);

              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row + res.down, col));

              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row + res.down, col);
      
      }
      else if (e.CubeManagerModel.getMapValue(row, col - res.left) === val){
              cube.activeMask(true);
              e.CubeManagerModel.getCube(row, col - res.left).activeMask(true);

              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row, col - res.left);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              
              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row, col - res.left));
              
              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row, col - res.left); 
                        
      } 
      else if (e.CubeManagerModel.getMapValue(row, col + res.right) === val) {
              cube.activeMask(true);
              e.CubeManagerModel.getCube(row, col + res.right).activeMask(true);

              const startP = this.getWorldPosByRowCol(e, row, col);
              const endP = this.getWorldPosByRowCol(e, row, col + res.right);
              EventBus.instance.emit(EffectEvent.Line, startP, endP);
              
              node.setPosition(newPos);
              e.CubeManagerModel.removeCube(cube);
              e.CubeManagerModel.removeCube(e.CubeManagerModel.getCube(row, col + res.right));
              
              e.CubeManagerModel.updateMapValueByCube(cube);
              e.CubeManagerModel.updateMapValue(row, col + res.right);
            
      }else{
        if (cube.node.name !== "cube_42" && cube.node.name !== "cube_43") {
          EventBus.instance.emit(CubeEvent.onShakeCube, cube.node); 
        }
      }
    }        
  }

  
  private cubeupdate(e:CubeManager , cube: Cube, row: number, col: number) {
    e.CubeManagerModel.updateMapValueByCube(cube);
    cube.updateCube(row, col);
    e.CubeManagerModel.updateMapValue(cube.model.row, cube.model.col, cube.model.id);
    const pos = v3((cube.model.col- e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE, (e.CubeManagerModel.OFFSET_ROW - cube.model.row) * e.CubeManagerModel.SIZE, 0);
    const wPos = this.convertWorldPos(pos);    
    cube.updateViewPos(pos, wPos);
  }

  public returnOrigin() {
    this._hLCubes.forEach(cube => {
      cube.rePosAnim();
    });
    this._vUCubes.forEach(cube => {
      cube.rePosAnim();
    });
    this._hRCubes.forEach(cube => {
      cube.rePosAnim();
    })
    this._vDCubes.forEach(cube => {
      cube.rePosAnim();
    });
    this._vUCubes = [];    
    this._vDCubes = [];
    this._hLCubes = [];
    this._hRCubes = [];
  }

  // 将以屏幕中心为原点的坐标转换为以屏幕左下角为原点的坐标
  private convertWorldPos(pos: Vec3): Vec3 {
    const size = view.getVisibleSize();
    return v3(pos.x + size.width / 2, pos.y + size.height / 2, pos.z);
  }


  private getReachablePos(e: CubeManager, row: number, col: number): any {
    const calculateDirection = (rowDelta: number, colDelta: number) => {
      let distance = 1;
      let currentRow = row + rowDelta;
      let currentCol = col + colDelta;
     while (true) {
        const value = e.CubeManagerModel.getMapValue(currentRow, currentCol);
        if (value === -1) {
          // 越界
          return -1;
        }
        if(value !== 0) {
          // 非空位
          break;
        }
        distance++;
        currentRow += rowDelta;
        currentCol += colDelta;
     }
     return distance;
  };
  return {
      up: calculateDirection(-1, 0),
      down: calculateDirection(1, 0),
      left: calculateDirection(0, -1),
      right: calculateDirection(0, 1),
    };
  }

  private getPosByRowCol(e: CubeManager, row: number, col: number): Vec3 {
   return v3(
      (col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE,
      (e.CubeManagerModel.OFFSET_ROW - row) * e.CubeManagerModel.SIZE,
      0
    );
  }

  private getWorldPosByRowCol(e: CubeManager, row: number, col: number): Vec3 {
    const pos = v3(
      (col - e.CubeManagerModel.OFFSET_COL) * e.CubeManagerModel.SIZE,
      (e.CubeManagerModel.OFFSET_ROW - row) * e.CubeManagerModel.SIZE,
      0
    );
    return this.convertWorldPos(pos);
  }

  private onPairSuccess(pos: Vec3) {
    // console.log("配对成功");

  }
}
