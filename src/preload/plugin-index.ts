import { platform } from "./generated/ipc-api-plugin";

// @ts-ignore
window.platform = platform;

function parse(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find(arg => arg.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const pluginId = parse("plugin-id");
const pluginPreloadPath = parse("plugin-preload");

console.log(`Plugin Preload Path: ${pluginPreloadPath}, Plugin ID: ${pluginId}`);

if (pluginPreloadPath) {
  require(pluginPreloadPath);
} else {
  console.error('No plugin preload path specified.');
}
