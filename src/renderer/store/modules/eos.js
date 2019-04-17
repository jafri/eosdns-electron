export default {
  namespaced: true,

  state: {
    nodeUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8888' // 'http://jungle2.cryptolions.io'
        : 'https://api.jungle.alohaeos.com'
  },

  actions: {
    SET_NODE_URL ({ commit }, nodeUrl) {
      commit('SET_NODE_URL', nodeUrl)
    }
  },

  mutations: {
    SET_NODE_URL (state, nodeUrl) {
      state.nodeUrl = nodeUrl
    }
  },

  getters: {}
}
