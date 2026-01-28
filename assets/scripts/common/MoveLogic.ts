/**
 * 原move
 */
import { Node, Tween, Vec2, tween, v2 } from 'cc';
export default class MoveLogic {

    /** 获取两点间距*/
    public static getDis(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    /**获取x方向上的距离 */
    public static getDisX(x1: number, x2: number): number {
        return Math.abs(x2 - x1);
    }
    /**获取y方向上的距离 */
    public static getDisY(y1: number, y2: number): number {
        return Math.abs(y2 - y1);
    }
    /**
     * 返回从原点(0,0)到(x,y)点的线段与x轴正方向之间的平面角度(角度值)
     */
    public static getRotation(dy: number, dx: number): number {
        return Math.floor(Math.atan2(dy, dx) * 180 / Math.PI);	//x轴的夹角
        // return Math.atan2(dy, dx) * 180 / Math.PI;	//x轴的夹角
    }

    /**
     * 获取xy方向上的分量
     * @param angle 角度
     * @returns
     */
    public static getComponentXY(angle: number): { cx: number, cy: number } {
        let radian: number = angle * Math.PI / 180;
        return { cx: Math.cos(radian), cy: Math.sin(radian) };
    }
    /**
     * 功能：使mc按speed速度直线运动
     * @param	mc
     * @param	speed
     * @param	cx cy x方向分量 y方向分量
     */
    public static line(mc: Node, speed: number, cx: number, cy: number): void {
        mc.setPosition(mc.position.x + speed * cx, mc.position.y + speed * cy);
    }
    /**
     * 余弦运动
     * @param	mc
     * @param	radius	半径
     * @param	vx	x速度
     */
    public static waveMove(mc: Node, radius: number, vx: number): void {
        mc.angle += 1;
        let radian: number = mc.angle * Math.PI / 180;
        mc.setPosition(mc.position.x + vx, Math.cos(radian) * radius);
    }
    /**
     * 抛物线运动
     * @param mc
     * @param v  初始速度
     * @param cx cy x方向分量 y方向分量
     * @param t  经历时间
     * g=9.8
     */
    public static parabola(mc: Node, v: number, cx: number, cy: number, t: number) {
        mc.setPosition(mc.position.x + v * t * cx, mc.position.y + v * t * cy - 0.5 * 9.8 * t * t);
    }
    /**
     * 角度跟踪
     * @param mc
     * @param tx
     * @param ty
     * @param omega 角速度 >=0 0=实时指向目标
     */
    public static angleTrack(mc: Node, tx: number, ty: number, omega: number = 0) {
        let dx: number = Math.floor(tx - mc.position.x);
        let dy: number = Math.floor(ty - mc.position.y);
        let insRotation: number = MoveLogic.getRotation(dy, dx);	//target与x轴的夹角

        if (omega == 0) mc.angle = insRotation; //实时跟踪
        else {
            let crtangle: number = insRotation - mc.angle;	//target与mc的夹角
            //修正夹角范围 [-180,180]
            if (crtangle > 180) crtangle -= 360;
            else if (crtangle < -180) crtangle += 360;
            if (Math.abs(crtangle) > omega) {
                if (crtangle > 0) mc.angle += omega;
                else mc.angle -= omega;
            }
            else mc.angle = insRotation;
        }
    }


    /**
     * 跟踪 mc以速度speed，角速度omega向目标target运动
     * @param	mc
     * @param	tx ty目标位置
     * @param	speed
     * @param	omega 角速度  0=实时指向目标
     */
    public static track(mc: Node, tx: number, ty: number, speed: number, omega: number = 0): void {
        MoveLogic.angleTrack(mc, tx, ty, omega); //角度跟踪
        let radian: number = mc.angle * Math.PI / 180;
        mc.setPosition(mc.position.x + speed * Math.cos(radian), mc.position.y + speed * Math.sin(radian));
    }
    /**
    *  2次贝赛尔曲线公式 计算当前点
    * @param v0 第1个点（x或y）
    * @param v1 控制点（x或y）
    * @param v2 第2个点（x或y）
    * @param t 范围（0-1）
    * @returns 当前值（x或y）
    */
    public static countBezier2(v0: number, v1: number, v2: number, t: number): number {
        return (1 - t) * (1 - t) * v0 + 2 * t * (1 - t) * v1 + t * t * v2;
    }

    /**
     * 2次贝赛尔曲线运动
     * @param mc
     * @param duration 缓动 时间
     * @param c0
     * @param c1
     * @param c2
     * isPoint 是否指向方向
     * cb 运动完毕回调
     */
    public static bezier2(mc: Node, duration: number, c0: Vec2, c1: Vec2, c2: Vec2, isPoint: boolean = false, cb: Function = null) {
        Tween.stopAllByTarget(mc);
        tween(mc).to(duration, {}, {
            easing: "quadInOut",
            onUpdate: (o, r) => {
                const x = MoveLogic.countBezier2(c0.x, c1.x, c2.x, r);
                const y = MoveLogic.countBezier2(c0.y, c1.y, c2.y, r);

                if (isPoint) mc.angle = MoveLogic.getRotation(y - mc.position.y, x - mc.position.x);
                mc.setPosition(x, y);
            },
            onComplete: () => { if (cb) cb(); } //运动完毕
        }).start();
    }

    /**
     * 半径碰撞检测
     */
    public static hitTestRadius(g1: IGeom, g2: IGeom): boolean {
        let distance: number = MoveLogic.getDis(g1.x, g1.y, g2.x, g2.y);
        if (distance < g1.radius + g2.radius) {
            return true;
        }
        return false;
    }

    /**
    * 世界坐标转本地坐标
    * @param mc 节点
    * @param w_x
    * @param w_y
    * @returns
    */
    public static worldToLocalPos(mc: Node, w_x: number, w_y: number): Vec2 {
        // let locationPos: Vec3 = new Vec3();
        // mc.inverseTransformPoint(locationPos, v3(w_x, w_y, 0));   // 转换坐标
        // return v2(locationPos.x, locationPos.y);
        return v2(w_x - mc.worldPosition.x, w_y - mc.worldPosition.y);
    }
}

export interface IGeom {
    x: number;	//坐标
    y: number;
    radius: number;		//半径
}
