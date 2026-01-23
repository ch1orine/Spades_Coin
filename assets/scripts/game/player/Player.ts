import { _decorator, Component, instantiate, Layout, math, Node, Prefab, resources, Vec2, Vec3 } from 'cc';
import { PlayerModel, PlayerType } from './model/PlayerModel';
import { PlayerBll } from './bll/PlayerBll';
import { PlayerView } from './view/PlayerView';
import { EventBus } from '../../event/EventBus';
import { Card } from '../card/Card';
import { PlayerEvent } from './PlayerEvent';
import { CardEvent } from '../card/CardEvent';
import { JumpEvent } from '../jump/JumpEvent';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    model!: PlayerModel;
    
    view!: PlayerView;

    bll!: PlayerBll;  
    
    onLoad(): void {
        this.model = this.addComponent(PlayerModel);
        this.view = this.getComponent(PlayerView);
        this.bll = this.addComponent(PlayerBll);

        // this.createCardInHand();      
        EventBus.instance.on(PlayerEvent.PLAY_CARD, ()=>{
          if(this.model.playerType === PlayerType.Human)
          this.view.updateCardLayout(this); // 更新手牌布局
        }, this);

        EventBus.instance.on(PlayerEvent.PLAY_CARD, this.resetCardsInHand, this);
    }

    load(parent: Node, pos: Vec3 = Vec3.ZERO) {
        this.node.parent = parent;
        this.node.setPosition(pos);       
    }

    /** 创建手牌 */
    public createCardInHand(handCard: Vec2[]) {
        this.model.Cards = [];
        console.log("create cards in hand");  
        resources.load(`card/card`, Prefab, (err, prefab) => {
            if (err) {
              console.error(err);
              return;
            }       
            for(let i = 0; i < this.model.HAND_CARD_COUNT; i++){                                
              const node = instantiate(prefab);
              node.name = `card_${i}`;
              node.parent = this.view.cardContainer; 
              const card = node.getComponent(Card);  
              this.model.Cards.push(card);                
            }       

            for(let i = 0; i < this.model.Cards.length; i++){
            //有if可以用接口隔离，但只有玩家和AI两种类型，可以不改动
              if(this.node.angle === 0){ // 玩家
                this.model.playerType = PlayerType.Human;
                this.view.layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT; // 从左到右
                this.view.layout.spacingX = this.model.PLAYER_SPACING; // 设置水平间距               

                // 优化的扇形排列：使用归一化位置计算，让曲线更平滑
                const normalizedPos = (i - (this.model.HAND_CARD_COUNT - 1) / 2) / ((this.model.HAND_CARD_COUNT - 1) / 2);
                this.model.Cards[i].node.angle = normalizedPos * -30; // 从-30度到30度平滑过渡
                this.model.Cards[i].model.y = -normalizedPos * normalizedPos * 50; // 抛物线曲线，中间最高

                this.model.Cards[i].refreshCardData(handCard[i]); // 更新数据
                this.model.Cards[i].refreshCardUI(handCard[i]); // 更新牌面
              }
              else { // AI
                this.model.Cards[i].node.setScale(0.8, 0.8, 1);
                this.model.Cards[i].canPlay = false; // AI不能点击出牌
                this.model.playerType = PlayerType.AI;
                this.view.layout.horizontalDirection = Layout.HorizontalDirection.RIGHT_TO_LEFT; // 从右到左
                this.view.layout.spacingX = this.model.AI_SPACING; // 设置水平间距
                
                this.model.Cards[i].refreshCardData(handCard[i]); // 只更新数据
              }
              this.scheduleOnce(()=>{
                this.model.Cards[i].moveInit();
              }, (this.model.Cards.length - 1 - i) * 0.125);                
            }    
            setTimeout(() => {      
              this.view.score.node.active = true; // 显示分数
              this.view.filterCardsInHand(this, 7); // 过滤手牌
              this.highLightCard(); // 高亮牌
            }, 2000);
        });    
    }

    /** 打出一张牌 */
    public playCard(suit: number) {                 
      if (this.model.playerType === PlayerType.Human) {
        // this.view.updateCardLayout(this); // 更新手牌布局
        console.log("玩家出牌");
        EventBus.instance.emit(CardEvent.Play, true)
        this.view.filterCardsInHand(this, suit); // 过滤手牌
        EventBus.instance.emit(JumpEvent.onJump);
      }else{
        this.model.setCard(new Vec2(suit, math.randomRangeInt(2, 13))); // 打出牌的数据 
        
        this.model.Cards[0].onPlayCard(); //打出牌的索引
        this.model.Cards.splice(0, 1); // 删除牌
        console.log("AI出牌");
        // this.view.filterCardsInHand(this, 0); // 过滤手牌
      }
    }

    public resetCardsInHand(): void {
        // 重置手牌显示
        this.model.Cards.forEach(card => {
          card.canPlay = true; // 重置为可以出牌
          card.view.mask.node.active = false; // 隐藏遮罩
        }); // 更新显示
    }

    public highLightCard(){
      if (this.model.playerType === PlayerType.Human) {        
        this.model.Cards[7]?.highLightCard();
      }
    }
}

