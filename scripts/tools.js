// @ts-ignore
import { h, Fragment, useState, useRef } from "./modules/preact.js";
import { Fill, ToolbarItem, ToolbarDivider, GlyphSwatch, ColorSwatch } from "./components.js";
import { reflect } from "./utils.js";
import * as Document from "./document.js";
import * as Node from "./node.js";
import * as Workspace from "./workspace.js";
import * as Renderer from "./renderer.js";
import * as Selection from "./selection.js";
import { useRendererEvent, useShortcut } from "./hooks.js";

/**
 * @param {App.ToolProps} props
 */
function BrushTool({ state, dispatch, renderer }) {
  let [mirrorY, setMirrorY] = useState(false);
  let [mirrorX, setMirrorX] = useState(false);

  useRendererEvent(renderer, "cursor/click", event => {
    if (state.currentNodeId == null) return;

    let node = Document.getNodeById(
      state.doc,
      state.currentSceneId,
      state.currentNodeId,
    );

    let center = Node.isEmpty(node)
      ? Workspace.getCenter(state)
      : Node.getCenter(node);

    let points = reflect(
      event.x,
      event.y,
      center.x,
      center.y,
      mirrorX,
      mirrorY,
    );

    /**
      * @type {App.Action[]}
      */
    let actions = points.map(({ x, y }) => {
      return {
        type: "node/set-cell",
        sceneId: state.currentSceneId,
        nodeId: state.currentNodeId,
        color: state.currentColor,
        glyph: state.currentGlyph,
        x,
        y,
      };
    });

    return dispatch(actions);
  }, [state, dispatch]);

  useRendererEvent(renderer, "after-cells", event => {
    let { ctx } = renderer;
    let { doc, cursor } = state;

    if (cursor.x == null || cursor.y == null) {
      return;
    }

    let glyph = Document.getGlyph(doc, state.currentGlyph);
    let color = Document.getColor(doc, state.currentColor);

    ctx.save();

    // Render background color behind cursor
    ctx.fillStyle = doc.backgroundColor;
    ctx.translate(cursor.x * doc.cellWidth, cursor.y * doc.cellHeight);
    ctx.fillRect(0, 0, doc.cellWidth, doc.cellHeight);

    // Render a cell guide for cursor
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, doc.cellWidth, doc.cellHeight);

    // Render a preview of the current character
    ctx.font = `${doc.fontSize}px ${doc.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(glyph, doc.cellWidth / 2, doc.cellHeight / 2);

    ctx.restore();
  }, [state]);

  return h(Fragment, {}, [
    h(Fill, { id: "tool-options" }, [
      h(ToolbarItem, {
        selected: mirrorX,
        onClick: () => setMirrorX(!mirrorX),
      }, [
        "Mirror X"
      ]),
      h(ToolbarItem, {
        selected: mirrorY,
        onClick: () => setMirrorY(!mirrorY),
      }, [
        "Mirror Y"
      ]),
    ]),
  ]);
}

BrushTool.title = "Brush";
BrushTool.icon = "brush";
BrushTool.shortcut = ["b"];

/**
 * @param {App.ToolProps} props
 */
function EraserTool({ state, dispatch, renderer }) {
  useRendererEvent(renderer, "cursor/click", event => {
    if (state.currentNodeId == null) return;

    return dispatch({
      type: "node/clear-cell",
      sceneId: state.currentSceneId,
      nodeId: state.currentNodeId,
      x: event.x,
      y: event.y,
    });
  }, [state, dispatch]);

  return null;
}

EraserTool.title = "Eraser";
EraserTool.icon = "eraser";
EraserTool.shortcut = ["e"];

/**
 * @param {App.ToolProps} props
 */
function EyedropperTool({ state, dispatch, renderer }) {
  let [cell, setCell] = useState(null);

  useRendererEvent(renderer, "cursor/move", event => {
    let { doc, currentSceneId, currentNodeId } = state;
    let node = Document.getNodeById(doc, currentSceneId, currentNodeId);

    if (node) {
      let cell = Node.getCell(node, event.x, event.y);

      if (cell) {
        setCell(cell);
      }
    }
  }, [state, dispatch]);

  useRendererEvent(renderer, "cursor/click", event => {
    if (cell) {
      dispatch([
        { type: "workspace/select-color", colorIndex: cell.color },
        { type: "workspace/select-glyph", glyphIndex: cell.glyph },
      ]);
    }
  }, [state, dispatch]);

  let color = cell ? Document.getColor(state.doc, cell.color) : null;
  let glyph = cell ? Document.getGlyph(state.doc, cell.glyph) : null;

  return h(Fill, { name: "tool-status" }, [
    h(ToolbarItem, {}, [
      cell && `IDX ${cell.glyph}`,
      cell && h(GlyphSwatch, {
        glyph,
        fontFamily: state.doc.fontFamily
      }),
    ]),
    h(ToolbarItem, {}, [
      cell && `IDX ${cell.color}`,
      cell && h(ColorSwatch, { color }),
    ]),
  ]);
}

EyedropperTool.title = "Eyedropper";
EyedropperTool.icon = "eye";
EyedropperTool.shortcut = ["i"];

/**
 * @param {App.ToolProps} props
 */
function LineTool({ state, dispatch, renderer }) {
  let startRef = useRef();
  let endRef = useRef();

  useRendererEvent(renderer, "cursor/down", event => {
    startRef.current = { x: event.x, y: event.y };
    endRef.current = { x: event.x, y: event.y };
  }, []);

  useRendererEvent(renderer, "cursor/up", event => {
    // TODO: Commit line to node

    // Reset the current line
    startRef.current = null;
    endRef.current = null;
  }, []);

  useRendererEvent(renderer, "cursor/move", event => {
    endRef.current = { x: event.x, y: event.y };
  }, []);

  useRendererEvent(renderer, "after-cells", () => {
    let { ctx } = renderer;
    let { doc } = state;
    let start = startRef.current;
    let end = endRef.current;

    if (start == null || end == null) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.translate(doc.cellWidth / 2, doc.cellHeight / 2);
    ctx.beginPath();
    ctx.moveTo(start.x * doc.cellWidth, start.y * doc.cellHeight);
    ctx.lineTo(end.x * doc.cellWidth, end.y * doc.cellHeight);
    ctx.stroke();
    ctx.restore();
  }, [state]);
}

LineTool.title = "Line";
LineTool.icon = "minus";
LineTool.shortcut = ["l"];

/**
 * @param {App.ToolProps} props
 */
function SelectTool({ state, dispatch, renderer }) {
  let startRef = useRef();
  let [selection, setSelection] = useState(null);

  useShortcut(["Escape"], () => {
    if (selection) {
      setSelection(null);
    }
  }, [dispatch, selection, setSelection]);

  useRendererEvent(renderer, "cursor/down", event => {
    let newSelection = Selection.createFromRect(event.x, event.y, 1, 1);
    setSelection(newSelection);
    startRef.current = { x: event.x, y: event.y };
  }, [setSelection]);

  useRendererEvent(renderer, "cursor/move", event => {
    if (selection) {
      let newSelection = Selection.createFromPoints(
        startRef.current.x,
        startRef.current.y,
        event.x,
        event.y
      );

      setSelection(newSelection);
    }
  }, [selection, setSelection]);

  useRendererEvent(renderer, "cursor/up", event => {
    if (selection) {
      setSelection(null);

      if (
        startRef.current.x !== event.x &&
        startRef.current.y !== event.y
      ) {
        dispatch({ type: "workspace/set-selection", selection });
      } else {
        dispatch({ type: "workspace/clear-selection" });
      }
    }
  }, [dispatch, selection, setSelection]);

  useRendererEvent(renderer, "after-cells", () => {
    let { ctx } = renderer;
    let { doc } = state;

    if (selection) {
      let { x0, y0, x1, y1 } = selection;

      Renderer.drawSelection(renderer, {
        x: x0 * doc.cellWidth,
        y: y0 * doc.cellHeight,
        width: (x1 - x0) * doc.cellWidth,
        height: (y1 - y0) * doc.cellHeight,
        color: "white",
        opacity: 0.5,
        lineWidth: 2,
      });
    }
  }, []);

  let current = selection || Workspace.getSelection(state);
  let cursor = state.cursor;

  return h(Fill, { name: "tool-status" }, [
    h(ToolbarItem, {}, [current ? current.x0 : cursor.x]),
    h(ToolbarItem, {}, [current ? current.y0 : cursor.y]),
    h(ToolbarDivider),
    h(ToolbarItem, {}, [current && current.x1]),
    h(ToolbarItem, {}, [current && current.y1]),
    h(ToolbarDivider),
    h(ToolbarItem, {}, [current && current.x1 - current.x0]),
    h(ToolbarItem, {}, [current && current.y1 - current.y0]),
    h(ToolbarDivider),
  ]);
}

SelectTool.title = "Select";
SelectTool.icon = "selection";
SelectTool.shortcut = ["m"];

/**
 * @param {App.ToolProps} props
 */
function MoveTool({ state, dispatch, renderer }) {
  let moveRef = useRef({ type: "none" });

  useRendererEvent(renderer, "cursor/down", event => {
    let selection = Workspace.getSelection(state);
    let node = Workspace.getCurrentNode(state);

    if (selection && Selection.containsPoint(selection, event.x, event.y)) {
      moveRef.current = {
        type: "selection",
        target: selection,
        start: { x: event.x, y: event.y }
      };
    } else if (node) {
      moveRef.current = {
        type: "node",
        target: node,
        start: { x: event.x, y: event.y }
      };
    } else {
      moveRef.current = { type: "none" };
    }

  }, [state]);

  useRendererEvent(renderer, "cursor/move", event => {
    let { type, target, start } = moveRef.current;

    switch (type) {
      case "selection": {
        let selection = Selection.translate(
          target,
          event.x - start.x,
          event.y - start.y,
        );

        return dispatch({
          type: "workspace/set-selection",
          selection,
        });
      }

      case "node": {
        return dispatch({
          type: "node/set-translation",
          sceneId: state.currentSceneId,
          nodeId: state.currentNodeId,
          x: target.translate.x + event.x - start.x,
          y: target.translate.y + event.y - start.y,
        });
      }
    }
  }, [dispatch]);

  useRendererEvent(renderer, "cursor/up", event => {
    moveRef.current = { type: "none" };
  }, []);
}

MoveTool.title = "Move";
MoveTool.icon = "move";
MoveTool.shortcut = ["v"];

export default {
  "brush": BrushTool,
  "eraser": EraserTool,
  "eyedropper": EyedropperTool,
  "line": LineTool,
  "select": SelectTool,
  "move": MoveTool,
}