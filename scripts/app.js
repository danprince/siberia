// @ts-ignore
import { h, Fragment, useReducer, useRef, useEffect } from "./modules/preact.js";
import reducer from "./reducer.js";
import tools from "./tools.js";
import * as Renderer from "./renderer.js";
import * as History from "./history.js";
import * as Document from "./document.js";
import * as Scene from "./scene.js";
import * as Node from "./node.js";
import * as Workspace from "./workspace.js";
import * as Shortcuts from "./shortcuts.js";
import { isBrightColor } from "./utils.js";
import { useShortcut, useBeforeUnload } from "./hooks.js";

import {
  Icon,
  Input,
  InlineEditor,
  IconButton,
  ContextMenu,
  ContextMenuItem,
  SelectableList,
  SelectableListItem,
  AppContainer,
  AppView,
  AppSidebar,
  AppWorkspace,
  Toolbar,
  ToolbarItem,
  ToolbarDivider,
  ToolbarMenu,
  SidebarPanel,
  SidebarPanelHeader,
  SidebarPanelContent,
  SidebarPanelTitle,
  SidebarPanelControls,
  Palette,
  PaletteSwatch,
  ColorSwatch,
  GlyphSwatch,
  SceneExplorer,
  SceneExplorerItem,
  HistoryExplorer,
  HistoryExplorerItem,
  HistoryRevisionPreview,
  NodeExplorer,
  NodeExplorerItem,
  SceneExplorerStats,
  DragNumberInput,
  ScrollView,
  Slot,
  TooltipTrigger,
  IconToggle,
} from "./components.js";

let initialState = Workspace.create();

