import axios from 'axios'

// State object
const initialState = () => ({
  menu: {},
  promotionItems: {}
});

const state = initialState();

// Setter functions

// Getter functions
const getters = {
  getMenu(state) {
    return state.menu;
  },
  getPromotionItems(state) {
    return state.promotionItems;
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
      return true;
    }).catch(({ response }) => {
    });
  },

  retrieveSuggestedPromotions({commit}, restaurantId) {
    return axios.post('https://ml.api.swiftapp.ml', 
    {
      "requestType": "suggestFromRatings",
      "restaurantId": restaurantId,
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      console.log(result.data)
      // commit('SAVE_PROMOTION_ITEMS', result.data);
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

  SAVE_PROMOTION_ITEMS(state, promoItems) {
    state.promotionItems = promoItems;
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

