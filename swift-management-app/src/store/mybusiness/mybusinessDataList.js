import state from './mybusinessDataListState.js'
import mutations from './mybusinessDataListMutations.js'
import actions from './mybusinessListActions.js'
import getters from './mybusinessListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

