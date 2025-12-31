import {
  _decorator,
  Component,
  instantiate,  
  Prefab,
  resources,
  find,
  v3,
  Vec3,
  view,
  math,
} from "cc";
import { CubeManager } from "../CubeManager";
import { Cube } from "../../cube/Cube";
import { EventBus } from "../../../event/EventBus";
import { CubeManagerEvent } from "../CubeManagerEvent";
import { EffectEvent } from "../../../effect/EffectEvent";
import { JumpEvent } from "../../jump/JumpEvent";
import { CubeEvent } from "../../cube/CubeEvent";
import { GuideEvent } from "../../guide/GuideEvent";
import { Sound } from "../../../sound/Sound";

const { ccclass, property } = _decorator;

@ccclass("CubeManagerBll")
export class CubeManagerBll  {
  
  private _size: math.Size = null;

  private _selectedCubes: Cube[] = [];  //改用数组方便访问最后和倒数第二个

  private _id: number = 0;

  private _finished: boolean = false;

  init(e: CubeManager) {
    this.addEvents(e); 
    this._size = view.getVisibleSize();   
  }


  public addEvents(e: CubeManager){
    EventBus.instance.on(CubeManagerEvent.TouchStart, (pos: Vec3) => this.onTouchStart(e, pos), this);
    EventBus.instance.on(CubeManagerEvent.TouchMove, (pos: Vec3) => this.onTouchMove(e, pos), this);
    EventBus.instance.on(CubeManagerEvent.TouchEnd, () => this.onTouchEnd(e), this);
    // EventBus.instance.on(CubeManagerEvent.)
  }


  private onTouchStart(e: CubeManager, pos: Vec3) {
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    EventBus.instance.emit(EventBus.StopTimer);   //阻断计时    
    EventBus.instance.emit(EffectEvent.LineClear);     
    const cube = this.getCubeAtTouch(e, pos);
    if (cube) {
      this._selectedCubes = [];  // 清空之前的选择
      this.markCube(cube);
      this._id = cube.model.id;
    }    
  }

  private onTouchMove(e: CubeManager, pos: Vec3) {     
    const cube = this.getCubeAtTouch(e, pos);
    if (cube && cube.model.id === this._id) {
      this.markCube(cube);
      
    }     
    
    EventBus.instance.emit(EventBus.StopTimer);   //阻断计时
  }

  private onTouchEnd(e: CubeManager) {
    EventBus.instance.emit(EffectEvent.LineClear);
    if (this._selectedCubes.length >= 2) {
      Sound.ins.playOneShot(Sound.effect.ing);
      const id = this._selectedCubes[0].model.id
      const score = find(`gui/game/Bar/Layout/${id}`);
      // 批量移除选中的麻将
      e.removeCubes(this._selectedCubes);
      if(score){          
        setTimeout(() => {        
        EventBus.instance.emit(EffectEvent.ShowBoom, find(`gui/game/Bar/Layout/${id}`).getWorldPosition()); 
         
      }, 800);
      }     
      // 播放销毁动画
      for (const cube of this._selectedCubes) {
        cube.destroyAnim();        
      }
      
      EventBus.instance.emit(JumpEvent.onJump);
      this._finished = true;
      // 播放音效
      // Sound.ins.play(Sound.effect.match);
    }else{
      // 少于2个则取消标记
      for (const cube of this._selectedCubes) {
        cube.activeMask(false);
        EventBus.instance.emit(CubeEvent.onShakeCube, cube);
      }
      this._selectedCubes = [];
      if(!this._finished){
        EventBus.instance.emit(EventBus.UpdateTimer); //恢复计时
      }
    }
  }
  

