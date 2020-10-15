<template>
  <v-container fill-height class="login-container">
    <DesktopLoginForm v-if="!isMobile"></DesktopLoginForm>
    <v-container v-if="isMobile" ma-0 pa-0 >
      <div class="row d-flex flex-column align-center">
        <div class="display-2 mb-2">Swift</div>
        <div class="title">Contactless Dining</div>
      </div>
    
      <div class="row d-flex flex-column align-center mt-8">
        <v-col cols="10" lg="6">
          <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
        </v-col>
        <v-col cols="10" lg="6" class="pt-0">
          <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
          <v-btn text @click="forgotPass" class="pr-0" style="float: right !important;">
            <p class="body-2 float-right" color="secondary"><u>Forgot password?</u></p>
          </v-btn>
        </v-col>
      </div>
      <div class="row d-flex flex-column align-center mx-8 mt-3">
        <v-col cols="10" lg="6" style="text-align: center">
          <v-btn @click="loginCustomer" v-show="!isLoading" block rounded class="py-5" color="primary">Sign in</v-btn>
          <v-progress-circular v-show="isLoading" indeterminate color="primary"></v-progress-circular>
          <v-input v-show=loginFailed :error-messages=errorMsg error disabled class="mt-2 login-error"></v-input>
        </v-col>
      </div>
      <p class="row d-flex flex-column align-center mx-8 mb-0 mt-5">
        or sign in with
      </p>
      <div class="row d-flex flex-column align-center justify-center">
        <v-col cols="2" class="pt-0 mt-3">
          <v-btn small fab class="google-signup" @click="loginWithGoogle" >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><g fill="none" fill-rule="evenodd"><path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"></path><path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"></path><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"></path><path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"></path></g></svg>
          </v-btn>
        </v-col>
      </div>
      <div v-if="isMobile" class="row d-flex flex-column align-center mt-8">
        <p>Don't have an account? <a @click="goToRegister"><u>Register</u></a>.</p>
      </div>
    </v-container>
  </v-container>
</template>

<style>
.login-error .v-messages {
  text-align: center !important;
}
.google-signup {
  /* border-radius: 13px;  */
  background-color: white; box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;
}
</style>

<script>
import store from '@/store/store.js';
import axios from 'axios'
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, maxLength, email } from 'vuelidate/lib/validators'
import DesktopLoginForm from "../../components/usermanagement/DesktopLoginView.vue"

export default {
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required },
  },
  components: {
    DesktopLoginForm
  },
  data () {
    return {
      showPassword: false,
      showPlaceholder: false,
      password: '',
      email: '',
      // password: 'john123',
      // email: 'john@doe.com',
      isLoading: false,
      errorMsg: '*Login Failed',
      loginFailed: false,
      isMobile: false,
    }
  },
  mounted:function(){
    this.handlegoogle()
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  methods: {
    handlegoogle: async function() {
      //let url= window.location.href;
      //console.log("got here ??" + url);
      let uri = window.location.search.substring(1); 
      let params = new URLSearchParams(uri);

       if(params.get("code") !== null){
        // console.log("CODE --" + params.get("code"));
        let code =  params.get("code");
        let user = await this.handleGoogle(code);
        
        this.isLoading = !this.isLoading;
        this.loginFailed = false
        if (user == "Success") 
          this.$router.push('/');
        else 
          this.loginFailed = true

       }
      //  else{
      //   console.log("got error");
      //  }
    },
    goToRegister () {
      this.$router.push('/register')
    },
    forgotPass () {
      this.$router.push('/forgotPassword')
    },
    async loginCustomer ()  {
      this.isLoading = !this.isLoading;
      if (this.emailErrors.length > 0 && this.passwordErrors > 0 || this.email.length == 0 || this.password.length == 0) {
        this.$v.$touch()
        this.isLoading = !this.isLoading;
      } else {
        let data = {
          email: this.email,
          password: this.password,
        }
        
        let user = await this.login(data);
        this.isLoading = !this.isLoading;
        this.loginFailed = false
        if (user == "Success") 
          this.$router.push('/');
        else 
          this.loginFailed = true

      }
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    async loginWithGoogle () {
      let url = await this.googleLogin();
      this.googleAuthUrl = url;
      window.location.href = url;
      // console.log('url :'+ url);

       this.$router.push('/');
    },
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      errors: 'getErrors',
    }),
    ...mapActions({
      login: 'CustomerStore/login',
      googleLogin: 'CustomerStore/googleLogin',
      handleGoogle: 'CustomerStore/handleGoogle',
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