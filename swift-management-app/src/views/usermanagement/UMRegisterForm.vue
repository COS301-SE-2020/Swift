<template>
  <div class="clearfix">
    <vs-input
      label-placeholder="Firstname"
      name="Firstname"
      placeholder="First name"
      v-model="firstname"
      class="w-full"
    />
    <!-- <span class="text-danger text-sm">{{ errors.first('displayName') }}</span> -->

    <vs-input
      label-placeholder="Last name"
      name="Surname"
      placeholder="Last name"
      v-model="surname"
      class="w-full"
    />
    <!-- <span class="text-danger text-sm">{{ errors.first('displayName') }}</span> -->

    <vs-input
      name="email"
      type="email"
      label-placeholder="Email"
      placeholder="Email"
      v-model="email"
      class="w-full mt-6"
    />
    <!-- <span class="text-danger text-sm">{{ errors.first('email') }}</span> -->

    <vs-input
      ref="password"
      type="password"
      name="password"
      label-placeholder="Password"
      placeholder="Password"
      v-model="password"
      class="w-full mt-6"
    />
    <!-- <span class="text-danger text-sm">{{ errors.first('password') }}</span> -->

    <vs-input
      type="password"
      name="confirm_password"
      label-placeholder="Confirm Password"
      placeholder="Confirm Password"
      v-model="confirm_password"
      class="w-full mt-6"
    />
    <!--  <span class="text-danger text-sm">{{ errors.first('confirm_password') }}</span> -->

    <vs-button class="float-right mt-6" @click="register">Register</vs-button>
  </div>
</template>

<script>
import authData from "@/store/usermanagement/moduleAuth.js";

export default {
  data() {
    return {
      firstname: "",
      surname: "",
      email: "",
      password: "",
      confirm_password: "",
      isTermsConditionAccepted: true,
    };
  },
  computed: {},
  methods: {
    register() {
      const payload = {
        userDetails: {
          name: this.firstname,
          surname: this.surname,
          email: this.email,
          password: this.password,
        },
      };
      this.$store.dispatch("authData/register", payload).then((res) => {
        if (res.status == 201) {
          this.$vs.notify({
            title: "Successful registration",
            text: "Automatically logging you in...",
            color: "success",
          });
          this.$store.dispatch("authData/login", payload).then((res) => {
            this.$vs.loading.close();
            if (res.status == 200) {
              this.$router.push("/mybusiness");
            }
          });
        }
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
