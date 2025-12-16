import { _decorator, Component, math, Node, resources, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { CubeModel } from './model/CubeModel';
import { CubeView } from './view/CubeView';
import { CubeBll } from './bll/CubeBll';
const { ccclass, property } = _decorator;

@ccclass('Cube')
export class Cube extends Component {
    model!: CubeModel;

    view!: CubeView;

    bll!: CubeBll; //not use but keep for structure consistency

    protected onLoad(): void {
        this.model = this.addComponent(CubeModel);
        this.bll = this.addComponent(CubeBll);
        this.view = this.getComponent(CubeView);
    }

    /** 加载显示图并初始化位置
     * @param parent 父节点
     * @param pos 位置
     */
    load(parent: Node, pos: Vec3 = Vec3.ZERO) {
        resources.load(`cube/texture/${this.model.id}/spriteFrame`, SpriteFrame,
            (err, sf) => {
            if (err) {
                console.error(err);
                return;
            }            
            this.view.sprite.spriteFrame = sf;
            this.node.parent = parent;
            this.node.setPosition(pos);  
            this.geneAnim();          
        });
    }

    /** 生成动画 */
    geneAnim(){
        const duration = math.randomRange(0.1, 0.4);
        const scale = math.randomRange(0.2, 0.5);
        this.node.setScale(v3(scale, scale, 1));
        tween(this.node)        
        .to(duration, { scale: v3(1, 1, 1) },{easing: 'linear'})
        .start();
    }


    /** 抖动动画 */
    shakeAnim(){
        tween(this.node)
        .to(0.1,{angle:8})
        .to(0.1,{angle:-8})
        .to(0.1,{angle:0})        
        .start();
    }

    /** 消除动画 */
}

