export default {
    SET_RESTAURANT_CATEGORY_OPTIONS(state, restaurantCategoryOptions) {
        state.restaurantCategoryOptions = restaurantCategoryOptions;
    },
    ADD_RESTAURANT(state, restaurant){
      state.businesses.unshift(restaurant);
    }
}
