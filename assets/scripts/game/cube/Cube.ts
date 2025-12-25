import { _decorator, Component, math, Node, resources, SpriteFrame, tween, v3, Vec3, find, view } from 'cc';
import { CubeModel } from './model/CubeModel';
import { CubeView } from './view/CubeView';
import { CubeBll } from './bll/CubeBll';
import { CubeEvent } from './CubeEvent';
import { EventBus } from '../../event/EventBus';
import { Sound } from '../../sound/Sound';

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
            this.view.initOriginalPos();
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
        .to(0.06,{angle:10})
        .to(0.06,{angle:-10})
        .union()        
        .repeat(2)
        .to(0.1,{angle:0})
        .start();
    }


    rePosAnim() {
    this.view.rePosAnim();
    }


    /** 更新位置 
     * @param rowoffset 行偏移
     * @param coloffset 列偏移
    */
    updateCube(rowoffset: number, coloffset: number) {
        this.model.addoffsetCube(rowoffset, coloffset);                
    }

    /** 更新视图位置 */
    updateViewPos(pos: Vec3, wPos: Vec3){
        this.view.updateCube(pos, wPos);
    }
    

    activeMask(active: boolean){
        this.view.mask.node.active = active;
    }

    /** 飞出动画 */
    flyAnim(){        
        const target = find(`gui/game/Bar/Layout/${this.model.id}`);                
        const start = this.node.getPosition().clone();
        const posW = this.node.getWorldPosition().clone();
        const pos = target.getWorldPosition();
        pos.add(v3(-view.getVisibleSize().width / 2, -view.getVisibleSize().height / 2,0));
                
        // 根据start坐标计算延迟差值，y坐标越小延迟越长
        const delayOffset = 100 / posW.y + posW.x / 4000;
        const totalDelay = 0.25 + delayOffset;
        
        // const control = v3(500, 600, 0);

        let control = this.bll.controlPoint(start, pos, 0, 500, 100);
        if (this.node.name === "cube_16" ||this.node.name === 'cube_17' || this.node.name === 'cube_18'){ 
            control = this.bll.controlPoint(start, pos, -100, 150, 100);
        }
        this.node.setSiblingIndex(this.node.getSiblingIndex() + 6); //确保在最上层显示
        // this.activeMask(true);
        tween(this.node)
        .to(0.25, {position: v3(start.x, start.y + 10, start.z) })
        // .to(0.25, {scale: v3(1.1, 1.1, 1)})             
        .call(()=>{
            this.activeMask(false);
            // EventBus.instance.emit(CubeEvent.FlyStart, this.node);
        })
        .start();    

        setTimeout(() => {
            EventBus.instance.emit(CubeEvent.FlyStart, this.node);
        }, 400);

        tween({t:0})
        .delay(totalDelay)
        .to(0.5 + delayOffset, {t: 1}, {
            easing:'quadInOut', 
            onUpdate:(v)=>{
                const target = this.bll.bezier(start, control, pos, v.t)
                this.node.setPosition(target);                
                if(v.t >= 0.8){                    
                    tween(this.node)
                    .to(0.2, {scale: v3(0.833, 0.833, 1)})          
                    .start();
                }
            }
        })
        .call(()=>{      
            Sound.ins.playOneShot(Sound.effect.fly);      
            EventBus.instance.emit(CubeEvent.FlyEnd, this.model.id);    
            this.node.removeFromParent();            
            this.node.destroy();        
        })
        .start();
    }

    /** 销毁动画 */
    destroyAnim(){
        tween(this.node)    
        .to(0.2, {scale: v3(1.1, 1.1, 1)})        
        .call(()=>{
            this.node.removeFromParent();            
            this.node.destroy();  
        })
        .start();
    }

    clearEvent() {
        this.view.clearEvent();
    }
}

