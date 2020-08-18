<template>
  <div class="relative">
    <div class="vx-navbar-wrapper" :class="classObj">
      <vs-navbar
        class="vx-navbar navbar-custom navbar-skelton"
        :color="navbarColorLocal"
        :class="textColor"
      >

        <!-- SM - OPEN SIDEBAR BUTTON -->
        <feather-icon
          class="sm:inline-flex xl:hidden cursor-pointer p-2"
          icon="MenuIcon"
          @click.stop="showSidebar"
        />

        <vs-dropdown class="mr-4">
        <vs-button style="font-size: 12px;" size="small" type="border">
          <span class="flex items-center">
            <span><b>Restaurant:</b> Mug n Bean</span>
            <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
          </span>
        </vs-button>
        <vs-dropdown-menu>
          <vs-dropdown-item>Mug n Bean</vs-dropdown-item>
          <vs-dropdown-item>O' Galitos</vs-dropdown-item>
        </vs-dropdown-menu>
      </vs-dropdown>

        <search-bar />
        <vs-spacer />

      


        <notification-drop-down />

        <profile-drop-down />
      </vs-navbar>
    </div>
  </div>
</template>


<script>
import SearchBar from "./components/SearchBar.vue";
import NotificationDropDown from "./components/NotificationDropDown.vue";
import ProfileDropDown from "./components/ProfileDropDown.vue";

export default {
  name: "the-navbar-vertical",
  props: {
    navbarColor: {
      type: String,
      default: "#fff",
    },
  },
  components: {
    SearchBar,
    NotificationDropDown,
    ProfileDropDown,
  },
  computed: {
    navbarColorLocal() {
      return this.$store.state.theme === "dark" && this.navbarColor === "#fff"
        ? "#10163a"
        : this.navbarColor;
    },
    verticalNavMenuWidth() {
      return this.$store.state.verticalNavMenuWidth;
    },
    textColor() {
      return {
        "text-white":
          (this.navbarColor != "#10163a" &&
            this.$store.state.theme === "dark") ||
          (this.navbarColor != "#fff" && this.$store.state.theme !== "dark"),
      };
    },
    windowWidth() {
      return this.$store.state.windowWidth;
    },

    // NAVBAR STYLE
    classObj() {
      if (this.verticalNavMenuWidth == "default") return "navbar-default";
      else if (this.verticalNavMenuWidth == "reduced") return "navbar-reduced";
      else if (this.verticalNavMenuWidth) return "navbar-full";
    },
  },
  methods: {
    showSidebar() {
      this.$store.commit("TOGGLE_IS_VERTICAL_NAV_MENU_ACTIVE", true);
    },
  },
};
</script>