export function Editor() {
  let [state, dispatch] = useReducer(reducer, initialState);

  let rendererRef = useRef(Renderer.create());

  useEffect(() => {
    let state = Workspace.load();

    if (state) {
      dispatch({ type: "workspace/load", state });
    }
  }, []);

  useBeforeUnload(() => {
    Workspace.save(state);
  }, [state]);

  useEffect(() => {
    let { currentNodeId } = state;

    if (currentNodeId != null) {
      let element = document.getElementById(`node-${currentNodeId}`);

      if (element) {
        element.scrollIntoView();
      }
    }
  }, [state.currentNodeId]);

  useShortcut(["Meta", "z"], () => {
    if (History.canUndo(state.history)) {
      dispatch({ type: "history/undo" })
    }
  }, [state.history]);

  useShortcut(["Meta", "y"], () => {
    if (History.canRedo(state.history)) {
      dispatch({ type: "history/redo" })
    }
  }, [state.history]);

  useEffect(() => {
    /**
     * @type {App.Shortcut[]}
     */
    let shortcuts = [];

    for (let id in tools) {
      let tool = tools[id];

      if (tool.shortcut) {
        let shortcut = Shortcuts.on(tool.shortcut, () => {
          dispatch({ type: "workspace/select-tool", toolId: id });
        });

        shortcuts.push(shortcut);
      }
    }

    return () => {
      for (let shortcut of shortcuts) {
        Shortcuts.off(shortcut);
      }
    };
  }, [tools, dispatch]);

  let selection = Workspace.getSelection(state);

  useEffect(() => {
    if (selection == null) return;

    let shortcut = Shortcuts.on(["Escape"], () => {
      dispatch({ type: "workspace/clear-selection" });
    });

    return () => Shortcuts.off(shortcut);
  }, [dispatch, selection]);

  let currentTool = tools[state.currentToolId];

  return (
    h(AppContainer, {}, [
      h(currentTool, {
        renderer: rendererRef.current,
        state,
        dispatch,
      }),
      h(Toolbar, {}, [
        h(Menus, { state, dispatch }),
        h(ToolbarDivider),
        h(ToolMenus, { state, dispatch }),
        h(ToolbarDivider),
        h(Slot, { name: "tool-options" }),
        h(ToolbarDivider),
      ]),
      h(AppView, {}, [
        h(AppSidebar, {}, [
          h(SceneExplorerPanel, { state, dispatch }),
          h(NodeExplorerPanel, { state, dispatch }),
          h(ColorPalettePanel, { state, dispatch }),
          h(GlyphPalettePanel, { state, dispatch }),
          h(HistoryExplorerPanel, { state, dispatch }),
        ]),

        h(AppWorkspace, {}, [
          h(Canvas, {
            state,
            dispatch,
            renderer: rendererRef.current,
          }),
        ]),

        h(AppSidebar, {}, [
          h(DocumentSettingsPanel, { state, dispatch }),
        ]),
      ]),
      h(Toolbar, {}, [
        h(Slot, { name: "tool-status" }, [
          h(ToolbarItem, {}, [
            h(Icon, { name: "plus" }),
          ]),
          h(ToolbarItem, {}, [
            state.cursor.x != null && state.cursor.y !== null && (
              `${state.cursor.x}, ${state.cursor.y}`
            )
          ]),
        ]),
      ]),
    ])
  );
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
export function Menus({ state, dispatch }) {
  let menus = {
    file: h(ContextMenu, {}, [
      h(ContextMenuItem, {
        onClick() {
          let state = Workspace.create();
          dispatch({ type: "workspace/new", state });
        }
      }, [
        "New",
        h(Icon, { name: "new" }),
      ]),
      h(ContextMenuItem, {
        onClick() {
          Workspace.save(state);
        }
      }, [
        "Save",
        h(Icon, { name: "save" }),
      ]),
      h(ContextMenuItem, {}, [
        "Load",
        h(Icon, { name: "load" }),
      ]),
    ]),

    edit: h(ContextMenu, {}, [
      h(ContextMenuItem, {
        onClick() {
          dispatch({
            type: "scene/add",
            scene: Scene.create(),
          });
        }
      }, [
        "Add scene",
        h(Icon, { name: "camera" }),
      ]),
      h(ContextMenuItem, {
        onClick() {
          dispatch({
            type: "node/add",
            sceneId: state.currentSceneId,
            node: Node.create(),
          });
        }
      }, [
        "Add node",
        h(Icon, { name: "layers" }),
      ]),
      h(ContextMenuItem, {
        disabled: !History.canUndo(state.history),
        onClick() {
          dispatch({ type: "history/undo" });
        }
      }, [
        "Undo",
        h(Icon, { name: "undo" }),
      ]),
      h(ContextMenuItem, {
        disabled: !History.canRedo(state.history),
        onClick() {
          dispatch({ type: "history/redo" });
        }
      }, [
        "Redo",
        h(Icon, { name: "redo" }),
      ]),
    ]),
  }

  return h(Fragment, {}, [
    h(ToolbarMenu, { menu: menus.file }, "File"),
    h(ToolbarMenu, { menu: menus.edit }, "Edit"),
  ]);
}

/**
 * @param {{
 *   state: App.State,
 *   dispatch: App.Dispatch,
 *   renderer: App.Renderer,
 * }} props
 */
export function Canvas({
  state,
  dispatch,
  renderer,
}) {
  let elementRef = useRef();
  let cellsRef = useRef();

  let { doc, currentSceneId } = state;
  let { ctx, canvas } = renderer;
  let width = doc.width * doc.cellWidth;
  let height = doc.height * doc.cellHeight;

  // TODO: Might need two modes for the renderer:
  // - Default mode: render in response to updates
  // - Animation mode: render every frame
  //
  // This allows things for like selections, that have fancy animated
  // rendering requirements.

  useEffect(() => {
    elementRef.current.appendChild(canvas);
    return () => elementRef.current.removeChild(canvas);
  }, [elementRef.current, canvas]);

  // Resize canvas when document size (or renderer resolution) changes
  useEffect(() => {
    Renderer.resize(renderer, width, height);
  }, [width, height, renderer.resolution]);

  // Re-composite the scene into renderable nodes when the document changes
  useEffect(() => {
    let scene = Document.getSceneById(doc, currentSceneId);

    if (scene) {
      cellsRef.current = Scene.composite(scene);
    }
  }, [doc, currentSceneId]);

  useEffect(() => {
    let cells = cellsRef.current;

    Renderer.clear(renderer);

    ctx.save();
    ctx.fillStyle = doc.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    Renderer.emit(renderer, { type: "before-cells" });

    ctx.font = `${doc.fontSize}px ${doc.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let cell of cells) {
      let color = Document.getColor(doc, cell.color);
      let glyph = Document.getGlyph(doc, cell.glyph);

      ctx.save();
      ctx.fillStyle = color;
      ctx.translate(cell.x * doc.cellWidth, cell.y * doc.cellHeight)
      ctx.fillText(glyph, doc.cellWidth / 2, doc.cellHeight / 2);
      ctx.restore();
    }

    ctx.restore();

    Renderer.emit(renderer, { type: "after-cells" });

    if (state.selection) {
      let { x0, y0, x1, y1 } = state.selection;

      Renderer.emit(renderer, { type: "before-selection" });

      Renderer.drawSelection(renderer, {
        x: x0 * doc.cellWidth,
        y: y0 * doc.cellHeight,
        width: (x1 - x0) * doc.cellWidth,
        height: (y1 - y0) * doc.cellHeight,
        color: "white",
      });

      Renderer.emit(renderer, { type: "after-selection" });
    }

    let drawGrid = false;

    if (drawGrid) {
      Renderer.emit(renderer, { type: "before-grid" });

      Renderer.drawGrid(renderer, {
        cellWidth: doc.cellWidth,
        cellHeight: doc.cellHeight,
        color: "white",
        opacity: 0.04
      });

      Renderer.drawGrid(renderer, {
        cellWidth: doc.cellWidth * 8,
        cellHeight: doc.cellHeight * 5,
        color: "blue",
        lineWidth: 1,
        opacity: 0.5
      });

      Renderer.emit(renderer, { type: "after-grid" });
    }
  }, [
    // Track all the dependencies that could trigger a re-render
    state,
    renderer,
  ]);

  function eventToGrid(event) {
    let { left, top } = event.target.getBoundingClientRect();
    let { clientX, clientY } = event;

    let x = clientX - left;
    let y = clientY - top;

    let gridX = Math.floor(x / doc.cellWidth);
    let gridY = Math.floor(y / doc.cellHeight);

    return [gridX, gridY];
  }

  return h("div", {
    class: "canvas",
    ref: elementRef,
    onMouseDown(event) {
      let [x, y] = eventToGrid(event);
      Renderer.emit(renderer, { type: "cursor/down", x, y });
      Renderer.emit(renderer, { type: "cursor/click", x, y });
    },
    onMouseUp(event) {
      let [x, y] = eventToGrid(event);
      Renderer.emit(renderer, { type: "cursor/up", x, y });
    },
    onMouseEnter() {
      Renderer.emit(renderer, { type: "cursor/enter" });
    },
    onMouseLeave() {
      dispatch({ type: "workspace/set-cursor", x: null, y: null });
      Renderer.emit(renderer, { type: "cursor/exit" });
    },
    onMouseMove(event) {
      let [x, y] = eventToGrid(event);

      if (x !== state.cursor.x || y !== state.cursor.y) {
        dispatch({ type: "workspace/set-cursor", x, y });
        Renderer.emit(renderer, { type: "cursor/move", x, y });

        if (event.buttons === 1) {
          Renderer.emit(renderer, { type: "cursor/click", x, y });
        }
      }
    },
  });
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function ToolMenus({ state, dispatch }) {
  return h(Fragment, {}, Object.keys(tools).map(id => {
    let tool = tools[id];

    return h(TooltipTrigger, { tip: tool.title }, [
      h(ToolbarItem, {
        selected: id === state.currentToolId,
        onClick() {
          if (state.currentToolId !== id) {
            dispatch({ type: "workspace/select-tool", toolId: id });
          }
        }
      }, (
        h(Icon, { name: tool.icon })
      ))
    ]);
  }));
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function SceneExplorerPanel({ state, dispatch }) {
  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "camera" }),
        "Scenes",
      ]),
      h(SidebarPanelControls, {}, [
        h(TooltipTrigger, { tip: "Add scene" }, [
          h(IconButton, {
            name: "plus",
            onClick() {
              dispatch({ type: "scene/add", scene: Scene.create() });
            }
          }),
        ]),
        h(IconButton, {
          name: "minus",
          disabled: state.currentSceneId == null,
          onClick() {
            if (Workspace.canDeleteScene(state, state.currentSceneId)) {
              dispatch({ type: "scene/delete", sceneId: state.currentSceneId });
            }
          }
        }),
      ]),
    ]),
    h(ScrollView, { maxHeight: 200 }, [
      h(SidebarPanelContent, {}, [
        h(SceneExplorer, {}, (
          h(SelectableList, {}, state.doc.scenes.map(scene => {
            return h(SelectableListItem, {
              key: scene.id,
              selected: scene.id === state.currentSceneId,
              onClick() {
                if (scene.id !== state.currentSceneId) {
                  dispatch({ type: "workspace/select-scene", sceneId: scene.id });
                }
              },
            }, (
              h(SceneExplorerItem, { id: `scene-${scene.id}` }, [
                h(InlineEditor, {
                  locked: scene.id !== state.currentSceneId,
                  value: scene.name,
                  placeholder: "Untitled Scene",
                  onSubmit(name) {
                    name = name.trim();

                    if (name && name !== scene.name) {
                      dispatch({
                        type: "scene/rename",
                        sceneId: scene.id,
                        name,
                      });
                    }
                  },
                }),
                h(SceneExplorerStats, {}, [
                  h(Icon, { name: "layers" }),
                  scene.nodes.length
                ]),
              ])
            ))
          }))
        ))
      ]),
    ]),
  ]);
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function NodeExplorerPanel({ state, dispatch }) {
  let currentScene = Document.getSceneById(
    state.doc,
    state.currentSceneId
  );

  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "layers" }),
        "Nodes",
      ]),
      h(SidebarPanelControls, {}, [
        IconButton({
          name: "plus",
          onClick() {
            dispatch({
              type: "node/add",
              sceneId: currentScene.id,
              node: Node.create(),
            });
          }
        }),
        IconButton({
          name: "minus",
          disabled: state.currentNodeId == null,
          onClick() {
            dispatch({
              type: "node/delete",
              sceneId: state.currentSceneId,
              nodeId: state.currentNodeId,
            });
          }
        }),
      ]),
    ]),
    h(ScrollView, { maxHeight: 200 }, [
      h(SidebarPanelContent, {}, [
        h(NodeExplorer, {}, (
          h(SelectableList, {}, (
            currentScene ? currentScene.nodes : []
          ).map(node => {
            return h(NodeExplorerItem, {
              id: `node-${node.id}`,
              key: node.id,
            }, [
              h(IconToggle, {
                name: "eye",
                value: node.visible,
                onClick(event) {
                  dispatch({
                    type: "node/set-visibility",
                    sceneId: currentScene.id,
                    nodeId: node.id,
                    visible: !node.visible,
                    exclusive: event.shiftKey,
                  });
                }
              }),
              h(IconToggle, {
                name: "lock",
                value: node.visible,
                onClick(event) {
                  //dispatch({
                  //  type: "node/set-locked",
                  //  sceneId: currentScene.id,
                  //  nodeId: node.id,
                  //  locked: !node.locked,
                  //});
                }
              }),
              h(SelectableListItem, {
                selected: node.id === state.currentNodeId,
                onClick() {
                  if (node.id !== state.currentNodeId) {
                    dispatch({ type: "workspace/select-node", nodeId: node.id });
                  }
                },
              }, [
                h(InlineEditor, {
                  value: node.name,
                  placeholder: "Untitled Node",
                  locked: node.id !== state.currentNodeId,
                  onSubmit(name) {
                    name = name.trim();

                    if (name && name !== node.name) {
                      dispatch({
                        type: "node/rename",
                        sceneId: currentScene.id,
                        nodeId: node.id,
                        name,
                      });
                    }
                  },
                }),
              ]),
            ])
          }))
        ))
      ]),
    ]),
  ]);
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function ColorPalettePanel({ state, dispatch }) {
  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "palette" }),
        "Colors",
      ])
    ]),
    h(SidebarPanelContent, {}, [
      h(Palette, {}, Array.from({ length: 20 }).map((_, index) => {
        let color = Document.getColor(state.doc, index);

        return h(PaletteSwatch, {
          selected: index === state.currentColor,
          inverted: color ? isBrightColor(color) : false,
          triangle: true,
          onClick() {
            if (index !== state.currentColor) {
              dispatch({ type: "workspace/select-color", colorIndex: index });
            }
          },
          onDblClick() {
            let color = prompt("Hex:");
            dispatch({ type: "document/set-color-index", index, color });
          }
        }, (
          h(ColorSwatch, { color })
        ));
      })),
    ]),
  ]);
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function GlyphPalettePanel({ state, dispatch }) {
  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "font" }),
        "Glyphs",
      ])
    ]),
    h(SidebarPanelContent, {}, [
      h(Palette, {}, Array.from({ length: 20 }).map((_, index) => {
        let glyph = Document.getGlyph(state.doc, index);

        return h(PaletteSwatch, {
          selected: index === state.currentGlyph,
          onClick() {
            if (index !== state.currentGlyph) {
              dispatch({ type: "workspace/select-glyph", glyphIndex: index });
            }
          },
          onDblClick() {
            let glyph = prompt("Glyph: ");
            dispatch({ type: "document/set-glyph-index", index: index, glyph });
          }
        }, (
          h(GlyphSwatch, {
            fontFamily: state.doc.fontFamily,
            glyph,
          })
        ));
      })),
    ]),
  ]);
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function HistoryExplorerPanel({ state, dispatch }) {
  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "history" }),
        "History",
      ]),
      h(SidebarPanelControls, {}, [
        state.history.cursor,
        IconButton({
          name: "undo",
          disabled: !History.canUndo(state.history),
          onClick() {
            if (History.canUndo(state.history)) {
              dispatch({ type: "history/undo" });
            }
          }
        }),
        IconButton({
          name: "redo",
          disabled: !History.canRedo(state.history),
          onClick() {
            if (History.canRedo(state.history)) {
              dispatch({ type: "history/redo" });
            }
          }
        }),
      ]),
    ]),
    h(ScrollView, { maxHeight: 200 }, [
      h(SidebarPanelContent, {}, (
        h(HistoryExplorer, {}, state.history.revisions.map(rev => {
          if (rev.action == null) {
            return null;
          }

          return h(HistoryExplorerItem, {
            future: History.isInFuture(state.history, rev.id),
            onClick() {
              dispatch({ type: "history/select-revision", id: rev.id });
            }
          }, [
            h("small", {}, `#${rev.id}`),
            h(HistoryRevisionPreview, {
              id: rev.id,
              action: rev.action,
              date: rev.timestamp,
            })
          ]);
        }))
      ))
    ])
  ]);
}

