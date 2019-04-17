import sudo from '@jafri/sudo-prompt'
import { remote } from 'electron'
import path from 'path'

const options = {
  name: 'EOSDNS',
  // eslint-disable-next-line no-undef
  icns: path.join(__static, 'icons', 'mac', 'app.icns') // (optional)
}

export async function startServer (nodeUrl) {
  return new Promise((resolve, reject) => {
    console.log('Start server at', nodeUrl)

    process.env.ELECTRON_RUN_AS_NODE = 0
    process.env.NODE_URL = nodeUrl

    const localOptions = Object.assign(options, {
      env: `ELECTRON_RUN_AS_NODE=0 NODE_URL=${nodeUrl}`
    })

    let startScriptPath
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-undef
      startScriptPath = path.join(__dns_server, 'start.js')
    } else {
      startScriptPath = path.join(process.resourcesPath, 'dns_server/start.js')
    }
    console.log('Enable path', startScriptPath)
    const command = `${remote.app.getPath('exe')} ${startScriptPath}`
    sudo.exec(command, localOptions, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
    })
    resolve('Started DNS Server')
  })
}

export async function stopServer () {
  return new Promise((resolve, reject) => {
    process.env.ELECTRON_RUN_AS_NODE = 0
    const localOptions = Object.assign(options, {
      env: `ELECTRON_RUN_AS_NODE=0`
    })

    let stopScriptPath
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-undef
      stopScriptPath = path.join(__dns_server, 'stop.js')
    } else {
      stopScriptPath = path.join(process.resourcesPath, 'dns_server/stop.js')
    }
    const command = `${remote.app.getPath('exe')} ${stopScriptPath}`
    sudo.exec(command, localOptions, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve('Stopped DNS Server')
      }
    })
  })
}

export async function resetSettings () {
  return new Promise((resolve, reject) => {
    process.env.ELECTRON_RUN_AS_NODE = 0

    let resetScriptPath
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-undef
      resetScriptPath = path.join(__dns_server, 'reset.js')
    } else {
      resetScriptPath = path.join(process.resourcesPath, 'dns_server/reset.js')
    }
    const command = `${remote.app.getPath('exe')} ${resetScriptPath}`
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve('Reset DNS Settings')
      }
    })
  })
}
