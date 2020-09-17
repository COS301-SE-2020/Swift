<template>
  <div class="the-navbar__user-meta flex items-center" v-if="activeUserInfo.displayName">
    <div class="text-right leading-tight hidden sm:block">
      <p class="font-semibold">{{ activeUserInfo.displayName }}</p>
      <small>{{ activeUserInfo.userRole }}</small>
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
            <span @click="editProfile()" class="ml-2">Profile</span>
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
      <vx-card class="mb-4">
        <vs-avatar size="large" :src="newProfileImage" />
        <vs-divider></vs-divider>
        <vs-button
          type="border"
          class="mb-4"
          size="small"
          @click="chooseFiles()"
        >Upload New Profile Image</vs-button>
        <input
          hidden
          ref="uploadImageInputRef"
          id="uploadImageInput"
          type="file"
          @change="updateImage"
          accept="image/*"
        />
        <div class="flex flex-wrap">
          <vs-input
            placeholder="Name"
            v-model="newName"
            icon-no-border
            class="mb-1 ml-2 mr-2 mt-2 w-full md:w-1/3 lg:w-1/3 xl:w-1/3 ml-auto"
          />
          <vs-input
            placeholder="Surname"
            v-model="newSurname"
            icon-no-border
            class="mb-1 ml-2 mr-2 mt-2 w-full md:w-1/3 lg:w-1/3 xl:w-1/3 mr-auto"
          />
        </div>
        <vs-button type="border" class="mt-4" @click="submitNewProfile">Save Profile</vs-button>
      </vx-card>
    </vs-popup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newSurname: "",
      newName: "",
      newProfilePopupActive: false,
      newProfileImage: "",
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
    submitNewProfile() {
      this.$store
        .dispatch("editProfile", {
          token: this.getAuthToken(),
          name: this.newName,
          surname: this.newSurname,
          profileImage: this.newProfileImage,
        })
        .then((res) => {
          if (res.status == 201 || res.status == 200) {
            this.$vs.notify({
              title: "Profile change success",
              text: "Wohoo!",
              color: "success",
            });
          }
        });
        this.newProfilePopupActive = false;
    },
    editProfile() {
      var userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        this.newProfileImage = JSON.parse(userInfo).photoURL;
        this.newName = JSON.parse(userInfo).displayName.split(" ")[0];
        this.newSurname = JSON.parse(userInfo).displayName.split(" ")[1];
      }
      this.newProfilePopupActive = true;
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
      this.newProfileImage = image;
    },
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
<style scoped>
#profileImageUploadPreview {
  height: 200px;
  width: 200px;
  margin: 0 auto;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: none;
}
</style>