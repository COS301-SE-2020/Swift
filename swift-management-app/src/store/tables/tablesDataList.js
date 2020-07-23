import state from './tablesDataListState.js'
import mutations from './tablesDataListMutations.js'
import actions from './tablesDataListActions.js'
import getters from './tablesDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

