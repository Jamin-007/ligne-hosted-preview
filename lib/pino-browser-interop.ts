// pino 7 publishes its browser entry as CommonJS. WalletConnect consumes it
// as ESM and expects both a default export and the named `levels` property.
// Vite pre-bundles this exact subpath; this facade supplies the missing named
// export without changing WalletConnect's runtime behaviour.
// @ts-expect-error pino 7 does not publish types for its browser subpath.
import pinoBrowser from "pino/browser.js";

export const levels = pinoBrowser.levels;
export default pinoBrowser;
