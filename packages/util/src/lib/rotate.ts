import type { ViewContext2D, PointSize, ElementSize } from '@idraw/types';
import { calcDistance } from './point';

export function parseRadianToAngle(radian: number): number {
  return (radian / Math.PI) * 180;
}

export function parseAngleToRadian(angle: number): number {
  return (angle / 180) * Math.PI;
}

export function calcElementRotateCenter(elem: ElementSize): PointSize {
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2
  };
  return p;
}

export function rotateElement(
  ctx: ViewContext2D | CanvasRenderingContext2D | ViewContext2D,
  elemSize: ElementSize,
  callback: (ctx: ViewContext2D | CanvasRenderingContext2D) => void
): void {
  const center = calcElementRotateCenter(elemSize);
  const radian = parseAngleToRadian(elemSize.angle || 0);
  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(radian);
    ctx.translate(-center.x, -center.y);
  }

  callback(ctx);

  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(-radian);
    ctx.translate(-center.x, -center.y);
  }
}

export function calcElementCenter(elem: ElementSize): PointSize {
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2
  };
  return p;
}

export function calcRadian(center: PointSize, start: PointSize, end: PointSize): number {
  const startAngle = calcLineRadian(center, start);
  const endAngle = calcLineRadian(center, end);
  if (endAngle !== null && startAngle !== null) {
    if (startAngle > (Math.PI * 3) / 2 && endAngle < Math.PI / 2) {
      return endAngle + (Math.PI * 2 - startAngle);
    } else if (endAngle > (Math.PI * 3) / 2 && startAngle < Math.PI / 2) {
      return startAngle + (Math.PI * 2 - endAngle);
    } else {
      return endAngle - startAngle;
    }
  } else {
    return 0;
  }
}

function calcLineRadian(center: PointSize, p: PointSize): number {
  const x = p.x - center.x;
  const y = p.y - center.y;
  if (x === 0) {
    if (y < 0) {
      return 0;
    } else if (y > 0) {
      return Math.PI;
    }
  } else if (y === 0) {
    if (x < 0) {
      return (Math.PI * 3) / 2;
    } else if (x > 0) {
      return Math.PI / 2;
    }
  }

  if (x > 0 && y < 0) {
    return Math.atan(Math.abs(x) / Math.abs(y));
  } else if (x > 0 && y > 0) {
    return Math.PI - Math.atan(Math.abs(x) / Math.abs(y));
  } else if (x < 0 && y > 0) {
    return Math.PI + Math.atan(Math.abs(y) / Math.abs(x));
  } else if (x < 0 && y < 0) {
    return 2 * Math.PI - Math.atan(Math.abs(y) / Math.abs(x));
  }

  return 0;
}

export function rotatePoint(center: PointSize, start: PointSize, radian: number): PointSize {
  const startRadian = calcLineRadian(center, start);

  const rotateRadian = radian;

  let endRadian = startRadian + rotateRadian;
  if (endRadian > Math.PI * 2) {
    endRadian = endRadian - Math.PI * 2;
  } else if (endRadian < 0 - Math.PI * 2) {
    endRadian = endRadian + Math.PI * 2;
  }
  if (endRadian < 0) {
    endRadian = endRadian + Math.PI * 2;
  }

  const length = calcDistance(center, start);
  let x = 0;
  let y = 0;
  if (endRadian === 0) {
    x = 0;
    y = 0 - length;
  } else if (endRadian > 0 && endRadian < Math.PI / 2) {
    x = Math.sin(endRadian) * length;
    y = 0 - Math.cos(endRadian) * length;
  } else if (endRadian === Math.PI / 2) {
    x = length;
    y = 0;
  } else if (endRadian > Math.PI / 2 && endRadian < Math.PI) {
    x = Math.sin(Math.PI - endRadian) * length;
    y = Math.cos(Math.PI - endRadian) * length;
  } else if (endRadian === Math.PI) {
    x = 0;
    y = length;
  } else if (endRadian > Math.PI && endRadian < (3 / 2) * Math.PI) {
    x = 0 - Math.sin(endRadian - Math.PI) * length;
    y = Math.cos(endRadian - Math.PI) * length;
  } else if (endRadian === (3 / 2) * Math.PI) {
    x = 0 - length;
    y = 0;
  } else if (endRadian > (3 / 2) * Math.PI && endRadian < 2 * Math.PI) {
    x = 0 - Math.sin(2 * Math.PI - endRadian) * length;
    y = 0 - Math.cos(2 * Math.PI - endRadian) * length;
  } else if (endRadian === 2 * Math.PI) {
    x = 0;
    y = 0 - length;
  }

  x += center.x;
  y += center.y;
  return { x, y };
}

export function rotateElementVertexes(elemSize: ElementSize): PointSize[] {
  const { x, y, w, h, angle } = elemSize;
  let p1 = { x, y };
  let p2 = { x: x + w, y };
  let p3 = { x: x + w, y: y + h };
  let p4 = { x, y: y + h };
  if (angle && (angle > 0 || angle < 0)) {
    const radian = parseAngleToRadian(angle);
    const center = calcElementCenter(elemSize);
    p1 = rotatePoint(center, p1, radian);
    p2 = rotatePoint(center, p2, radian);
    p3 = rotatePoint(center, p3, radian);
    p4 = rotatePoint(center, p4, radian);
  }
  return [p1, p2, p3, p4];
}
