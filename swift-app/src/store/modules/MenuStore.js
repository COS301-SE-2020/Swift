import axios from 'axios'

// State object
const initialState = () => ({
  menu: {},
});

const state = initialState();

// Setter functions

// Getter functions
const getters = {
  getMenu(state) {
    return state.menu;
  },
}

// Actions 
const actions = {
  retrieveMenu({commit}, restaurantId) {
    var token = this.getters['CustomerStore/getToken']
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "restaurantMenu",
        "restaurantId": restaurantId,
        "token": token,
      }
    ).then(result => {
      console.log("MENU: ", result.data)
      commit('SAVE_MENU', result.data);
    }).catch(({ response }) => {
    });
  },
  
  reset({ commit }) {
    commit('RESET');
  },
}

// Mutations
const mutations = {
  SAVE_MENU(state, menu) {
    state.menu = menu;
  },

  // Used to reset the store
  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

