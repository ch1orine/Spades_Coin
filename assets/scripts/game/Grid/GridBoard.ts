import { _decorator, Component, Graphics, UITransform, Color } from "cc";
import { EventBus } from "../../event/EventBus";
import { GridEvent } from "./GridEvent";
import { gameConfig } from "../../common/GameConfig";
const { ccclass, property } = _decorator;

/**
 * 棋盘格组件 - 使用 Graphics 绘制横线和竖线
 */
@ccclass("GridBoard")
export class GridBoard extends Component {
  @property
  public rows: number = 8; // 行数

  @property
  public cols: number = 8; // 列数

  @property
  public cellSize: number = 83; // 每个格子的大小（像素）

  @property
  public showBorder: boolean = false; // 是否显示边界线 

  @property
  public lineWidth: number = 3.8; // 线条宽度

  @property(Color)
  public lineColor: Color = new Color(0, 0, 0, 255); // 线条颜色（黑色）

  private _graphics: Graphics = null;
  
  // 存储被移除的线段信息
  // 格式: "lineIndex_startCol_endCol" 用于横线
  // 格式: "lineIndex_startRow_endRow" 用于竖线
  private _removedHorizontalSegments: Set<string> = new Set();
  private _removedVerticalSegments: Set<string> = new Set();
  
  // 存储预删除的边框线段（第一次标记为dirty）
  private _pendingHorizontalSegments: Set<string> = new Set();
  private _pendingVerticalSegments: Set<string> = new Set();

  protected onLoad(): void {
    this._graphics = this.node.getComponent(Graphics);
    if (!this._graphics) {
      this._graphics = this.node.addComponent(Graphics);
    }

    // 设置节点的 UITransform 尺寸
    const uiTransform = this.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(
        this.cols * this.cellSize,
        this.rows * this.cellSize
      );
    }
    this.lineColor = Color.fromHEX(new Color(), gameConfig.getColor());
    
    EventBus.instance.on(GridEvent.WipeGrid, this.removeLines3x3, this);
    
