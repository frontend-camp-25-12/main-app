const fs = require('fs');

window.alert('插件的 preload 被加载')

const currentDir = __dirname;
fs.readdir(currentDir, (err, files) => {
  window.alert('当前目录文件:\n' + files.join('\n'));
});