<template>
  <div class="main-splash">
      <div class="center-flex">
        <img id="logo" src="static/eosdns-color.png" alt="EOS DNS" key="mainpage">
      </div>

      <div class="center-flex by-column">
        <p>Resolve EOS accounts to .eos websites</p>

        <div style="text-align: center;">
          Certificate Status:
          <span style="color: green;" v-if="certInstalled"> Installed </span>
          <span style="color: red;" v-else> Not Installed </span>
        </div>

        <div @click="installCertificate"
             v-if="!certInstalled"
             class="btn btn-lg main-btn"
             style="width: 300px;">
          Install Certificate
        </div>
        <div @click="uninstallCertificate"
             v-if="certInstalled"
             class="btn btn-lg main-btn-light"
             style="width: 300px;">
          Uninstall Certificate
        </div>
      </div>
  </div>
</template>

<script>
import path from 'path'
import { generateTrust } from 'trust-cert'

const trust = generateTrust(process.platform, 'EOS DNS')

let certPath
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-undef
  certPath = path.join(__certs, 'eos_root_ca.crt')
} else {
  certPath = path.join(process.resourcesPath, 'certs/eos_root_ca.crt')
}

console.log(certPath)

export default {
  data () {
    return {
      certInstalled: false
    }
  },

  computed: {

  },

  methods: {
    async installCertificate () {
      await trust.installFromFile(certPath)
      await this.updateCertStatus()
    },

    async uninstallCertificate () {
      await trust.uninstall(certPath)
      await this.updateCertStatus()
    },

    async updateCertStatus () {
      this.certInstalled = await trust.exists(certPath)
    }
  },

  created () {
    this.updateCertStatus()
  },

  destroyed () {

  }
}
</script>

<style lang="scss">
#logo {
  width: 232px;
  height: 60px;
}

.by-column {
  flex-direction: column;
}

.center-flex {
  display: flex;
  justify-content: center; /* align horizontal */
}

.main-splash {
  height: 100%;
  width: 100%;
  padding-left: 50px;
  padding-right: 50px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
