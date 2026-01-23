import { _decorator, Component, Layout, Node } from 'cc';
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

    // @property(Layout)
    

    protected onLoad(): void {           
         EventBus.instance.emit(GameManagerEvent.RegisterView, this);

         EventBus.instance.on(GameManagerEvent.WinnerCalculated, this.onWinnerCalculated, this);         
    }


    //视觉效果，把没有赢的牌遮住
    private onWinnerCalculated(e: GameManager, winningCard: Card) {
        // setTimeout(() => {
            for (const player of e.model.players){
            const playedCard = e.model.tableCards.get(player.model.index);
            if (playedCard && playedCard !== winningCard) {
                playedCard.view.mask.node.active = true;
            }
        }
        // }, 1);
        
        EventBus.instance.emit(EffectEvent.ShowBlade, ()=>{
            this.cardFlyAway(Array.from(e.model.tableCards.values()), winningCard);
        });

        // setTimeout(() => {
        //     this.cardFlyAway(Array.from(e.model.tableCards.values()), winningCard);
        // }, 1200);
        // this.cardFlyAway(Array.from(e.model.tableCards.values()));
    }


    private cardFlyAway(cards: Card[], winningCard: Card) { 
        console.log('cards');       
        for (const card of cards){            
            // card.flyAway(new Vec3(0, 800, 0));
            card.node.active = false;
        }
        // e.model.tableCards.clear();
        EventBus.instance.emit(GameManagerEvent.CardsCleared);
    }
}

