<template>
  <div>
    <vs-input
        v-validate="'required|email|min:3'"
        data-vv-validate-on="blur"
        name="email"
        icon-no-border
        icon="icon icon-user"
        icon-pack="feather"
        label-placeholder="Email"
        v-model="email"
        class="w-full"/>
  <!--  <span class="text-danger text-sm">{{ errors.first('email') }}</span> -->

    <vs-input
        data-vv-validate-on="blur"
        v-validate="'required|min:6|max:10'"
        type="password"
        name="password"
        icon-no-border
        icon="icon icon-lock"
        icon-pack="feather"
        label-placeholder="Password"
        v-model="password"
        class="w-full mt-6" />
    <!--   <span class="text-danger text-sm">{{ errors.first('password') }}</span> -->

    <div class="flex flex-wrap justify-between my-5">
        <vs-checkbox v-model="checkbox_remember_me" class="mb-3">Remember Me</vs-checkbox>
        <router-link to="/reset-password">Forgot Password?</router-link>
    </div>
    <div class="flex flex-wrap justify-between mb-3">
      <vs-button :disabled="!validateForm" @click="login">Login</vs-button>
    </div>
  </div>
</template>

<script>
import authData from "@/store/usermanagement/moduleAuth.js"

export default {
  data() {
    return {
      email: 'u18009035@tuks.co.za',
      password: 'Giov123a',
      checkbox_remember_me: false
    }
  },
  computed: {
    validateForm() {
      return true;
    //  return !this.errors.any() && this.email != '' && this.password != '';
    },
  },
  methods: {
    checkLogin() {
      // If user is already logged in notify  
      if (this.$store.state.authData.isAuthenticated) {
        // Close animation if passed as payload
        // this.$vs.loading.close()

        this.$vs.notify({
          title: 'Login Attempt',
          text: 'You are already logged in!',
          iconPack: 'feather',
          icon: 'icon-alert-circle',
          color: 'warning'
        })

        return false
      }
      return true
    },
    login() {

      if (!this.checkLogin()) return

      // Loading
      this.$vs.loading()

      const payload = {
        checkbox_remember_me: this.checkbox_remember_me,
        userDetails: {
          email: this.email,
          password: this.password
        }
      }

      this.$store.dispatch('authData/login', payload)
        .then(() => { 
          this.$vs.loading.close() 
          }) 
        .catch(error => {
          this.$vs.loading.close()
          this.$vs.notify({
            title: 'Error',
            text: error.message,
            iconPack: 'feather',
            icon: 'icon-alert-circle',
            color: 'danger'
          })
        })
    },
  },
  created() {
      if(!authData.isRegistered) {
          this.$store.registerModule('authData', authData)
          authData.isRegistered = true
      }
  },
}

</script>

