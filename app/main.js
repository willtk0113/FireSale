const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    });

    if (files) {
        const file = files[0];
        openFile(file, targetWindow);
    }

};

const openFile = (file, targetWindow) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened', content);
};

let windows = new Set();

const createWindow = exports.createWindow = () => {

    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();
    if(currentWindow)
    {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }

    let newWindow = new BrowserWindow({
        x,
        y,
        show: false,
    });

    newWindow.loadFile(`${__dirname}\\index.html`);
    newWindow.once('ready-to-show', () => {
        newWindow.show();
    })
  
    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    windows.add(newWindow);
    return newWindow;
};

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if(process.platform === 'darwin') {
        return false;
    }

    app.quit();
})

app.on('activate', (event, hasVisibleWindows) => {
    if(!hasVisibleWindows) {createWindow();}
})