import * as Document from "./document.js";
import * as History from "./history.js";
import * as Node from "./node.js";
import * as Tools from "./tools.js";
import * as Workspace from "./workspace.js";

import {
  compose,
  withLogReducer,
  withBatchReducer,
  combineReducers
} from "./utils.js";

/**
 * @param {App.State} state
 * @param {App.Action} action
 * @return {App.State}
 *
 * Workspace reducer deals with actions that affect both the editor and
 * the underlying document.
 */
function WorkspaceReducer(state, action) {
  switch (action.type) {
    case "workspace/load":
    case "workspace/new":
      return { ...state, ...action.state };

    case "workspace/select-tool":
      return Workspace.setCurrentTool(state, action.toolId);

    case "workspace/select-color":
      return Workspace.setCurrentColor(state, action.colorIndex);

    case "workspace/select-glyph":
      return Workspace.setCurrentGlyph(state, action.glyphIndex);

    case "workspace/select-node":
      return Workspace.setCurrentNode(state, action.nodeId);

    case "workspace/select-scene": {
      state = Workspace.setCurrentScene(state, action.sceneId);
      state = Workspace.selectDefaultNode(state);
      return state;
    }

    case "workspace/set-cursor":
      return Workspace.setCursor(state, action.x, action.y);

    case "workspace/set-selection":
      return Workspace.setSelection(state, action.selection);

    case "workspace/clear-selection":
      return Workspace.clearSelection(state);

    case "scene/add": {
      state = Workspace.setCurrentScene(state, action.scene.id);
      state = Workspace.selectDefaultNode(state);
      return state;
    }

    case "scene/delete": {
      if (action.sceneId === state.currentSceneId) {
        state = Workspace.selectNearestScene(state, action.sceneId);
        state = Workspace.selectDefaultNode(state);
      }

      return state;
    }

    case "node/add": {
      if (state.currentSceneId === action.sceneId) {
        return Workspace.setCurrentNode(state, action.node.id)
      } else {
        return state;
      }
    }

    case "node/delete": {
      if (state.currentSceneId === action.sceneId) {
        return Workspace.selectNearestNode(state, action.sceneId, action.nodeId);
      } else {
        return state;
      }
    }

    default:
      return state;
  }
}

/**
 * @param {Editor.Doc} state
 * @param {App.Action} action
 * @return {Editor.Doc}
 *
 * Deals with document specific state.
 */
function DocumentReducer(state, action) {
  switch (action.type) {
    case "document/set-name":
      return Document.setName(state, action.name);

    case "document/set-font":
      return Document.setFont(state, action.family, action.size);

    case "document/set-dimensions":
      return Document.setDimensions(state, action.width, action.height);

    case "document/set-cell-dimensions":
      return Document.setCellDimensions(state, action.width, action.height);

    case "document/set-glyph-index":
      return Document.setGlyph(state, action.index, action.glyph);

    case "document/set-color-index":
      return Document.setColor(state, action.index, action.color);

    case "scene/add":
      return Document.addScene(state, action.scene);

    case "scene/delete":
      return Document.deleteScene(state, action.sceneId);

    case "scene/rename":
      return Document.editScene(
        state,
        action.sceneId,
        scene => ({ ...scene, name: action.name }),
      );

    case "node/add":
      return Document.addNode(state, action.sceneId, action.node);

    case "node/delete":
      return Document.deleteNode(state, action.sceneId, action.nodeId);

    case "node/rename":
      return Document.editNode(
        state,
        action.sceneId,
        action.nodeId,
        node => ({ ...node, name: action.name })
      );

    case "node/set-cell":
      return Document.editNode(
        state,
        action.sceneId,
        action.nodeId,
        node => Node.setCell(
          node,
          action.x - node.translate.x,
          action.y - node.translate.y,
          action.glyph,
          action.color,
        ),
      );

    case "node/clear-cell":
      return Document.editNode(
        state,
        action.sceneId,
        action.nodeId,
        node => Node.clearCell(
          node,
          action.x - node.translate.x,
          action.y - node.translate.y,
        ),
      );

    case "node/set-translation":
      return Document.editNode(
        state,
        action.sceneId,
        action.nodeId,
        node => Node.setTranslation(node, action.x, action.y),
      );

    case "node/set-visibility": {
      let target = Document.getNodeById(
        state,
        action.sceneId,
        action.nodeId
      );

      if (action.exclusive) {
        return Document.editScene(
          state,
          action.sceneId,
          scene => ({
            ...scene,
            nodes: scene.nodes.map(node => {
              if (target.visible) {
                return Node.setVisibility(node, node === target);
              } else {
                return Node.setVisibility(node, true);
              }
            })
          })
        );
      } else {
        return Document.editNode(
          state,
          action.sceneId,
          action.nodeId,
          node => Node.setVisibility(node, action.visible),
        );
      }
    }

    default:
      return state;
  }
}

/**
 * @param {App.State} state
 * @param {App.Action} action
 * @return {App.State}
 */
function HistoryReducer(state, action) {
  switch (action.type) {
    case "history/undo": {
      let history = History.undo(state.history);
      let doc = History.getCurrentDoc(history);
      return { ...state, history, doc };
    }

    case "history/redo": {
      let history = History.redo(state.history);
      let doc = History.getCurrentDoc(history);
      return { ...state, history, doc };
    }

    case "history/select-revision": {
      let history = History.selectRevision(state.history, action.id);
      let doc = History.getCurrentDoc(history);
      return { ...state, history, doc };
    }

    // Transient actions don't modify the state of the document and
    // aren't recorded as undoable.
    case "workspace/load":
    case "workspace/new":
    case "workspace/select-scene":
    case "workspace/select-node":
    case "workspace/select-color":
    case "workspace/select-glyph":
    case "workspace/select-tool":
    case "workspace/set-cursor":
    case "workspace/set-selection":
    case "workspace/clear-selection":
      return state;

    // Persistent actions modify the document
    default: {
      let history = History.addRevision(state.history, state.doc, action);
      return { ...state, history };
    }
  }
}

/**
 * @param {App.State} state
 * @param {App.Action} action
 * @return {App.State}
 */
function ToolReducer(state, action) {
  /**
   * @type {App.Tool}
   */
  let currentTool = Tools[state.currentToolId];

  if (currentTool && currentTool.reducer) {
    state = currentTool.reducer(state, action);
  }

  return state;
}

let DomainReducers = combineReducers({
  doc: DocumentReducer,
});

/**
 * @param {App.State} state
 * @param {App.Action} action
 * @return {App.State}
 */
function appReducer(state, action) {
  state = WorkspaceReducer(state, action);
  state = DomainReducers(state, action);
  state = ToolReducer(state, action);
  state = HistoryReducer(state, action);
  return state;
}

let enhance = compose(
  withLogReducer({ ignore: /set-cursor/ }),
  withBatchReducer,
);

/**
 * @type {App.Reducer}
 */
let reducer = enhance(appReducer);

export default reducer;
