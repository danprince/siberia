import * as Document from "./document.js";
import * as Scene from "./scene.js";
import * as History from "./history.js";
import * as Node from "./node.js";
import tools from "./tools.js";

/**
 * @param {Partial<App.State>} workspace
 * @return {App.State}
 */
export function create(workspace = {}) {
  let node = Node.create();
  let scene = Scene.create({ nodes: [node] });
  let doc = Document.create({ scenes: [scene] });
  let history = History.create();

  // Add an initial revision to the history, so that there is always
  // something to go back to.
  history = History.addRevision(history, doc);

  return {
    ...workspace,
    doc,
    history,
    currentSceneId: scene.id,
    currentNodeId: node.id,
    currentGlyph: 0,
    currentColor: 0,
    currentToolId: "brush",
    cursor: { x: null, y: null },
    selection: null,
    lockedNodes: [],
  };
}

/**
 * @param {App.State} state
 */
export function getCenter(state) {
  return {
    x: Math.floor(state.doc.width / 2),
    y: Math.floor(state.doc.height / 2),
  }
}

/**
 * @param {App.State} state
 * @param {string} sceneId
 * @return {boolean}
 */
export function canDeleteScene(state, sceneId) {
  // Prevent the user from deleting their only scene
  return state.doc.scenes.length > 1;
}

/**
 * @param {App.State} state
 * @param {string} toolId
 * @return {App.State}
 */
export function setCurrentTool(state, toolId) {
  return { ...state, currentToolId: toolId };
}

/**
 * @param {App.State} state
 * @param {number} colorIndex
 * @return {App.State}
 */
export function setCurrentColor(state, colorIndex) {
  return { ...state, currentColor: colorIndex };
}

/**
 * @param {App.State} state
 * @param {number} glyphIndex
 * @return {App.State}
 */
export function setCurrentGlyph(state, glyphIndex) {
  return { ...state, currentGlyph: glyphIndex };
}

/**
 * @param {App.State} state
 * @param {string} sceneId
 * @return {App.State}
 */
export function setCurrentScene(state, sceneId) {
  return { ...state, currentSceneId: sceneId };
}

/**
 * @param {App.State} state
 * @param {string} toolId
 * @return {App.Tool}
 */
export function getToolById(state, toolId) {
  return tools.find(tool => tool.id === toolId);
}

/**
 * @param {App.State} state
 * @return {App.Tool}
 */
export function getCurrentTool(state) {
  return getToolById(state, state.currentToolId);
}

/**
 * @param {App.State} state
 * @param {string} nodeId
 * @return {App.State}
 */
export function setCurrentNode(state, nodeId) {
  return { ...state, currentNodeId: nodeId };
}

/**
 * @param {App.State} state
 * @return {App.State}
 */
export function selectDefaultNode(state) {
  let scene = Document.getSceneById(state.doc, state.currentSceneId);
  let node = scene && scene.nodes[0];

  if (node) {
    return setCurrentNode(state, node.id);
  } else {
    return state;
  }
}

/**
 * @param {App.State} state
 * @param {string} sceneId
 * @param {string} nodeId
 * @return {App.State}
 */
export function selectNearestNode(state, sceneId, nodeId) {
  let scene = Document.getSceneById(state.doc, sceneId);
  let index = scene.nodes.findIndex(node => node.id === nodeId);
  let nearestNode = scene.nodes[index + 1] || scene.nodes[index - 1];

  if (nearestNode) {
    return setCurrentNode(state, nearestNode.id);
  } else {
    return state;
  }
}

/**
 * @param {App.State} state
 * @param {string} sceneId
 * @return {App.State}
 */
export function selectNearestScene(state, sceneId) {
  let { scenes } = state.doc;
  let index = scenes.findIndex(scene => scene.id === sceneId);
  let nearestScene = scenes[index + 1] || scenes[index - 1];

  if (nearestScene) {
    return setCurrentScene(state, nearestScene.id);
  } else {
    return state;
  }
}

/**
 * @param {App.State} state
 * @return {string}
 */
export function serialize(state) {
  return JSON.stringify(state);
}

/**
 * @param {string} state
 * @return {App.State}
 */
export function deserialize(state) {
  return JSON.parse(state);
}

/**
 * @param {App.State} state
 */
export function save(state) {
  state = { ...state };
  delete state.cursor;
  delete state.selection;
  let json = serialize(state);
  localStorage.setItem("recent-save", json);
}

/**
 * @return {App.State | null}
 */
export function load() {
  let json = localStorage.getItem("recent-save");

  if (json) {
    let state = deserialize(json);
    return state;
  }

  return null;
}

/**
 * @param {App.State} state
 * @param {number} x
 * @param {number} y
 * @return {App.State}
 */
export function setCursor(state, x, y) {
  return { ...state, cursor: { x, y } };
}

/**
 * @param {App.State} state
 * @param {App.Selection} selection
 * @return {App.State}
 */
export function setSelection(state, selection) {
  return { ...state, selection };
}

/**
 * @param {App.State} state
 * @return {App.State}
 */
export function clearSelection(state) {
  return { ...state, selection: null };
}

/**
 * @param {App.State} state
 * @return {App.Selection}
 */
export function getSelection(state) {
  return state.selection;
}

/**
 * @param {App.State} state
 * @return {Editor.Node}
 */
export function getCurrentNode(state) {
  return Document.getNodeById(
    state.doc,
    state.currentSceneId,
    state.currentNodeId,
  );
}

/**
 * @param {App.State} state
 * @param {string} nodeId
 * @param {boolean} locked
 * @return {App.State}
 */
export function setNodeLocked(state, nodeId, locked) {
  return {
    ...state,
    lockedNodes: locked
      ? [...state.lockedNodes, nodeId]
      : state.lockedNodes.filter(lockId => lockId !== nodeId)
  };
}

/**
 * @param {App.State} state
 * @param {string} nodeId
 * @return {boolean}
 */
export function isNodeLocked(state, nodeId) {
  return state.lockedNodes.includes(nodeId);
}
