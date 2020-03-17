# Siberia
ASCII image editor built on the Trans-Siberian railway. Don't know if I'll ever continue with this project, but it's a good example of a moderately complex typed web app that "just works" in the browser without any tools (no bundlers, compilers etc).

![Imgur](https://i.imgur.com/kqdFskP.png)

## Features
* Hierarchy: Document > Scenes > Nodes
* Undo history
* Indexed glyphs/colors
* Persistence

## Roadmap
### Big
- [ ] Animation
- [ ] Node libraries
- [ ] Copy and paste
- [ ] Grouping

### Medium
- [ ] Exports
- [ ] Selection
- [ ] Save + load
- [ ] Router support
- [ ] Node cloning
- [ ] Move tool
- [ ] Color picker
- [ ] Shape tool
- [ ] Brush picker
- [ ] Persistent editor settings (view, tools, etc)
- [ ] Palette library
- [ ] Contextual actions (flip node, etc)
- [ ] Node format / cell index
- [ ] Shift click line drawing
- [ ] Selecting multiple layers
- [ ] Layer flattening

### Small
- [ ] Fill
- [ ] Toast notifications
- [ ] Prompts
- [ ] Design a better default palette
- [ ] Node locking
- [ ] Allow the cursor to move out of the canvas
- [ ] After creating a selection, move content inside selection on current node into a temporary node.

### Blemishes
- [ ] Dropdown menus glitch
- [ ] Tooltip alignment
- [ ] Sidebar can grow beyond page
- [ ] No picker for color/brush yet
- [ ] Poor styling on settings forms
- [ ] Revision styles
- [x] Triangle on glyph palette

### Bugs
- [ ] Eyedropper picks the first cell (not the top cell)
- [ ] Eyedropper is node specific
- [ ] Symmetry is broken if node is translated
- [ ] Move tool can't move contents of selection

### Sanity
- [x] Using workspace to mean App.State and { state: App.State, dispatch: App.Dispatch }
- [ ] Separate renderer hooks from events
