export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export class VecHelp {
    static equal(a: Vec3, b:Vec3) {
        return a.x == b.x && a.y == b.y && a.z == b.z;
    }
}