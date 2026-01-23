import { _decorator, Component, Node, resources, Vec3, SpriteFrame, Vec2, tween, math } from 'cc';
import { CardModel, ESuit, ERank } from './model/CardModel';
import { CardView } from './view/CardView';
import { CardBll } from './bll/CardBll';
import { EventBus } from '../../event/EventBus';
import { CardEvent } from './CardEvent';
import { PlayerEvent } from '../player/PlayerEvent';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {
   model!: CardModel;

   view!: CardView;

   bll!: CardBll; 

   public canPlay: boolean = true; // 是否可以出牌

   protected onLoad(): void {
       this.model = this.addComponent(CardModel);
       this.view = this.getComponent(CardView);
       this.bll = this.addComponent(CardBll);


       this.node.on(Node.EventType.TOUCH_START, this.onPlayCard, this);    
       this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);   
       EventBus.instance.on(CardEvent.Play, this.setCardCanPlay, this); 
   }

   moveInit() {
       this.view.moveUp(this.model.y);                
   }

   refreshCardUI(data: Vec2){
      this.view.updateCardUI(data);
   }

   refreshCardData(data: Vec2){
        this.model.suit = data.x;
        this.model.rank = data.y;
   }
   
   /** 回收card */   
   flyAway(pos: Vec3){
        const moveSpeed = this.model.moveSpeed; // 移动速度，单位：像素/秒
        this.node.setSiblingIndex(0); // 置顶
        // 获取当前位置
        const currentPos = this.node.worldPosition.clone();
        // 计算方向向量
        const direction = new Vec3();
        Vec3.subtract(direction, pos, currentPos);
        const dis = direction.length(); // 计算距离
        direction.normalize();
        
        // 反方向移动的位置（往相反方向移动一小段距离）
        const backPos = new Vec3();
        Vec3.scaleAndAdd(backPos, currentPos, direction, -45); // 反向移动30个单位
        this.node.angle += math.randomRangeInt(-5, 5); // 随机旋转角度
        tween(this.node)
        .to(0.15, { worldPosition: backPos }) // 先往反方向移动
        .to(dis / moveSpeed, { worldPosition: pos }) // 然后快速飞向目标
        .call(() => {
            this.node.active = false;
        })
        .start();
   }
   

   onPlayCard() {  
    if(!this.canPlay) return; // 不能出牌直接返回

        this.view.turnOver(this); 
        EventBus.instance.emit(PlayerEvent.PLAY_CARD, this);
        this.view.highLight.active = false; // 取消高亮
          //阻止点击事件 
        this.setCardCanPlay(false);         
        console.log(`${this.model.suit === 1? '♦' : this.model.suit === 2? '♣' : this.model.suit === 3? '♥' : '♠'}, ${this.model.rank}`);    
   }


   onTouchEnd() {
       
   }

   private setCardCanPlay(canPlay: boolean) {
       if (canPlay) {
           this.node.parent.resumeSystemEvents(true);
       }
       else {
           this.node.parent.pauseSystemEvents(true);
       }
   }

   public highLightCard(): void {
         this.view.highLightCard();
   }
}

