'use strict'

import { app, BrowserWindow, ipcMain, Menu, session } from 'electron'
import path from 'path'
// import { enforceMacOSAppLocation } from 'electron-util'
import 'electron-context-menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  global.__dns_server = require('path').join(__dirname, '/dns_server').replace(/\\/g, '\\\\')
  global.__certs = require('path').join(__dirname, '/certs').replace(/\\/g, '\\\\')
}

let mainWindow
// let logsWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const openAboutWindow = require('about-window').default

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 650,
    useContentSize: true,
    width: 960,
    minWidth: 900,
    minHeight: 600,
    resizable: false
  })

  mainWindow.setResizable(true)
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create the Application's main menu
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  const version = app.getVersion()

  if (process.platform === 'win32') {
    template.unshift({
      label: 'EOS DNS',
      submenu: [
        {
          label: 'About',
          click: () =>
            openAboutWindow({
              icon_path: path.join(global.__static, '/eosdns.png'),
              copyright: 'Copyright (c) 2019 EOS DNS.',
              open_devtools: true,
              homepage: 'https:/eosdns.io',
              product_name: 'EOS DNS',
              package_json_dir: path.join(__dirname, '../..'),
              use_version_info: false
            })
        },
        {
          label: `Version ${version}`,
          enabled: false
        },
        // {
        //   label: 'View logs',
        //   click: function () {
        //     if (typeof logsWindow === 'undefined' || logsWindow === null || logsWindow.isDestroyed()) {
        //       const modalPath = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/view-logs' : `file://${__dirname}/index.html#view-logs`
        //       logsWindow = new BrowserWindow({
        //         width: 860,
        //         height: 600,
        //         useContentSize: false,
        //         resizable: false
        //       })
        //       logsWindow.setTitle('Logs')
        //       logsWindow.loadURL(modalPath)
        //     } else {
        //       logsWindow.show()
        //     }
        //   }
        // },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  } else {
    template.unshift({
      label: 'EOS DNS',
      submenu: [
        { role: 'about' },
        {
          label: `Version ${version}`,
          enabled: false
        },
        {
          label: `Dev Tools`,
          click: function () {
            mainWindow.webContents.openDevTools()
          }
        },
        // {
        //   label: 'View logs',
        //   click: function () {
        //     if (typeof logsWindow === 'undefined' || logsWindow === null || logsWindow.isDestroyed()) {
        //       const modalPath = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/view-logs' : `file://${__dirname}/index.html#view-logs`
        //       logsWindow = new BrowserWindow({
        //         width: 860,
        //         height: 600,
        //         useContentSize: false,
        //         resizable: false
        //       })
        //       logsWindow.setTitle('Logs')
        //       logsWindow.loadURL(modalPath)
        //     } else {
        //       logsWindow.show()
        //     }
        //   }
        // },
        { type: 'separator' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
// Allow only one instance
app.requestSingleInstanceLock()
app.on('second-instance', function (event, argv, cwd) {
  app.quit()
})

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.on('ready', () => {
  createWindow()

  // Move to Application folder on MacOS
  // enforceMacOSAppLocation()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  session.defaultSession.clearStorageData()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => {})
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
})

ipcMain.on('online-status-changed', (event, status) => {
  event.sender.send('onlinestatus', status)
})
