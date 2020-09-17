import state from './promosDataListState.js'
import mutations from './promosDataListMutations.js'
import actions from './promosDataListActions.js'
import getters from './promosDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

