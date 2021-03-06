const {app, BrowserWindow, Menu, shell } = require('electron');
const mainProcess = require('./main');

const template = [
    {
        label : 'Edit',
        submenu : [
            {
                label : 'Undo',
                accelerator : 'CommandOrControl + Z',
                role : 'undo'
            },
            {
                label : 'Redo',
                accelerator : 'Shift + CommandOrControl + Z',
                role : 'redo'
            },
            {
                type : 'separator'
            },
            {
                label : 'Cut',
                accelerator : 'CommandOrControl + X',
                role : 'cut'
            },
            {
                lable : 'Copy',
                accelerator : 'CommandOrControl + C',
                role : 'copy',
            },
            {
                label : 'Paste',
                accelerator : 'CommandOrControl + V',
                role : 'paste',
            },
            {
                label : 'Select All',
                accelerator : 'CommandOrControl + A',
                role : 'selectall'
            }
        ]
    }
]

if( process.platform === 'darwin') {
    const name = 'Fire Sale';
    template.unshift({ label: name });
}

module.exports = Menu.buildFromTemplate(template);