  /** 创建麻将实体
   * @param e CubeManager实例
   * @param data 麻将数据
   * @param offsetIndex 从顶部掉落时的偏移索引（用于错开生成位置）
   */
  public createCube(e: CubeManager, data: any, offsetIndex: number = -1) {
    resources.load(`cube/cube`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
        return;
      }
      const node = instantiate(prefab);
      node.name = `cube_${data.row * 8 + data.col}`;
      const cube = node.getComponent(Cube);
      node.parent = find("gui/game/LayerGame");
      cube.model.id = data.id;
      cube.model.row = data.row;
      cube.model.col = data.col;
      cube.view.candrag = false;
      
      const targetPos = v3(
        (data.col - e.model.OFFSET_COL) * e.model.SIZE,
        (e.model.OFFSET_ROW - data.row) * e.model.SIZE,
        0
      );
      
      if (offsetIndex >= 0) {
        // 从顶部掉落：初始位置在屏幕上方，根据索引错开
        const startPos = v3(
          targetPos.x,
          targetPos.y + e.model.SIZE * (e.model.map.length + offsetIndex), // 在屏幕上方
          0
        );
        cube.load(find("gui/game/LayerGame"), startPos);
        // cube.activeMask(true);
      } else {
        // 正常加载到目标位置
        cube.load(find("gui/game/LayerGame"), targetPos);
      }
      
      e.model.cubes.push(cube);
    });
  }
    

  private uiToCenterOrigin(uiPos: Vec3): Vec3 {     
    return v3(uiPos.x - this._size.width / 2, uiPos.y - this._size.height / 2, 0);
  }

  /**
   * 将 UI 坐标（左下角为原点）转换为网格索引（row, col）
   */
  private uiPosToGrid(e: CubeManager, uiPos: Vec3): { row: number; col: number } | null {
    const centerPos = this.uiToCenterOrigin(uiPos);
    const SIZE = e.model.SIZE;
    const OFFSET_COL = e.model.OFFSET_COL;
    const OFFSET_ROW = e.model.OFFSET_ROW;

    const col = Math.floor((centerPos.x + SIZE / 2) / SIZE) + OFFSET_COL;
    const row = OFFSET_ROW - Math.floor((centerPos.y + SIZE / 2) / SIZE);

    const rows = e.model.map.length;
    const cols = e.model.map[0].length;
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }

  /**
   * 根据触摸位置获取对应的 cube（优先按网格索引查找，失败时用包围盒命中）
   */
  private getCubeAtTouch(e: CubeManager, uiPos: Vec3): Cube | null {
    const grid = this.uiPosToGrid(e, uiPos);    
    if (grid) {      
      // return;
      const cube = e.model.getCube(grid.row, grid.col);
      if (cube) return cube;      
    }
    // 若按索引未找到（例如该格为空），继续用包围盒检测
    // const centerPos = this.uiToCenterOrigin(uiPos);
    // const half = e.model.SIZE / 2;
    // for (const cube of e.model.cubes) {
    //   const p = cube.node.position;
    //   if (Math.abs(p.x - centerPos.x) <= half && Math.abs(p.y - centerPos.y) <= half) {
    //     return cube;
    //   }
    // }
    return null;
  }

  /** 标记一个 cube，若回到倒数第二个位置则取消最后一个的标记（撤销） */
  private markCube(cube: Cube) {
    const len = this._selectedCubes.length;
    
    // 如果当前cube是倒数第二个（回溯），则取消最后一个的标记
    if (len >= 2 && this._selectedCubes[len - 2] === cube) {
      const last = this._selectedCubes.pop();
      EventBus.instance.emit(EffectEvent.LineRemove);
      if (last) {
        last.activeMask(false);
      }
      return;
    }
    
    // 去重：检查整个数组中是否已存在该cube
    if (this._selectedCubes.includes(cube)) {
      return;
    }
    
    // 邻接检测：必须与最后一个标记的cube相邻（8个方向）
    if (len > 0) {
      const last = this._selectedCubes[len - 1];
      if (!this.isAdjacent(last, cube)) {
        return; // 不相邻则不标记
      }
    }
    
    // 正常标记
    this._selectedCubes.push(cube);
    cube.activeMask(true);
    cube.selectAnim();    
    const newLen = this._selectedCubes.length;
    Sound.ins.playOneShot(Sound.effect.click);
    if(newLen >= 2){
      EventBus.instance.emit(EffectEvent.Line, this._selectedCubes[newLen - 2].node.getPosition() ,cube.node.getPosition());
    }
  }

  /** 检测两个 cube 是否相邻（8个方向：上下左右+4个对角） */
  private isAdjacent(cube1: Cube, cube2: Cube): boolean {
    const dRow = Math.abs(cube1.model.row - cube2.model.row);
    const dCol = Math.abs(cube1.model.col - cube2.model.col);
    // 相邻定义：行列差值都 <= 1，且不是同一个格子
    return dRow <= 1 && dCol <= 1 && !(dRow === 0 && dCol === 0);
  }

  /** 根据行列计算位置坐标（供 CubeManager 调用） */
  public getPosByRowCol(e: CubeManager, row: number, col: number): Vec3 {
    return v3(
      (col - e.model.OFFSET_COL) * e.model.SIZE,
      (e.model.OFFSET_ROW - row) * e.model.SIZE,
      0
    );
  }
  
}
