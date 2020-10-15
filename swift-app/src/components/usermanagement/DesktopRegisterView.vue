<template>
  <v-container id="signinup-form" class="fill-height">
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="8" class="">
        <v-card class="evelation-12 card">
          <v-window v-model="step">
            <!--SignUp-->
            <v-window-item :value="2">
              <v-row class="fill-height">
                <v-col cols="12" md="4" class="vcenter" :class="`${bgColor}`">
                  <div>
                    <v-card-text :class="`${fgColor}--text`">
                      <h1 class="text-center headline mb-3">Already a user?</h1>
                      <h5 class="text-center overline mb-3">Please Sign In</h5>
                    </v-card-text>
                    <div class="text-center mb-6">
                      <v-btn class="loginButton" dark outlined rounded @click="goToLogin">Sign In</v-btn>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="8" class=" pt-6 pb-6">
                  <v-card-text>
                   <v-row class="mb-6 d-flex justify-center flex-column">
                      <div cols="12" class="py-0 display-2 secondary--text" style="display: block; margin: 0 auto;" >Swift</div>
                      <div cols="12" class="py-0 title secondary--text" style="display: block; margin: 0 auto;">Contactless Dining</div>
                    </v-row>
                    <v-form class="signup-form-form" @submit.prevent="signup">
                      <v-text-field v-model="name" :error-messages="nameErrors" label="Name" required @blur="$v.name.$touch()"></v-text-field>
                      <v-text-field v-model="surname" :error-messages="surnameErrors" label="Surname" required @blur="$v.surname.$touch()"></v-text-field>
                      <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
                      <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
                      <div class="text-center mt-6">
                        <v-btn @click="registerCustomer"  v-show=!isLoading rounded class="py-2 signUpButton" color="primary">Register</v-btn>
                        <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
                      </div>
                    </v-form>
                  </v-card-text>
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
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email } from 'vuelidate/lib/validators'

export default {
  name: 'DesktopRegisterForm',
  props: {
    source: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: 'primary'
    },
    fgColor: {
      type: String,
      default: 'white'
    }
  },
  mixins: [validationMixin],
  validations: {
    name: { required, maxLength: maxLength(16) },
    surname: { required, maxLength: maxLength(16) },
    email: { required, email },
    password: { required, minLength: minLength(8) },
  },
  data: () => ({
    showPassword: false,
    showPlaceholder: false,
    name: '',
    surname: '',
    email: '',
    password: '',
    isLoading: false,
    rules: {
      required: value => !!value || '*Required.',
      min: v => v.length >= 8 || '*Min 8 characters',
      emailMatch: () => ('*This email has already been used'),
    },
    step: 1
  }),
  methods: {
    goToLogin () {
      this.$router.push('login')
    },
    async registerCustomer () {
      this.isLoading = true
      if (this.nameErrors.length > 0 || this.surnameErrors.length > 0 || this.emailErrors > 0 || this.passwordErrors > 0 || this.password.length < 8) {
        this.$v.$touch()
        this.isLoading = false
      } else {
        
        let data = {
          name: this.name,
          surname: this.surname,
          email: this.email,
          password: this.password,
        }
        
        var hasRegistered = await this.register(data)

        if (hasRegistered) {
          this.isLoading = false
          this.$router.push('/location')
        }
      }
    },
    async registerWithGoogle () {
      let url = await this.googleRegister();
      //console.log("url"+ url);
      window.location.href = url; 
     // url= window.location.href;
      // console.log("got here ??" + url);
      this.$router.push('/location');
    },
    ...mapActions({
      register: 'CustomerStore/register',
      googleRegister: 'CustomerStore/googleRegister',
    }),
  },
  computed: {
    nameErrors () {
      const errors = []
      if (!this.$v.name.$dirty) return errors
      !this.$v.name.maxLength && errors.push('Name can be at most 16 characters long')
      !this.$v.name.required && errors.push('Name is required.')
      return errors
    },
    surnameErrors () {
      const errors = []
      if (!this.$v.surname.$dirty) return errors
      !this.$v.surname.maxLength && errors.push('Surname can be at most 16 characters long')
      !this.$v.surname.required && errors.push('Surname is required.')
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
  opacity: 0.8;
}
</style>