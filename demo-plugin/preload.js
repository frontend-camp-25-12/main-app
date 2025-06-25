const fs = require('fs');

window.alert('插件的 preload 被加载')

const currentDir = __dirname;
fs.readdir(currentDir, (err, files) => {
  window.alert('当前目录文件:\n' + files.join('\n'));
});

window.platform.hello('world')
window.platform.onPluginEnter((action) => {
  window.alert('插件进入事件触发: ' + JSON.stringify(action));
});
                      // 嵌套的配置路径是允许的，将会生成类似{ "hello": { "world": "!!!" } }
window.platform.configSet('hello.world', '!!!!').then(async () => {
  alert('配置项 hello.world 设置为: ' + await window.platform.configGet('hello.world', 'default')); // 请确保给出default值
});