import { _decorator, Component, Node } from 'cc';
import { Block } from './block/Block';
import { BlockManager } from './manager/BlockManager';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        const node = new BlockManager();
        node.createBlock({id:9});
        // node.parent = this.node;
        // const block = node.addComponent(Block);
        // block.load(node);        
    }

    update(deltaTime: number) {
        
    }
}

