import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/Main').default
    },
    {
      path: '/certificate',
      name: 'certificates',
      component: require('@/components/Certificate').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
