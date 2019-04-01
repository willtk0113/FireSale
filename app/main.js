const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const getFileFromUser = exports.getFileFromUser = () => {
    const files = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    });

    if (files) {
        const file = files[0];
        openFile(file);
    }

};

const openFile = (file) => {
    const content = fs.readFileSync(file).toString();
    mainWindow.webContents.send('file-opened123', content);
};

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        show: false,
    });

    mainWindow.loadFile(`${__dirname}\\index.html`);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});