import navbarSearchAndPinList from "@/layouts/components/navbar/navbarSearchAndPinList"
import baseConfig from "@/../baseConfig.js"
import colors from "@/../baseConfig.js"

//User Profile
var userDefaults = {
  uid         : 0,          // From Auth
  displayName : "Stacey Barror", // From Auth
  about       : "I am a driven entrepreneur & third year student at the University or Pretoria studying BSc Information and Knowledge Systems.",
  photoURL    : require("@/assets/images/portrait/small/avatar-s-10.jpg"), // From Auth
  status      : "online",
  userRole    : "admin"
}

// /////////////////////////////////////////////
// State
// /////////////////////////////////////////////

const state = {
    AppActiveUser           : userDefaults,
    bodyOverlay             : false,
    isVerticalNavMenuActive : true,
    mainLayoutType          : baseConfig.mainLayoutType || "vertical",
    navbarSearchAndPinList  : navbarSearchAndPinList,
    reduceButton            : baseConfig.sidebarCollapsed,
    verticalNavMenuWidth    : "default",
    verticalNavMenuItemsMin : false,
    scrollY                 : 0,
    starredPages            : navbarSearchAndPinList["pages"].data.filter((page) => page.is_bookmarked),
    theme                   : baseConfig.theme || "light",
    themePrimaryColor       : colors.primary,

    // Can be used to get current window with
    // Note: Above breakpoint state is for internal use of sidebar & navbar component
    windowWidth: null,
    myRestaurants: null,
    currentRestaurant: null,
}

export default state
