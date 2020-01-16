// @ts-ignore
import { h, render, createContext, useReducer, useState, useRef, useEffect, useContext } from "./modules/preact.js";
import { classes } from "./utils.js";
import Icons from "./icons.js";

// --- App Components ---

export function AppContainer(props) {
  return h("div", { class: "app-container" }, props.children);
}

export function AppView(props) {
  return h("div", { class: "app-view" }, props.children);
}

export function AppSidebar(props) {
  return h("div", { class: "app-sidebar" }, props.children);
}

export function AppWorkspace(props) {
  return h("div", { class: "app-workspace" }, props.children);
}

// --- Toolbars ---

export function Toolbar(props) {
  return h("div", { class: "toolbar" }, props.children);
}

export function ToolbarItem({ children, selected, onClick }) {
  return h("div", {
    class: classes({
      "toolbar-item": true,
      "toolbar-item-selected": selected,
    }),
    onClick
  }, children);
}

export function ToolbarButton({ children, onClick }) {
  return h("button", { class: "toolbar-button toolbar-item", onClick }, children);
}

export function ToolbarDivider(props) {
  return h("div", { class: "toolbar-divider" });
}

export function ToolbarMenu(props) {
  return h(ContextMenuTrigger, { menu: props.menu }, (
    h(ToolbarButton, {}, props.children)
  ));
}

// --- Sidebar ---

export function SidebarPanel(props) {
  return h("div", { class: "sidebar-panel" }, props.children);
}

export function SidebarPanelHeader(props) {
  return h("header", { class: "sidebar-panel-header" }, props.children);
}

export function SidebarPanelContent(props) {
  return h("div", { class: "sidebar-panel-content" }, props.children);
}

export function SidebarPanelTitle(props) {
  return h("div", { class: "sidebar-panel-title" }, props.children);
}

export function SidebarPanelControls(props) {
  return h("div", { class: "sidebar-panel-controls" }, props.children);
}

// --- Palette ---

export function Palette(props) {
  return h("div", { class: "palette" }, props.children);
}

export function PaletteSwatch({
  selected,
  inverted,
  children,
  triangle,
  ...props
}) {
  return h("div", {
    class: classes({
      "palette-swatch": true,
      "palette-swatch-selected": selected,
      "palette-swatch-inverted": inverted,
      "palette-swatch-triangle": triangle,
    }),
    ...props
  }, children);
}

export function ColorSwatch(props) {
  return h("div", {
    class: "color-swatch",
    style: {
      background: props.color
    }
  });
}

export function GlyphSwatch(props) {
  return h("div", {
    class: "glyph-swatch",
    style: {
      fontFamily: props.fontFamily,
    },
    onClick: props.onClick,
  }, props.glyph);
}

// --- Scene Explorer ---

export function SceneExplorer(props) {
  return h("div", { class: "scene-list" }, props.children);
}

export function SceneExplorerItem(props) {
  return h("a", {
    id: props.id,
    class: classes({
      "scene-explorer-item": true,
      "scene-explorer-item-selected": props.selected
    }),
    onClick: props.onClick,
  }, props.children);
}

export function SceneExplorerStats(props) {
  return h("div", {
    class: "scene-explorer-stats"
  }, props.children);
}

// --- Inline Editor ---

export function InlineEditor(props) {
  let [isEditing, setIsEditing] = useState(false);
  let inputRef = useRef();

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
      inputRef.current.select(0, 100);
    }
  }, [isEditing]);

  return h("div", {
    class: "inline-editor-container",
    onClick(event) {
      if (!props.locked) {
        setIsEditing(true);
      }
    }
  }, (
    h("input", {
      ref: inputRef,
      as: "input",
      type: "text",
      class: classes({
        "inline-editor": true,
        "inline-editor-locked": props.locked,
      }),
      value: props.value,
      disabled: !isEditing,
      onBlur(event) {
        props.onSubmit(event.target.value);
        setIsEditing(false);
      },
      onKeyDown(event) {
        if (event.key === "Enter") {
          event.target.blur();
        }
      },
      ...props,
    })
  ));
}

// --- Button ---

export function Button(props) {
  return h("button", {
    class: "button",
    onClick: props.onClick,
  }, props.children);
}

// --- Floating ---

export function Floating({ align, children }) {
  return h("div", {
    class: `floating floating-align-${align}`
  }, children);
}

// --- Panel ---

export function Panel(props) {
  return h("div", {
    class: "panel",
  }, props.children);
}

// --- History Explorer ---

