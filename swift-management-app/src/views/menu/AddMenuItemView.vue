<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Add Menu Item</h2>
      </div>
      <vs-divider></vs-divider>
      <vs-button @click="$router.push('/menu')" type="filled" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="ArrowLeftIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Back to Menu</span>
        </span>
      </vs-button>
    </div>
    <div class="vx-row">
      <div class="vx-col sm:w-1/2 w-full mb-2">
        <vx-card
          class="mb-4"
          title="General"
          title-color="primary"
          collapse-action
          subtitle="Provide the base description of the item"
        >
          <vs-dropdown vs-trigger-click class="dd-actions cursor-pointer mr-4 mb-4">
            <div
              class="p-4 shadow-drop rounded-lg d-theme-dark-bg cursor-pointer flex items-center justify-center text-lg font-medium w-32 w-full"
            >
              <span class="mr-2">{{ itemCategoryTitle }}</span>
              <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
            </div>
            <vs-dropdown-menu style="z-index:99999">
              <vs-dropdown-item v-for="category in restaurantObject.categories" :key="category.categoryName">
                <vs-button type="flat"  @click="itemCategory = category.categoryName" v-if="category.type == 'primary'">{{ category.categoryName }}</vs-button>
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <vs-dropdown v-if="itemCategory" vs-trigger-click class="dd-actions cursor-pointer mr-4 mb-4">
            <div
              class="p-4 shadow-drop rounded-lg d-theme-dark-bg cursor-pointer flex items-center justify-center text-lg font-medium w-32 w-full"
            >
              <span class="mr-2">Sub-Category</span>
              <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
            </div>
            <vs-dropdown-menu>
              <vs-dropdown-item>
                <span>Menu 1</span>
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>

          <vs-button @click="addMenuItem()" type="border" class="mb-4 mr-4">
            <span class="flex items-center">
              <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
              <span>Add category</span>
            </span>
          </vs-button>

          <vs-row class="vx-row mb-4">
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input label="Item Name" v-model="itemName" />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input type="number" label="Price (ZAR)" min="0" step="0.5" v-model="itemPrice" />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input
                type="number"
                label="Preperation Time (min)"
                min="0"
                v-model="itemPrepTime"
              />
            </vs-col>
          </vs-row>

          <vs-textarea v-model="itemDescription" label="Item Description" height="200" />
        </vx-card>
      </div>
      <div class="vx-col sm:w-1/2 w-full mb-2">
        <vx-card title="Item Preview" class="mb-4" title-color="primary" collapse-action>
          <h2>{{ itemName }}</h2>
          <p>{{ itemDescription }}</p>
          <vs-divider></vs-divider>
          <vs-chip class="mb-2" color="primary">Price: R{{ itemPrice }}</vs-chip>
          <vs-chip class="mb-2" color="success">Preperation: {{ itemPrepTime }}min</vs-chip>
          <vs-divider color="white"></vs-divider>
        </vx-card>
      </div>
    </div>

    <vx-card
      title="Add-ons"
      class="mb-4"
      title-color="primary"
      collapse-action
      subtitle="Specify the item-specific attributes"
    >Add-ons</vx-card>
    <vx-card
      title="Images"
      class="mb-4"
      title-color="primary"
      collapse-action
      subtitle="Bring the menu item to life with vibrant images"
    >
      <vs-upload
        multiple
        max="3"
        text="Upload Images"
        action="https://jsonplaceholder.typicode.com/posts/"
        @on-success="successUpload"
      />
    </vx-card>
    <vs-row>
      <vs-col
        class="mt-3"
        vs-offset="4"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-w="4"
      >
        <vs-button @click="addMenuItem()" type="filled" class="mb-4 mr-4">
          <span class="flex items-center">
            <feather-icon icon="SaveIcon" svgClasses="h-4 w-4 mr-1" />
            <span>Save Item</span>
          </span>
        </vs-button>
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
import modulemenuList from "@/store/menu/menuDataList.js";

export default {
  data() {
    return {
      itemName: "Moroccan Butternut",
      itemDescription:
        "Roasted butternut, spiced chickpeas, candied walnuts, cherry tomatoes, feta & spring onions tossed with mixed lettuce.",
      itemPrice: 20.5,
      itemPrepTime: 10,
      itemCategory: ''
    };
  },
  computed: {
    restaurantObject() {
      return this.$store.state.menuList.restaurantObject;
    },
    itemCategoryTitle() {
      if(this.itemCategory)
        return this.itemCategory;
      else
        return "Item Category";
    }
  },
  methods: {
    successUpload() {
      this.$vs.notify({
        color: "success",
        title: "Upload Success",
        text: "Lorem ipsum dolor sit amet, consectetur",
      });
    },
  },
  created() {
    if (!modulemenuList.isRegistered) {
      this.$store.registerModule("menuList", modulemenuList);
      modulemenuList.isRegistered = true;
    }
    //if menu has not been loaded yet, load it first
    if(Object.keys(this.restaurantObject).length === 0){
     this.$store.dispatch("menuList/listMenuItems");
    }
  },
};
</script>
        