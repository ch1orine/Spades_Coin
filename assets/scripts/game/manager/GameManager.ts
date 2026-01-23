import {
  _decorator,
  Component,
  instantiate,
  math,
  Node,
  Prefab,
  resources,
} from "cc";
import { GameManagerView } from "./view/GameManagerView";
import { GameManagerModel } from "./model/GameManagerModel";
import { GameManagerBll } from "./bll/GameManagerBll";
import { GameManagerEvent } from "./GameManagerEvent";
import { EventBus } from "../../event/EventBus";
import { CardEvent } from "../card/CardEvent";
import { Player } from "../player/Player";
import { Card } from "../card/Card";
import { PlayerEvent } from "../player/PlayerEvent";
import { PlayerType } from "../player/model/PlayerModel";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager {
  //数据层
  model!: GameManagerModel;

  //视图层
  view!: GameManagerView;

  //业务层
  bll!: GameManagerBll;

  constructor() {
    this.model = new GameManagerModel();

    this.bll = new GameManagerBll();
  }

  init() {
    this.addEvents();
  }

  public generatePlayers() {
    for (let i = 0; i < this.model.MAX_PLAYERS; i++) {      
      resources.load(`player/player`, Prefab, (err, prefab) => {
        if (err) {
          console.error(err);
          return;
        }
        const node = instantiate(prefab);
        node.parent = this.view.container;
        node.setPosition(this.model.POSITIONS[i]);
        node.angle = this.model.ROTATIONS[i];


        //破坏 依赖倒置原则 (不应该直接引用该底层模块)
        const player = node.getComponent(Player);
        this.model.players.push(player);
        player.model.index = i;
        player.createCardInHand(this.bll.selectCards(this, i));
      });
    }
  }

  private geneDealCard(){
    resources.load(`deal/deal`, Prefab, (err, prefab) => {      
      if (err) {
        console.error(err);
        return;
      }
      const node = instantiate(prefab);
      node.parent = this.view.container;
      // const deal = node.getComponent(Deal);
      // deal.init(this);
    });
  }

  private addEvents() {
    EventBus.instance.on(GameManagerEvent.RegisterView, this.setView, this);

    EventBus.instance.on(CardEvent.Click, this.nextPlayer, this); //监听出牌事件

    EventBus.instance.on(PlayerEvent.PLAY_CARD, this.removeCard, this);

    EventBus.instance.on(GameManagerEvent.CardsCleared, this.newTurn, this); //监听牌局结束事件
  }


  private newTurn(){
    this.model.currentCount = 0;
    this.model.tableCards.clear();

    setTimeout(() => {
      if (this.model.players[this.model.currentPlayerIndex].model.playerType !==  PlayerType.Human){
        this.model.players[this.model.currentPlayerIndex].playCard(math.randomRangeInt(1, 4));
      }else{
        this.model.players[this.model.currentPlayerIndex].playCard(4);
      }
    }, 1000);
  }
  /**
   * 下一个玩家出牌
   */
  private nextPlayer(card: Card) {

    // 移除重复调用，setTableCards 已通过事件监听触发
    // this.setTableCards(card);
    // this.model.currentPlayerIndex = this.model.currentPlayerIndex % this.model.MAX_PLAYERS;    
    // // console.log("11111111",card);
    // this.model.tableCards.set(this.model.currentPlayerIndex, card);
    this.setTableCards(card);
  
    this.model.currentPlayerIndex = (this.model.currentPlayerIndex + 1) % this.model.MAX_PLAYERS;

    // 第一轮出牌时，确定主花色
    if(this.model.currentCount === 0){
      this.model.leadingSuit = card.model.suit;
    }

    this.model.currentCount = this.model.currentCount + 1;    

    console.log("当前已出牌数：" + this.model.currentCount);
    if(this.model.tableCards.size === this.model.MAX_PLAYERS){      
      console.log(this.model.tableCards);
      this.getWinner();
      return;
    }
    
    setTimeout(() => {    
      this.model.players[this.model.currentPlayerIndex].playCard(this.model.leadingSuit);
    }, 300);
    
  }

  private setView(view: GameManagerView) {
    this.view = view;
    console.log("设置 GameManager 视图完成");
    this.geneDealCard();
    setTimeout(() => {      
      this.generatePlayers();
    }, 250);
  }

  private getWinner() {
    this.bll.WinnerCalculate(this); //计算赢家
  }
  

  private setTableCards(card: Card) {    
    this.model.currentPlayerIndex = this.model.currentPlayerIndex % this.model.MAX_PLAYERS;    
    // console.log("8888888888*********",this.model.currentPlayerIndex);
    this.model.tableCards.set(this.model.currentPlayerIndex, card);
    // console.log(this.model.tableCards);    
  }

  private removeCard(card: Card){
    const index = this.model.players[0].model.Cards.indexOf(card);
    if (index > -1) {
      this.model.players[0].model.Cards.splice(index, 1); //删除手牌中的该卡牌
    }
  }
}
