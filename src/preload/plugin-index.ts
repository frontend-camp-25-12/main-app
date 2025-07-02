import { PlatformApi } from "./generated/ipc-api-plugin";

function parse(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find(arg => arg.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const pluginId = parse("plugin-id");
const pluginPreloadPath = parse("plugin-preload");

// @ts-ignore
window.platform = new PlatformApi(pluginId);

console.log(`Plugin Preload Path: ${pluginPreloadPath}, Plugin ID: ${pluginId}`);

if (pluginPreloadPath) {
  console.log(`Loading plugin preload script from: ${pluginPreloadPath}`);
  require(pluginPreloadPath);
} else {
  console.error('No plugin preload path specified.');
}
