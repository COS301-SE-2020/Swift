<template>
  <div class="the-navbar__user-meta flex items-center" v-if="activeUserInfo.displayName">
    <div class="text-right leading-tight hidden sm:block">
      <p class="font-semibold">{{ activeUserInfo.displayName }}</p>
      <small>Restaurant Owner</small>
    </div>
    <vs-dropdown vs-custom-content vs-trigger-click class="cursor-pointer">
      <div class="con-img ml-3">
        <img
          v-if="activeUserInfo.photoURL"
          key="onlineImg"
          :src="activeUserInfo.photoURL"
          alt="user-img"
          width="40"
          height="40"
          class="rounded-full shadow-md cursor-pointer block"
        />
      </div>

      <vs-dropdown-menu class="vx-navbar-dropdown">
        <ul style="min-width: 9rem">
          <li class="flex py-2 px-4 cursor-pointer hover:bg-primary hover:text-white">
            <feather-icon icon="UserIcon" svgClasses="w-4 h-4" />
            <span @click="newProfilePopupActive = true" class="ml-2">Profile</span>
          </li>

          <vs-divider class="m-1" />

          <li
            class="flex py-2 px-4 cursor-pointer hover:bg-primary hover:text-white"
            @click="logout"
          >
            <feather-icon icon="LogOutIcon" svgClasses="w-4 h-4" />
            <span class="ml-2">Logout</span>
          </li>
        </ul>
      </vs-dropdown-menu>
    </vs-dropdown>
    <vs-popup class="text-center" title="Manage Profile" :active.sync="newProfilePopupActive">

      

    </vs-popup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newProfilePopupActive: false,
    };
  },
  computed: {
    activeUserInfo() {
      if (localStorage.getItem("userInfo") === null)
        return this.$store.state.AppActiveUser;
      else return JSON.parse(localStorage.getItem("userInfo"));
    },
  },
  methods: {
    updateProfileImage() {},
    logout() {
      this.$store.commit("SET_MY_RESTAURANTS", null);
      this.$store.commit("SET_CURRENT_RESTAURANT", {});

      localStorage.setItem("currentRestaurantName", null);
      localStorage.setItem("userInfo", null);
      localStorage.setItem("currentRestaurantId", null);
      localStorage.setItem("authToken", null);

      this.$router.push("/login").catch(() => {});
    },
  },
};
</script>
