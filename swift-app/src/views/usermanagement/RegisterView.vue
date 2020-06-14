<template>
  <v-container fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="display-2 mb-2">Swift</div>
      <div class="title">Contactless Dining</div>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-col cols="10" >
        <v-text-field v-model="username" :error-messages="usernameErrors" label="Username" required @blur="$v.username.$touch()"></v-text-field>
      </v-col>
      <v-col cols="10" >
        <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
      </v-col>
      <v-col cols="10" >
        <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
        <p class="body-2 float-right" color="secondary"><u>Forgot Password?</u></p>
      </v-col>
    </div>
    <div class="row d-flex flex-column align-center mx-8">
      <v-btn @click="registerCustomer"  v-show=!isLoading block rounded class="py-5" color="primary">Register</v-btn>
      <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
    </div>
    <div class="row d-flex flex-column align-center ">
      <p>Not your first time here? <a @click="goToLogin"><u>Login</u></a>.</p>
    </div>
  </v-container>

</template>

<script>
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    username: { required, maxLength: maxLength(16) },
    email: { required, email },
    password: { required, minLength: minLength(8) },
  },
  data () {
    return {
      showPassword: false,
      showPlaceholder: false,
      username: '',
      email: '',
      password: '',
      isLoading: false,
      rules: {
        required: value => !!value || '*Required.',
        min: v => v.length >= 8 || '*Min 8 characters',
        emailMatch: () => ('*This email has already been used'),
      },
    }
  },
  methods: {
    goToLogin () {
      this.$router.push('login')
    },
    registerCustomer () {
      this.isLoading = true
      if (this.usernameErrors.length > 0 && this.emailErrors > 0 && this.passwordErrors > 0|| this.username.length == 0 || this.email.length == 0 || this.password.length == 0) {
        this.$v.$touch()
        this.isLoading = false
      } else {
        this.isLoading = false
        let data = {
          username: this.username,
          email: this.email,
          password: this.password,
        }
        
        this.register(data)
        this.$router.push('/')
      }
    },
    ...mapActions({
      register: 'CustomerStore/register',
    }),
  },
  computed: {
    usernameErrors () {
      const errors = []
      if (!this.$v.username.$dirty) return errors
      !this.$v.username.maxLength && errors.push('Username can be at most 16 characters long')
      !this.$v.username.required && errors.push('Username is required.')
      return errors
    },
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
      !this.$v.password.minLength && errors.push('Password must be at least 8 characters long')
      !this.$v.password.required && errors.push('Password is required.')
      
      return errors
    },
  },
}
</script>