window.platform.getLastPluginEnterAction().then((action) => {
    if (action) {
        window.ipcApi.execCommand(action.payload ?? '');
        window.platform.closeSelf();
    }
});