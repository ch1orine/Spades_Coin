import { _decorator, Component, Layout, Node } from 'cc';
import { Player } from '../Player';
import { Score } from '../../score/Score';
import { EventBus } from '../../../event/EventBus';
import { PlayerEvent } from '../PlayerEvent';
import { PlayerType } from '../model/PlayerModel';
const { ccclass, property } = _decorator;

@ccclass('PlayerView')
export class PlayerView extends Component {
    @property(Node)
    cardContainer!: Node; // 手牌容器

    @property(Score)
    score!: Score; // 分数组件


    layout!: Layout; // 布局组件

    protected onLoad(): void {
        this.layout = this.cardContainer.getComponent(Layout)!;

        this.score.node.angle = -this.node.angle;

        
    }

    protected start(): void {
        this.score.node.angle = -this.node.angle;
    }

    public updateCardLayout(e:Player): void {
        // this.layout.updateLayout();
        this.layout.spacingX = -90 + (13 - e.model.Cards.length) * 3; // 根据手牌数量调整间距
        const count = e.model.Cards.length; // 获取手牌数量
        const curveFactor = (count / 13) * 40; // 随着手牌减少，弧度系数变小（从50到约4）
        
        for (let i = 0; i < e.model.Cards.length; i++) {            
            const normalizedPos = (i - (count - 1) / 2) / ((count - 1) / 2);
            e.model.Cards[i].node.angle = normalizedPos * -30; // 从-30度到30度平滑过渡
            e.model.Cards[i].model.y = -normalizedPos * normalizedPos * curveFactor; // 抛物线随手牌数量变平
        }
    }

    public filterCardsInHand(e: Player, suit: number): void {
        if (e.model.playerType !== PlayerType.Human) return; // 仅对人类玩家生效
        e.model.Cards.forEach(card => {
            card.canPlay = true; // 重置为可以出牌
            card.view.mask.node.active = false; // 重置遮罩
        }); // 先重置所有牌的遮罩
        if (suit === 4){
            const cards = e.model.Cards.filter(card => card.model.suit === 4);
            cards.forEach(card => {
                card.canPlay = false; // 设置为不能出牌
                card.view.mask.node.active = true; // 显示遮罩
            }); // 更新显示
            return;
        }
        if (suit === 7){
            const cards = e.model.Cards.filter(card => card.model.suit !== 3 || card.model.rank !== 13);
            cards.forEach(card => {
                card.canPlay = false; // 设置为不能出牌
                card.view.mask.node.active = true; // 显示遮罩
            }); // 更新显示
            return;
        }
        // 根据某些条件过滤手牌并更新显示
       const cards = e.model.Cards.filter(card => card.model.suit !== suit && card.model.suit !== 4);
       cards.forEach(card => {
           card.canPlay = false; // 设置为不能出牌
           card.view.mask.node.active = true; // 显示遮罩
       }); // 更新显示
    }


}

