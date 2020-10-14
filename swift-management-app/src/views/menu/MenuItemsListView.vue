<template>
  <div id="data-list-list-view" class="data-list-container">
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Menu Items</h2>
      </div>
      <vs-divider>
        <h3 class="menuTitle mb-1">{{ currentMenu }} Menu</h3>
      </vs-divider>
      <vs-dropdown class="mb-4 mr-4">
        <vs-button type="border">
          <span class="flex items-center">
            <span>Switch Menu</span>
            <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
          </span>
        </vs-button>
        <vs-dropdown-menu>
          <vs-dropdown-item
            @click="changeMenu(category.categoryName)"
            v-for="category in primaryCategories"
            :key="category.categoryName"
          >{{ category.categoryName }}</vs-dropdown-item>
        </vs-dropdown-menu>
      </vs-dropdown>

      <vs-button @click="addMenuItem()" type="filled" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Add Menu Item</span>
        </span>
      </vs-button>
    </div>
    <vs-table ref="table" pagination :max-items="itemsPerPage" search :data="menuItems">
      <div slot="header" class="flex flex-wrap items-center flex-grow justify-between">
        <vs-dropdown vs-trigger-click class="cursor-pointer mb-4 mr-4 items-per-page-handler">
          <div
            class="p-4 border border-solid d-theme-border-grey-light rounded-full d-theme-dark-bg cursor-pointer flex items-center justify-between font-medium"
          >
            <span
              class="mr-2"
            >{{ currentPage * itemsPerPage - (itemsPerPage - 1) }} - {{ menuItems.length - currentPage * itemsPerPage > 0 ? currentPage * itemsPerPage : menuItems.length }} of {{ queriedItems }}</span>
            <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
          </div>
          <vs-dropdown-menu>
            <vs-dropdown-item @click="itemsPerPage=4">
              <span>4</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage=10">
              <span>10</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage=15">
              <span>15</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage=20">
              <span>20</span>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </div>

      <template slot="thead">
        <vs-th sort-key="menuItemId">SKU</vs-th>
        <vs-th sort-key="name">Name</vs-th>
        <vs-th sort-key="popularity">Popularity</vs-th>
        <vs-th sort-key="estimatedWaitingTime">Prep Time</vs-th>
        <vs-th sort-key="price">Price</vs-th>
        <vs-th>Action</vs-th>
      </template>

      <template slot-scope="{data}">
        <tbody>
          <vs-tr :data="tr" :key="indextr" v-for="(tr, indextr) in data">
            <vs-td>
              <p class="product-name font-medium truncate">#{{ tr.menuItemId }}</p>
            </vs-td>

            <vs-td>
              <p class="product-name font-medium truncate">{{ tr.menuItemName }}</p>
              <p class="product-name product-desc">{{ tr.menuItemDescription }}</p>
            </vs-td>

            <vs-td>
              <vs-progress
                :percent="Number(tr.popularity)"
                :color="getPopularityColor(tr.popularity)"
                class="shadow-md"
              />
            </vs-td>

            <vs-td>
              <vs-chip
                :color="getEstimatedTimeColor(tr.estimatedWaitingTime)"
                class="product-order-status"
              >{{ tr.estimatedWaitingTime}} min</vs-chip>
            </vs-td>

            <vs-td>
              <p class="product-price">R{{ tr.price }}</p>
            </vs-td>

            <vs-td class="whitespace-no-wrap">
              <feather-icon
                icon="EditIcon"
                svgClasses="w-5 h-5 hover:text-primary stroke-current"
                @click.stop="$router.push({name: 'edit-menu-item', params: { menuItemId: tr.menuItemId }})"
              />
              <feather-icon
                icon="TrashIcon"
                svgClasses="w-5 h-5 hover:text-danger stroke-current"
                class="ml-2"
                @click.stop="deleteMenuItem(tr)"
              />
            </vs-td>
          </vs-tr>
        </tbody>
      </template>
    </vs-table>
  </div>
</template>

<script>
import modulemenuList from "@/store/menu/menuDataList.js";

