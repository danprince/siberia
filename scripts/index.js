// @ts-ignore
import { h, render } from "./modules/preact.js";
import App from "./app.js";
import { SlotAndFillProvider } from "./components.js";

function Providers({ children }) {
  return h(SlotAndFillProvider, {}, children);
}

render(
  h(Providers, {},
    h(App)
  ),
  document.body
);
