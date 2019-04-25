import sudo from 'exec-root'
import { remote } from 'electron'
import path from 'path'

process.env.ELECTRON_RUN_AS_NODE = 0
const options = {
  name: 'EOSDNS',
  // eslint-disable-next-line no-undef
  icns: path.join(__static, 'icons', 'mac', 'app.icns'), // (optional),
  env: `ELECTRON_RUN_AS_NODE=0`
}
const electronPath = remote.app.getPath('exe')

const scriptPath = (scriptName) => {
  return process.env.NODE_ENV === 'development'
    // eslint-disable-next-line no-undef
    ? path.join(__dns_server, 'scripts', `${scriptName}`)
    : path.join(process.resourcesPath, `dns_server/scripts/${scriptName}`)
}

export async function startServer (nodeUrl) {
  console.log('Start server at', nodeUrl)

  process.env.NODE_URL = nodeUrl
  const startScriptPath = scriptPath('start.js')

  const command = `"${electronPath}" "${startScriptPath}"`
  try {
    const { stdout, stderr, error } = await sudo.exec(command, options)
    console.log('Stdout', stdout, 'Stderr', stderr, 'error', error)
    if (error) throw error
  } catch (e) {
    console.log('Error in starting script:', e)
  }
}

export async function stopServer () {
  console.log('stop server')
  const stopScriptPath = scriptPath('stop.js')

  const command = `"${electronPath}" "${stopScriptPath}"`
  const { error } = await sudo.exec(command, options)
  if (error) throw error
}

export async function resetDefaults () {
  console.log('reset settings')
  const resetScriptPath = scriptPath('reset.js')

  const command = `"${electronPath}" "${resetScriptPath}"`
  const { error } = await sudo.exec(command, options)
  if (error) throw error
}
