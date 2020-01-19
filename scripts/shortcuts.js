// Don't process shortcuts if they are triggered whilst one of these
// elements is the target (user is probably trying to type something).
const IGNORED_ELEMENTS = new Set([
  "input",
  "textarea",
  "select",
]);

/**
 * @type App.Shortcut[][]
 */
let shortcutStack = [];

/**
 * @type Set<string | number>
 */
let activeKeys = new Set();

/**
 * @type App.Shortcut[]
 */
let activeShortcuts = [];

function addListeners() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);
}

function removeListeners() {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("blur", handleBlur);
}

/**
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  if (shouldIgnoreEvent(event)) {
    return;
  }

  activeKeys.add(event.key);
  activeKeys.add(event.which);
  if (event.metaKey) activeKeys.add("Meta");

  for (let shortcut of activeShortcuts) {
    if (shortcut.keys.every(key => activeKeys.has(key))) {
      shortcut.callback(event);
      event.preventDefault();
      activeKeys.clear();
      break;
    }
  }
}

/**
 * @param {KeyboardEvent} event
 */
function handleKeyUp(event) {
  if (shouldIgnoreEvent(event)) {
    return;
  }

  activeKeys.delete(event.key);
  activeKeys.delete(event.which);
  if (event.metaKey) activeKeys.delete("Meta");
}

function handleBlur() {
  activeKeys.clear();
}

/**
 * @param {KeyboardEvent} event
 */
function shouldIgnoreEvent(event) {
  // @ts-ignore Doesn't know about tagName?
  let tag = event.target.tagName.toLowerCase();
  return IGNORED_ELEMENTS.has(tag);
}

export function push({ reset = false }) {
  shortcutStack.push(activeShortcuts);

  if (reset) {
    activeShortcuts = [];
  } else {
    activeShortcuts = [...activeShortcuts];
  }
}

export function pop() {
  let shortcuts = shortcutStack.pop() || [];
  activeShortcuts = shortcuts;
}

/**
 * @param {string[]} keys
 * @param {(event: KeyboardEvent) => any} callback
 */
export function on(keys, callback) {
  let shortcut = { keys, callback };

  if (activeShortcuts.length === 0) {
    addListeners();
  }

  activeShortcuts.push(shortcut);

  return shortcut;
}

/**
 * @param {App.Shortcut} shortcut
 */
export function off(shortcut) {
  activeShortcuts = activeShortcuts.filter(other => other !== shortcut);

  if (activeShortcuts.length === 0) {
    removeListeners();
  }
}

/**
 * @param {string[]} keys
 * @param {(event: KeyboardEvent) => any} callback
 */
export function once(keys, callback) {
  let shortcut = on(keys, event => {
    callback(event);
    off(shortcut);
  });
}

export function isKeyDown(key) {
  return activeKeys.has(key);
}