export function HistoryExplorer({ children }) {
  return h("div", { class: "history-explorer" }, children);
}

export function HistoryExplorerItem({ future, children, onClick }) {
  return h("div", {
    class: classes({
      "history-explorer-item": true,
      "history-explorer-item-future": future,
    }),
    onClick,
  }, children);
}

export function HistoryRevisionPreview({ id, action }) {
  return action ? action.type : null;
}

// --- Node Explorer ---

export function NodeExplorer({ children }) {
  return h("div", { class: "node-explorer" }, children);
}

export function NodeExplorerItem({ id, children }) {
  return h("div", { class: "node-explorer-item", id }, children);
}

// --- Link ---

export function Link({ to, children, ...props }) {
  function onClick() {
    history.pushState({}, "", to);
  }

  return h("a", { onClick, ...props }, children);
}

// --- Icon ---

export function Icon({ name }) {
  let path = Icons[name];

  return h("svg", {
    class: "icon",
    xmlns: "http://www.w3.org/2000/svg",
    fillRule: "evenodd",
    clipRule: "evenodd",
    viewBox: "0 0 24 24",
    "data-name": name,
  }, (
    h("path", { d: path })
  ));
}

export function IconButton({ name, ...props }) {
  return h("button", {
    class: "icon-button",
    ...props,
  }, (
    h(Icon, { name })
  ));
}

export function IconToggle({ name, value, ...props }) {
  return h("button", {
    class: classes({
      "icon-toggle": true,
      "icon-toggle-on": value,
      "icon-toggle-off": !value,
    }),
    ...props,
  }, (
    h(Icon, { name })
  ));
}

// --- Context Menu ---

export function ContextMenu(props) {
  return h("div", {
    class: "context-menu"
  }, props.children);
}

export function ContextMenuItem(props) {
  return h("button", {
    disabled: props.disabled,
    class: classes({
      "context-menu-item": true,
      "context-menu-item-selected": props.selected,
    }),
    onClick: props.onClick,
  }, props.children);
}

export function ContextMenuTrigger(props) {
  let [isMenuVisible, setMenuVisible] = useState(false);
  let triggerElementRef = useRef();

  function showMenu() {
    setMenuVisible(true);
  }

  function hideMenu() {
    setMenuVisible(false);
  }

  return h("div", {
    class: "context-menu-trigger",
    ref: triggerElementRef,
    onMouseEnter: showMenu,
    onMouseLeave: hideMenu,
  }, [
    props.children,
    isMenuVisible && (
      h(Portal, {}, (
        h(Anchor, {
          element: triggerElementRef.current,
          align: "bottom-left",
          onClick: hideMenu,
          onMouseEnter: showMenu,
          onMouseLeave: hideMenu,
        }, props.menu)
      ))
    )
  ]);
}


// --- Portal ---

export function Portal(props) {
  let elementRef = useRef();

  useEffect(() => {
    elementRef.current = document.createElement("div");
    document.body.appendChild(elementRef.current);
    render(props.children, elementRef.current);

    return () => {
      document.body.removeChild(elementRef.current);
    }
  }, []);

  return null;
}


// --- Selectable List ---

export function SelectableList(props) {
  return h("ul", { class: "selectable-list" }, props.children);
}

export function SelectableListItem({ selected, ...props }) {
  return h("li", {
    ...props,
    class: classes({
      "selectable-list-item": true,
      "selectable-list-item-selected": selected,
    }),
  }, props.children);
}

// --- Overlay ---

export function Overlay(props) {
  return h(Portal, {}, h("div", {
    class: "overlay",
    ...props
  }));
}

// --- Window ---

export function Window(props) {
  return h("div", {
    class: "window",
    ...props,
  });
}

export function WindowTitle(props) {
  return h("div", {
    class: "window-title",
    ...props,
  });
}

export function WindowTitleBar(props) {
  return h("div", {
    class: "window-title-bar",
    ...props,
  });
}

export function WindowTitleBarControls(props) {
  return h("div", {
    class: "window-title-bar-controls",
    ...props,
  });
}

export function WindowContent(props) {
  return h("div", {
    class: "window-content",
    ...props,
  });
}

// --- Input ---

export function Input({ as="input", ...props }) {
  return h(as, {
    class: "input",
    ...props
  });
}

