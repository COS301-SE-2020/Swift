<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">My Business</h2>
      </div>
    </div>
    <vs-row vs-w="12">
      <vs-col
        v-for="business in myRestaurants"
        :key="business.restaurantId"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-w="12"
      >
        <vx-card class="mb-4">
          <vs-row vs-w="12">
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-lg="6" vs-sm="12">
              <div
                :style="'background-image: url('+business.image+')'"
                class="restaurantCover rounded-lg"
              ></div>
            </vs-col>
            <vs-col style="margin: auto;" class="text-center" vs-lg="6" vs-sm="12">
              <h2 class="mb-4">{{ business.name }}</h2>
              <vs-chip
                style="float: none; max-width: 200px; margin: auto"
                class="mb-4"
                color="primary"
              >Branch: {{ business.branch }}</vs-chip>
              <div class="newRestaurantDescription mb-4">{{ business.description }}</div>

              <vs-button @click="editRestaurant(business)" type="border">
                <span class="flex items-center">
                  <feather-icon icon="EditIcon" svgClasses="h-4 w-4 mr-1" />
                  <span>Edit</span>
                </span>
              </vs-button>
            </vs-col>
          </vs-row>
        </vx-card>
      </vs-col>
    </vs-row>
    <div class="text-center mt-4">
      <vs-button @click="addRestaurant()" type="border" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Add Restaurant</span>
        </span>
      </vs-button>
    </div>
    <vs-popup
      class="text-center"
      :title="restaurantPopupTitle"
      :active.sync="restaurantPopupActive"
    >
      <form>
        <vs-row>
          <vs-col
            class="mb-4"
            vs-type="flex"
            vs-justify="center"
            vs-align="center"
            vs-lg="6"
            vs-sm="12"
          >
            <vs-input
              label="Restaurant Name"
              placeholder="Mug & Bean"
              v-model.trim="$v.newRestaurantName.$model"
            />
          </vs-col>
          <vs-col
            class="mb-4"
            vs-type="flex"
            vs-justify="center"
            vs-align="center"
            vs-lg="6"
            vs-sm="12"
          >
            <vs-input label="Branch" placeholder="Centurion Mall" v-model="newRestaurantBranch" />
          </vs-col>
        </vs-row>
        <vs-row>
          <vs-col
            vs-offset="1"
            class="mb-2"
            vs-type="flex"
            vs-justify="center"
            vs-align="center"
            vs-lg="10"
            vs-sm="12"
          >
            <vs-textarea label="Description" v-model="newRestaurantDesc" />
          </vs-col>
        </vs-row>
        <p class="vs-input--label mb-2">Target Sales (per day)</p>
        <vs-input
          style="margin: 0 auto"
          type="number"
          min="1"
          placeholder="Sales Per Day Goal"
          v-model="salesPerDay"
          class="mb-4 text-center"
        ></vs-input>

        <label class="vs-input--label">Select (up to 3) Restaurant Categories</label>
        <div style="margin: auto" class="vx-row mt-4">
          <vx-card
            :ref="'categoryCard'+category.categoryId"
            style="pointer-events: all;cursor: pointer;"
            @click="selectCategory($event, category.categoryId)"
            class="categoryOptionCards mr-2 ml-2 mb-6 md:w-1/6 lg:w-1/6 xl:w-1/6"
            v-for="category in restaurantCategoryOptions"
            :key="category.categoryId"
            type="border"
            :card-background="'linear-gradient(120deg ,rgba(0,0,0,.6), rgba(0,0,0,0.1)),url('+category.categoryImage+')'"
          >
            <p style="color:white;pointer-events: none;">{{ category.categoryName }}</p>
          </vx-card>
        </div>

        <vx-card>
          <vs-button type="border" size="small" @click="chooseFiles()">Choose header image</vs-button>
          <input
            hidden
            ref="uploadImageInputRef"
            id="uploadImageInput"
            type="file"
            @change="updateImage"
            accept="image/*"
          />
          <div
            id="restaurantCoverUploadPreview"
            hidden
            class="mt-4 rounded-lg"
            :style="'background-image:url('+newRestaurantImage+')'"
          ></div>
        </vx-card>
        <vs-button
          @click="restaurantPopupSubmit"
          style="margin-top:15px"
          color="primary"
          type="filled"
        >{{ restaurantPopupButton }}</vs-button>
      </form>
    </vs-popup>
  </div>
