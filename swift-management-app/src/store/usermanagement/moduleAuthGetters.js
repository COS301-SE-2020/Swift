export default {
    getProfile( state ) {
        return state.user;
      },
      getToken( state ) {
        return state.token;
      },
      isAuthenticated(state) {
        return state.isAuthenticated;
      }
}
