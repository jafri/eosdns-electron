const getResolverCommand = (resolver) => {
  const os = process.platform
  if (os === 'darwin') {
    return `networksetup -setdnsservers Wi-Fi ${resolver}`
  } else if (os === 'win32') {
    return `netsh interface ipv4 set dns "Wi-Fi" static ${resolver} primary`
  } else {
    return `echo 'nameserver ${resolver}' > /etc/resolv.conf`
  }
}

module.exports = {
  getResolverCommand
}
