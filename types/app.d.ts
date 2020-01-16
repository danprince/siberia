declare namespace App {
  export type State = {
    doc: Editor.Doc
    history: History,
    currentToolId: string,
    currentSceneId: string,
    currentNodeId: string,
    currentGlyph: number,
    currentColor: number,
    cursor: { x: number, y: number }
    selection: { x0: number, y0: number, x1: number, y1: number }
  };

  export type Action =
    | { type: "workspace/new", state: State }
    | { type: "workspace/load", state: State }
    | { type: "workspace/select-tool", toolId: string }
    | { type: "workspace/select-color", colorIndex: number }
    | { type: "workspace/select-glyph", glyphIndex: number }
    | { type: "workspace/select-scene", sceneId: string }
    | { type: "workspace/select-node", nodeId: string }
    | { type: "workspace/set-cursor", x: number, y: number }
    | { type: "workspace/set-selection", selection: Selection }
    | { type: "workspace/clear-selection" }
    | { type: "document/set-name", name: string }
    | { type: "document/set-font", family: string, size: number }
    | { type: "document/set-dimensions", width: number, height: number }
    | { type: "document/set-cell-dimensions", width: number, height: number }
    | { type: "document/set-glyph-index", index: number, glyph: string }
    | { type: "document/set-color-index", index: number, color: string }
    | { type: "scene/add", scene: Editor.Scene }
    | { type: "scene/delete", sceneId: string }
    | { type: "scene/rename", sceneId: string, name: string }
    | { type: "node/add", sceneId: string, node: Editor.Node }
    | { type: "node/delete", sceneId: string, nodeId: string }
    | { type: "node/rename", sceneId: string, nodeId: string, name: string }
    | { type: "node/clear-cell", sceneId: string, nodeId: string, x: number, y: number }
    | { type: "node/set-cell", sceneId: string, nodeId: string, x: number, y: number, glyph: number, color: number }
    | { type: "node/set-visibility", sceneId: string, nodeId: string, visible: boolean, exclusive: boolean }
    | { type: "node/set-translation", sceneId: string, nodeId: string, x: number, y: number }
    | { type: "history/undo" }
    | { type: "history/redo" }
    | { type: "history/select-revision", id: number }

  export type History = {
    cursor: number,
    revisions: Revision[],
  };

  export type Revision = {
    id: number,
    timestamp: number,
    doc: Editor.Doc,
    action: Action | null,
    actions: Action[],
  }

  export type Reducer = Utils.Reducer<State, Action>;

  export type Dispatch = Utils.Dispatch<Action | Action[]>;

  export type ToolProps = {
    state: State,
    dispatch: Dispatch,
    renderer: Renderer,
  }

  export interface Tool {
    title: string,
    icon: string,
    shortcut: string[],
    reducer: Reducer,
    (props: ToolProps): any
  }

  export type Shortcut = {
    keys: string[],
    callback(event: KeyboardEvent): any,
  }

  export type Renderer = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    listeners: any[],
    width: number,
    height: number,
    resolution: number,
  }

  export type RendererEvent =
    | { type: "before-cells" }
    | { type: "after-cells" }
    | { type: "before-grid" }
    | { type: "after-grid" }
    | { type: "before-selection" }
    | { type: "after-selection" }
    | { type: "cursor/click", x: number, y: number }
    | { type: "cursor/move", x: number, y: number }
    | { type: "cursor/exit" }
    | { type: "cursor/enter" }
    | { type: "cursor/up", x: number, y: number }
    | { type: "cursor/down", x: number, y: number }

  export type Selection = {
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  }
}
