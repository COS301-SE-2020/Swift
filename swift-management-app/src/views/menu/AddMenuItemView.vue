<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Add Menu Item</h2>
      </div>
      <label class="mr-4">Bulk add mode</label>
      <vs-switch color="success" v-model="bulkAddMode" />
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
              <vs-dropdown-item v-for="category in allCategories" :key="category.categoryName">
                <span
                  v-if="category.type == 'primary'"
                  @click="itemCategoryName = category.categoryName; itemCategory = category.categoryId"
                >{{ category.categoryName }}</span>

                <span
                  v-if="category.type == 'secondary'"
                  class="ml-4"
                  @click="itemCategoryName = category.categoryName; itemCategory = category.categoryId"
                >{{ category.categoryName }}</span>
              </vs-dropdown-item>
              <vs-dropdown-item v-if="primaryCategories.length == 0">
                <span @click="addCategoryPopupActive=true">No categories yet</span>
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <vs-button @click="addCategoryPopupActive=true" type="border" class="mb-4 mr-4">
            <span class="flex items-center">
              <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
              <span>Add Category</span>
            </span>
          </vs-button>

          <vs-row class="vx-row mb-4">
            <vs-col
              class="mb-4"
              vs-type="flex"
              vs-justify="center"
              vs-align="center"
              vs-lg="4"
              vs-sm="12"
            >
              <vs-input label="Item Name" v-model="itemName" />
            </vs-col>
            <vs-col
              class="mb-4"
              vs-type="flex"
              vs-justify="center"
              vs-align="center"
              vs-lg="4"
              vs-sm="12"
            >
              <vs-input type="number" label="Price (ZAR)" min="0" step="0.5" v-model="itemPrice" />
            </vs-col>
            <vs-col
              class="mb-4"
              vs-type="flex"
              vs-justify="center"
              vs-align="center"
              vs-lg="4"
              vs-sm="12"
            >
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
          <vs-divider>Add-ons</vs-divider>

          <vs-list v-for="addOn in itemAddons" :key="addOn.id">
            <vs-list-header v-if="addOn.attributeName" :title="addOn.attributeName"></vs-list-header>

            <vs-list-item
              v-for="attributeValue in addOn.values"
              :key="attributeValue.id"
              :title="attributeValue.name"
              :subtitle="'R'+attributeValue.price"
            ></vs-list-item>
          </vs-list>

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
    >
      <div class="addOnsList" v-for="addOn in itemAddons" :key="addOn.id">
        <vs-divider color="primary">{{ addOn.attributeName }}</vs-divider>
        <vs-row class="mb-4">
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input
              label="Attribute Name"
              placeholder="Preperation of Eggs"
              v-model="addOn.attributeName"
            />
          </vs-col>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <p>How many can they select:</p>
            <vs-input-number
              label="min"
              style="max-width: 200px; margin: 0 auto"
              v-model="addOn.min"
              icon-inc="expand_less"
              icon-dec="expand_more"
            />
          </vs-col>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input-number
              label="max"
              style="max-width: 200px; margin: 0 auto"
              v-model="addOn.max"
              icon-inc="expand_less"
              icon-dec="expand_more"
            />
          </vs-col>
        </vs-row>
        <vs-divider>Attribute Values</vs-divider>
        <div
          class="attributesValuesList"
          v-for="attributeValue in addOn.values"
          :key="attributeValue.id"
        >
          <vs-row class="mb-8">
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="3"></vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-input
                label="Value name"
                placeholder="Hard, soft, etc."
                v-model="attributeValue.name"
              />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-input
                type="number"
                label="Additional Price (ZAR)"
                min="0"
                step="0.5"
                v-model="attributeValue.price"
              />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-checkbox v-model="attributeValue.selectedByDefault">selected by default</vs-checkbox>
            </vs-col>
          </vs-row>
        </div>
        <div class="text-center">
          <vs-button
            color="dark"
            @click="addAddOnValue(addOn.id)"
            size="small"
            type="border"
            class="mb-4 mr-4"
          >
            <span class="flex items-center">
              <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
              <span>New Value</span>
            </span>
          </vs-button>
        </div>
      </div>
      <vs-divider></vs-divider>
      <div class="text-center">
        <vs-button @click="addAddOn()" type="border" class="mb-4 mr-4">
          <span class="flex items-center">
            <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
            <span>New Item Add-On</span>
          </span>
        </vs-button>
      </div>
    </vx-card>
    <vx-card
      title="Images"
      class="mb-4"
      title-color="primary"
      collapse-action
      subtitle="Bring the menu item to life with vibrant images"
    >
      <vs-row vs-w="12" class="text-center">
        <vs-col
          style="margin: auto"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          vs-lg="6"
          vs-xs="12"
        >
          <vx-card>
            <vs-button type="border" size="small" @click="chooseFiles()">Choose item image</vs-button>
            <input
              hidden
              ref="uploadImageInputRef"
              id="uploadImageInput"
              type="file"
              @change="updateItemImage"
              accept="image/*"
            />
            <div
              id="itemImageUploadPreview"
              hidden
              class="mt-4 rounded-lg"
              :style="'background-image:url('+itemImage+')'"
            ></div>
          </vx-card>
        </vs-col>
      </vs-row>
    </vx-card>

    <div class="text-center">
      <vs-button @click="addMenuItem()" type="filled" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="SaveIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Save Item</span>
        </span>
      </vs-button>
    </div>
    <vs-popup
      class="addCategoryPopup text-center"
      title="Add Category"
      :active.sync="addCategoryPopupActive"
    >
      <label class="vs-input--label">Category type</label>
      <br />
      <vs-radio v-model="newCategoryType" vs-value="primary" class="mt-2 mr-4">Primary (menu)</vs-radio>
      <vs-radio
        v-if="primaryCategories.length != 0"
        v-model="newCategoryType"
        vs-value="secondary"
      >Secondary</vs-radio>

      <div v-if="newCategoryType == 'secondary'" class="mt-4">
        <label class="vs-input--label">Parent category</label>
        <br />
        <vs-dropdown vs-trigger-click class="dd-actions cursor-pointer mt-2 mb-4">
          <div
            class="p-4 shadow-drop rounded-lg d-theme-dark-bg cursor-pointer flex items-center justify-center text-lg font-medium w-32 w-full"
          >
            <span>{{ newItemCategoryTitle }}</span>
            <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
          </div>
          <vs-dropdown-menu style="z-index:99999">
            <vs-dropdown-item v-for="category in primaryCategories" :key="category.categoryName">
              <span
                @click="newCategoryParentName = category.categoryName; newCategoryParent = category.categoryId"
              >{{ category.categoryName }}</span>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </div>

      <vs-input
        style="margin: auto"
        class="mb-4"
        label="New Category Name"
        placeholder="Drinks"
        v-model="newCategoryName"
      />
      <vs-textarea label="Category Description" v-model="newCategoryDescription" />

      <vs-button @click="addMenuCategory()">Add Category</vs-button>
    </vs-popup>
  </div>
