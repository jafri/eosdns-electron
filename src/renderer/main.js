// import '@babel/polyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import ElectronStore from 'electron-store'

import './helpers/external_links.js'
import store from './store'

Vue.use(BootstrapVue)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

const electronstore = new ElectronStore()

Vue.prototype.$electronstore = electronstore

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
