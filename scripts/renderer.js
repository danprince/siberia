/**
 * @return {App.Renderer}
 */
export function create() {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let listeners = [];
  let resolution = window.devicePixelRatio;
  return { canvas, ctx, listeners, width: 0, height: 0, resolution };
}

/**
 * @param {App.Renderer} renderer
 * @param {(event: App.RendererEvent) => void} callback
 * @return {() => void}
 */
export function on(renderer, callback) {
  renderer.listeners.push(callback);
  return () => off(renderer, callback);
}

/**
 * @param {App.Renderer} renderer
 * @param {(event: App.RendererEvent) => void} callback
 */
export function off(renderer, callback) {
  renderer.listeners = renderer.listeners.filter(other => other !== callback);
}

/**
 * @param {App.Renderer} renderer
 * @param {App.RendererEvent} event
 */
export function emit(renderer, event) {
  for (let listener of renderer.listeners) {
    listener(event);
  }
}

/**
 * @param {App.Renderer} renderer
 */
export function clear({ ctx, canvas }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * @param {App.Renderer} renderer
 * @param {number} width
 * @param {number} height
 */
export function resize(renderer, width, height) {
  let { canvas, ctx, resolution } = renderer;

  canvas.width = width * resolution;
  canvas.height = height * resolution;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  renderer.width = width;
  renderer.height = height;

  ctx.scale(resolution, resolution);
}

/**
 * @param {App.Renderer} renderer
 */
export function drawGrid({ ctx, width, height }, {
  cellWidth = 10,
  cellHeight = 10,
  color = "white",
  lineWidth = 1,
  opacity = 1,
}) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = opacity;

  let rows = Math.ceil(height / cellHeight);
  let cols = Math.ceil(width / cellWidth);

  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(x * cellWidth, 0);
    ctx.lineTo(x * cellWidth, height);
  }

  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * cellHeight);
    ctx.lineTo(width, y * cellHeight);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * @param {App.Renderer} renderer
 */
export function drawSelection({ ctx }, {
  x,
  y,
  width,
  height,
  color = "white",
  opacity = 1,
  lineWidth = 3,
}) {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}
