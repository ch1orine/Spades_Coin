import { _decorator, Component, Node } from "cc";
import { Cube } from "../../cube/Cube";
const { ccclass } = _decorator;

@ccclass("CubeManagerModel")
export class CubeManagerModel {
  cubes: Cube[] = [];

  private _map: number[][];

  public readonly SIZE: number = 118;

  public readonly OFFSET_COL: number = 2.5;
  
  public readonly OFFSET_ROW: number = 3;

  public get map(): number[][] {
    return this._map;
  }

   
  constructor() {
    this._map = [
      [41, 31, 0, 31, 0, 0],
      [0, 0, 0, 47, 51, 45],
      [47, 51, 45, 0, 0, 0],
      [0, 22, 0, 32, 16, 0],
      [22, 0, 0, 0, 39, 0],
      [0, 34, 21, 41, 0, 34],
      [32, 0, 16, 39, 0, 0],
      [21, 0, 0, 0, 0, 0],
    ];
  }

  /** 获取格子值
   * @param row 横坐标
   * @param col 纵坐标
   * @returns 格子值
   */
  getMapValue(row: number, col: number): number {
    if (
      col < 0 ||
      col >= this._map[0].length ||
      row < 0 ||
      row >= this._map.length
    ) {
      return -1;
    }
    return this._map[row][col];
  }

  /** 更新格子值
   * @param row 
   * @param col 
   * @param value 
   * @returns 
   */
  updateMapValue(row: number, col: number, value: number = 0) {
    if (
      col < 0 ||
      col >= this._map[0].length ||
      row < 0 ||
      row >= this._map.length
    ) {
      console.error("GridMap update: Invalid coordinates");
      return;
    }
    this._map[row][col] = value;
  }

  getCube(row: number, col: number): Cube {
    return this.cubes.find((cube) => cube.model.row === row && cube.model.col === col);
  }

  getCubesById(id: number): Cube[] {
    return this.cubes.filter((cube) => cube.model.id === id);    
  }

}
