import axios from 'axios'

// State object
const initialState = () => ({
  allRestaurants: {},
  tableNumber: "",
  checkedIn: false,
  displayNotification: false,
  exploreCategories: {},
  suggestedItemsIds: {},
  suggestedItemsFromRatings: {},
  allActiveRestaurantPromotions: {}
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
  getSuggestedItemsIds(state) {
    return state.suggestedItemsIds;
  },
  getSuggestedItemsFromRatings(state) {
    return state.suggestedItemsFromRatings;
  },
  getAllActiveRestaurantPromotions(state) {
    return state.allActiveRestaurantPromotions;
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

  retrieveSuggestedMenuItemIds({commit}) {
    return axios.post('https://ml.api.swiftapp.ml', 
    {
      "requestType": "suggestFromRatings",
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      console.log(result.data)
      this.dispatch('RestaurantsStore/retrieveSuggestedMenuItemsFromRatings', result.data.menuItemIds);
    }).catch(({ response }) => {

    });
  },

  retrieveSuggestedMenuItemsFromRatings({commit}, data) {
    // console.log(data)
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "suggestedMenuItems",
      "menuItems": data,
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      commit('SAVE_SUGGESTED_ITEMS', result.data);
    }).catch(({ response }) => {

    });
  },

  retrieveActivePromotions({commit}) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "getActivePromotions",
      "token": sessionStorage.getItem('authToken'),
    }
    ).then(result => {
      console.log(result.data)
      commit('SAVE_ACTIVE_PROMOTIONS', result.data);
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

  SAVE_ACTIVE_PROMOTIONS(state, promotions) {
    state.allActiveRestaurantPromotions = promotions;
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

