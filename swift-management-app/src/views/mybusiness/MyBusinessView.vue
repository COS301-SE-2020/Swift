<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">My Business</h2>
      </div>
    </div>
    <vs-row vs-w="12">
      <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="12">
        <vx-card class="mb-4">
          <vs-row vs-w="12">
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-lg="6" vs-sm="12">
              <div
                style="background-image: url('https://images.unsplash.com/photo-1519155031214-e8d583928bf2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80')"
                class="restaurantCover rounded-lg"
              ></div>
            </vs-col>
            <vs-col style="margin: auto;" class="text-center" vs-lg="6" vs-sm="12">
              <h2 class="mb-4">O'Galito</h2>
              <vs-chip
                style="float: none; max-width: 200px; margin: auto"
                class="mb-4"
                color="primary"
              >Branch: Centurion Mall</vs-chip>
              <div
                class="restaurantDescription mb-4"
              >O’Galito is an upmarket restaurant specialising in preparing exceptionally fine Portuguese dishes, complimented with world class service.</div>

              <vs-button @click="editRestaurant()" type="border">
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
      <vs-row>
        <vs-col
          class="mb-4"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          vs-lg="6"
          vs-sm="12"
        >
          <vs-input label="Restaurant Name" placeholder="Mug & Bean" v-model="restaurantName" />
        </vs-col>
        <vs-col
          class="mb-4"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          vs-lg="6"
          vs-sm="12"
        >
          <vs-input label="Branch" placeholder="Centurion Mall" v-model="restaurantBranch" />
        </vs-col>
      </vs-row>
      <vs-row>
        <vs-col
          vs-offset="1"
          class="mb-4"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          vs-lg="10"
          vs-sm="12"
        >
          <vs-textarea label="Description" v-model="restaurantDesc" />
        </vs-col>
      </vs-row>
      <vx-card>
        <vs-button type="border" size="small" @click="chooseFiles()">Choose header image</vs-button>
        <input hidden id="uploadImageInput" type="file" @change="updateImage" accept="image/*" />
        <div
          id="restaurantCoverUploadPreview"
          hidden
          class="mt-4 rounded-lg"
          :style="'background-image:url('+restaurantImage+')'"
        ></div>
      </vx-card>
      <vs-button
        @click="addRestaurantSubmit()"
        style="margin-top:15px"
        color="primary"
        type="filled"
      >{{ restaurantPopupButton }}</vs-button>
    </vs-popup>
  </div>
</template>
<script>

export default {
  data() {
    return {
      restaurantPopupAction: "",
      restaurantPopupTitle: "",
      restaurantPopupButton: "",
      restaurantPopupActive: false,
      restaurantName: "",
      restaurantBranch: "",
      restaurantDesc: "",
      restaurantImage: "",
    };
  },
  methods: {
    chooseFiles() {
      document.getElementById("uploadImageInput").click();
    },
    updateImage() {
      var reader = new FileReader();
      reader.readAsDataURL(
        document.getElementById("uploadImageInput").files[0]
      );
      reader.onload = () => {
        this.setRestaurantImage(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    },
    setRestaurantImage(image) {
      this.restaurantImage = image;
      document.getElementById("restaurantCoverUploadPreview").style.display =
        "block";
    },
    editRestaurant(){
      this.restaurantPopupAction = "edit";
      this.restaurantPopupTitle = "Edit Restaurant";
      this.restaurantPopupButton = "Save Restaurant";
      this.restaurantPopupActive = true;
    },
    addRestaurant(){
      this.restaurantPopupAction = "add";
      this.restaurantPopupTitle = "Add New Restaurant";
      this.restaurantPopupButton = "Create Restaurant";
      this.restaurantPopupActive = true;
    }
  },
};
</script>

<style scoped>
.restaurantDescription {
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
@media (max-width: 600px) {
  .restaurantCover {
    margin-bottom: 10px;
  }
}
</style>