    // this.removeLines3x3(3,3);
    // this.removeLines3x3(2,2);
    // this._removedHorizontalSegments.add("4_2_3");
    this._removedVerticalSegments.add(`4_8_9`);
    this.drawGrid();
  }

  /**
   * 绘制棋盘格（不包含边界，内部线条占满整个区域）
   */
  public drawGrid(): void {
    if (!this._graphics) return;

    this._graphics.clear();
    this._graphics.lineWidth = this.lineWidth;
    this._graphics.strokeColor = this.lineColor;

    const width = this.cols * this.cellSize;
    const height = this.rows * this.cellSize;

    // 计算起始位置（居中绘制）
    const startX = -width / 2;
    const startY = -height / 2;

    // 绘制横线（不包含顶部和底部边界，从第1条到第rows-1条，共rows-1条）
    for (let i = 1; i < this.rows; i++) {
      const y = startY + i * this.cellSize;
      
      // 将横线分段绘制，跳过被移除的线段
      this.drawHorizontalLineSegments(i, startX, y, width);
    }
  
    // 绘制竖线（不包含左侧和右侧边界，从第1条到第cols-1条，共cols-1条）
    for (let i = 1; i < this.cols; i++) {
      const x = startX + i * this.cellSize;
      
      // 将竖线分段绘制，跳过被移除的线段
      this.drawVerticalLineSegments(i, x, startY, height);
    }  
    
      if(this.showBorder){
      // 绘制边界线
      this._graphics.moveTo(startX, startY);
      this._graphics.lineTo(startX + width, startY);
      this._graphics.lineTo(startX + width, startY + height);
      this._graphics.lineTo(startX, startY + height);
      this._graphics.close();
      this._graphics.stroke();
    }
  }

  /**
   * 绘制横线的各个线段
   */
  private drawHorizontalLineSegments(lineIndex: number, startX: number, y: number, totalWidth: number): void {
    let currentCol = 0;
    
    while (currentCol < this.cols) {
      // 查找下一个未被移除的线段起点
      while (currentCol < this.cols && this.isHorizontalSegmentRemoved(lineIndex, currentCol, currentCol + 1)) {
        currentCol++;
      }
      
      if (currentCol >= this.cols) break;
      
      // 查找连续未被移除的线段终点
      let endCol = currentCol;
      while (endCol < this.cols && !this.isHorizontalSegmentRemoved(lineIndex, endCol, endCol + 1)) {
        endCol++;
      }
      
      // 绘制这一段
      const segmentStartX = startX + currentCol * this.cellSize;
      const segmentEndX = startX + endCol * this.cellSize;
      this._graphics.moveTo(segmentStartX, y);
      this._graphics.lineTo(segmentEndX, y);
      this._graphics.stroke();
      
      currentCol = endCol;
    }
  }

  /**
   * 绘制竖线的各个线段
   */
  private drawVerticalLineSegments(lineIndex: number, x: number, startY: number, totalHeight: number): void {
    let currentRow = 0;
    
    while (currentRow < this.rows) {
      // 查找下一个未被移除的线段起点
      while (currentRow < this.rows && this.isVerticalSegmentRemoved(lineIndex, currentRow, currentRow + 1)) {
        currentRow++;
      }
      
      if (currentRow >= this.rows) break;
      
      // 查找连续未被移除的线段终点
      let endRow = currentRow;
      while (endRow < this.rows && !this.isVerticalSegmentRemoved(lineIndex, endRow, endRow + 1)) {
        endRow++;
      }
      
      // 绘制这一段
      const segmentStartY = startY + currentRow * this.cellSize;
      const segmentEndY = startY + endRow * this.cellSize;
      this._graphics.moveTo(x, segmentStartY);
      this._graphics.lineTo(x, segmentEndY);
      this._graphics.stroke();
      
      currentRow = endRow;
    }
  }

  /**
   * 检查横线段是否被移除
   */
  private isHorizontalSegmentRemoved(lineIndex: number, startCol: number, endCol: number): boolean {
    const key = `${lineIndex}_${startCol}_${endCol}`;
    return this._removedHorizontalSegments.has(key);
  }

  /**
   * 检查竖线段是否被移除
   */
  private isVerticalSegmentRemoved(lineIndex: number, startRow: number, endRow: number): boolean {
    const key = `${lineIndex}_${startRow}_${endRow}`;
    return this._removedVerticalSegments.has(key);
  }

  /**
   * 更新棋盘格参数并重新绘制
   */
  public updateGrid(rows: number, cols: number, cellSize?: number): void {
    this.rows = rows;
    this.cols = cols;
    if (cellSize !== undefined) {
      this.cellSize = cellSize;
    }

    // 更新 UITransform 尺寸
    const uiTransform = this.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(
        this.cols * this.cellSize,
        this.rows * this.cellSize
      );
    }

    this.drawGrid();
  }

  /**
   * 设置线条样式
   */
  public setLineStyle(width: number, color: Color): void {
    this.lineWidth = width;
    this.lineColor = color;
    this.drawGrid();
  }

  /**
   * 清除棋盘格
   */
  public clear(): void {
    if (this._graphics) {
      this._graphics.clear();
    }
  }

  /**
   * 消除指定坐标周围3x3区域内部的线段
   * @param row 行索引（0-based），作为9宫格的中心点
   * @param col 列索引（0-based），作为9宫格的中心点
   */
  public removeLines3x3(row: number, col: number): void {
    //修改映射,graphics从左下角开始，数组从左上角开始
    row = this.rows - 1 - row;
    // 计算3x3区域的范围（以传入坐标为中心）
    const minRow = Math.max(0, row - 1);
    const maxRow = Math.min(this.rows - 1, row + 1);
    const minCol = Math.max(0, col - 1);
    const maxCol = Math.min(this.cols - 1, col + 1);

    // 移除3x3区域内部的所有横线段
    // 横线位于格子之间，索引从1到rows-1
    // 对于3x3区域，需要移除的是 minRow+1 到 maxRow 之间的横线
    for (let lineIdx = minRow + 1; lineIdx <= maxRow; lineIdx++) {
      // 边界保护：不移除棋盘的顶部边界(0)和底部边界(rows)
      if (lineIdx > 0 && lineIdx < this.rows) {
        // 移除该横线在3x3区域列范围内的所有线段
        for (let c = minCol; c <= maxCol; c++) {
          if (c < this.cols) {
            const key = `${lineIdx}_${c}_${c + 1}`;            
            this._removedHorizontalSegments.add(key);
          }
        }
      }
    }

    // 移除3x3区域内部的所有竖线段
    // 竖线位于格子之间，索引从1到cols-1
    // 对于3x3区域，需要移除的是 minCol+1 到 maxCol 之间的竖线
    for (let lineIdx = minCol + 1; lineIdx <= maxCol; lineIdx++) {
      // 边界保护：不移除棋盘的左侧边界(0)和右侧边界(cols)
      if (lineIdx > 0 && lineIdx < this.cols) {
        // 移除该竖线在3x3区域行范围内的所有线段
        for (let r = minRow; r <= maxRow; r++) {
          if (r < this.rows) {
            const key = `${lineIdx}_${r}_${r + 1}`;            
            this._removedVerticalSegments.add(key);
          }
        }
      }
    }

    // 处理外边框线段（dirty标记机制）
    // this.markBorderSegments(minRow, maxRow, minCol, maxCol);

    //检测并移除孤立线段
    this.removeIsolatedSegments();

    // 重新绘制棋盘格
    this.drawGrid();
  }

  /**
   * 标记3x3区域的外边框线段
   * 第一次标记为pending（dirty），第二次移动到真正删除数组
   */
  private markBorderSegments(minRow: number, maxRow: number, minCol: number, maxCol: number): void {
    // 处理上边框横线段（minRow行）
    if (minRow > 0) {
      for (let c = minCol; c <= maxCol; c++) {
        if (c < this.cols) {
          const key = `${minRow}_${c}_${c + 1}`;
          this.toggleSegment(key, true); // true表示横线
        }
      }
    }

    // 处理下边框横线段（maxRow+1行）
    if (maxRow < this.rows - 1) {
      for (let c = minCol; c <= maxCol; c++) {
        if (c < this.cols) {
          const key = `${maxRow + 1}_${c}_${c + 1}`;
          this.toggleSegment(key, true);
        }
      }
    }

    // 处理左边框竖线段（minCol列）
    if (minCol > 0) {
      for (let r = minRow; r <= maxRow; r++) {
        if (r < this.rows) {
          const key = `${minCol}_${r}_${r + 1}`;
          this.toggleSegment(key, false); // false表示竖线
        }
      }
    }

    // 处理右边框竖线段（maxCol+1列）
    if (maxCol < this.cols - 1) {
      for (let r = minRow; r <= maxRow; r++) {
        if (r < this.rows) {
          const key = `${maxCol + 1}_${r}_${r + 1}`;
          this.toggleSegment(key, false);
        }
      }
    }
  }

  /**
   * 切换线段状态：pending -> removed
   * @param key 线段键值
   * @param isHorizontal 是否为横线
   */
  private toggleSegment(key: string, isHorizontal: boolean): void {
    if (isHorizontal) {
      // 如果在预删除数组中，移动到真正删除数组
      if (this._pendingHorizontalSegments.has(key)) {
        this._pendingHorizontalSegments.delete(key);
        this._removedHorizontalSegments.add(key);
        console.log(`Horizontal segment ${key} moved to removed (2nd touch)`);
      } 
      // 如果已经在删除数组中，跳过
      else if (this._removedHorizontalSegments.has(key)) {
        console.log(`Horizontal segment ${key} already removed`);
      }
      // 否则添加到预删除数组
      else {
        this._pendingHorizontalSegments.add(key);
        console.log(`Horizontal segment ${key} marked as pending (1st touch)`);
      }
    } else {
      // 竖线的相同逻辑
      if (this._pendingVerticalSegments.has(key)) {
        this._pendingVerticalSegments.delete(key);
        this._removedVerticalSegments.add(key);
        console.log(`Vertical segment ${key} moved to removed (2nd touch)`);
      } 
      else if (this._removedVerticalSegments.has(key)) {
        console.log(`Vertical segment ${key} already removed`);
      }
      else {
        this._pendingVerticalSegments.add(key);
        console.log(`Vertical segment ${key} marked as pending (1st touch)`);
      }
    }
  }

  /**
   * 重置所有线条（恢复所有被移除的线段）
   */
  public resetLines(): void {
    this._removedHorizontalSegments.clear();
    this._removedVerticalSegments.clear();
    this._pendingHorizontalSegments.clear();
    this._pendingVerticalSegments.clear();
    this.drawGrid();
  }


