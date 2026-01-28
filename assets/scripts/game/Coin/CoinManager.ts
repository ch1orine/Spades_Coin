import { _decorator, Component, instantiate, Node, Prefab, resources, v2, Vec3 } from 'cc';
import { Coin } from './Coin';
import { EventBus } from '../../event/EventBus';
import { CoinEvent } from './CoinEvent';
import MoveLogic from '../../common/MoveLogic';
const { ccclass, property } = _decorator;


export type PayWin = { 
    playerId: number, 
    toPlayerId: number, 
    score: number };


@ccclass('CoinManager')
export class CoinManager extends Component {

    private _coins: Coin[] = [];

    private _pos: Vec3[] = [new Vec3(0, -270, 0), new Vec3(-300, 320, 0), new Vec3(0, 360, 0), new Vec3(300, 320, 0)];

    // 金币特效对象池
    private _coinEffectPool: Node[] = [];
    private _coinEffectPrefab: Prefab | null = null;
    private readonly POOL_INIT_SIZE = 10; // 初始对象池大小

    private readonly COIN_COUNT = 5; // 每次飞的金币数量

    onLoad() {
        EventBus.instance.on(CoinEvent.ShowCoin, () =>{
            this._coins.forEach(coin => {
                coin.node.active = true;
            });
        }, this);

        EventBus.instance.on(CoinEvent.FlyCoin, this.flyToWinner, this)

        // 预加载金币特效预制体并初始化对象池
        resources.load(`effect/gold`, Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            this._coinEffectPrefab = prefab;
            // 预创建一些金币到对象池
            for (let i = 0; i < this.POOL_INIT_SIZE; i++) {
                const node = instantiate(prefab);
                node.active = false;
                this._coinEffectPool.push(node);
            }
        });
    }

    start() {
        resources.load(`coin/coin`, Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            for (let i = 0; i < 4; i++) {
                const node = instantiate(prefab);
                node.active = false;
                const coin = node.getComponent(Coin)!;
                coin.index = i;
                this._coins.push(coin);
                node.setPosition(this._pos[i]);                
                this.node.addChild(node);
            }
        });
    }   

    /**
     * 从对象池获取金币节点
     */
    private getCoinFromPool(): Node | null {
        if (!this._coinEffectPrefab) return null;
        
        let node: Node;
        if (this._coinEffectPool.length > 0) {
            // 从池中获取
            node = this._coinEffectPool.pop()!;
        } else {
            // 池中没有可用的，创建新的
            node = instantiate(this._coinEffectPrefab);
        }
        node.active = true;
        return node;
    }

    /**
     * 回收金币节点到对象池
     */
    private recycleCoinToPool(node: Node): void {
        node.active = false;
        node.parent = null;
        this._coinEffectPool.push(node);
    }


    private flyToWinner(index:number){        
        const pos = this._pos[index];
        for (let i = 0; i < this._coins.length; i++) {
            if (i == index) continue;
            for (let j = 0; j < this.COIN_COUNT; j++){
                this.scheduleOnce(() => {
                    this.fly(this._pos[i].x, this._pos[i].y, pos.x, pos.y, {playerId: i, toPlayerId: index, score: 1}, true);
                }, j * 0.1);
            }
        }
        // this._coins.forEach(coin => {
        //     this.fly(coin.node.position.x, coin.node.position.y, pos.x, pos.y, {playerId: -1, toPlayerId: index, score: 1}, false);
        // });
    }

    /**
     * 移动到指定位置
     * @param cx cy 当前x y
     * @param toX 目标x
     * @param toY c
     */
    public fly(cx: number, cy: number, toX: number, toY: number, pay: PayWin, isEnd: boolean = false) {        
        const node = this.getCoinFromPool();
        if (!node) {
            console.error('Failed to get coin from pool');
            return;
        }
        
        node.parent = this.node;
        node.setPosition(cx, cy);

        EventBus.instance.emit(EventBus.PayScoreStartEvent, pay);
        const c0 = v2(cx, cy);
        const c2 = v2(toX, toY);
        const c1 = v2((c2.x - c0.x) / 2, (c2.y - c0.y) / 2);
        MoveLogic.bezier2(node, 0.7, c0, c1, c2, false, () => {
            EventBus.instance.emit(EventBus.OnePayScoreEvent, pay);
            if (isEnd) EventBus.instance.emit(EventBus.PayScoreCompleteEvent, pay);
            this.recycleCoinToPool(node); // 回收到对象池
        });
    }
}

