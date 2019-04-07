const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js')
const path = require('path');

let filePath = null;
let originalContent = '';
let currentContent = '';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');
const currentWindow = remote.getCurrentWindow();

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', (event) => {
    const file = getDraggedFile(event);
    if (isFileTypeSupported(file)) {
        markdownView.classList.add('drag-over');
    } else {
        markdownView.classList.add('drag-error');
    }
});

document.addEventListener('dragleave', (event) => {
    removeDraggedMarkdownStyle();
});

document.addEventListener('drop', (event) => {
    const file = getDroppedFile(event);
    if (isFileTypeSupported(file)) {
        mainProcess.openFile(file.path, currentWindow);
    } else {
        alert('That file type is not supported');
    }

    removeDraggedMarkdownStyle();
});



const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const removeDraggedMarkdownStyle = () => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
};
const isFileTypeSupported = (file) => {
    return ['text/plain', 'text/markdown'].includes(file.type);
}

const updateUserInterface = (isEdited) => {
    let title = 'Fire Sale';
    if (filePath) { title = `${path.basename(filePath)} - ${title}`; }
    if (isEdited) { title = `${title} (Edited)`; }

    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
}

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, {
        sanitize: true,
    })
}

saveMarkdownButton.addEventListener('click', () => {
    // if(filePath)
    //     mainProcess.saveFile(filePath, currentContent);
    // else

});

saveHtmlButton.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});

markdownView.addEventListener('keyup', (event) => {
    currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    updateUserInterface(currentContent != originalContent);
})

newFileButton.addEventListener('click', () => {
    mainProcess.createWindow();
})

openFileButton.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow);
})

const renderFile = (file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHtml(content);
    updateUserInterface();
};

ipcRenderer.on('file-opened', (event, file, content) => {
    if (currentWindow.isDocumentEdited()) {
        const result = remote.dialog.showMessageBox(currentWindow, {
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            buttons: [
                'Yes',
                'Cancel',
            ],
            defaultId: 0,
            cancelId: 1
        });
        if (result === 1) { return; }
    }
    renderFile(file, content);
});

ipcRenderer.on('file-changed', (event, file, content) => {
    const result = remote.dialog.showMessageBox(currentWindow, {
        type: 'warning',
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file. Load changes?',
        buttons: [
            'Yes',
            'Cancel',
        ],
        defaultId: 0,
        cancelId: 1
    });
    renderFile(file, content);
});