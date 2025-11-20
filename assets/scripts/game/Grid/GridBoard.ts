import { _decorator, Component, Graphics, UITransform, Color } from "cc";
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

    this.drawGrid();

    this.removeLines3x3(3,3);
    this.removeLines3x3(2,2);
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

    // 重新绘制棋盘格
    this.drawGrid();
  }

  /**
   * 重置所有线条（恢复所有被移除的线段）
   */
  public resetLines(): void {
    this._removedHorizontalSegments.clear();
    this._removedVerticalSegments.clear();
    this.drawGrid();
  }
}
