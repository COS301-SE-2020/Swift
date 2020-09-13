import state from './analyticsDataListState.js'
import mutations from './analyticsDataListMutations.js'
import actions from './analyticsDataListActions.js'
import getters from './analyticsDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

