<template>
  <v-container fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="display-2 mb-2">Swift</div>
      <div class="title">Contactless Dining</div>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-col cols="10" >
        <v-text-field
          v-model="email"
          :rules="[rules.required]"
          label="Email"
          color="secondary"
        ></v-text-field>
      </v-col>
      <v-col cols="10">
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[rules.required]"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          @click:append="showPassword = !showPassword"
          color="secondary"
        ></v-text-field>
        <p class="body-2 float-right" color="secondary"><u>Forgot Password?</u></p>
      </v-col>
    </div>
    <div class="row d-flex flex-column align-center mx-8">
      <v-btn @click="loginCustomer" block rounded class="py-5" color="primary">Sign in</v-btn>
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

export default {
  data () {
    return {
      showPassword: false,
      showPlaceholder: false,
      password: '',
      email: '',
      rules: {
        required: value => !!value || '*Required.',
        incorrectPassword: () => ('*Incorrect Password'),
      },
    }
  },
  methods: {
    goToRegister () {
      this.$router.push('/register')
    },
    loginCustomer () {
      let data = {
        email: this.email,
        password: this.password,
      }
      this.login(data)
    },
    ...mapActions({
      login: 'CustomerStore/login',
    }),
  },
  computed: {
    
  }
}
</script>