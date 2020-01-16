import { uid } from "./utils.js";
import * as Scene from "./scene.js";

/**
 * @param {Partial<Editor.Doc>} doc
 * @return {Editor.Doc}
 */
export function create(doc = {}) {
  return {
    id: uid(),
    name: "",
    colors: ["#000", "#fff", "#f00", "#0f0", "#00f"],
    glyphs: [".", "|", "-", "_", "/", "\\", "=", "*", "'", `"`, "`"],
    scenes: [Scene.create({})],
    width: 50,
    height: 20,
    fontFamily: "mononoki",
    fontSize: 20,
    cellWidth: 12,
    cellHeight: 20,
    backgroundColor: "#282c33",
    ...doc,
  }
}

/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene} scene
 * @return {Editor.Doc}
 */
export function addScene(doc, scene) {
  return {
    ...doc,
    scenes: [...doc.scenes, scene],
  };
}

/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene["id"]} sceneId
 * @return {Editor.Doc}
 */
export function deleteScene(doc, sceneId) {
  return {
    ...doc,
    scenes: doc.scenes.filter(scene => {
      return scene.id !== sceneId;
    }),
  };
}


/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene["id"]} sceneId
 * @param {Editor.Node} node
 * @return {Editor.Doc}
 */
export function addNode(doc, sceneId, node) {
  return {
    ...doc,
    scenes: doc.scenes.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          nodes: [node, ...scene.nodes]
        }
      } else {
        return scene;
      }
    }),
  };
}

/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene["id"]} sceneId
 * @param {Editor.Node["id"]} nodeId
 * @return {Editor.Doc}
 */
export function deleteNode(doc, sceneId, nodeId) {
  return {
    ...doc,
    scenes: doc.scenes.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          nodes: scene.nodes.filter(node => {
            return node.id !== nodeId;
          }),
        };
      } else {
        return scene;
      }
    }),
  };
}

/**
 * @param {Editor.Doc} doc
 * @param {string} sceneId
 * @param {(scene: Editor.Scene) => Editor.Scene} callback
 * @return {Editor.Doc}
 */
export function editScene(doc, sceneId, callback) {
  let scenes = doc.scenes.map(scene => {
    if (scene.id === sceneId) {
      return callback(scene);
    } else {
      return scene;
    }
  });

  return { ...doc, scenes };
}

/**
 * @param {Editor.Doc} doc
 * @param {string} sceneId
 * @param {string} nodeId
 * @param {(scene: Editor.Node) => Editor.Node} callback
 * @return {Editor.Doc}
 */
export function editNode(doc, sceneId, nodeId, callback) {
  return editScene(doc, sceneId, scene => {
    let nodes = scene.nodes.map(node => {
      if (node.id === nodeId) {
        return callback(node);
      } else {
        return node;
      }
    });

    return { ...scene, nodes };
  });
}

/**
 * @param {Editor.Doc} doc
 * @param {string[]} colors
 * @return {Editor.Doc}
 */
export function setColors(doc, colors) {
  return {
    ...doc,
    colors,
  };
}

/**
 * @param {Editor.Doc} doc
 * @param {string[]} glyphs
 * @return {Editor.Doc}
 */
export function setGlyphs(doc, glyphs) {
  return {
    ...doc,
    glyphs,
  };
}

/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene["id"]} sceneId
 */
export function getSceneById(doc, sceneId) {
  return doc.scenes.find(scene => scene.id === sceneId);
}

/**
 * @param {Editor.Doc} doc
 * @param {Editor.Scene["id"]} sceneId
 * @param {Editor.Node["id"]} nodeId
 */
export function getNodeById(doc, sceneId, nodeId) {
  let scene = getSceneById(doc, sceneId);
  return scene && scene.nodes.find(node => node.id === nodeId);
}

/**
 * @param {Editor.Doc} doc
 * @param {number} colorIndex
 */
export function getColor(doc, colorIndex) {
  return doc.colors[colorIndex];
}

/**
 * @param {Editor.Doc} doc
 * @param {number} glyphIndex
 */
export function getGlyph(doc, glyphIndex) {
  return doc.glyphs[glyphIndex];
}

/**
 * @param {Editor.Doc} doc
 * @param {string} name
 * @return {Editor.Doc}
 */
export function setName(doc, name) {
  return { ...doc, name };
}

/**
 * @param {Editor.Doc} doc
 * @param {string} family
 * @param {number} size
 * @return {Editor.Doc}
 */
export function setFont(doc, family, size) {
  return { ...doc, fontFamily: family, fontSize: size };
}

/**
 * @param {Editor.Doc} doc
 * @param {number} width
 * @param {number} height
 * @return {Editor.Doc}
 */
export function setDimensions(doc, width, height) {
  return { ...doc, width, height };
}

/**
 * @param {Editor.Doc} doc
 * @param {number} width
 * @param {number} height
 * @return {Editor.Doc}
 */
export function setCellDimensions(doc, width, height) {
  return { ...doc, cellWidth: width, cellHeight: height };
}

/**
 * @param {Editor.Doc} doc
 * @param {number} index
 * @param {string} color
 * @return {Editor.Doc}
 */
export function setColor(doc, index, color) {
  let colors = [...doc.colors];
  colors[index] = color;
  return { ...doc, colors };
}

/**
 * @param {Editor.Doc} doc
 * @param {number} index
 * @param {string} glyph
 * @return {Editor.Doc}
 */
export function setGlyph(doc, index, glyph) {
  let glyphs = [...doc.glyphs];
  glyphs[index] = glyph;
  return { ...doc, glyphs };
}
