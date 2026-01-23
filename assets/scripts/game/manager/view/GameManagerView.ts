import { _decorator, Component, Layout, Node, Vec3, view, View } from 'cc';
import { EventBus } from '../../../event/EventBus';
import { GameManagerEvent } from '../GameManagerEvent';
import { Card } from '../../card/Card';
import { GameManager } from '../GameManager';
import { EffectEvent } from '../../../effect/EffectEvent';
const { ccclass, property } = _decorator;

@ccclass('GameManagerView')
export class GameManagerView extends Component {
    @property(Node)
    container!: Node;


    private _view: View;

    protected onLoad(): void {           
         EventBus.instance.emit(GameManagerEvent.RegisterView, this);

         EventBus.instance.on(GameManagerEvent.WinnerCalculated, this.onWinnerCalculated, this);         

         this._view = view;
    }


    //视觉效果，把没有赢的牌遮住
    private onWinnerCalculated(e: GameManager, winningCard: Card) {        
        for (const player of e.model.players){
            const playedCard = e.model.tableCards.get(player.model.index);
            if (playedCard && playedCard !== winningCard) {
                playedCard.view.mask.node.active = true;
            }
        }

        EventBus.instance.emit(EffectEvent.ShowBlade, ()=>{
            this.cardFlyAway(Array.from(e.model.tableCards.values()), e.model.currentPlayerIndex);
        });
    }


    private cardFlyAway(cards: Card[], index: number) {           
        const pos = this.calPosByIndex(index);
        for (const card of cards){            
            card.flyAway(pos);
            // card.node.active = false;
        }        
        EventBus.instance.emit(GameManagerEvent.CardsCleared);
    }

    private calPosByIndex(index: number): Vec3 {
        switch (index) {
            case 0: 
                return new Vec3(this._view.getVisibleSize().width / 2, 0, 0);//中下
            case 1:
                return new Vec3(0, this._view.getVisibleSize().height / 2, 0);//左中
            case 2:
                return new Vec3(this._view.getVisibleSize().width / 2, this._view.getVisibleSize().height, 0);//中上
            case 3: 
                return new Vec3(this._view.getVisibleSize().width, this._view.getVisibleSize().height / 2, 0);//右中
            default:    
                break;

        }

        return Vec3.ZERO;
    }
}

