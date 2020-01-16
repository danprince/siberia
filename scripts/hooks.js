// @ts-ignore
import { useEffect } from "./modules/preact.js";
import * as Shortcuts from "./shortcuts.js";
import * as Renderer from "./renderer.js";

/**
 * @param {App.Shortcut["keys"]} keys
 * @param {App.Shortcut["callback"]} callback
 * @param {any[]} deps
 */
export function useShortcut(keys, callback, deps = []) {
  useEffect(() => {
    let shortcut = Shortcuts.on(keys, callback);
    return () => Shortcuts.off(shortcut);
  }, [keys, callback, ...deps]);
}

/**
 * @template {App.RendererEvent} Event
 * @param {App.Renderer} renderer
 * @param {Event["type"]} type
 * @param {(event: any) => any} callback
 * @param {any[]} deps
 *
 * TODO: Figure out how to extract the correct event type, given the
 * event name.
 */
export function useRendererEvent(renderer, type, callback, deps = []) {
  useEffect(() => {
    return Renderer.on(renderer, event => {
      if (event.type === type) {
        // @ts-ignore
        callback(event);
      }
    });
  }, [renderer, callback, ...deps]);
}

/**
 * @param {(event: Event) => any} callback
 * @param {any[]} deps
 */
export function useBeforeUnload(callback, deps = []) {
  useEffect(() => {
    window.addEventListener("beforeunload", callback);
    return () => window.removeEventListener("beforeunload", callback);
  }, [callback, ...deps]);
}
