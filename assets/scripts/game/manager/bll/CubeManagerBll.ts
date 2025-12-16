import { _decorator, Component, instantiate, Node, Prefab, resources,find, v3 } from 'cc';
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
            cube.load(find("gui/game/LayerGame"), v3((data.col - 2.5) * 118, (3.5 - data.row) * 125, 0));
            e.CubeManagerModel.cubes.push(cube);
        });
    }

    /** 检查麻将是否可移动
     * @param e CubeManager实例
     * @param cube 需要检查的麻将
     * @param callback 回调函数，返回可移动方向
    */
    public checkCubeMovable(e:CubeManager, callback:(dir:number)=>void){
        const result = 2;
        callback(result);
    }

}

