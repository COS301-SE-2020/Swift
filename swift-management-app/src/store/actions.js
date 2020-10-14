import axios from "@/axios.js"
import state from "./state.js";

const actions = {

  // Vertical NavMenu
  updateVerticalNavMenuWidth({
    commit
  }, width) {
    commit('UPDATE_VERTICAL_NAV_MENU_WIDTH', width)
  },

  // VxAutoSuggest
  updateStarredPage({
    commit
  }, payload) {
    commit('UPDATE_STARRED_PAGE', payload)
  },

  // The Navbar
  arrangeStarredPagesLimited({
    commit
  }, list) {
    commit('ARRANGE_STARRED_PAGES_LIMITED', list)
  },
  arrangeStarredPagesMore({
    commit
  }, list) {
    commit('ARRANGE_STARRED_PAGES_MORE', list)
  },

  toggleContentOverlay({
    commit
  }) {
    commit('TOGGLE_CONTENT_OVERLAY')
  },
  updateTheme({
    commit
  }, val) {
    commit('UPDATE_THEME', val)
  },
  updateUserInfo({
    commit
  }, payload) {
    console.log(payload);
    commit('UPDATE_USER_INFO', payload)
  },
  setCurrentRestaurant({
    commit
  }, payload) {
    console.log(payload);
    commit('SET_CURRENT_RESTAURANT', payload);
  },
  retrieveMyRestaurants({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "listAdminRestaurants",
        "token": payload.authKey,
        "includeImage": true
      }).then(result => {
        console.log("My Restaurants", result);

        commit('SET_MY_RESTAURANTS', result.data.restaurants);

        //set current restaurant on initial load - then use localStorage
        if (result.data.restaurants.length > 0 && ((payload.currentRestaurantName == "null") || !(payload.currentRestaurantName)))
          commit('SET_CURRENT_RESTAURANT', {
            name: result.data.restaurants[0].name,
            id: result.data.restaurants[0].restaurantId
          });

        if (result.data.restaurants.length > 0) {
          var accessList = ["nothing"];
          for (var i = 0; i < state.AppActiveUser.employeeData.length; i++) {
            if (state.AppActiveUser.employeeData[i].restaurantId == result.data.restaurants[0].restaurantId) {
              accessList = state.AppActiveUser.employeeData[i].rights;
            }
          }
          localStorage.setItem("accessList", JSON.stringify(accessList));
        }

        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });

    });
  },
  editProfile({
    commit,
    dispatch
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "editProfile",
        "token": payload.token,
        "name": payload.name,
        "surname": payload.surname,
        "profileImage": payload.profileImage,
        "theme": "light"
      }).then(result => {

        dispatch("updateUserInfo", {
          displayName: payload.name + ' ' + payload.surname
        });
        dispatch("updateUserInfo", {
          photoURL: payload.profileImage
        });

        resolve(result);

      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });

    });
  },
}

export default actions