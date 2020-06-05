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
  ]
});

const state = initialState();

// Getter functions
const getters = {
  getVariable1( state ) {
    return state.varaible1;
  },
  getVariable2( state ) {
    return state.varaible2;
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
  }
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
  SET_VARIABLE_2(state, data) {
    state.variable2 = data;
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