export default {
  components: {},
  data() {
    return {
      selected: [],
      // menuItems: [],
      itemsPerPage: 10,
      isMounted: false,
      currentMenu: "",
      deleteItem: null,
    };
  },
  computed: {
    restaurantObject() {
      //if restaurant has been loaded before menu - use that
      if (this.$store.state.menuList)
        return this.$store.state.menuList.restaurantObject;
      else if (this.$store.state.myRestaurants) {
        for (var i = 0; i < this.$store.state.myRestaurants.length; i++)
          if (
            this.$store.state.myRestaurants[i].restaurantId ==
            this.getCurrentRestaurantId()
          ) {
            return this.$store.state.myRestaurants[i];
          }
      } else {
        return null;
      }
    },
    currentPage() {
      if (this.isMounted) {
        return this.$refs.table.currentx;
      }
      return 0;
    },
    menu() {
      if (this.restaurantObject.categories) {
        var myMenu = [];
        this.restaurantObject.categories.forEach((category) => {
          if (category.categoryName === this.currentMenu) {
            category.menuItems.forEach((item) => {
              myMenu.push(item);
            });
            this.restaurantObject.categories.forEach((subcategory) => {
              if (subcategory.parentCategoryId === category.categoryId)
                subcategory.menuItems.forEach((item) => {
                  myMenu.push(item);
                });
            });
          }
        });
        return myMenu;
      } else return null;
    },
    menuItems() {
      if (this.menu) {
        return this.menu.filter(
          (i) => i.availability
        );
      } else return [];
    },
    queriedItems() {
      return this.$refs.table
        ? this.$refs.table.queriedResults.length
        : this.menuItems.length;
    },
    primaryCategories() {
      if (this.restaurantLoaded())
        return this.restaurantObject.categories.filter(
          (i) => i.type === "primary"
        );
      else return null;
    },
  },
  methods: {
    addFirstItemPrompt() {
      this.$vs.dialog({
        color: "primary",
        title: "Let's create your first item!",
        text:
          "It looks like the current restaurant doesn't have any items yet. Let's create your first menu item.",
        accept: this.addMenuItem,
        acceptText: "Add Menu Item",
      });
    },
    addMenuItem() {
      this.$router.push("/add-menu-item");
    },
    editData(tr) {
      console.log(tr);
    },
    deleteData(id) {
      this.$store.dispatch("menuList/removeItem", id).catch((err) => {
        console.error(err);
      });
    },
    getEstimatedTimeColor(time) {
      if (time <= 15) return "success";
      if (time <= 25) return "warning";
      if (time <= 40) return "danger";
      return "primary";
    },
    getPopularityColor(num) {
      if (num > 60) return "success";
      if (num >= 30) return "warning";
      if (num < 30) return "danger";
      return "primary";
    },
    listMenuItems() {
      this.$store.dispatch("menuList/listMenuItems", {
        authKey: this.getAuthToken(),
        currentRestaurantId: this.getCurrentRestaurantId(),
      });
    },
    restaurantLoaded() {
      if (Object.keys(this.restaurantObject).length === 0) return false;
      else return true;
    },
    changeMenu(categoryName) {
      this.currentMenu = categoryName;
    },
    loadInitialMenu() {
      //TODO: Store current menu in cross page persistent store
      if (this.currentMenu != "" || !this.restaurantLoaded()) return;

      if (this.primaryCategories.length > 0)
        this.currentMenu = this.primaryCategories[0].categoryName;
      //set the current menu filter
    },
    deleteMenuItem(menuItem){
      this.deleteItem = menuItem;
      this.$vs.dialog({
        color: "danger",
        title: "Confirm deletion of: " + menuItem.menuItemName,
        text: "Please confirm that this is what you which to do?",
        accept: this.acceptRemoveAlert,
      });
    },
    acceptRemoveAlert(){
        this.$store
        .dispatch("menuList/editMenuItem", {
          authKey: this.getAuthToken(),
          itemId: this.deleteItem.menuItemId,
          categoryId: 2,
          itemName: this.deleteItem.menuItemName,
          itemDescription: this.deleteItem.menuItemDescription,
          itemPrice: this.deleteItem.price,
          itemWaitingTime: this.deleteItem.estimatedWaitingTime,
          itemAttributes: this.deleteItem.attributes,
          arAsset: "",
          available: false,
          itemImages: this.deleteItem.images,
        })
        .then(() => {
          this.$vs.loading.close();
          this.$vs.notify({
            title: "Success",
            text:
              "The menu item: <b>" + this.itemName + "</b> has been set inactive.",
            color: "success",
          });
          this.$router.push("/menu");
        });
    }
  },
  created() {
    if (this.getAuthToken() != null) {
      this.checkNoRestaurantsCreated();
      if (!modulemenuList.isRegistered) {
        this.$store.registerModule("menuList", modulemenuList);
        modulemenuList.isRegistered = true;
      }
      if (!this.restaurantLoaded()) this.$vs.loading();
      else this.loadInitialMenu();

      this.listMenuItems();
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    restaurantObject(newCount, oldCount) {
      this.$vs.loading.close();
      this.loadInitialMenu();
      if (this.primaryCategories)
        if (this.primaryCategories.length <= 0) this.addFirstItemPrompt();
    },
  },
};
</script>

<style lang="scss">
.product-desc {
  font-size: 12px;
}
.menuTitle {
  color: #636363;
}
#data-list-list-view {
  .vs-con-table {
    @media (max-width: 689px) {
      .vs-table--search {
        margin-left: 0;
        max-width: unset;
        width: 100%;

        .vs-table--search-input {
          width: 100%;
        }
      }
    }

    @media (max-width: 461px) {
      .items-per-page-handler {
        display: none;
      }
    }

    @media (max-width: 341px) {
      .data-list-btn-container {
        width: 100%;

        .dd-actions,
        .btn-add-new {
          width: 100%;
          margin-right: 0 !important;
        }
      }
    }

    .product-name {
      max-width: 23rem;
    }

    .vs-table--header {
      display: flex;
      flex-wrap: wrap;
      margin-left: 1.5rem;
      margin-right: 1.5rem;
      > span {
        display: flex;
        flex-grow: 1;
      }

      .vs-table--search {
        padding-top: 0;

        .vs-table--search-input {
          padding: 0.9rem 2.5rem;
          font-size: 1rem;

          & + i {
            left: 1rem;
          }

          &:focus + i {
            left: 1rem;
          }
        }
      }
    }

    .vs-table {
      border-collapse: separate;
      border-spacing: 0 1.3rem;
      padding: 0 1rem;

      tr {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
        td {
          padding: 20px;
          &:first-child {
            border-top-left-radius: 0.5rem;
            border-bottom-left-radius: 0.5rem;
          }
          &:last-child {
            border-top-right-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
        }
        td.td-check {
          padding: 20px !important;
        }
      }
    }

    .vs-chip--text {
      text-align: center;
    }

    .vs-table--thead {
      th {
        padding-top: 0;
        padding-bottom: 0;

        .vs-table-text {
          text-transform: uppercase;
          font-weight: 600;
        }
      }
      th.td-check {
        padding: 0 15px !important;
      }
      tr {
        background: none;
        box-shadow: none;
      }
    }

    .vs-table--pagination {
      justify-content: center;
    }
  }
}
</style>
