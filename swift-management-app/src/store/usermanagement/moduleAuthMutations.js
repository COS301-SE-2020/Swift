export default {
  SAVE_TOKEN(state, token) {
    state.token = token;
  },

  SAVE_USER(state, user) {
    state.user = user;
  },

  SET_AUTHENTICATION(state, authentication_state) {
    state.isAuthenticated = authentication_state;
  },

  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },
}
