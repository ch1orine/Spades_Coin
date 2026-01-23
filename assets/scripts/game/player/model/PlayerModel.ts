import { _decorator, Component, Node, Vec2 } from 'cc';
import { Card } from '../../card/Card';
const { ccclass, property } = _decorator;

export enum PlayerType {
    AI = 0,
    Human = 1
}

@ccclass('PlayerModel')
export class PlayerModel extends Component {
   
    public readonly HAND_CARD_COUNT: number = 13;

    public readonly PLAYER_SPACING: number = -90;

    public readonly AI_SPACING: number = -95;

    public  Cards: Card[] = [];

    public  playerType: PlayerType = PlayerType.AI; // 0: AI, 1: Human

    public index: number = -1; // 玩家索引


    setCard(data: Vec2){
        this.Cards[0].model.suit = data.x;
        this.Cards[0].model.rank = data.y;
    }
}

