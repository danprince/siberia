import { uid } from "./utils.js";
import * as Node from "./node.js";

/**
 * @param {Partial<Editor.Scene>} scene
 * @return {Editor.Scene}
 */
export function create(scene = {}) {
  return {
    id: uid(),
    name: "",
    nodes: [Node.create({})],
    ...scene,
  };
}

/**
 * Turns all of the nodes in a scene into a single flat list of cells.
 *
 * @param {Editor.Scene} scene
 * @return {Editor.Cell[]}
 */
export function composite(scene) {
  /**
   * @type {Record<string, Editor.Cell>}
   */
  let cells = {};

  // Iterate through the nodes in reverse order to ensure the layering
  // is correct.

  for (let i = scene.nodes.length - 1; i >= 0; i--) {
    let node = scene.nodes[i];

    if (node.visible) {
      for (let cell of node.cells) {
        let x = node.translate.x + cell.x;
        let y = node.translate.y + cell.y;
        let key = `${x}:${y}`;
        cells[key] = { x, y, glyph: cell.glyph, color: cell.color };;
      }
    }
  }

  return Object.values(cells);
}

/**
 * @param {Editor.Scene} scene
 * @return {Editor.Node}
 */
export function getTopNode(scene) {
  return scene.nodes[0];
}
