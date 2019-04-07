const { app, BrowserWindow, dialog, Menu } = require('electron');
const fs = require('fs');
const applicationMenu = require('./application-menu.js');
const openFiles = new Map();


const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);

    const watcher = fs.watchFile(file, (event) => {
        if (event === 'change') {
            const content = fs.readFileSync(file).toString();
            targetWindow.webContents.send('file-changed', file, content);
        }
    })

    openFiles.set(targetWindow, watcher);
}

const stopWatchingFile = (targetWindow) => {
    if(openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
    }
}

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialog ({
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

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    const file = dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath : app.getPath('desktop'),
        fileters: [
            { name: 'HTML Files', extensions: ['html', 'html']}
        ]
    });

    if (!file) return;

    fs.writeFileSync(file, content);
};

const openFile = exports.openFile = (file, targetWindow) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
};

const saveFile = exports.saveFile = (file, content) => {
    fs.writeFileSync(file, content);
}
//let windows = new Set();

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
        //windows.delete(newWindow);
        stopWatchingFile(newWindow);
        newWindow = null;
    });

    newWindow.on('close', (event) => {
        if(newWindow.isDocumentEdited()) {
            event.preventDefault();

            const result = dialog.showMessageBox(newWindow, {
                type : 'warning',
                title : 'Quit with Unsaved Message',
                message : 'Your change will be lost if you do not save.',
                buttons : [
                    'Quit Anyway',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1
            });

            if( result === 0) newWindow.destroy();
        }
    })
    //windows.add(newWindow);
    return newWindow;
};

app.on('ready', () => {
    Menu.setApplicationMenu(applicationMenu);
    createWindow();
});

app.on('window-all-closed', () => {
    if(process.platform === 'darwin') {
        return false;
    }

    app.quit();
})

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow(); }
})