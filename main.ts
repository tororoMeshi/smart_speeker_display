import {app,BrowserWindow} from 'electron';
import {worker} from "cluster";

let win: BrowserWindow | null = null;
let isObserverActive: boolean = true;
let stateData: string = "";
let anyData: string = "";

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        kiosk: true,
        'fullscreen': true,
        'frame': false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('clock/index.html').catch(error => console.log(error));
    win.on('closed', () => {
        win = null;
    });
    openCallApiThread();
}

function openCallApiThread(){
    const workerFarm = require('electron-worker-farm');
    const workers = workerFarm(require.resolve('./callApiThread'));

    const callbackApi = (state: string,any: string) => {
         if(stateData !== state || anyData !== any){
             if(state === "検索"){
                 win?.loadURL("https://www.google.com/search?q="+any);
             }else if(state === "時計"){
                 win?.loadFile('clock/index.html');
             }
         }
         if(isObserverActive) {
             workers(callbackApi);
         }
    }
    workers(callbackApi);
}

//開いた時
app.on('ready', createWindow);

//windowがcloseされた時
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        isObserverActive = false;
        app.quit();
    }
});

//
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});


