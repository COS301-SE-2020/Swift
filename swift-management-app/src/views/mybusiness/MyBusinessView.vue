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

              <vs-button type="border">
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
      <vs-button type="border" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Add Restaurant</span>
        </span>
      </vs-button>
    </div>

    <vs-popup
      class="addRestaurantPopup text-center"
      title="Add new Restaurant"
      :active.sync="addTablePopupActive"
    >
      <AddRestaurantPopup></AddRestaurantPopup>
      <vs-button
        @click="addTable()"
        style="margin-top:15px"
        color="primary"
        type="filled"
      >Create Restaurant</vs-button>
    </vs-popup>
  </div>
</template>
<script>
import AddRestaurantPopup from "../../components/AddRestaurantPopup";

export default {
  components: {
    AddRestaurantPopup,
  },
  data() {
    return {
      addTablePopupActive: true,
    };
  },

  /*
	"requestType": "createRestaurant",
  "name": "O'Galito",
  "description": "O’Galito is an upmarket restaurant specialising in preparing exceptionally fine Portuguese dishes, complimented with world class service.",
  "location": "Centurion Mall",
  "coverImageURL": "data:image/jpeg;base64...",
  "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUN"
  */
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
@media (max-width: 600px) {
  .restaurantCover {
    margin-bottom: 10px;
  }
}
</style>