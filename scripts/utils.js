export function uid() {
  return Math.random().toString(36).slice(2);
}

/**
 * @param {{ [className: string]: any }} object
 */
export function classes(object) {
  return Object
    .keys(object)
    .filter(key => object[key])
    .join(" ");
}

/**
 * @param {((x: any) => any)[]} fns
 * @return {(x: any) => any}
 *
 * Doesn't seem possible to get a sane type for this with JSDoc and
 * ambient type files.
 */
export function compose(...fns) {
  return val => fns.reduce((val, fn) => fn(val), val);
}

/**
 * @param {string} hex
 * @return {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  let hexR = "";
  let hexG = "";
  let hexB = "";

  if (hex[0] === "#") {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hexR = hex[0] + hex[0];
    hexG = hex[1] + hex[1];
    hexB = hex[2] + hex[2];
  } else if (hex.length === 6) {
    hexR = hex.slice(0, 2);
    hexG = hex.slice(2, 4);
    hexB = hex.slice(4, 6);
  } else {
    throw new Error(`Could not parse hex code`);
  }

  let r = parseInt(hexR, 16);
  let g = parseInt(hexG, 16);
  let b = parseInt(hexB, 16);

  return { r, g, b };
}

/**
 * @param {string} hex
 * @return {boolean}
 */
export function isBrightColor(hex) {
  let { r, g, b } = hexToRgb(hex);
  return (r + g + b) > 400;
}

/**
 * @template {App.State} State
 * @template {App.Action} Action
 * @param {{ [K in keyof State]?: Utils.Reducer<State[K], Action> }} reducerMap
 * @return {Utils.Reducer<State, Action>}
 */
export function combineReducers(reducerMap) {
  return function combinedReducer(state, action) {
    for (let key in reducerMap) {
      let reducer = reducerMap[key];
      let prevState = state[key];
      // @ts-ignore
      let newState = reducer(prevState, action);

      if (newState !== prevState) {
        state = { ...state, [key]: newState };
      }
    }

    return state;
  }
}

/**
 * @template State
 * @template {{ type: string }} Action
 * @param {{ quiet?: RegExp, ignore?: RegExp }} options
 * @return {(reducer: Utils.Reducer<State, Action>) => Utils.Reducer<State, Action>}
 */
export function withLogReducer(options = {}) {
  return function(reducer) {
    return function logReducer(state, action) {
      let ignored = options.ignore && options.ignore.test(action.type);

      if (!ignored) {
        console.groupCollapsed(`%caction %c${action.type}`, "color: grey", "color: black");
        console.log("%cprev state", "color: grey", state);
        console.log("%caction    ", "color: blue", action);
      }

      try {
        state = reducer(state, action);
      } catch (err) {
        throw err;
      } finally {
        if (!ignored) {
          console.log("%cnew state ", "color: green", state);
          console.groupEnd();
        }
      }

      return state;
    }
  }
}

/**
 * @template State
 * @template Action
 * @param {Utils.Reducer<State, Action>} reducer
 * @return {Utils.Reducer<State, Action | Action[]>}
 *
 * Allows the reducer to accept arrays of actions as well as single
 * actions.
 */
export function withBatchReducer(reducer) {
  return function batchReducer(state, actionOrActions) {
    if (Array.isArray(actionOrActions)) {
      return actionOrActions.reduce(reducer, state);
    } else {
      return reducer(state, actionOrActions);
    }
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} centerX
 * @param {number} centerY
 * @param {boolean} horizontal
 * @param {boolean} vertical
 * @return {{ x: number, y: number }[]}
 */
export function reflect(
  x = 0,
  y = 0,
  centerX = 0,
  centerY = 0,
  horizontal = false,
  vertical = false
) {
  let dx = centerX - x;
  let dy = centerY - y;

  let x0 = centerX + dx;
  let x1 = centerX - dx;
  let y0 = centerY + dy;
  let y1 = centerY - dy;

  if (horizontal && vertical) {
    return [
      { x: x0, y: y1 },
      { x: x0, y: y0 },
      { x: x1, y: y1 },
      { x: x1, y: y0 },
    ];
  }

  if (horizontal) {
    return [
      { x: x0, y: y1 },
      { x: x1, y: y1 },
    ];
  }

  if (vertical) {
    return [
      { x: x1, y: y0 },
      { x: x1, y: y1 },
    ];
  }

  return [{ x, y }];
}
