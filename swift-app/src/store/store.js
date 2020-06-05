import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules';

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  actions: {
    reset({commit}) {
      // resets state of all the modules - call this.$store.dispatch('reset');
      Object.keys(modules).forEach(moduleName => {
        commit(`${moduleName}/RESET`);
      })
    }
  },
})
