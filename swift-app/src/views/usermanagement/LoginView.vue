<template>
  <v-container fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="display-2 mb-2">Swift</div>
      <div class="title">Contactless Dining</div>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-col cols="10" >
        <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
      </v-col>
      <v-col cols="10" >
        <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
        <v-btn text @click="forgotPass" class="pr-0" style="float: right !important;">
          <p class="body-2 float-right" color="secondary"><u>Forgot Password?</u></p>
        </v-btn>
      </v-col>
    </div>
    <div class="row d-flex flex-column align-center mx-8">
      <v-btn @click="loginCustomer" v-show=!isLoading block rounded class="py-5" color="primary">Sign in</v-btn>
      <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
    </div>
    <div class="row d-flex flex-col align-center justify-center">
      <v-col cols="2">
        <v-btn small fab>
          <v-icon>mdi-google</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn small fab>
          <v-icon>mdi-facebook</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn small fab>
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </v-col>
    </div>
    <div class="row d-flex flex-column align-center ">
      <p>Don't have an account? <a @click="goToRegister"><u>Register</u></a>.</p>
    </div>
  </v-container>
</template>

<script>
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, maxLength, email } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required },
  },
  data () {
    return {
      showPassword: false,
      showPlaceholder: false,
      password: 'john123',
      email: 'john@doe.com',
      isLoading: false,
      errorMsg: '',
    }
  },
  methods: {
    goToRegister () {
      this.$router.push('/register')
    },
    forgotPass () {
      this.$router.push('/forgotPassword')
    },
    loginCustomer ()  {
      this.isLoading = true
      if (this.emailErrors.length > 0 && this.passwordErrors > 0 || this.email.length == 0 || this.password.length == 0) {
        this.$v.$touch()
        this.isLoading = false
      } else {
        this.isLoading = false
        let data = {
          email: this.email,
          password: this.password,
        }
        
        this.login(data)
        this.$router.push('/')
      }
    },
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      errors: 'getErrors',
    }),
    ...mapActions({
      login: 'CustomerStore/login',
    }),
  },
  computed: {
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push('Must be a valid email')
      !this.$v.email.required && errors.push('Email is required.')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('Password is required.')
      return errors
    },
  },
}
</script>