//边框记录成dirty，再次删除时真正删除这些dirty线段

  /**
 * 检测并移除所有孤立的线段
 * 孤立线段定义：
 * - 横线段：上下相邻的横线段都被移除，且左右相邻同侧两条竖线段被移除
 * - 竖线段：左右相邻的竖线段都被移除，且上下相邻同侧两条横线段被移除
 */
public removeIsolatedSegments(): void {
  let hasChanges = true;
  
  // 迭代检测，直到没有新的孤立线段
  while (hasChanges) {
    hasChanges = false;
    
    // 检测孤立的横线段
    for (let lineIdx = 1; lineIdx < this.rows; lineIdx++) {
      for (let col = 0; col < this.cols; col++) {
        const segmentKey = `${lineIdx}_${col}_${col + 1}`;
        
        // 如果该线段已被移除，跳过
        if (this._removedHorizontalSegments.has(segmentKey)) {
          continue;
        }
        
        // 检查是否为孤立线段
        if (this.isHorizontalSegmentIsolated(lineIdx, col)) {
          this._removedHorizontalSegments.add(segmentKey);
          hasChanges = true;
          console.log(`Removed isolated horizontal segment: ${segmentKey}`);
        }
      }
    }
    
    // 检测孤立的竖线段
    for (let lineIdx = 1; lineIdx < this.cols; lineIdx++) {
      for (let row = 0; row < this.rows; row++) {
        const segmentKey = `${lineIdx}_${row}_${row + 1}`;
        
        // 如果该线段已被移除，跳过
        if (this._removedVerticalSegments.has(segmentKey)) {
          continue;
        }
        
        // 检查是否为孤立线段
        if (this.isVerticalSegmentIsolated(lineIdx, row)) {
          this._removedVerticalSegments.add(segmentKey);
          hasChanges = true;
          console.log(`Removed isolated vertical segment: ${segmentKey}`);
        }
      }
    }
  }
  
  // 重新绘制棋盘格
  this.drawGrid();
}