export function DragNumberInput({
  dragStep = 10,
  dragIncrement = 1,
  ...props
}) {
  let inputRef = useRef();

  useEffect(() => {
    let input = inputRef.current;
    let dragStartX = null;
    let initialValue = 0;

    function onMouseDown(event) {
      initialValue = Number(input.value);
      dragStartX = event.clientX;
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
    }

    function onMouseUp() {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    }

    function onMouseMove(event) {
      let deltaX = event.clientX - dragStartX;
      let steps = Math.round(deltaX / dragStep);
      let value = initialValue + steps * dragIncrement;
      setInputValue(value);
    }

    function setInputValue(value) {
      if (typeof props.min === "number") {
        value = Math.max(value, props.min);
      }

      if (typeof props.max === "number") {
        value = Math.min(value, props.max);
      }

      input.value = value;

      // FIXME: Hack to make sure dragging triggers a change event.
      props.onChange({ target: input });
    }

    input.addEventListener("mousedown", onMouseDown);

    return () => {
      input.removeEventListener("mousedown", onMouseDown)
    }
  }, [inputRef.current]);

  return h("input", {
    ref: inputRef,
    type: "number",
    class: "input drag-number-input",
    ...props
  });
}

// --- Color Picker ---

// TODO: Finish building this
// TODO: Use HSV (like aseprite) for more natural distribution
// TODO: Track mouse drags
// TODO: Need tools for converting between color types

