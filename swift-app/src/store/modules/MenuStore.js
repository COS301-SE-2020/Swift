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
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "restaurantMenu",
        "restaurantId": restaurantId,
        "token": sessionStorage.getItem('authToken'),
      }
    ).then(result => {
      commit('SAVE_MENU', result.data);
      console.log("menu set")
      return true;
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

  CLEAR_MENU(state) {
    state.menu = {};
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