/**
 * 检查横线段是否为孤立线段
 * @param lineIdx 横线索引
 * @param col 列索引（线段从col到col+1）
 * @returns 是否为孤立线段
 */
private isHorizontalSegmentIsolated(lineIdx: number, col: number): boolean {
  // 检查上方相邻的横线段（lineIdx-1行，同列）
  const hasUpperSegment = lineIdx > 1 && 
    !this.isHorizontalSegmentRemoved(lineIdx - 1, col, col + 1);
  
  // 检查下方相邻的横线段（lineIdx+1行，同列）
  const hasLowerSegment = lineIdx < this.rows - 1 && 
    !this.isHorizontalSegmentRemoved(lineIdx + 1, col, col + 1);
  
  // 如果上下至少有一条相邻横线段存在，则不是孤立的
  if (hasUpperSegment || hasLowerSegment) {
    return false;
  }
  
  // 检查左侧同侧的两条竖线段（col列，lineIdx-1行到lineIdx行 和 lineIdx行到lineIdx+1行）
  const hasLeftUpperSegment = col > 0 && lineIdx > 0 && 
    !this.isVerticalSegmentRemoved(col, lineIdx - 1, lineIdx);
  const hasLeftLowerSegment = col > 0 && lineIdx < this.rows - 1 && 
    !this.isVerticalSegmentRemoved(col, lineIdx, lineIdx + 1);
  
  // 检查右侧同侧的两条竖线段（col+1列，lineIdx-1行到lineIdx行 和 lineIdx行到lineIdx+1行）
  const hasRightUpperSegment = col + 1 < this.cols && lineIdx > 0 && 
    !this.isVerticalSegmentRemoved(col + 1, lineIdx - 1, lineIdx);
  const hasRightLowerSegment = col + 1 < this.cols && lineIdx < this.rows - 1 && 
    !this.isVerticalSegmentRemoved(col + 1, lineIdx, lineIdx + 1);
  
  // 左侧同侧两条竖线都被移除 或 右侧同侧两条竖线都被移除
  const leftSideRemoved = !hasLeftUpperSegment && !hasLeftLowerSegment;
  const rightSideRemoved = !hasRightUpperSegment && !hasRightLowerSegment;
  
  return leftSideRemoved || rightSideRemoved;
}

