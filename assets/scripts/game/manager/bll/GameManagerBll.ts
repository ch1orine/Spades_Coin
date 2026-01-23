import { _decorator, instantiate, Prefab, resources, Vec2, Vec3 } from 'cc';
import { GameManager } from '../GameManager';
import { Player } from '../../player/Player';
import { ESuit } from '../../card/model/CardModel';
import { Card } from '../../card/Card';
import { EventBus } from '../../../event/EventBus';
import { GameManagerEvent } from '../GameManagerEvent';
import { CardEvent } from '../../card/CardEvent';
import { ScoreEvent } from '../../score/ScoreEvent';
const { ccclass, property } = _decorator;

@ccclass('GameManagerBll')
export class GameManagerBll  {
    
    /** 创建玩家
     * @param e GameManager实例
     */
    public creatPlayer(e: GameManager, pos:Vec3, angle: number = 0) {
        resources.load(`player/player`, Prefab, (err, prefab) => {
              if (err) {
                console.error(err);
                return;
              }
              const node = instantiate(prefab);
              node.parent = e.view.container;
              node.setPosition(pos);
              node.angle = angle;

              //破坏 依赖倒置原则 (不应该直接引用该底层模块)
              const player = node.getComponent(Player);
              player.createCardInHand(e.model.PLAYER_CARD);              
        });                
    }


    /** 计算赢家
     * @param e GameManager实例
     */
    public WinnerCalculate(e: GameManager) {
      
        //TODO: 计算赢家
        // for(const )
        let winningCard: Card = null;
        let winningPlayer: Player = null;
        
        for (const player of e.model.players){
            const playedCard = e.model.tableCards.get(player.model.index);

            if( playedCard.model.suit === ESuit.spade){
                if(winningCard == null || winningCard.model.suit !== ESuit.spade || playedCard.model.rank > winningCard.model.rank){
                    winningCard = playedCard;
                    winningPlayer = player;
                }
            }
            else if(playedCard.model.suit === e.model.leadingSuit){
                if(!winningCard || 
                    (winningCard.model.suit === e.model.leadingSuit && playedCard.model.rank > winningCard.model.rank)){
                    winningCard = playedCard;
                    winningPlayer = player;
                }
            }
        }

        if(winningPlayer){
            e.model.currentPlayerIndex = winningPlayer.model.index;
        }
        
        //通知view视图层
        //将非获胜卡片的遮罩设置为显示    
        EventBus.instance.emit(GameManagerEvent.WinnerCalculated, e, winningCard);

        console.log("赢家是玩家：" + e.model.currentPlayerIndex);
        if(e.model.currentPlayerIndex % 2 === 0){
            EventBus.instance.emit(ScoreEvent.PlayerScoreUpdated);
        } else {
            EventBus.instance.emit(ScoreEvent.AIScoreUpdated);
        }
    }

    /**
     * 根据玩家位置索引选择对应的卡组
     * @param e GameManager实例
     * @param index 玩家位置索引
     * @returns 对应位置的卡牌数组
     */
    public selectCards(e: GameManager, index: number): Vec2[] {
        switch (index) {
            case 0: // 下 - 玩家
                return e.model.PLAYER_CARD;
            case 1: // 左 - AI
                return e.model.Left_CARD;
            case 2: // 上 - AI
                return e.model.Up_CARD;
            case 3: // 右 - AI
                return e.model.Right_CARD;
            default:                
                return e.model.PLAYER_CARD;
        }
    }
}

