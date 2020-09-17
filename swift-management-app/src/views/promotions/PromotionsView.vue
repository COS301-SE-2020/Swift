<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Promotions</h2>
      </div>
      <vs-button @click="addPromo()" :disabled="addPromoButtonDisabled">Add Promo</vs-button>
    </div>
    <vs-card
      class="mb-4 mt-4 ml-4 mr-4 w-full sm:w-full md:w-full lg:w-1/2 xl:w-1/2 ml-auto mr-auto"
    >
      <h3 class="mb-2 mt-2 ml-2">Recommended Promos</h3>
      <p
        class="ml-2"
        style="font-size: 14px"
      >These items are frequently bought together. Grouping them together in a promo could lead to great sales!</p>
      <div class="flex flex-wrap">
        <div
          v-for="item in recommendedPromoItems"
          :key="item.menuItemId"
          class="mb-1 ml-1 mr-1 sm:w-full md:w-1/4 lg:w-1/4 xl:w-1/4 ml-auto mr-auto"
        >
          <vs-card
            type="border"
            class="miniMenuItem mediumSize largeSize"
            :style="'background:linear-gradient(120deg ,rgba(0,0,0,.6), rgba(0,0,0,0.1)),url('+item.images[0]+')'"
          >
            <p style="color:white;">{{ item.menuItemName }}</p>
          </vs-card>
        </div>
      </div>
    </vs-card>

    <vs-row v-if="promoCount <= 0" vs-type="flex" vs-justify="center" vs-align="center" vs-w="12">
      <vs-col class="mt-20" vs-sm="12" vs-lg="6">
        <vx-card>
          <h5 class="mb-1 text-center">No Promotions Yet</h5>
        </vx-card>
      </vs-col>
    </vs-row>
    <div class="flex flex-wrap">
      <vs-card
        class="text-center mb-4 mt-4 ml-4 mr-4 w-full sm:w-full md:w-full lg:w-1/2 xl:w-1/4 ml-auto mr-auto"
        v-for="promo in promos"
        :key="promo.promotionId"
      >
        <img class="existingPromoImage" :src="promo.image" />
        <h6 class="mb-2 mt-4">Description</h6>
        <p style="font-size: 14px">{{promo.message}}</p>

        <h6 class="mb-2 mt-4">Active Period</h6>
        <p style="font-size: 14px">{{formatDate(promo.startDate)}} - {{formatDate(promo.endDate)}}</p>

        <h6 class="mb-2 mt-4">Promotion Items</h6>
        <div class="flex flex-wrap">
          <div
            v-for="item in menuItemsByIds(promo.promotions[0].items)"
            :key="item.menuItemId"
            class="mb-1 ml-1 mr-1 sm:w-1/3 md:w-1/4 lg:w-1/4 xl:w-1/4 ml-auto mr-auto"
          >
            <vs-card
              type="border"
              class="miniMenuItem mediumSize"
              :style="'background:linear-gradient(120deg ,rgba(0,0,0,.6), rgba(0,0,0,0.1)),url('+item.images[0]+')'"
            >
              <p style="color:white;">{{ item.menuItemName }}</p>
            </vs-card>
          </div>
        </div>

        <h6 class="mb-2 mt-4">Active Days</h6>
        <vs-chip class="mb-8 mt-4" v-for="days in promo.days" :key="days">{{ days }}</vs-chip>
        <vs-divider></vs-divider>
        <div class="flex flex-wrap">
          <vs-alert color="dark" class="largeChip mb-2 mt-2 mr-4 w-1/3 ml-auto">
            Type:
            <span
              style="font-weight: 400"
            >{{ promo.type.charAt(0).toUpperCase() + promo.type.slice(1) }}</span>
          </vs-alert>
          <vs-alert color="dark" class="largeChip mb-2 mt-2 ml-4 w-1/3 mr-auto">
            Value:
            <span style="font-weight: 400">{{ promo.value }}</span>
          </vs-alert>
        </div>
      </vs-card>
    </div>

    <vs-popup class="text-center" title="Add Promotion" :active.sync="addPromoActive">
      <vs-textarea label="Promotion Description" v-model="newPromoDesc" />

      <h5 class="mb-2 mt-4">Menu Items</h5>
      <p class="mb-4 subTitle">Select the menu items to include in the discount</p>

      <vue-simple-suggest
        style="max-width:300px; margin: 0 auto"
        v-model="chosenItem"
        :list="menuItemNames"
        :filter-by-query="true"
        placeholder="Search for menu items"
        class="mb-4"
      ></vue-simple-suggest>

      <div class="flex flex-wrap">
        <div
          v-for="item in chosenItems"
          :key="item.menuItemId"
          class="mb-1 ml-2 mr-2 mt-2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/6"
        >
          <vs-card
            type="border"
            class="miniMenuItem"
            :style="'background:linear-gradient(120deg ,rgba(0,0,0,.6), rgba(0,0,0,0.1)),url('+item.images[0]+')'"
          >
            <feather-icon
              icon="XCircleIcon"
              svgClasses="text-white h-4 w-4"
              @click.stop="removeChosenItem(item.menuItemId)"
              class="cursor-pointer mr-2"
            ></feather-icon>
            <p style="color:white;">{{ item.menuItemName }}</p>
          </vs-card>
        </div>
      </div>

      <h5 class="mb-2 mt-4">Promotion Type</h5>
      <p class="mb-4 subTitle">Percentage or Value based discount</p>
      <ul class="flex flex-wrap">
        <li class="mb-2 w-full sm:w-full md:w-full lg:w-1/4 xl:w-1/4 ml-auto">
          <vs-radio v-model="newPromoType" vs-value="percent">Percentage</vs-radio>
        </li>
        <li class="mb-2 w-full sm:w-full md:w-full lg:w-1/4 xl:w-1/4 mr-auto">
          <vs-radio v-model="newPromoType" vs-value="total">Value</vs-radio>
        </li>
      </ul>

      <h5 class="mb-2 mt-4">Promotion Amount</h5>
      <p class="mb-4 subTitle">Amount of discount to be applied</p>
      <div class="text-center items-center">
        <vs-input
          style="margin: 0 auto; max-width: 100px"
          class="inputx text-center"
          type="number"
          placeholder="Discount"
          v-model="newPromoValue"
        />
      </div>
      <h5 class="mb-2 mt-4">Start and end date</h5>
      <p class="mb-4 subTitle">How long the promotion will run</p>
      <div class="flex flex-wrap">
        <div class="mb-2 w-full sm:w-full md:w-1/3 lg:w-1/3 xl:w-1/3 ml-auto">
          <div>
            <flat-pickr
              :config="configFromdateTimePicker"
              v-model="newPromoFromDate"
              placeholder="From Date"
            />
          </div>
        </div>
        <div class="mb-2 w-full sm:w-full md:w-1/3 lg:w-1/3 xl:w-1/3 mr-auto">
          <flat-pickr
            :config="configTodateTimePicker"
            v-model="newPromoToDate"
            placeholder="To Date"
          />
        </div>
      </div>

      <h5 class="mb-2 mt-4">Active Days</h5>
      <p class="mb-4 subTitle">Which days of the week the promotion will run</p>
      <ul class="flex flex-wrap centerx">
        <li
          class="w-full sm:w-full md:w-1/4 lg:w-1/4 xl:w-1/4 mb-4"
          v-for="item in newPromoActiveDays"
          :key="item.day"
        >
          <vs-checkbox v-model="item.value">{{ item.day }}</vs-checkbox>
        </li>
      </ul>

      <h5 class="mb-2 mt-4">Promo Image</h5>
      <p class="mb-4 subTitle">Select a vibrant image for the promotion</p>
      <vx-card class="mb-4">
        <vs-button type="border" size="small" @click="chooseFiles()">Choose promo image</vs-button>
        <input
          hidden
          ref="uploadImageInputRef"
          id="uploadImageInput"
          type="file"
          @change="updateImage"
          accept="image/*"
        />
        <div
          ref="promoImageUploadPreview"
          id="promoImageUploadPreview"
          hidden
          class="mt-4 rounded-lg"
          :style="'background-image:url('+newPromoImage+')'"
        ></div>
      </vx-card>
      <vs-button type="border" @click="submitNewPromo">Add Promotion</vs-button>
    </vs-popup>
  </div>