/**
 * 检查竖线段是否为孤立线段
 * @param lineIdx 竖线索引
 * @param row 行索引（线段从row到row+1）
 * @returns 是否为孤立线段
 */
private isVerticalSegmentIsolated(lineIdx: number, row: number): boolean {
  // 检查左侧相邻的竖线段（lineIdx-1列，同行）
  const hasLeftSegment = lineIdx > 1 && 
    !this.isVerticalSegmentRemoved(lineIdx - 1, row, row + 1);
  
  // 检查右侧相邻的竖线段（lineIdx+1列，同行）
  const hasRightSegment = lineIdx < this.cols - 1 && 
    !this.isVerticalSegmentRemoved(lineIdx + 1, row, row + 1);
  
  // 如果左右至少有一条相邻竖线段存在，则不是孤立的
  if (hasLeftSegment || hasRightSegment) {
    return false;
  }
  
  // 检查上侧同侧的两条横线段（连接到该竖线段的上端点）
  // 上端点在row行，需要检查该行的 lineIdx-1到lineIdx 和 lineIdx到lineIdx+1 两个横线段
  const hasUpperLeftSegment = row > 0 && lineIdx > 0 && 
    !this.isHorizontalSegmentRemoved(row, lineIdx - 1, lineIdx);
  const hasUpperRightSegment = row > 0 && lineIdx < this.cols && 
    !this.isHorizontalSegmentRemoved(row, lineIdx, lineIdx + 1);
  
  // 检查下侧同侧的两条横线段（连接到该竖线段的下端点）
  // 下端点在row+1行，需要检查该行的 lineIdx-1到lineIdx 和 lineIdx到lineIdx+1 两个横线段
  const hasLowerLeftSegment = row + 1 < this.rows && lineIdx > 0 && 
    !this.isHorizontalSegmentRemoved(row + 1, lineIdx - 1, lineIdx);
  const hasLowerRightSegment = row + 1 < this.rows && lineIdx < this.cols && 
    !this.isHorizontalSegmentRemoved(row + 1, lineIdx, lineIdx + 1);
  
  // 上侧同侧两条横线都被移除 或 下侧同侧两条横线都被移除
  const upperSideRemoved = !hasUpperLeftSegment && !hasUpperRightSegment;
  const lowerSideRemoved = !hasLowerLeftSegment && !hasLowerRightSegment;
  
  return upperSideRemoved || lowerSideRemoved;
}
}
