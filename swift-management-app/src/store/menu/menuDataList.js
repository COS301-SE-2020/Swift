import state from './menuDataListState.js'
import mutations from './menuDataListMutations.js'
import actions from './menuDataListActions.js'
import getters from './menuDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

