<template>
  <v-container fill-height>
    <DesktopRegisterForm v-if="!isMobile"></DesktopRegisterForm>
    <v-container v-if="isMobile" ma-0 pa-0 >
      <div class="row d-flex flex-column align-center">
        <div class="display-2 mb-2">Swift</div>
        <div class="title">Contactless Dining</div>
      </div>
      <div class="row d-flex flex-column align-center mt-8">
        <v-col cols="10" class="pb-0">
          <v-text-field v-model="name" :error-messages="nameErrors" label="Name" required @blur="$v.name.$touch()"></v-text-field>
        </v-col>
        <v-col cols="10" class="pb-0 pt-0">
          <v-text-field v-model="surname" :error-messages="surnameErrors" label="Surname" required @blur="$v.surname.$touch()"></v-text-field>
        </v-col>
        <v-col cols="10" class="pb-0 pt-0">
          <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
        </v-col>
        <v-col cols="10" class="pb-0 pt-0">
          <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
          <!-- <p class="body-2 float-right" color="secondary"><u>Forgot Password?</u></p> -->
        </v-col>
      </div>
      <div class="row d-flex flex-column align-center mx-8 mt-6">
        <v-btn @click="registerCustomer"  v-show=!isLoading block rounded class="py-5" color="primary">Register</v-btn>
        <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
      </div>
      <p class="row d-flex flex-column align-center mx-8 mb-0 mt-5">
        or register with
      </p>
      <div class="row d-flex flex-col align-center justify-center">
        <v-col cols="2" class="pt-0 mt-3">
          <v-btn small fab class="google-signup" @click.prevent="registerWithGoogle" >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><g fill="none" fill-rule="evenodd"><path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"></path><path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"></path><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"></path><path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"></path></g></svg>
          </v-btn>
        </v-col>
      </div>
      <div class="row d-flex flex-column align-center mt-8">
        <p>Not your first time here? <a @click="goToLogin"><u>Login</u></a>.</p>
      </div>
    </v-container>
  </v-container>

</template>

<script>
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email } from 'vuelidate/lib/validators'
import DesktopRegisterForm from "../../components/usermanagement/DesktopRegisterView.vue"

export default {
  mixins: [validationMixin],
  validations: {
    name: { required, maxLength: maxLength(16) },
    surname: { required, maxLength: maxLength(16) },
    email: { required, email },
    password: { required, minLength: minLength(8) },
  },
  components: {
    DesktopRegisterForm
  },
  data () {
    return {
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
      isMobile: false,
    }
  },
  mounted:function(){
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
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
    onResize () {
      this.isMobile = window.innerWidth < 600
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