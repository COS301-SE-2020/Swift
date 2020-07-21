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
    console.log("sdfsdf");
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "allRestaurants",
      "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFIcGlOenhVUy05S2NmMUNRbnVvYTFCWnlIajg5N2NOXzdIeDFvR1dWc0h0Vk5QdmUtamRRck1ncFhVRW9IajVhTkVsdTVzdFBfaEpUMjZ3VTBGWDBoYjAiLCJ5IjoiQVhrdjNkb0N4Y2VCSlNMLUlNSDlfUXMtWkxtSndIYVpmYjJzdGUzclp1V1IxWFpXand5a0NlR1hQMHlNa04wbjAxQ0JJQXl0aUJaVVJiempUWlp5empPUiJ9fQ..DfncSVJ0sN8TLzBLMj5c9g.7RUd7fTncqDO5JJw-cK1MqFoYd_bbMun_NUo16jrKwVAwjnaKN2xMKTT-Y0KEvU11spU6_YLKQUltIEVg5bPlWolP2OM0oWRYChnlw6BEJ0fuos2eLXexvWyIOfWkgOFZJINpnSVjOI58HugBo5J1bstSz9CfQq3NsYctzMsuAvF7gRiWNfgGUnc0JwWXvcWHk6ZMUK8gg6osLPeZaSOgVdClWqz9dtKRovwhrD6UB0lAHPReBaZGSRB852cz3zNlxJVAMIIo-4KD-wzSty6kuba9aGap-aPHH2iN-9CTam21t1nYFocoK77V4uilAzcKVtKVKhovCdvWQCXPWeoZ4xtthgMmWM4h_2UwpzVWvNAU5Pse24xA8ENH0Ck80tmCisnNw7UacPmgAkwuDlFvEXHW0NRBKykW3CKiuYzWlZeD8VS_l6GGuLUAW0oRXxdAFBL77K4SA2eFDuRzIQifC2PIlJnIeZHu0rg-nQswspniMg_cTcBCIAzkRMgPRxTJdYe6mvvE47YEt7tVu406Jnb-h1KY_xyJQNMJzgOwdyPQuLd6Cx8C0n8cvOQDaCRVZR8K-nqmu5ZH8jyv2t32o6XOPKypb0ZKvxba86786iV9I085cuSVAAx2TWwW0TOdzLM6SS5Ah423CkA6qzYaA.dtLnjg3pz3rUZPcnAJu4tw"
    }
    ).then(result => {
      commit('SAVE_ALL_RESTAURANTS', result.data);
      console.log(result.data);
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

