export enum CubeEvent {
  /** 麻将被点击 */
  onCubeClick = "onCubeClick",

  /** 晃动麻将 */
  onShakeCube = "onShakeCube",

  /** 跟随麻将 */
  onFollowCube = "onFollowCube",

  /** 麻将点击结束 */
  onCubeDragEnd = "onCubeDragEnd",

  /** 回归原位 */
  onCubeReturn = "onReturn",
}