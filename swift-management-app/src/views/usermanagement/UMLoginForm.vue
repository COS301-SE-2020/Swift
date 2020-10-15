<template>
  <div>
    <vs-input
      name="email"
      icon-no-border
      icon="icon icon-user"
      icon-pack="feather"
      label-placeholder="Email"
      v-model="email"
      class="w-full"
    />
    <!--  <span class="text-danger text-sm">{{ errors.first('email') }}</span> -->

    <vs-input
      type="password"
      name="password"
      icon-no-border
      icon="icon icon-lock"
      icon-pack="feather"
      label-placeholder="Password"
      v-model="password"
      class="w-full mt-6"
    />
    <!--   <span class="text-danger text-sm">{{ errors.first('password') }}</span> -->

    <div class="flex flex-wrap justify-between my-5">
      <a href="https://app.swiftapp.ml/#/login">Forgot Password?</a>
    </div>
    <div class="flex flex-wrap justify-between mb-3">
      <vs-button @click="login">Login</vs-button>
    </div>
  </div>
</template>

<script>
import authData from "@/store/usermanagement/moduleAuth.js";
import navMenuItems from "@/layouts/components/vertical-nav-menu/navMenuItems.js";

export default {
  data() {
    return {
      email: "",
      password: ""
    };
  },
  computed: {},
  methods: {
    login() {
      // Loading
      this.$vs.loading();

      const payload = {
        userDetails: {
          email: this.email,
          password: this.password,
        },
      };

      this.$store
        .dispatch("authData/login", payload)
        .then((res) => {
          this.$vs.loading.close();
          if (res.status != 200) {
            this.$vs.notify({
              title: "Invalid login",
              text: "The supplied email & password combination is incorrect.",
              color: "danger",
            });
          } else {
            this.$vs.notify({
              title: "Successful login",
              text: "Let's get cracking!",
              color: "success",
            });
            this.$store.dispatch("retrieveMyRestaurants", {
              authKey: this.getAuthToken(),
              currentRestaurantName: this.getCurrentRestaurantName(),
            });
            this.$router.push("/mybusiness");
          }
        })
        .catch((error) => {
          this.$vs.loading.close();
          this.$vs.notify({
            title: "Error",
            text: error.message,
            iconPack: "feather",
            icon: "icon-alert-circle",
            color: "danger",
          });
        });
    },
  },
  created() {
    if (!authData.isRegistered) {
      this.$store.registerModule("authData", authData);
      authData.isRegistered = true;
    }
  },
};
</script>