export function ColorPicker() {
  let [hue, setHue] = useState(0);
  let [saturation, setSaturation] = useState(0);
  let [lightness, setLightness] = useState(0);
  let [alpha, setAlpha] = useState(0);
  let saturationLightnessCanvasRef = useRef();
  let hueCanvasRef = useRef();
  let alphaCanvasRef = useRef();

  function drawCursor(ctx, x, y, color = "black") {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2, false);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }

  useEffect(() => {
    let canvas = saturationLightnessCanvasRef.current;
    let ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        let s = x / canvas.width;
        let l = 1 - y / canvas.height;
        ctx.fillStyle = `hsl(${hue * 360}, ${s * 100}%, ${l * 100}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    let x = saturation * canvas.width;
    let y = lightness * canvas.height;
    drawCursor(ctx, x, y);
  }, [hue, saturation, lightness]);

  useEffect(() => {
    let canvas = hueCanvasRef.current;
    let ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    for (let x = 0; x < canvas.width; x++) {
      let h = x / canvas.width;
      ctx.fillStyle = `hsl(${h * 360}, 100%, 50%)`;
      ctx.fillRect(x, 0, 1, canvas.height);
    }

    let x = hue * canvas.width;
    let y = canvas.height / 2;
    drawCursor(ctx, x, y);
  }, [hue]);

  useEffect(() => {
    let canvas = alphaCanvasRef.current;
    let ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let step = 20;
    let bg1 = "grey";
    let bg2 = "darkgrey";

    for (let x = 0; x < canvas.width; x += step) {
      let [f1, f2] = (x / step) % 2 ? [bg1, bg2] : [bg2, bg1];
      ctx.fillStyle = f1;
      ctx.fillRect(x, 0, step, canvas.height / 2);
      ctx.fillStyle = f2;
      ctx.fillRect(x, canvas.height / 2, step, canvas.height / 2);
    }

    for (let x = 0; x < canvas.width; x++) {
      let a = x / canvas.width;
      ctx.fillStyle = `hsla(${hue * 360}, ${saturation * 100}%, ${lightness * 100}%, ${a})`;
      ctx.fillRect(x, 0, 1, canvas.height);
    }

    let x = alpha * canvas.width;
    let y = canvas.height / 2;
    drawCursor(ctx, x, y);
  }, [hue, saturation, lightness, alpha]);

  return h("div", {
    class: "color-picker",
  }, [
    h("canvas", {
      ref: saturationLightnessCanvasRef,
      class: "color-picker-sl",
      onMouseDown(event) {
        let { left, top } = event.target.getBoundingClientRect();
        let { clientX, clientY } = event;
        let x = clientX - left;
        let y = clientY - top;
        setSaturation(x / event.target.width);
        setLightness(y / event.target.height);
      }
    }),
    h("canvas", {
      ref: hueCanvasRef,
      class: "color-picker-h",
      onMouseDown(event) {
        let { left } = event.target.getBoundingClientRect();
        let { clientX } = event;
        let x = clientX - left;
        setHue(x / event.target.width);
      }
    }),
    h("canvas", {
      ref: alphaCanvasRef,
      class: "color-picker-a",
      onMouseDown(event) {
        let { left } = event.target.getBoundingClientRect();
        let { clientX } = event;
        let x = clientX - left;
        setAlpha(x / event.target.width);
      }
    }),
  ]);
}

// --- Scroll View ---

export function ScrollView({ height, minHeight, maxHeight, children, ...props }) {
  let [state, dispatch] = useReducer(scrollReducer, {
    canScroll: false,
    scrolledToTop: false,
    scrolledToBottom: false,
  });

  /**
   * @param {HTMLElement} element
   */
  function scrollReducer(_, element) {
    let { scrollTop, scrollHeight, clientHeight } = element;
    let canScroll = scrollHeight > clientHeight;
    let scrolledToTop = scrollTop === 0;
    let scrolledToBottom = scrollTop + clientHeight === scrollHeight;
    return { canScroll, scrolledToTop, scrolledToBottom };
  }

  return h("div", {
    class: "scroll-view-container",
  }, [
    h("div", {
      ref: dispatch,
      class: classes({
        "scroll-view": true,
        "scroll-view-can-scroll": state.canScroll,
        "scroll-view-at-top": state.scrolledToTop,
        "scroll-view-at-bottom": state.scrolledToBottom,
      }),
      style: {
        maxHeight,
        minHeight,
        height,
      },
      onScroll: event => dispatch(event.target),
    }, children)
  ])
}

// --- Slot and Fill ---

let SlotAndFillContext = createContext({});

export function SlotAndFillProvider({ children }) {
  // It might seem awkward but the distinction between using a ref and
  // state here is important.
  //
  // When the `Fill` component receives new children (every render) it
  // will call up to this provider. If mount/unmount causes this component
  // to re-render, then we get the app into an infinite loop.
  //
  // Using the pub/sub model we can avoid this component ever needing
  // to re-render.

  let slotsRef = useRef({});
  let subscribersRef = useRef([]);

  function mount(name, children) {
    slotsRef.current[name] = children;
    publish(slotsRef.current);
  }

  function unmount(name) {
    delete slotsRef.current[name];
    publish(slotsRef.current);
  }

  function subscribe(callback) {
    subscribersRef.current.push(callback);
    return () => unsubscribe(callback);
  }

  function unsubscribe(callback) {
    subscribersRef.current = subscribersRef.current.filter(sub => sub !== callback);
  }

  function publish(slots) {
    for (let subscriber of subscribersRef.current) {
      subscriber(slots);
    }
  }

  let context = { mount, unmount, subscribe, unsubscribe };

  return h(SlotAndFillContext.Provider, { value: context }, children);
}

export function Slot({ name, children: defaultChildren }) {
  let [children, setChildren] = useState(null);
  let { subscribe } = useContext(SlotAndFillContext);

  useEffect(() => {
    return subscribe(slots => setChildren(slots[name]));
  }, [name, subscribe, setChildren]);

  return children || defaultChildren;
}

export function Fill({ name, children }) {
  let { mount, unmount } = useContext(SlotAndFillContext);

  useEffect(() => {
    mount(name, children);
    return () => unmount(name);
  }, [name, children]);

  return null;
}

// --- Tooltip ---

export function Tooltip({ children }) {
  return h("div", { class: "tooltip" }, children);
}

export function TooltipTrigger({ tip, children }) {
  return h(Trigger, {
    render() {
      return h(Tooltip, {}, tip);
    },
  }, children);
}

// --- Anchor + Trigger ---

export function Anchor({
  element,
  align = "bottom-left",
  children,
  ...props
}) {
  let { left, top } = element.getBoundingClientRect();
  let { offsetWidth, offsetHeight } = element;

  let x = left;
  let y = top;

  switch (align) {
    case "top-left":
      break;
    case "top-right":
      x += offsetWidth;
      break;
    case "bottom-left":
      y += offsetHeight;
      break;
    case "bottom-right":
      x += offsetWidth;
      y += offsetHeight;
      break;
  }

  x = Math.max(0, x);
  y = Math.max(0, y);
  x = Math.min(x, window.innerWidth - offsetWidth);
  y = Math.min(y, window.innerHeight - offsetHeight);

  return h("div", {
    class: "anchor",
    style: {
      top: y,
      left: x,
    },
    ...props,
  }, children);
}

export function Trigger({ children, render, anchor }) {
  let triggerElementRef = useRef();
  let [visible, setVisible] = useState(false);

  return h("div", {
    class: "trigger",
    ref: triggerElementRef,
    onMouseEnter() {
      setVisible(true);
    },
    onMouseLeave() {
      setVisible(false);
    }
  }, [
    ...children,
    visible && h(Portal, {}, [
      h(Anchor, {
        element: triggerElementRef.current,
        align: anchor,
      }, render())
    ])
  ]);
}
