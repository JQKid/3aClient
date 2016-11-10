const {
    app,
    BrowserWindow,
    Menu,
    dialog,
    ipcMain
} = require('electron')

const path = require('path')
const url = require('url')
const TradeProxy = require('./trade/TradeProxy')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    TradeProxy.init()
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1280,
        autoHideMenuBar:false,
        // titleBarStyle:'hidden',
        backgroundColor:'#333333'
    })
    mainWindow.maximize()
    mainWindow.setMenuBarVisibility(false)

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: "www.aaa-aaa.cn",
        protocol: 'http:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()


    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        TradeProxy.close()
    })

    ipcMain.on('aaa-menus', (event, arg) => {
        createMenu(arg)
    })
}

function create3AMenu(views) {
    let menus = [];
    for (let i = 0; i < views.length; i++) {
        let view = views[i]
        if (view.admin) {
            continue;
        }
        let menu = {label:view.name, id:view.id}
        if (view.items && view.items.length) {
            menu.submenu = create3AMenu(view.items)
        } else {
            menu.click = function(item) {
                mainWindow.webContents.executeJavaScript("window.aaa.$broadcast('showView', '" + item.id + "');")
            }
        }
        menus.push(menu);
    }
    return menus;
}

function createMenu(views) {
    //创建菜单
    const template = [{
        label: app.getName(),
        submenu: [{
            label:'登录交易客户端',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+L' : 'Ctrl+Shift+L',
            click(item, focusedWindow) {
                TradeProxy.processor.login({}, (err) => dialog.showErrorBox('登录失败', err), (msg) => '')
            }
        }, {
            label:'关闭交易客户端',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+C' : 'Ctrl+Shift+C',
            click(item, focusedWindow) {
                TradeProxy.processor.close({}, (err) => dialog.showErrorBox('登录失败', err), (msg) => '')
            }
        }, {
            label:'显示交易客户端',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+V' : 'Ctrl+Shift+V',
            click(item, focusedWindow) {
                TradeProxy.processor.setVisible(true)
            }
        }, {
            label:'隐藏交易客户端',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+H' : 'Ctrl+Shift+H',
            click(item, focusedWindow) {
                TradeProxy.processor.setVisible(false)
            }
        }, {
            type: 'separator'
        }, {
            label:'资金股票',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+Z' : 'Ctrl+Shift+Z',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showZijingupiao')
                `)
            }
        }, {
            label:'当日委托',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+W' : 'Ctrl+Shift+W',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showWeituo')
                `)
            }
        }, {
            label:'持仓明细',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+P' : 'Ctrl+Shift+P',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showPositiondetail')
                `)
            }
        }, {
            label:'交易管理',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+T' : 'Ctrl+Shift+T',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showTraderecord')
                `)
            }
        }, {
            type: 'separator'
        }, {
            label:'账户分析',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+A' : 'Ctrl+Shift+A',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showAccountanalyze')
                `)
            }
        }, {
            label:'收益分析',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+S' : 'Ctrl+Shift+S',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showShouyianalyze')
                `)
            }
        }, {
            label:'净值分析',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+J' : 'Ctrl+Shift+J',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showJingzhianalyze')
                `)
            }
        }, {
            label:'债券分析',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+B' : 'Ctrl+Shift+B',
            click(item, focusedWindow) {
                mainWindow.webContents.executeJavaScript(`
                    window.aaa.$broadcast('showBondanalyze')
                `)
            }
        }, {
            type: 'separator'
        }, {
            label:'退出',
            role: 'quit'
        }]
    }, {
        label: '编辑',
        submenu: [{
            label:'撤销',
            role: 'undo'
        }, {
            label:'重做',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label:'剪切',
            role: 'cut'
        }, {
            label:'拷贝',
            role: 'copy'
        }, {
            label:'粘贴',
            role: 'paste'
        }, {
            label:'删除',
            role: 'delete'
        }, {
            label:'全选',
            role: 'selectall'
        }]
    }, {
        label: '视图',
        submenu: create3AMenu(views || []).concat([{
            type: 'separator'
        }, {
            label: '重新加载此页',
            accelerator: 'CmdOrCtrl+R',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.reload()
            }
        }, {
            label: '开发者工具',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
        }, {
            type: 'separator'
        }, {
            role: 'togglefullscreen'
        }])
    }, {
        label:'帮助',
        role: 'help',
        submenu: [{
            label: '3A主页',
            click() {
                require('electron').shell.openExternal('http://www.aaa-aaa.cn')
            }
        }, {
            label: '3A论坛',
            click() {
                require('electron').shell.openExternal('http://bbs.aaa-aaa.cn')
            }
        }]
    }]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    mainWindow.setMenuBarVisibility(true)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.