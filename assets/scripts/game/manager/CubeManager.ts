import { _decorator, Component, Node } from "cc";
import { CubeManagerBll } from "./bll/CubeManagerBll";
import { CubeManagerView } from "./view/CubeManagerView";
import { EventBus } from "../../event/EventBus";
import { CubeManagerEvent } from "./CubeManagerEvent";
import { CubeManagerModel } from "./model/CubeManagerModel";
import { CubeEvent } from "../cube/CubeEvent";
import { Cube } from "../cube/Cube";
const { ccclass, property } = _decorator;

@ccclass("CubeManager")
export class CubeManager {
  //数据层
  CubeManagerModel!: CubeManagerModel;

  //业务层
  CubeManagerBll!: CubeManagerBll;

  //视图层
  CubeManagerView!: CubeManagerView;


/**
 *
 */
constructor() {
    this.CubeManagerModel = new CubeManagerModel();
    this.CubeManagerBll = new CubeManagerBll();
    this.CubeManagerView = new CubeManagerView();    
}

  init() {
    this.generateBoardLayout();
    this.addEvents();
  }

  public generateBoardLayout() {
    for (let r = 0; r < this.CubeManagerModel.map.length; r++) {
      for (let c = 0; c < this.CubeManagerModel.map[r].length; c++) {
        if (this.CubeManagerModel.map[r][c] === 0) continue;
        this.CubeManagerBll.createCube(this, {
          id: this.CubeManagerModel.map[r][c],
          row: r,
          col: c,
        });
      }
    }
  }

  private addEvents() {
    EventBus.instance.on(CubeEvent.onCubeClick, this.onCubeClick, this);
    EventBus.instance.on(CubeEvent.onShakeCube, this.onShakeCubes, this);
    EventBus.instance.on(CubeEvent.onFollowCube, this.onFollowCube, this);
    EventBus.instance.on(CubeEvent.onCubeDragEnd, this.onCubeDragEnd, this);
    EventBus.instance.on(CubeEvent.onCubeReturn, this.onCubeReturn, this);
  }

  private onCubeClick(node: Node, callback:(data:any)=>void) {
    // console.log("点击了麻将", cube.model);
    this.CubeManagerBll.checkCubeMovable(this, node, callback);
  }

  private onShakeCubes(node:Node) {
    const cube = node.getComponent(Cube);
    const id = cube?.model.id || 0;
    const cubes = this.CubeManagerModel.getCubesById(id);
    cubes.forEach((cube)=>{
      cube.shakeAnim();
    });
  }


  private onFollowCube(data: any) {
    this.CubeManagerBll.followCube(this, data.node, data.isHorizontal, data.delta);
  }

  private onCubeDragEnd() {
    this.CubeManagerBll.checkMovedCubes(this);
  }

  private onCubeReturn() {
    this.CubeManagerBll.returnOrigin();//被移动的麻将回到原位
  }
}
