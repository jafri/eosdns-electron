<template>
  <div>
    <b-form-input v-model="nodeUrl"
              v-if="!enabled"
              placeholder="EOS Node API"
              style="font-size: 1.2em;"
              class="mb-4"></b-form-input>
              
    <div class="mb-4" v-if="portTakenMessage">
      {{ portTakenMessage }}
    </div>

    <div v-if="enabled">
      <div class="text-center">
        <a class="js-external-link btn btn-lg main-btn-light" href="http://eoscafeblock.eos/" style="margin-right: 10px;">
          Test Website
        </a>
        <div class="btn btn-lg main-btn" @click="stop">
          Stop Server
        </div>
      </div>
    </div>
    <div v-else>
      <div class="text-center">
        <div class="btn btn-lg main-btn-light mr-3"
              @click="resetDefaults"
              v-if="savedDefaults"
              style="width: 250px;">
          Reset Defaults
        </div>
        <div class="btn btn-lg main-btn" @click="start" style="width: 250px;">
          Start EOS DNS
        </div>
      </div>
    </div>

    <div class="mb-4">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { startServer, stopServer, resetDefaults } from '@/helpers/dns'
import detect from 'detect-port'
import EditDns from 'edit-dns'
const editDns = new EditDns('EOSDNS')

export default {
  data () {
    return {
      loading: false,
      message: '',
      portTakenMessage: '',
      enabled: false,
      savedDefaults: false,
      recursiveServer: undefined,
      checkStartInterval: undefined
    }
  },

  computed: {
    nodeUrl: {
      get () {
        return this.$store.state.eos.nodeUrl
      },
      set (newNodeUrl) {
        this.$store.dispatch('eos/SET_NODE_URL', newNodeUrl)
      }
    }
  },

  methods: {
    async start () {
      startServer(this.nodeUrl)
      console.log('Started')


      try {
        await this.updateSavedDefaults()
      } catch (e) {
        console.log('Error in start of defaults', e)
      }

      this.checkStartInterval = setInterval(async () => {
        try {
          await this.updateSavedDefaults()
        } catch (e) {
          console.log('Error in interval', e)
        }
      }, 1000)
    },

    async stop () {
      await stopServer()
      await this.checkPort()
      await this.updateSavedDefaults()
    },

    async resetDefaults () {
      await resetDefaults()
      await this.updateSavedDefaults()
    },

    async updateSavedDefaults (creation) {
      console.log('Pid before: ', Object.assign({}, editDns))
      await editDns.loadDataFromFile()

      let enabled = false

      // If pid exists, check if process is still running
      if (editDns.pid) {
        console.log('Pid', editDns.pid, 'Is running', this.isRunning(editDns.pid))
        enabled = this.isRunning(editDns.pid)
      }

      // Check if file exists
      try {
        this.savedDefaults = await editDns.dataFileExists()
      } catch (e) {
        this.savedDefaults = false
      }

      // Stop checking if server is started still
      if (enabled) {
        console.log('Clearing interval')
        clearInterval(this.checkStartInterval)
        this.checkStartInterval = undefined
        this.portTakenMessage = ''
      }

      if (this.enabled !== enabled) {
        this.enabled = enabled
      }
    },

    isRunning (pid) {
      try {
        return process.kill(pid, 0)
      } catch (e) {
        return e.code === 'EPERM'
      }
    },

    async checkPort () {
      const port = await detect(53)
      console.log(port)

      if (port !== 53 && !this.enabled) {
        this.portTakenMessage = `Your computer's default DNS server is running at port 53. Starting will stop that server and start the EOS DNS Server.`
      } else {
        this.portTakenMessage = ''
      }
    }
  },

  created () {
    this.updateSavedDefaults()

    this.checkPort()
    this.checkPortInterval = setInterval(() => {
      this.checkPort()
    }, 5000)
  },

  destroyed () {
    clearInterval(this.checkPortInterval)
    clearInterval(this.checkStartInterval)
  }
}
</script>
<style lang="scss">
</style>
