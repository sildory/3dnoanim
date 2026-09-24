export class NoirMath {
  static clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  static noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3.0 - 2.0 * f);
    return NoirMath.lerp(NoirMath.hash(i), NoirMath.hash(i + 1), u);
  }

  // Честная 3D-перспективная проекция
  static project3D(x, y, z, fov = 750, cx = 960, cy = 540) {
    if (z <= -fov + 10) return null;
    const factor = fov / (fov + z);
    return {
      x: x * factor + cx,
      y: y * factor + cy,
      scale: factor
    };
  }

  static rotateX(p, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }

  static rotateY(p, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }

  // Генератор ветвящейся молнии
  static getLightningBranches(x1, y1, x2, y2, displace, seed) {
    const pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    let curDisp = displace;

    for (let depth = 0; depth < 5; depth++) {
      const nextPts = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const rnd = (NoirMath.hash(seed + depth * 13 + i * 29) - 0.5) * 2;
        const nx = mx + rnd * curDisp;
        const ny = my + (NoirMath.hash(seed + 91 + i) - 0.5) * curDisp * 0.4;
        nextPts.push(p1);
        nextPts.push({ x: nx, y: ny });
      }
      nextPts.push(pts[pts.length - 1]);
      pts.length = 0;
      pts.push(...nextPts);
      curDisp *= 0.52;
    }
    return pts;
  }
}
