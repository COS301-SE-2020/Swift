import CustomerStore from '../modules/CustomerStore';

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
  retrieveMenu({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "restaurantMenu",
        "restaurantId": 1,
        // "token": CustomerStore.store.getToken()
        "token": '"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFXTDVtdERHUFp0b0p3emh6dURROHE5bEVpaXhDdVdOR3hDN0lKUXh5SDdzYmxUdk9VM1ZCOGxxWnQtUURlN0RCbE5QT1RNS3Ywb3RJcXYzNi01WldmTGUiLCJ5IjoiQUk2NGl3bkt4Ujd3TEJQUVJ5eVBJdEMySEtCb1NUbzczemFqeF9vOTJiQVZnVDg5cjgxUmhNT3YzeDQ1c3dYR3AtQTBwZklKWUQ1MUpZNzdZcVVLT0pHMCJ9fQ..983R_NqPLjsAEm455O7h8Q.TTVogzTrWR3myKvZI_4PJGRWe2T_OmMAvZZOWoKBqH3MrvQGUfqGFP9Zop20jWezQtFM3T-iXQExeuxAsHnVTseKZnc7S4QEi7WzdWXheRe1GZDW2moU8I6yE0KUYqiTtpEzpH0JHVB2Z9sQxkOwRCJ2PX_fLCSUBx_J3uZWkqviBBOZA441fJLv4jlAOwCPlTiQ8YSe68nD4926KDnMNtB6I1SmerhDG_3dI0lGkmHx8IxpFBUG3C_HGarqMwnUcsaNf2cv_x6Sn0WOgieEoJ5lL8XQJljDkainv7PNTVS8vJKG4pjv5xgJqXE4Yii-_cLm5wmiZA4pkPyySiv9swcBXdlpX5HU8fFETuUxsbrLP2YnnAUSDPWJ71Z1xd9_ZCCRW5GswMJwo9nPMsWZc2XD9kkLcbY6vltAGZzyrnQbkLl2CUb_sTLIa_LLyG3aBwGUdLORGy8XUr73_QvPNFkOQzycDWr0UCQvS2ZB1pCONr35kv07BnpMed9oOo_TzH1hlfYHqdFCKB1p-CNUZRDi71vBpKhAxFuUl9aKgRtGPYAgeAQDgVHYQEY4kwWXFTWdWbVcitX8A8brOR-u08-OvOMxLRgmq6hElf6MQd9yummMX31UA5xMet_4SIhp_k1loIQ-PlScxlWRPwzksw.FpnAF23LGnPKJFniFeCKJw"'
      }
    ).then(result => {
      // commit('SAVE_MENU', result.data);
    }).catch(({ response }) => {
    });
  },
  
  reset({ commit }) {
    commit('RESET');
  },
}

// Mutations
const mutations = {
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

