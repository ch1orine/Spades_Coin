import { _decorator, Component, Label, math, Node, tween } from 'cc';
import { EventBus } from '../../event/EventBus';
import { CoinEvent } from './CoinEvent';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {

    @property(Label)
    label!: Label;

    public index: number = 0;

    private _currentCoin: number = 1500;
    
    start() {
        EventBus.instance.on(CoinEvent.FlyCoin, this.addCoin, this);

        this._currentCoin = math.randomRangeInt(1200, 1500);
        this.label.string = this._currentCoin.toString();
    }

    private addCoin(index: number, coin: number = 100, duration: number = 0.5) {
        if (this.index === index){
            coin = coin * 3;
        }else{
            coin = -coin ;
        }
        const start = this._currentCoin;
            
        tween({ value: 0 })
        .to(duration, { value: 1 }, {
            onUpdate: (obj: any) => {
                const t = obj.value;
                const display = Math.floor(start + coin * t);
                this.label.string = display.toString();
            }
          })
        .call(() => {
                this._currentCoin += coin;
            })
        .start();        
    }
}

