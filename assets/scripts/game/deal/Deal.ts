import { _decorator, Component, Node, Sprite, SpriteFrame, tween, UITransform, Vec3, view } from 'cc';
import { Sound } from '../../sound/Sound';
const { ccclass, property } = _decorator;

@ccclass('Deal')
export class Deal extends Component {
    @property(Node)
    container!: Node;

    @property(SpriteFrame)
    back!: SpriteFrame;

    @property(Node)
    stack!: Node;

    private readonly CARD_COUNT = 13; // 每个玩家8张牌
    private readonly PLAYER_COUNT = 4; // 4个玩家
    private readonly CARD_SPEED = 1200; // 卡片飞行速度（像素/秒）
    private readonly MIN_VISIBLE_CARDS = 8; // 同一方向至少显示6张牌（增加可见牌数，缩短发牌间隔）
    private readonly DEAL_DELAY_RANDOM = 0.05; // 随机延迟范围
    private readonly POOL_SIZE = 50; // 对象池初始大小

    private targetPositions: Vec3[] = []; // 动态计算的目标位置
    private flyDuration: number = 0; // 飞行时长
    private dealDelay: number = 0; // 发牌间隔
    private cardPool: Node[] = []; // 卡牌对象池

    protected onLoad(): void {
        // 根据屏幕可视区域动态计算目标位置
        const visibleSize = view.getVisibleSize();
        const extraOffset = 200; // 额外偏移，确保完全飞出屏幕
        
        this.targetPositions = [
            new Vec3(0, -(visibleSize.height / 2 + extraOffset), 0),   // 下方 - 飞出屏幕下方
            new Vec3(-(visibleSize.width / 2 + extraOffset), 0, 0),    // 左侧 - 飞出屏幕左侧
            new Vec3(0, visibleSize.height / 2 + extraOffset, 0),      // 上方 - 飞出屏幕上方
            new Vec3(visibleSize.width / 2 + extraOffset, 0, 0)        // 右侧 - 飞出屏幕右侧
        ];

        // 计算飞行距离和时长（取最大距离保证一致性）
        const maxDistance = Math.max(
            visibleSize.height / 2 + extraOffset,
            visibleSize.width / 2 + extraOffset
        );
        this.flyDuration = maxDistance / this.CARD_SPEED; // 根据速度计算时长
        
        // 计算发牌间隔，确保至少MIN_VISIBLE_CARDS张牌同时显示
        this.dealDelay = this.flyDuration / this.MIN_VISIBLE_CARDS;
        
        // 初始化对象池
        this.initCardPool();
        
        // console.log(`屏幕尺寸: ${visibleSize.width}x${visibleSize.height}, 飞行距离: ${maxDistance}px, 飞行时长: ${this.flyDuration.toFixed(2)}s, 发牌间隔: ${this.dealDelay.toFixed(2)}s`);
    }

    /**
     * 初始化卡牌对象池
     */
    private initCardPool(): void {
        for (let i = 0; i < this.POOL_SIZE; i++) {
            const cardNode = this.createCardNode();
            cardNode.active = false;
            this.cardPool.push(cardNode);
        }
        console.log(`卡牌对象池初始化完成，池大小: ${this.POOL_SIZE}`);
    }

    /**
     * 创建卡牌节点
     */
    private createCardNode(): Node {
        const cardNode = new Node('DealCard');
        cardNode.parent = this.container;
        
        // 添加 UITransform 组件
        const transform = cardNode.addComponent(UITransform);
        transform.setContentSize(140, 190);
        
        // 添加 Sprite 组件并设置卡牌背面
        const sprite = cardNode.addComponent(Sprite);
        sprite.spriteFrame = this.back;
        
        return cardNode;
    }

    /**
     * 从对象池获取卡牌节点
     */
    private getCardFromPool(): Node | null {
        if (this.cardPool.length > 0) {
            const card = this.cardPool.pop()!;
            card.active = true;
            return card;
        }
        // 如果池为空，动态创建新节点
        console.warn('对象池已空，动态创建新卡牌节点');
        return this.createCardNode();
    }

    /**
     * 回收卡牌节点到对象池
     */
    private returnCardToPool(card: Node): void {
        card.active = false;
        card.setPosition(Vec3.ZERO);
        card.setScale(1, 1, 1);
        card.angle = -45;
        this.cardPool.push(card);
    }

    start() {
        this.startDeal();
    }

    /**
     * 开始发牌动画
     */
    public startDeal(): void {
        Sound.ins.playOneShot(Sound.effect.deal);
        // 每一轮同时向4个方向发牌
        for (let round = 0; round < this.CARD_COUNT; round++) {
            const randomOffset = (Math.random() - 0.5) * this.DEAL_DELAY_RANDOM;
            const delay = round * this.dealDelay + randomOffset;
            
            // 同时向4个方向发牌
            for (let playerIndex = 0; playerIndex < this.PLAYER_COUNT; playerIndex++) {
                this.scheduleOnce(() => {
                    this.dealCardToPlayer(playerIndex);
                }, delay);
            }
        }
        setTimeout(() => {            
            this.stack.active = false; // 隐藏牌堆
        }, 1000);
    }

    /**
     * 向指定玩家发一张牌
     */
    private dealCardToPlayer(playerIndex: number): void {
        // 从对象池获取卡牌节点
        const cardNode = this.getCardFromPool();
        if (!cardNode) return;
        
        // 从 Deal 节点的位置开始（屏幕中心）
        const startPos = this.container.getComponent(UITransform)?.convertToNodeSpaceAR(this.node.worldPosition) || Vec3.ZERO;
        cardNode.setPosition(startPos);
        cardNode.setScale(1.3, 1.3, 1);
        cardNode.angle = -45;

        const targetPos = this.targetPositions[playerIndex];
        
        // 添加随机偏移
        const offsetX = (Math.random() - 0.5) * 40; // 随机水平偏移
        const offsetY = (Math.random() - 0.5) * 40; // 随机垂直偏移
        const finalPos = new Vec3(targetPos.x + offsetX, targetPos.y + offsetY, targetPos.z);

        // 计算位移方向，让节点y轴指向该方向（左右取反修正）
        const direction = finalPos.clone().subtract(startPos);
        let targetAngle = -Math.abs(Math.atan2(direction.x, direction.y)) * 180 / Math.PI;
        
        // 添加随机旋转偏移，让同方向的卡片角度有所不同
        const angleOffset = (Math.random() - 0.5) * 30; // -15度到15度的随机偏移
        
        // 上下方向转到横向（90度），左右方向指向飞行方向
        if (playerIndex === 0 || playerIndex === 2) {
            targetAngle = 90 + angleOffset; // 上下发牌时转到横向，加上随机偏移
        } else {
            targetAngle += angleOffset; // 左右方向也加上随机偏移
        }

        // 发牌动画：移动到目标位置并旋转到y轴指向位移方向
        // 发牌动画：移动到目标位置并旋转到y轴指向位移方向
        tween(cardNode)
            .parallel(
                tween().to(this.flyDuration, { position: finalPos }, { easing: 'cubicOut' }),
                tween().to(this.flyDuration * 0.6, { angle: targetAngle }, { easing: 'sineOut' }),
                tween().to(this.flyDuration * 0.4, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'backOut' })
            )
            .call(() => {
                // 动画结束后回收到对象池
                this.returnCardToPool(cardNode);
            })
            .start();
    }
}


