import { app, screen } from "electron";
import { BuiltinPluginId } from "./plugins/builtin";
import { pluginManager } from "./plugins/loader";
import { windowManager } from "./plugins/window";
import { AppConfig } from "./config/app";

class FloatButtonManager {
  private posX: number = 0;
  private posY: number = 0;

  private initialMouseX: number = 0;
  private initialMouseY: number = 0;
  private isDragging: boolean = false;

  constructor() {
    if (AppConfig.get('floatWindow', true)) {
      app.whenReady().then(() => {
        this.show();
      })
    }
  }

  private async show() {
    await pluginManager.open(BuiltinPluginId.FLOAT_BUTTON, {
      code: "",
      payload: "",
      from: "menu"
    });
    const pluginWin = this.getPluginWindow()
    if (pluginWin) {
      const window = pluginWin.window;
      if (window) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        this.posX = width - window.getBounds().width - 30;
        this.posY = height - window.getBounds().height - 100;
        window.setPosition(
          this.posX,
          this.posY
        );
      }
    }
  }

  private getPluginWindow() {
    return windowManager.getWindow(BuiltinPluginId.FLOAT_BUTTON)
  }

  private hide() {
    windowManager.remove(BuiltinPluginId.FLOAT_BUTTON);
  }

  toggle() {
    if (this.getPluginWindow()) {
      AppConfig.set('floatWindow', false);
      this.hide();
    } else {
      AppConfig.set('floatWindow', true);
      this.show();
    }
  }
  /**
   * 鼠标按下事件处理
   * 记录按下时间和初始位置，用于后续判断点击还是拖拽
   */
  onMouseDown() {
    const cursorPosition = screen.getCursorScreenPoint();
    this.initialMouseX = cursorPosition.x;
    this.initialMouseY = cursorPosition.y;
    this.isDragging = false;
  }

  /**
   * 鼠标移动事件处理
   * 检测是否为拖拽操作，如果是则实时更新窗口位置
   */
  onMouseMove() {
    const { newX, newY, deltaX, deltaY } = this.calculateNewPos();
    // 如果移动距离超过5像素，认为是拖拽操作
    if (deltaX > 5 || deltaY > 5 || this.isDragging) {
      this.isDragging = true;
      this.updatePosition(newX, newY);
    }
  }

  private calculateNewPos() {
    const cursorPosition = screen.getCursorScreenPoint();
    const deltaX = Math.abs(cursorPosition.x - this.initialMouseX);
    const deltaY = Math.abs(cursorPosition.y - this.initialMouseY);
    const newX = cursorPosition.x - this.initialMouseX + this.posX;
    const newY = cursorPosition.y - this.initialMouseY + this.posY;
    return { newX, newY, deltaX, deltaY };
  }

  private updatePosition(newX: number, newY: number) {
    // 更新悬浮球窗口位置
    const pluginWin = this.getPluginWindow();
    if (pluginWin && pluginWin.window) {
      const window = pluginWin.window;
      const bounds = window.getBounds();
      // 确保窗口不会移出屏幕边界
      const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
      const clampedX = Math.max(0, Math.min(newX, screenWidth - bounds.width));
      const clampedY = Math.max(0, Math.min(newY, screenHeight - bounds.height));

      window.setPosition(clampedX, clampedY);
    }
  }

  /**
   * 鼠标抬起事件处理
   * 根据时间间隔和是否拖拽来判断用户意图（点击或拖拽）
   */
  onMouseUp() {
    const { newX, newY, deltaX, deltaY } = this.calculateNewPos();
    if (!this.isDragging) {
      this.onClick();
    } else {
      this.updatePosition(newX, newY);
      this.posX = newX;
      this.posY = newY;
    }
    this.isDragging = false;
  }

  private onClick() {
    pluginManager.open(BuiltinPluginId.ENTRANCE, {
      code: "",
      payload: "",
      from: "menu"
    })
  }
}

export const floatButtonManager = new FloatButtonManager();