</template>
data<script>
import promoDataList from "@/store/promos/promosDataList.js";
import VueSimpleSuggest from "vue-simple-suggest";
import "vue-simple-suggest/dist/styles.css";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

export default {
  components: {
    VueSimpleSuggest,
    flatPickr,
  },
  data() {
    return {
      addPromoButtonDisabled: true,
      addPromoActive: false,
      menuItems: [],
      menuItemNames: [],
      chosenItem: "",
      chosenItems: [],
      newPromoDesc: "",
      newPromoImage: "",
      newPromoFromDate: "",
      newPromoToDate: "",
      configFromdateTimePicker: {
        minDate: new Date(),
        maxDate: null,
      },
      configTodateTimePicker: {
        minDate: null,
      },
      newPromoActiveDays: [
        { day: "Monday", value: true },
        { day: "Tuesday", value: true },
        { day: "Wednesday", value: true },
        { day: "Thursday", value: true },
        { day: "Friday", value: true },
        { day: "Saturday", value: true },
        { day: "Sunday", value: true },
      ],
      newPromoType: "percent",
      newPromoValue: 0,
    };
  },
  computed: {
    recommendedPromoItems() {
      if (!this.restaurantObject) return [];
      return [
        this.restaurantObject.categories[3].menuItems[1],
        this.restaurantObject.categories[5].menuItems[1],
        this.restaurantObject.categories[2].menuItems[1],
      ];
      var menuList = [];
      this.recommendedPromos.forEach((id) => {
        for (var i = 0; i < this.restaurantObject.categories.length; i++)
          for (
            var j = 0;
            j < this.restaurantObject.categories[i].menuItems.length;
            j++
          ) {
            var item = this.restaurantObject.categories[i].menuItems[j];
            if (id == item.menuItemId) {
              menuList.push(item);
            }
          }
      });
      return menuList;
    },
    promos() {
      if (this.$store.state.promoData) {
        return this.$store.state.promoData.promos;
      } else return null;
    },
    recommendedPromos() {
      if (this.$store.state.promoData) {
        return this.$store.state.promoData.recommendedPromos;
      } else return null;
    },
    restaurantObject() {
      if (this.$store.state.myRestaurants) {
        for (var i = 0; i < this.$store.state.myRestaurants.length; i++)
          if (
            this.$store.state.myRestaurants[i].restaurantId ==
            this.getCurrentRestaurantId()
          ) {
            this.addPromoButtonDisabled = false;
            return this.$store.state.myRestaurants[i];
          }
      } else {
        return null;
      }
    },
    promoCount() {
      if (this.promos) return this.promos.length;
      else return 0;
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toDateString();
    },
    menuItemsByIds(idList) {
      if (!idList) return [];
      if (!this.restaurantObject) return [];
      var menuList = [];
      idList.forEach((id) => {
        for (var i = 0; i < this.restaurantObject.categories.length; i++)
          for (
            var j = 0;
            j < this.restaurantObject.categories[i].menuItems.length;
            j++
          ) {
            var item = this.restaurantObject.categories[i].menuItems[j];
            if (item.menuItemId == id.itemId) {
              menuList.push(item);
            }
          }
      });
      return menuList;
    },
    removeChosenItem(id) {
      for (var i = 0; i < this.chosenItems.length; i++) {
        if (this.chosenItems[i].menuItemId == id) this.chosenItems.splice(i, 1);
      }
    },
    chooseFiles() {
      this.$refs.uploadImageInputRef.click();
    },
    updateImage() {
      var reader = new FileReader();
      reader.readAsDataURL(this.$refs.uploadImageInputRef.files[0]);
      reader.onload = () => {
        this.setnewPromoImage(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    },
    setnewPromoImage(image) {
      this.newPromoImage = image;
      this.$refs.promoImageUploadPreview.style.display = "block";
    },
    addPromo() {
      this.addPromoActive = true;
    },
    createMenuItemsFilterList() {
      if (!this.restaurantObject) return;
      this.menuItems = [];
      this.menuItemNames = [];
      if (this.restaurantObject.categories)
        this.restaurantObject.categories.forEach((category) => {
          category.menuItems.forEach((item) => {
            this.menuItems.push(item);
            this.menuItemNames.push(item.menuItemName);
          });
        });
    },
    submitNewPromo() {
      var selectedDays = [];
      this.newPromoActiveDays.forEach((day) => {
        if (day.value == true) selectedDays.push(day.day);
      });
      var chosenItemIds = [];
      this.chosenItems.forEach((item) => {
        chosenItemIds.push({ itemId: item.menuItemId, attribute: {} });
      });
      this.$store
        .dispatch("promoData/addNewPromo", {
          message: this.newPromoDesc,
          image: this.newPromoImage,
          startDate: this.newPromoFromDate,
          endDate: this.newPromoToDate,
          days: selectedDays,
          value: this.newPromoValue,
          type: this.newPromoType,
          promotions: [{ items: chosenItemIds }],
          restaurantId: this.getCurrentRestaurantId(),
          authKey: this.getAuthToken(),
        })
        .then((res) => {
          if (res.status == 201 || res.status == 200) {
            this.listPromos();
            this.$vs.notify({
              title: "Promotion successfully created!",
              text: "Wohoo!",
              color: "success",
            });
          }
        });
      this.addPromoActive = false;
    },
    listPromos() {
      /*  this.$store.dispatch("promoData/listRecommendedPromo", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      }); */

      this.$store.dispatch("promoData/listPromos", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!promoDataList.isRegistered) {
        this.$store.registerModule("promoData", promoDataList);
        promoDataList.isRegistered = true;
      }
      if (this.promos == null) this.$vs.loading();
      this.listPromos();
    }
  },
  watch: {
    restaurantObject: function () {
      this.createMenuItemsFilterList();
    },
    chosenItem: function (val) {
      if (this.menuItemNames.includes(val)) {
        var exists = false;
        //check if item already selected
        this.chosenItems.forEach((item) => {
          if (item.menuItemName == val) exists = true;
        });

        if (!exists)
          //if item has not yet been selected, add it to the selection
          this.menuItems.forEach((item) => {
            if (item.menuItemName == val) this.chosenItems.push(item);
          });
        this.chosenItem = "";
      }
    },
    newPromoFromDate: function (val) {
      this.configTodateTimePicker.minDate = new Date(val);
    },
    promos(newCount, oldCount) {
      this.$vs.loading.close();
    },
  },
};
</script>
<style lang="scss">
@import "@/assets/scss/vuexy/extraComponents/autocomplete.scss";
</style>

<style scoped>
.miniMenuItem {
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  width: 70px !important;
  height: 70px !important;
  display: table;
  text-align: center;
}
.miniMenuItem >>> .vx-card__body {
  padding: 0px;
}
.miniMenuItem >>> .vs-card--content {
  display: table-cell;
  vertical-align: middle;
}
.mediumSize {
  margin: 20px !important;
}
.largeSize {
  width: 120px !important;
}
#promoImageUploadPreview {
  height: 200px;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: none;
}
.subTitle {
  font-size: 12px;
}
.existingPromoImage {
  width: 90%;
  height: auto;
  margin: 20px;
  border-radius: 10px;
}
.largeChip {
  height: 50px !important;
  display: table;
  text-align: center;
}
.largeChip >>> .vs-alert {
  display: table-cell;
  vertical-align: middle;
}
@media (max-width: 600px) {
  .existingPromoImage {
    max-width: 250px;
  }
}
@media (max-width: 350px) {
  .existingPromoImage {
    max-width: 200px;
  }
}
</style>
