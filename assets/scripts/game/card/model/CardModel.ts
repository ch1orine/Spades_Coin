import { _decorator, Component, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;


export enum ESuit{
    None = 0,
    diamond = 1, // 方块
    club = 2,    // 梅花
    heart = 3,   // 红桃
    spade = 4    // 黑桃    
}

export enum ERank{
    Two = 2,  // 2
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11, // J
    Queen = 12, // Q
    King = 13,   // K
    Ace = 14,  // A
}

@ccclass('CardModel')
export class CardModel extends Component {
    
    suit:ESuit = ESuit.None;

    rank:ERank = ERank.Two;

    y:number = 0;

    canPlay: boolean = true; // 是否可以出牌

    moveSpeed: number = 3000; // 卡牌移动速度，单位：像素/秒

    reset(){        

        this.y = 0;

        this.suit = ESuit.None;

        this.rank = ERank.Two;

        this.canPlay = true;
    }


}

