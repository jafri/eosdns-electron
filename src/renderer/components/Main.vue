<template>
  <div class="main-splash">
    <div>
      <div class="center-flex">
        <img id="logo" src="static/eosdns-color.png" alt="EOS DNS" key="mainpage">
      </div>

      <div style="width: 550px;">
        <p>Resolve EOS accounts to .eos websites</p>
        <div class="loading" v-if="loading">
          <div class="inner"></div>
        </div>

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
              Test
            </a>
            <div class="btn btn-lg main-btn" @click="disable">
              Disable
            </div>
          </div>
        </div>
        <div v-else>
          <div class="text-center">
            <div class="btn btn-lg main-btn-light mr-3" @click="reset" style="width: 250px;">
              Reset Defaults
            </div>
            <div class="btn btn-lg main-btn" @click="enable" style="width: 250px;">
              Start DNS Server
            </div>
          </div>
        </div>

        <div class="mb-4">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { startServer, stopServer, resetSettings } from '@/helpers/dns'
import detect from 'detect-port'

export default {
  data () {
    return {
      loading: false,
      message: '',
      portTakenMessage: '',
      enabled: false,
      recursiveServer: undefined
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
    async enable () {
      await startServer(this.nodeUrl)
      this.enabled = true
    },

    async disable () {
      await stopServer()
      this.enabled = false
    },

    async reset () {
      await resetSettings()
      this.enabled = false
    },

    async checkPort () {
      const port = await detect(53)
      console.log(port)

      if (port !== 53 && !this.enabled) {
        this.portTakenMessage = 'There is a DNS server already running at port 53. Enabling will stop that server and start a new one.'
      } else {
        this.portTakenMessage = ''
      }
    }
  },

  created () {
    this.checkPort()
    setInterval(() => {
      this.checkPort()
    }, 5000)
  },

  destroyed () {
    this.disable()
  }
}
</script>
<style lang="scss">
#logo {
  width: 232px;
  height: 60px;
}

.center-flex {
  display: flex;
  justify-content: center; /* align horizontal */
}

.main-splash {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 100vw;
  min-height: 100vh;

  .choose-app {
    color: #000;
    font-weight: 800;
  }

  p {
    font-size: 20px;
    color: #000808;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}

.option-text {
  font-size: 20px;
  font-weight: 800;
  margin-left: 20px;
  margin-right: 20px;
  color: black;
}

.main-btn {
  display:inline-block;
  border: none;
  position: relative;
  background: transparent;
  padding-top: 15px;
  // padding-left: 58px;
  // padding-right: 58px;
  padding-bottom: 15px;
  border-radius: 100px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 15px;
  width: 160px;
  background: #5e72e4;
  color: #fff;

  &:hover {
    cursor: pointer;

    &:before {
      background: none;
    }
  }

  &:before,
  &:after {
    content: ' ';
    position: absolute;
    border-radius: 100px;
  }

  &:before {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -2;
    background: #0029dd;
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#003132', endColorstr='#00afb0',GradientType=0 );
  }

  &:after {
    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 2px;
    background-color: #fff;
    z-index: -1;
    opacity: 1;
    transition: all 0.6s ease-in-out;
  }
}
  .main-btn-light {
    display:inline-block;
    border: none;
    position: relative;
    background: transparent;
    padding-top: 15px;
    // padding-left: 58px;
    // padding-right: 58px;
    padding-bottom: 15px;
    border-radius: 100px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 15px;
    width: 160px;

    &:hover {
      background: #5e72e4;
      color: #fff;
      cursor: pointer;

      &:before {
        background: none;
      }
    }

    &:before,
    &:after {
      content: ' ';
      position: absolute;
      border-radius: 100px;
    }

    &:before {
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: -2;
      background: #0029dd;
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#003132', endColorstr='#00afb0',GradientType=0 );
    }

    &:after {
      top: 2px;
      bottom: 2px;
      left: 2px;
      right: 2px;
      background-color: #fff;
      z-index: -1;
      opacity: 1;
      transition: all 0.6s ease-in-out;
    }
  }
</style>
