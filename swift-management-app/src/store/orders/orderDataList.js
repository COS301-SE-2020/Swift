import state from './orderDataListState.js'
import mutations from './orderDataListMutations.js'
import actions from './orderDataListActions.js'
import getters from './orderDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

