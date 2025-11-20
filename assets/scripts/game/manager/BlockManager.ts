import {
  _decorator,
  Component,
  find,
  instantiate,
  Node,
  Prefab,
  resources,
  v3,
} from "cc";
import { Block } from "../block/Block";

export class BlockManager {
  /** 创建砖块对象 */
  public createBlock(data: any) {
    resources.load("prefabs/block", Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      const node = instantiate(prefab);
      const block = node.getComponent(Block);
      node.parent = find("gui");
      block.model.id = data.id;
    //   console.log("创建了砖块，ID=", block.model.id);
    //   block.model.id = data.id;
      block.load(find("gui"), v3(0, 0, 0));
    });
  }
}
