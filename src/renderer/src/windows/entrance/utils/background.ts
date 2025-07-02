import { handles } from '../../../utils/uiChange'

let backgroundImgSrc: string | undefined
let backgroundImgOpacity: number | undefined

// 创建或获取背景元素
function getOrCreateBackgroundElement(): HTMLDivElement {
  let bgElement = document.getElementById('app-background') as HTMLDivElement
  if (!bgElement) {
    bgElement = document.createElement('div')
    bgElement.id = 'app-background'
    bgElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      pointer-events: none;
    `
    document.body.appendChild(bgElement)
  }
  return bgElement
}

// 清除背景图片
function clearBackground() {
  const bgElement = document.getElementById('app-background')
  if (bgElement) {
    bgElement.remove()
  }
  backgroundImgSrc = undefined
  backgroundImgOpacity = undefined
}

async function setBackground() {
  const newImgSrc = await window.ipcApi.entranceBackgroundFile(undefined)
  const newOpacity = await window.ipcApi.entranceBackgroundImageOpacity(undefined)
  
  if (newImgSrc === undefined) {
    // 清除当前配置的图片
    clearBackground()
  } else {
    // 设置新的背景图片
    const bgElement = getOrCreateBackgroundElement()
    
    // 只有当图片源或不透明度发生变化时才更新
    if (backgroundImgSrc !== newImgSrc || backgroundImgOpacity !== newOpacity) {
      backgroundImgSrc = newImgSrc
      backgroundImgOpacity = newOpacity ?? 1 // 默认不透明度为1
      
      bgElement.style.backgroundImage = `url("${newImgSrc}")`
      bgElement.style.opacity = backgroundImgOpacity.toString()
    }
  }
}
setBackground()

handles.push((key: string, _value: any) => {
  if (key === 'windowBackgroundFileName' || key === 'windowBackgroundImageOpacity') {
    setBackground()
  }
})