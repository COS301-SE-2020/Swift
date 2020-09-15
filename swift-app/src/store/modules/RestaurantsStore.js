import axios from 'axios'

// State object
const initialState = () => ({
  allRestaurants: {},
  tableNumber: "",
  checkedIn: false,
  displayNotification: false,
  exploreCategories: {},
  suggestedItemsFromRatings: {},
  
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
  getExploreCategories(state) {
    return state.exploreCategories;
  },
  getSuggestedItemsFromRatings(state) {
    return state.suggestedItemsFromRatings;
  },
}

// Actions 
const actions = {
  allRestaurants({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "allRestaurants",
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      commit('SAVE_ALL_RESTAURANTS', result.data.restaurants);
      return true;
    }).catch(({ response }) => {
    });
  },

  retrieveRestaurantMenu({commit, dispatch}, restaurantId) {
    this.dispatch('MenuStore/retrieveMenu', restaurantId);
  },

  retrieveExploreCategories({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "allRestaurantCategories",
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      commit('SAVE_ALL_EXPLORE_CATEGORIES', result.data.categories);
      return true;
    }).catch(({ response }) => {
    });
  },

  retrieveSuggestedMenuItemsFromRatings({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "suggestFromRatings",
      // "customerId": 5,
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      // Need another call that builds the json for each menu item OR only do it in the menu you are checked into
      console.log(result.menuItemIds)
      // commit('SAVE_SUGGESTED_ITEMS', result.data.menuItemIds);
      return true;
    }).catch(({ response }) => {

    });
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

  SAVE_ALL_EXPLORE_CATEGORIES(state, categories) {
    state.exploreCategories = categories;
  },

  SAVE_SUGGESTED_ITEMS(state, suggestedItems) {
    state.suggestedItemsFromRatings = suggestedItems;
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