</template>
<script>
import moduleDataList from "@/store/mybusiness/mybusinessDataList.js";
import { required, minLength, between } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      salesPerDay: 0,
      restaurantPopupAction: "",
      restaurantPopupTitle: "",
      restaurantPopupButton: "",
      restaurantPopupActive: false,
      newRestaurantName: "",
      newRestaurantBranch: "",
      newRestaurantDesc: "",
      newRestaurantImage: "",
      newRestaurantCategories: [],
      newPopupCount: 0,
    };
  },
  computed: {
    myRestaurants() {
      if (this.$store.state) return this.$store.state.myRestaurants;
      else return null;
    },
    restaurantCategoryOptions() {
      return this.$store.state.mybusinessData.restaurantCategoryOptions;
    },
  },
  methods: {
    addFirstItemPrompt() {
      this.newPopupCount++;
      if (this.newPopupCount > 1) return;
      this.$vs.dialog({
        color: "primary",
        title: "Let's create your Business!",
        text:
          "To get those customers coming, they'll need to know a little bit about your restaurant. Let's set it up now.",
        accept: this.addRestaurant,
        acceptText: "Add Restaurant",
      });
    },
    selectCategory(event, id) {
      var cardElement = event.target;
      var index = this.newRestaurantCategories.indexOf(id);

      if (index > -1) {
        cardElement.style.opacity = "0.5";
        this.newRestaurantCategories.splice(index, 1);
      } else if (this.newRestaurantCategories.length < 3) {
        this.newRestaurantCategories.push(id);
        cardElement.style.opacity = "1";
      }
    },
    chooseFiles() {
      this.$refs.uploadImageInputRef.click();
    },
    updateImage() {
      var reader = new FileReader();
      reader.readAsDataURL(this.$refs.uploadImageInputRef.files[0]);
      reader.onload = () => {
        this.setnewRestaurantImage(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    },
    setnewRestaurantImage(image) {
      this.newRestaurantImage = image;
      document.getElementById("restaurantCoverUploadPreview").style.display =
        "block";
    },
    editRestaurant(business) {
      this.restaurantPopupAction = "edit";
      this.restaurantPopupTitle = "Edit Restaurant";
      this.restaurantPopupButton = "Save Restaurant";
      //set fields to business being edited
      this.salesPerDay = business.serviceGoal;
      this.newRestaurantName = business.name;
      this.newRestaurantDesc = business.description;
      this.newRestaurantBranch = business.branch;
      this.setnewRestaurantImage(business.image);
      if (business.restaurantCategories)
        for (var i = 0; i < business.restaurantCategories.length; i++) {
          this.$refs[
            "categoryCard" + business.restaurantCategories[i]
          ][0].$el.click();
        }
      //show popup
      this.restaurantPopupActive = true;
    },
    addRestaurant() {
      this.restaurantPopupAction = "add";
      this.restaurantPopupTitle = "Add New Restaurant";
      this.restaurantPopupButton = "Create Restaurant";
      this.restaurantPopupActive = true;
    },
    restaurantPopupSubmit() {
      if (this.restaurantPopupAction == "add") {
        this.$store.dispatch("mybusinessData/addNewRestaurant", {
          restaurantName: this.newRestaurantName,
          restaurantDesc: this.newRestaurantDesc,
          restaurantBranch: this.newRestaurantBranch,
          restaurantImage: this.newRestaurantImage,
          restaurantCategories: JSON.stringify(this.newRestaurantCategories),
          restaurantSalesGoal: this.salesPerDay,
          authKey: this.getAuthToken(),
        });
        this.restaurantPopupActive = false;
      } else if (this.restaurantPopupAction == "edit") {
        this.$store
          .dispatch("mybusinessData/editRestaurant", {
            restaurantName: this.newRestaurantName,
            restaurantDesc: this.newRestaurantDesc,
            restaurantBranch: this.newRestaurantBranch,
            restaurantImage: this.newRestaurantImage,
            restaurantCategories: JSON.stringify(this.newRestaurantCategories),
            restaurantId: this.getCurrentRestaurantId(),
            restaurantSalesGoal: this.salesPerDay,
            authKey: this.getAuthToken(),
          })
          .then((res) => {
            if (res.status == 201) {
              this.listMyRestaurants();
              this.$vs.notify({
                title: "Restaurant edit successful",
                text: "Restaurant information has been updated.",
                color: "success",
              });
            }
          });
        this.restaurantPopupActive = false;
      }
    },
    listMyRestaurants() {
      this.$store.dispatch("retrieveMyRestaurants", {
        authKey: this.getAuthToken(),
        currentRestaurantName: this.getCurrentRestaurantName(),
      });

      this.$store.dispatch("mybusinessData/retrieveRestaurantCategories", {
        authKey: this.getAuthToken(),
      });
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("mybusinessData", moduleDataList);
        moduleDataList.isRegistered = true;
      }

      if (this.myRestaurants == null) this.$vs.loading();

      this.listMyRestaurants();
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    myRestaurants(newCount, oldCount) {
      this.$vs.loading.close();
      if (this.myRestaurants.length <= 0) this.addFirstItemPrompt();
    },
  },
  validations: {
    newRestaurantName: {
      required,
    },
  },
};
</script>

<style scoped>
.newRestaurantDescription {
  font-size: 15px;
  font-weight: 300;
  max-width: 90%;
  margin: 0 auto;
}
.restaurantCover {
  height: 400px;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
#restaurantCoverUploadPreview {
  height: 200px;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: none;
}
.categoryOptionCards {
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  height: 60px;
  opacity: 0.5;
}
.categoryOptionCards >>> .vx-card__body {
  padding: 0px;
  pointer-events: none;
}
.categoryOptionCards >>> .vx-card__collapsible-content {
  margin: 0;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  pointer-events: none;
}
@media (max-width: 600px) {
  .restaurantCover {
    margin-bottom: 10px;
  }
}
</style>