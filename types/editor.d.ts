declare namespace Editor {
  export type Doc = {
    id: string,
    name: string,
    width: number,
    height: number,
    scenes: Scene[],
    colors: string[],
    glyphs: string[],
    fontFamily: string,
    fontSize: number,
    cellWidth: number,
    cellHeight: number,
    backgroundColor: string,
  }

  export type Scene = {
    id: string,
    name: string,
    nodes: Node[],
  }

  export type Node = {
    id: string,
    name: string,
    visible: boolean,
    translate: Vector,
    cells: Cell[],
  }

  export type Cell = {
    glyph: number,
    color: number,
    x: number,
    y: number,
  }

  export type Vector = {
    x: number,
    y: number,
  }
}
