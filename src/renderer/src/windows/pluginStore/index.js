// button.addEventListener("click", async (e) => {
//   await window.electron.ipcRenderer.invoke(IpcChannel.PluginUpload);
// });

const fileInput = document.getElementById('pluginFile')
const file = fileInput.files[0]

if (!file) {
  alert('请选择文件')
  return
}

const formData = new FormData()
formData.append('plugin', file)

try {
  const response = await fetch('http://localhost:3000/plugin', {
    method: 'POST',
    body: formData
  })

  const result = await response.json()

  if (response.ok) {
    console.log('上传成功:', result)
    alert(`文件 ${result.originalname} 上传成功`)
  } else {
    throw new Error(result.error || '上传失败')
  }
} catch (error) {
  console.error('上传错误:', error)
  alert('上传失败: ' + error.message)
}
