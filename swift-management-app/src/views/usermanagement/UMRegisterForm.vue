<template>
  <div class="clearfix">
    <vs-input
      v-validate="'required|alpha_dash|min:3'"
      data-vv-validate-on="blur"
      label-placeholder="Firstname"
      name="Firstname"
      placeholder="First name"
      v-model="firstname"
      class="w-full" />
   <!-- <span class="text-danger text-sm">{{ errors.first('displayName') }}</span> -->

     <vs-input
      v-validate="'required|alpha_dash|min:3'"
      data-vv-validate-on="blur"
      label-placeholder="Last name"
      name="Surname"
      placeholder="Last name"
      v-model="surname"
      class="w-full" />
   <!-- <span class="text-danger text-sm">{{ errors.first('displayName') }}</span> -->

    <vs-input
      v-validate="'required|email'"
      data-vv-validate-on="blur"
      name="email"
      type="email"
      label-placeholder="Email"
      placeholder="Email"
      v-model="email"
      class="w-full mt-6" />
   <!-- <span class="text-danger text-sm">{{ errors.first('email') }}</span> -->

    <vs-input
      ref="password"
      type="password"
      data-vv-validate-on="blur"
      v-validate="'required|min:6|max:10'"
      name="password"
      label-placeholder="Password"
      placeholder="Password"
      v-model="password"
      class="w-full mt-6" />
   <!-- <span class="text-danger text-sm">{{ errors.first('password') }}</span> -->

    <vs-input
      type="password"
      v-validate="'min:6|max:10|confirmed:password'"
      data-vv-validate-on="blur"
      data-vv-as="password"
      name="confirm_password"
      label-placeholder="Confirm Password"
      placeholder="Confirm Password"
      v-model="confirm_password"
      class="w-full mt-6" />
  <!--  <span class="text-danger text-sm">{{ errors.first('confirm_password') }}</span> -->

    <vs-checkbox v-model="isTermsConditionAccepted" class="mt-6">I accept the terms & conditions.</vs-checkbox>
    <vs-button class="float-right mt-6" @click="register" :disabled="!validateForm">Register</vs-button>
  </div>
</template>

<script>
import authData from "@/store/usermanagement/moduleAuth.js"

export default {
    data() {
        return {
            firstname: '',
            surname: '',
            email: '',
            password: '',
            confirm_password: '',
            isTermsConditionAccepted: true
        }
    },
    computed: {
        validateForm() {
          return true;
          //  return !this.errors.any() && this.displayName != '' && this.email != '' && this.password != '' && this.confirm_password != '' && this.isTermsConditionAccepted === true;
        }
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
        register() {
            // If form is not validated or user is already login return
            if (!this.validateForm || !this.checkLogin()) return

            const payload = {
              userDetails: {
                displayName: this.displayName,
                name: this.firstname,
                surname: this.surname,
                email: this.email,
                password: this.password,
                confirmPassword: this.confirm_password
              },
              notify: this.$vs.notify
            }
            this.$store.dispatch('authData/register', payload)
        }
    },
      created() {
      if(!authData.isRegistered) {
          this.$store.registerModule('authData', authData)
          authData.isRegistered = true
      }
  },
}
</script>