/**
 * @param {{ state: App.State, dispatch: App.Dispatch }} props
 */
function DocumentSettingsPanel({ state, dispatch }) {
  return h(SidebarPanel, {}, [
    h(SidebarPanelHeader, {}, [
      h(SidebarPanelTitle, {}, [
        h(Icon, { name: "new" }),
        "Document",
      ]),
    ]),
    h(SidebarPanelContent, {}, [
      h("table", {}, [
        h("tbody", {}, [
          h("tr", {}, [
            h("td", {}, [
              h("label", {
                for: "input-doc-name"
              }, "Name"),
              h(Input, {
                id: "input-doc-name",
                type: "text",
                value: state.doc.name,
                placeholder: "Untitled document",
                onChange(event) {
                  let name = event.target.value;
                  dispatch({ type: "document/set-name", name });
                }
              }),
            ]),
          ]),
          h("tr", {}, [
            h("td", {}, [
              h("label", {
                for: "input-doc-width"
              }, "Width"),
              h(DragNumberInput, {
                id: "input-doc-width",
                type: "number",
                drag: true,
                value: state.doc.width,
                placeholder: 0,
                onChange(event) {
                  let width = parseInt(event.target.value);
                  let height = state.doc.height;
                  dispatch({ type: "document/set-dimensions", width, height });
                }
              }),
            ]),
            h("td", {}, [
              h("label", {
                for: "input-doc-height"
              }, "Height"),
              h(DragNumberInput, {
                id: "input-doc-height",
                type: "number",
                drag: true,
                value: state.doc.height,
                placeholder: "",
                onChange(event) {
                  let height = parseInt(event.target.value);
                  let width = state.doc.width;
                  dispatch({ type: "document/set-dimensions", width, height });
                }
              }),
            ]),
          ]),
          h("tr", {}, [
            h("td", {}, [
              h("label", {
                for: "input-doc-font-family"
              }, "Font Family"),
              h(Input, {
                id: "input-doc-font-family",
                type: "text",
                value: state.doc.fontFamily,
                placeholder: "",
                onChange(event) {
                  let family = event.target.value.trim();
                  let size = state.doc.fontSize;
                  dispatch({ type: "document/set-font", family, size });
                }
              }),
            ]),
            h("td", {}, [
              h("label", {
                for: "input-doc-font-size"
              }, "Font Size"),
              h(DragNumberInput, {
                id: "input-doc-font-size",
                type: "number",
                value: state.doc.fontSize,
                placeholder: state.doc.fontSize,
                min: 0,
                onChange(event) {
                  let size = parseFloat(event.target.value);
                  let family = state.doc.fontFamily;
                  dispatch({ type: "document/set-font", family, size });
                }
              }),
            ]),
          ]),
          h("tr", {}, [
            h("td", {}, [
              h("label", {
                for: "input-doc-cell-width"
              }, "Cell width"),
              h(DragNumberInput, {
                id: "input-doc-cell-width",
                type: "number",
                value: state.doc.cellWidth,
                min: 0,
                placeholder: 0,
                onChange(event) {
                  let width = parseInt(event.target.value);
                  let height = state.doc.cellHeight;
                  dispatch({ type: "document/set-cell-dimensions", width, height });
                }
              }),
            ]),
            h("td", {}, [
              h("label", {
                for: "input-doc-cell-height"
              }, "Cell height"),
              h(DragNumberInput, {
                id: "input-doc-cell-height",
                type: "number",
                value: state.doc.cellHeight,
                min: 0,
                placeholder: 0,
                onChange(event) {
                  let height = parseInt(event.target.value);
                  let width = state.doc.cellWidth;
                  dispatch({ type: "document/set-cell-dimensions", width, height });
                }
              }),
            ]),
          ]),
        ])
      ])
    ])
  ]);
}

export default Editor;
