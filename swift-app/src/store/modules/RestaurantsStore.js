import axios from 'axios'

// State object
const initialState = () => ({
  allRestaurants: {},
  tableNumber: "Checked in manually",
  checkedIn: false,
  displayNotification: false,
});

const state = initialState();

// Getter functions
const getters = {
  getAllRestaurants(state) {
    return state.allRestaurants;
  },
  getTableNumber(state) {
    return state.tableNumber;
  },
  getCheckInFlag(state) {
    return state.checkedIn;
  },
  getDisplayNotification(state) {
    return state.displayNotification;
  },
}

// Actions 
const actions = {
  allRestaurants({commit}, data) {
    var token = this.getters['CustomerStore/getToken']
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "allRestaurants",
      "token": token,
    }
    ).then(result => {
      commit('SAVE_ALL_RESTAURANTS', result.data.restaurants);
      console.log(result.data.restaurants);
    }).catch(({ response }) => {
    });
  },

  retrieveRestaurantMenu({commit, dispatch}, restaurantId) {
    this.dispatch('MenuStore/retrieveMenu', restaurantId);
  },

  // Used to reset the store
  reset({ commit }) {
    commit('RESET');
  },

  updateCheckInFlag({commit}, data) {
    commit('updateCheckInFlag', data);
  },

  updateDisplayNotification({commit}, data) {
    commit('updateDisplayNotification', data);
  }
}

// Mutations
const mutations = {
  SAVE_ALL_RESTAURANTS(state, restaurants) {
    state.allRestaurants = restaurants;
  },

  // Used to reset the store
  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },

  setTableNumber(state, data) {
    state.tableNumber = data;
  },

  updateCheckInFlag(state, data) {
    state.checkedIn = data;
  },

  updateDisplayNotification(state, data) {
    state.displayNotification = data;
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

