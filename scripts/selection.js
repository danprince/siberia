/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {App.Selection}
 */
export function createFromPoints(x0, y0, x1, y1) {
  let minX = Math.min(x0, x1);
  let minY = Math.min(y0, y1);
  let maxX = Math.max(x0, x1);
  let maxY = Math.max(y0, y1);

  return {
    x0: minX,
    y0: minY,
    x1: minX < maxX ? maxX : maxX + 1,
    y1: minY < maxY ? maxY : maxY + 1,
  };
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @return {App.Selection}
 */
export function createFromRect(x, y, w, h) {
  let x0 = x;
  let y0 = y;
  let x1 = x0 + w;
  let y1 = y0 + h;
  return createFromPoints(x0, y0, x1, y1);
}

/**
 * @param {App.Selection} selection
 * @param {number} x
 * @param {number} y
 * @return {App.Selection}
 */
export function translate(selection, x, y) {
  let { x0, y0, x1, y1 } = selection;

  return {
    x0: x0 + x,
    y0: y0 + y,
    x1: x1 + x,
    y1: y1 + y,
  };
}

/**
 * @param {App.Selection} selection
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function containsPoint(selection, x, y) {
  let { x0, y0, x1, y1 } = selection;

  return (
    x >= x0 &&
    y >= y0 &&
    x < x1 &&
    y < y1
  );
}
