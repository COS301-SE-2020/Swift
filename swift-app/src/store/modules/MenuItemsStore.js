// State object
const initialState = () => ({
  menuItems: [
    {
      id: '1',
      name: 'Fruit Salad',
      rating: 4,
      price: '120.00',
      description: "The BEST Fruit Salad with a sweet and bright honey lime dressing! It's an incredibly refreshing, must have side dish that's made with beautiful blend of delicious fruits and a simple dressing to compliment it.",
      prepTime: '15',
      images: [],
    },
    {
      id: '2',
      name: 'Seafood',
      rating: 3,
      price: '100.00',
      description: "Seafood at its best",
      prepTime: '15',
      images: [],
    },
  ],
  menuItem: null
});

const state = initialState();

// Getter functions
const getters = {
  getVariable1( state ) {
    return state.varaible1;
  },

  getMenuItem( state ) {
    return state.menuItem;
  },
}

// Actions 
const actions = {
  // Used to reset the store
  reset({ commit }) {
    commit('RESET');
  },

  fetchVariable1({ commit }) {
    return new Promise( (resolve, reject) => {
      // Make network request and fetch data
      // and commit the data
      commit('SET_VARIABLE_1', data); 
      resolve();
    })
  },

  addItemToEdit({commit,}, orderItemInfo) {
    commit('ADD_ITEM_TO_EDIT', orderItemInfo);
  },

  clearItem({commit,}, orderItemInfo) {
    commit('CLEAR_ITEM_TO_EDIT', orderItemInfo);
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

  SET_VARIABLE_1(state, data) {
    state.varaible1 = data;
  },

  ADD_ITEM_TO_EDIT(state, data) {
    state.menuItem = data;
    // console.log(this.getters['MenuItemsStore/getMenuItem'])
  },

  CLEAR_ITEM_TO_EDIT(state, data) {
    state.menuItem = null;
  }
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

