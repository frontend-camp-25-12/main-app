let isMouseDown = false;
document.body.addEventListener('mousedown', () => {
    isMouseDown = true;
    window.ipcApi.floatingButtonMouseDown();

    const onMouseMove = () => {
        if (isMouseDown) {
            window.ipcApi.floatingButtonMouseMove();
        }
    };

    const onMouseUp = () => {
        if (isMouseDown) {
            window.ipcApi.floatingButtonMouseUp();
            isMouseDown = false;
        }
        // 移除事件监听器
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    // 注册移动和松开事件
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    window.addEventListener('mouseleave', onMouseUp);
});