<template>
  <v-container id="signinup-form" class="fill-height">
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="8" class="">
        <v-card class="evelation-12 card">
          <v-window v-model="step">
            <!--SignIn-->
            <v-window-item :value="1">
              <v-row class="">
                <v-col cols="12" md="8" class="pt-6 pb-6">
                  <v-card-text>
                    <v-form class="signup-form-form" @submit.prevent="signin">
                      <v-row class="mb-6 d-flex justify-center flex-column">
                        <div cols="12" class="py-0 display-2 secondary--text" style="display: block; margin: 0 auto;" >Swift</div>
                        <div cols="12" class="py-0 title secondary--text" style="display: block; margin: 0 auto;">Contactless Dining</div>
                      </v-row>
                      <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
                      <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
                      <div class="text-center">
                        <a href="#" class="mt-3 overline no-text-decoration" :class="`primary--text`" @click="forgotPass">
                          Forgot your password?
                        </a>
                      </div>
                      <div class="text-center mt-6">
                        <v-btn @click="loginCustomer" v-show=!isLoading rounded class="py-2 loginButton" color="primary">Sign in</v-btn>
                        <v-progress-circular v-show="isLoading" indeterminate color="primary"></v-progress-circular>
                        <v-input class="mt-2" v-show=loginFailed :error-messages=errorMsg error disabled></v-input>
                      </div>
                    </v-form>
                  </v-card-text>
                </v-col>
                <v-col cols="12" md="4" class="vcenter primary">
                  <div>
                    <v-card-text :class="`${fgColor}--text`">
                      <h1 class="text-center headline mb-3">New here?</h1>
                      <h5 class="text-center overline mb-3">
                        Please Sign Up to continue
                      </h5>
                    </v-card-text>
                    <div class="text-center mb-6">
                      <v-btn class="signUpButton" rounded dark outlined @click="goToRegister">Sign Up</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-window-item>
            
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, maxLength, email } from 'vuelidate/lib/validators'
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DesktopLoginForm',
  props: {
    source: {
      type: String,
      default: ''
    },
    fgColor: {
      type: String,
      default: 'white'
    }
  },
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required },
  },
  data: () => ({
    step: 1,
    showPassword: false,
    showPlaceholder: false,
    password: 'john123',
    email: 'john@doe.com',
    isLoading: false,
    errorMsg: '*Login Failed',
    loginFailed: false,
    isMobile: false,
  }),
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
      console.log('url :'+ url);

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

<style scoped lang="scss">
.v-input__icon--double .v-input__icon {
  margin-left: -4.25rem !important;
}
a.no-text-decoration {
  text-decoration: none;
}
#signinup-form {
  max-width: 75rem;
}
.signup-form-form {
  max-width: 23rem;
  margin: 0 auto;
}
.card {
  overflow: hidden;
}
.vcenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loginButton:hover {
  opacity: 0.7;
}

.signUpButton:hover {
  opacity: 0.5;
}
</style>