<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Promotions</h2>
      </div>
      <vs-button @click="addPromo()">Add Promo</vs-button>
    </div>
    <vs-popup class="text-center" title="Add Promotion" :active.sync="addPromoActive">
      <vue-simple-suggest
        v-model="chosenItem"
        :list="menuItemNames"
        :filter-by-query="true"
        placeholder="Search for a menu item"
      ></vue-simple-suggest>

      <h5>Placeholder</h5>
    </vs-popup>
  </div>
</template>
<script>
import modulemenuList from "@/store/menu/menuDataList.js";
import VueSimpleSuggest from "vue-simple-suggest";
import "vue-simple-suggest/dist/styles.css";
export default {
  components: {
    VueSimpleSuggest,
  },
  data() {
    return {
      addPromoActive: false,
      menuItems: [],
      menuItemNames: [],
      chosenItem: "",
      chosenItems: [],
    };
  },
  computed: {
    restaurantObject() {
      if (this.$store.state.menuList)
        return this.$store.state.menuList.restaurantObject;
      else return null;
    },
  },
  methods: {
    addPromo() {
      this.createMenuItemsFilterList();
      this.addPromoActive = true;
    },
    createMenuItemsFilterList() {
      this.menuItems = [];
      this.menuItemNames = [];
      this.restaurantObject.categories.forEach((category) => {
        category.menuItems.forEach((item) => {
          this.menuItems.push(item);
          this.menuItemNames.push(item.menuItemName);
        });
      });
    },
    listMenuItems() {
      this.$store.dispatch("menuList/listMenuItems", {
        authKey: this.getAuthToken(),
        currentRestaurantId: this.getCurrentRestaurantId(),
      });
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!modulemenuList.isRegistered) {
        this.$store.registerModule("menuList", modulemenuList);
        modulemenuList.isRegistered = true;
      }
      this.listMenuItems(); //load menu items in order to select them for promotions
    }
  },
  watch: {
    chosenItem: function (val) {
      if (
        this.menuItemNames.includes(val) &&
        this.chosenItems.indexOf(val) < 0
      ) {
        this.chosenItems.push(val);
        this.chosenItem = "";
      }
    },
  },
};
</script>
<style lang="scss">
@import "@/assets/scss/vuexy/extraComponents/autocomplete.scss";
</style>
