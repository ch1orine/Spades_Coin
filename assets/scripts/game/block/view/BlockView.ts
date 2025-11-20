import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockView')
export class BlockView extends Component {
    @property({type:Sprite, tooltip:"方块图片"})
    sprite!: Sprite;

}

