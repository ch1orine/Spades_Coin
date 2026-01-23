import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { Player } from '../../player/Player';
import { ERank, ESuit } from '../../card/model/CardModel';
import { Card } from '../../card/Card';
const { ccclass, property } = _decorator;

@ccclass('GameManagerModel')
export class GameManagerModel {
   players: Player[] = [];

   public readonly MAX_PLAYERS = 4;

   public readonly POSITIONS: Vec3[] = [new Vec3(0, -435, 0), new Vec3(-375, 0, 0), new Vec3(0, 525, 0), new Vec3(375, 0, 0)];

   public readonly ROTATIONS: number[] = [0, -90, 180, 90];   
   
   // 默认发给玩家的牌
   public PLAYER_CARD: Vec2[] = [
      new Vec2(ESuit.club, ERank.Two), 
      new Vec2(ESuit.club, ERank.Queen), 
      new Vec2(ESuit.diamond, ERank.Three), 
      new Vec2(ESuit.diamond, ERank.Ace), 
      new Vec2(ESuit.heart, ERank.Two),
      new Vec2(ESuit.heart, ERank.Four), 
      new Vec2(ESuit.heart, ERank.Queen), 
      new Vec2(ESuit.heart, ERank.King), 
      new Vec2(ESuit.spade, ERank.Five), 
      new Vec2(ESuit.spade, ERank.Eight), 
      new Vec2(ESuit.club, ERank.Jack), 
      new Vec2(ESuit.club, ERank.Queen),    
      new Vec2(ESuit.spade, ERank.Ace)
   ]; 

   public Left_CARD: Vec2[] =[
      new Vec2(ESuit.club, ERank.Two),
      new Vec2(ESuit.diamond, ERank.Three),
      new Vec2(ESuit.heart, ERank.Four),
      new Vec2(ESuit.spade, ERank.Five),
      new Vec2(ESuit.club, ERank.Six),
      new Vec2(ESuit.diamond, ERank.Seven),
      new Vec2(ESuit.heart, ERank.Eight),
      new Vec2(ESuit.spade, ERank.Nine),
      new Vec2(ESuit.club, ERank.Ten),
      new Vec2(ESuit.diamond, ERank.Jack),
      new Vec2(ESuit.heart, ERank.Queen),
      new Vec2(ESuit.spade, ERank.King),
      new Vec2(ESuit.spade, ERank.Ace)      
   ]

   public Up_CARD: Vec2[] =[
      new Vec2(ESuit.club, ERank.Two),
      new Vec2(ESuit.diamond, ERank.Three),
      new Vec2(ESuit.heart, ERank.Four),
      new Vec2(ESuit.spade, ERank.Five),
      new Vec2(ESuit.club, ERank.Six),
      new Vec2(ESuit.diamond, ERank.Seven),
      new Vec2(ESuit.heart, ERank.Eight),
      new Vec2(ESuit.spade, ERank.Nine),
      new Vec2(ESuit.club, ERank.Ten),
      new Vec2(ESuit.diamond, ERank.Jack),
      new Vec2(ESuit.heart, ERank.Queen),
      new Vec2(ESuit.spade, ERank.King),
      new Vec2(ESuit.spade, ERank.Ace) 
   ];


   public Right_CARD: Vec2[] =[
      new Vec2(ESuit.club, ERank.Two),
      new Vec2(ESuit.diamond, ERank.Three),
      new Vec2(ESuit.heart, ERank.Four),
      new Vec2(ESuit.spade, ERank.Five),
      new Vec2(ESuit.club, ERank.Six),
      new Vec2(ESuit.diamond, ERank.Seven),
      new Vec2(ESuit.heart, ERank.Eight),
      new Vec2(ESuit.spade, ERank.Nine),
      new Vec2(ESuit.club, ERank.Ten),
      new Vec2(ESuit.diamond, ERank.Jack),
      new Vec2(ESuit.heart, ERank.Queen),
      new Vec2(ESuit.spade, ERank.King),
      new Vec2(ESuit.spade, ERank.Ace) 
   ];

   // public readonly GAME_FLOW: number[][] = [
   //    [4, 5, 2],// 玩家先手 第一轮
   //    [1, 2, 3],// 玩家先手 第二轮
   //    [2, 3, 0],// 左AI先手 第三轮
   //    [3, 0, 1] // 上AI先手 第四轮
   // ];
   public currentPlayerIndex: number = 0; // 当前出牌的玩家索引

   public leadingSuit: ESuit = ESuit.None; // 当前出牌的花色

   public currentRank: ERank = ERank.Two; // 当前出牌的点数

   public currentCount: number = 0; // 当前出牌的数量 MAX = 4, MIN = 0

   public tableCards: Map<number, Card> = new Map<number, Card>(); // 当前出的牌
}

