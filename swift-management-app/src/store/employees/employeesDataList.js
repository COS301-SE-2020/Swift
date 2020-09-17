import state from './employeesDataListState.js'
import mutations from './employeesDataListMutations.js'
import actions from './employeesDataListActions.js'
import getters from './employeesDataListGetters.js'

export default {
  isRegistered: false,
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