</template>

<script>
import modulemenuList from "@/store/menu/menuDataList.js";

export default {
  data() {
    return {
      bulkAddMode: true,
      newCategoryParentName: "",
      newCategoryDescription: "",
      newCategoryType: "primary",
      newCategoryName: "",
      newCategoryParent: null,
      addCategoryPopupActive: false,
      itemCategoryName: "",
      itemName: "",
      itemDescription: "",
      itemPrice: 20.5,
      itemPrepTime: 10,
      itemCategory: "",
      itemImage: "",
      itemAddons: [
        {
          id: Math.random(),
          attributeName: "",
          min: 0,
          max: 10,
          values: [
            {
              id: Math.random(),
              name: "",
              price: 0,
              selectedByDefault: false,
            },
          ],
        },
      ],
    };
  },
  computed: {
    restaurantObject() {
      return this.$store.state.menuList.restaurantObject;
    },
    itemCategoryTitle() {
      if (this.itemCategoryName) return this.itemCategoryName;
      else return "Item Menu";
    },
    newItemCategoryTitle() {
      if (this.newCategoryParentName) return this.newCategoryParentName;
      else return "Item Menu";
    },
    allCategories() {
      if (this.restaurantLoaded()) {
        var myCategories = [];
        this.restaurantObject.categories.forEach((category) => {
          if (category.type === "primary") {
            myCategories.push(category);
            this.restaurantObject.categories.forEach((subcategory) => {
              if (subcategory.type === "secondary") {
                if (subcategory.parentCategoryId === category.categoryId) {
                  myCategories.push(subcategory);
                }
              }
            });
          }
        });
        return myCategories;
      } else return null;
    },
    primaryCategories() {
      if (this.restaurantLoaded())
        return this.restaurantObject.categories.filter(
          (i) => i.type === "primary"
        );
      else return null;
    },
    secondaryCategories() {
      if (this.restaurantLoaded())
        return this.restaurantObject.categories.filter(
          (i) => i.type === "secondary"
        );
      else return null;
    },
  },
  methods: {
    chooseFiles() {
      this.$refs.uploadImageInputRef.click();
    },
    updateItemImage() {
      var file = document.getElementById("uploadImageInput").files[0];
      var reader = new FileReader();

      if (file && file.type.match("image.*")) {
        reader.readAsDataURL(file);
      }

      reader.onloadend = () => {
        this.setItemImagePreview(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    },
    setItemImagePreview(image) {
      this.itemImage = image;
      document.getElementById("itemImageUploadPreview").style.display = "block";
    },
    addMenuCategory() {
      this.$store
        .dispatch("menuList/addMenuCategory", {
          currentRestaurantId: this.getCurrentRestaurantId(),
          categoryName: this.newCategoryName,
          categoryDescription: this.newCategoryDescription,
          categoryType: this.newCategoryType,
          parentCategoryId: this.newCategoryParent,
          authKey: this.getAuthToken(),
        })
        .then(() => {
          this.$vs.notify({
            title: "Successfully added category",
            text:
              "Your new category <b>" +
              this.newCategoryName +
              "</b> has been added.",
            color: "success",
          });
          this.addCategoryPopupActive = false;
          this.newCategoryDescription = "";
          this.newCategoryType = "";
          this.newCategoryParentName = "";
          this.newCategoryName = "";
          this.newCategoryParent = null;
        });
    },
    addMenuItem() {
      this.$store
        .dispatch("menuList/addMenuItem", {
          authKey: this.getAuthToken(),
          currentRestaurantId: this.getCurrentRestaurantId(),
          categoryId: this.itemCategory,
          itemName: this.itemName,
          itemDescription: this.itemDescription,
          itemPrice: this.itemPrice,
          itemWaitingTime: this.itemPrepTime,
          itemAttributes: {
            attributes: this.itemAddons,
          },
          arAsset: "",
          available: true,
          itemImages: [this.itemImage],
        })
        .then(() => {
          this.$vs.notify({
            title: "Success",
            text:
              "Your menu item: <b>" + this.itemName + "</b> has been added.",
            color: "success",
          });
          if (!this.bulkAddMode) {
            this.$router.push("/menu");
          }
        });
    },
    restaurantLoaded() {
      if (Object.keys(this.restaurantObject).length === 0) return false;
      else return true;
    },
    addAddOn() {
      var newAddOn = {
        id: Math.random(),
        attributeName: "",
        min: 0,
        max: 10,
        values: [
          {
            id: Math.random(),
            name: "",
            price: 10,
            selectedByDefault: false,
          },
        ],
      };
      this.itemAddons.push(newAddOn);
    },
    addAddOnValue(id) {
      var newAddOnValue = {
        name: "",
        price: 10,
        selectedByDefault: false,
      };
      this.itemAddons.find((i) => i.id === id).values.push(newAddOnValue);
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!modulemenuList.isRegistered) {
        this.$store.registerModule("menuList", modulemenuList);
        modulemenuList.isRegistered = true;
      }
      //if menu has not been loaded yet, load it first
      if (!this.restaurantLoaded()) {
        this.$store.dispatch("menuList/listMenuItems", {
          currentRestaurantId: this.getCurrentRestaurantId(),
          authKey: this.getAuthToken(),
        });
      }
    }
  },
};
</script>
<style scoped>
#itemImageUploadPreview {
  height: 400px;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: none;
}
.addCategoryPopup >>> .vs-popup {
  max-width: 300px;
}
</style>
        