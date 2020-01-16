import { uid } from "./utils.js";

/**
 * @param {Partial<Editor.Node>} node
 * @return {Editor.Node}
 */
export function create(node = {}) {
  return {
    id: uid(),
    name: "",
    translate: { x: 0, y: 0 },
    cells: [],
    visible: true,
    ...node
  };
}

/**
 * @param {Editor.Node} node
 * @param {number} x
 * @param {number} y
 * @param {number} glyph
 * @param {number} color
 */
export function setCell(node, x, y, glyph, color) {
  return {
    ...node,
    cells: [
      ...node.cells,
      { x, y, glyph, color },
    ],
  };
}

/**
 * @param {Editor.Node} node
 * @param {number} x
 * @param {number} y
 */
export function clearCell(node, x, y) {
  return {
    ...node,
    cells: node.cells.filter(cell => {
      return !(cell.x == x && cell.y == y);
    }),
  };
}

/**
 * @param {Editor.Node} node
 */
export function getBounds(node) {
  let xs = node.cells.map(cell => cell.x);
  let ys = node.cells.map(cell => cell.y);
  let x0 = Math.min(...xs);
  let y0 = Math.min(...ys);
  let x1 = Math.max(...xs);
  let y1 = Math.max(...ys);
  return { x0, y0, x1, y1 };
}

/**
 * @param {Editor.Node} node
 */
export function getCenter(node) {
  let { x0, y0, x1, y1 } = getBounds(node);
  let x = Math.floor(x0 + (x1 - x0) / 2);
  let y = Math.floor(y0 + (y1 - y0) / 2);
  return { x, y };
}

/**
 * @param {Editor.Node} node
 */
export function isEmpty(node) {
  return node.cells.length === 0;
}


/**
 * @param {Editor.Node} node
 * @param {boolean} visible
 * @return {Editor.Node}
 */
export function setVisibility(node, visible) {
  return { ...node, visible };
}

/**
 * @param {Editor.Node} node
 * @param {number} x
 * @param {number} y
 * @return {Editor.Cell}
 */
export function getCell(node, x, y) {
  return node.cells.find(cell => {
    return cell.x === x && cell.y === y;
  });
}

/**
 * @param {Editor.Node} node
 * @param {number} x
 * @param {number} y
 * @return {Editor.Node}
 */
export function setTranslation(node, x, y) {
  return { ...node, translate: { x, y } };
}

/**
 * @param {Editor.Node} node
 * @param {number} x
 * @param {number} y
 */
export function toLocalPoint(node, x, y) {
  return {
    x: x - node.translate.x,
    y: y - node.translate.y
  };
}
