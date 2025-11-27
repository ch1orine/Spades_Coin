import { _decorator, Component, director, instantiate, Node, Prefab, resources, Tween, tween, UIOpacity, UITransform, v3, Vec3 } from "cc";
import { GuideEvent } from "./GuideEven";
import { EventBus } from "../../event/EventBus";
const { ccclass, property } = _decorator;

@ccclass("Guide")
export class GuideManager {
  private _hand!: Node;

  private _mask!: Node;

  private _offset: number = 75;

  constructor() {
    const guideNode = new Node(); //创建一个节点作为guidelayer
    guideNode.name = "GuideLayer";
    director.getScene().children[0].addChild(guideNode); //添加节点到场景
    const mapNode = director.getScene().children[0].children[0].getChildByName("Map");

    resources.load(`prefabs/hand`, Prefab, (err, prefab) => {
        if (err) {
            console.error(err);
            return;
        }
        this._hand = instantiate(prefab);
        this._hand.parent = guideNode;
        this._hand.active = false;
        this._offset = this._hand.getComponent(UITransform).width / 2;  
           resources.load(`prefabs/mask`, Prefab, (err, prefab) => {
        if (err) {
            console.error(err);
            return;
        }
        this._mask = instantiate(prefab);
        this._mask.parent = mapNode;
        this._mask.setPosition(0,170,0);
        const ui = this._mask.getComponent(UITransform);
        ui.width = 170;
        ui.height = 85;
        this._mask.active = false; 
        EventBus.instance.emit(GuideEvent.GetGuideBlocks);       
    });  
            
    });

 
    EventBus.instance.on(GuideEvent.ShowHand, this.showGuide, this);    
    EventBus.instance.on(GuideEvent.StopShowGuide, this.stopGuideShow, this);
  }

  public showGuide(pos:Vec3[]){ 
    
    if (this._hand){          
      this._hand.active = true;
      this._mask.active = true;
      this._hand.setPosition(pos[0].x + this._offset, pos[0].y - this._offset, 0);
      console.log("show guide at ", pos[0].x + this._offset, pos[0].y - this._offset, 0);
      const opacity = this._hand.getComponent(UIOpacity);
      opacity.opacity = 255;

      const opacityMask = this._mask.getComponent(UIOpacity);
      opacityMask.opacity = 255;

      const ui = this._mask.getComponent(UITransform);
      ui.width = Math.max((pos[1].x - pos[0].x) * 2, 85);
      ui.height = Math.max((pos[0].y - pos[1].y) * 2, 85);      
      this._mask.setPosition(pos[0].x + (pos[1].x - pos[0].x)/2, pos[0].y + (pos[1].y - pos[0].y)/2, 0);

      //播放动画
      tween(this._hand)
        .tag(0)
        .repeatForever(
          tween()
          .to(0.5, { position: v3(pos[1].x + this._offset, pos[1].y - this._offset, pos[1].z) })
          .delay(1)            
          .call(() => {
            this._hand.setPosition(pos[0].x + this._offset, pos[0].y - this._offset, pos[0].z);            
          })   
        )                
        .start();
        
      tween(opacity)
        .tag(0)
        .repeatForever(
          tween()
          .delay(0.5)
          .to(1, { opacity: 0 })                     
          .call(() => {            
            opacity.opacity = 255;
          })    
        )
        .start();  
      
      tween(opacityMask)
        .tag(0)
        .repeatForever(
          tween()
          .delay(0.5)
          .to(1, { opacity: 0 })                     
          .call(() => {            
            opacityMask.opacity = 255;
          })    
        )
        .start();    
    }
  }

  public stopGuideShow(){    
    this._hand.active = false;
    this._mask.active = false;
    Tween.stopAllByTag(0);    
  }  
}
