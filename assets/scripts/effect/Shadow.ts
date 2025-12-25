import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shadow')
export class Shadow extends Component {
   
    followNode: Node = null;

    private _onFinish:boolean = false; // 是否已经完成动画
    
    protected onLoad(): void {
        this.node.setScale(0,0,0);
        tween(this.node)
        .to(0.3, {scale: v3(0.8, 0.8, 1)})
        .call(()=>{
            this._onFinish = true;
        })
        .start();
    }
    update(deltaTime: number) {
      
        if (this.followNode != null) {
            if (this.followNode.activeInHierarchy){
                this.node.setPosition(this.followNode.getPosition().add(v3(-22, -12, 0))); // 设置阴影的位置与跟随节点相同
                if (this._onFinish) {                    
                    if ( this.node.getPosition().y > 400) {
                        this.node.setScale(this.followNode.getScale().subtract(v3(0.35, 0.35, 0))); // 设置阴影的缩放与跟随节点相同
                    }
                    else if ( this.node.getPosition().y > 300) {
                        this.node.setScale(this.followNode.getScale().subtract(v3(0.3, 0.3, 0))); // 设置阴影的缩放与跟随节点相同
                    }
                    else{
                        this.node.setScale(this.followNode.getScale().subtract(v3(0.2, 0.2, 0))); // 设置阴影的缩放与跟随节点相同
                    }
                }
            }else{
                this.node.removeFromParent();
                this.node.destroy();
                return;
            }
        }
        if (this.node.getPosition().y > 450) {
            this.node.removeFromParent();
            this.node.destroy();
            return;
        }
    }
}

