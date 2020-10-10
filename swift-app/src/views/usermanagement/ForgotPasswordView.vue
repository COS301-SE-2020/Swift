<template>
  <v-container class="fill-height d-flex align-start">
    <v-container v-if="!isMobile" class="fill-height d-flex align-center">
      <DesktopForgetPassword></DesktopForgetPassword>
    </v-container>
    <v-container fluid class="pa-0">
      <v-container v-if="isMobile" v-show="step == 1">
        <v-card class="mx-auto" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-0 pr-0 pl-0">
              <v-btn @click="backNavigation" color="secondary" small text>
                <v-icon size="37">mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card flat tile>
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-1">
              <v-avatar size="180px" color="#F5F5F5" justify="center">
                <v-icon color="primary" class="lockIcon" size="120">mdi-lock-reset</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="mt-12" justify="center">
              <span  style="font-size: 25px">Forgot Password?</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <span style="font-size: 16px; text-align: center; opacity: 0.9" class="font-weight-light">Enter the email address associated with your account</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <v-col cols="10" >
                <v-text-field v-model="email" :error-messages="emailErrors" label="Email" required @blur="$v.email.$touch()"></v-text-field>
              </v-col>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <v-col cols="10" class="d-flex justify-center">
                <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
                <div style="color: red; font-size: 14px; text-align: center" v-if="errorMssg != '' && !isLoading">{{errorMssg}}</div>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
           <div class="row d-flex flex-column align-center mx-8">
              <v-btn @click="resetPass" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Reset Password</v-btn>
           </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-if="isMobile" v-show="step == 2">
        <v-card class="mx-auto" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-0 pr-0 pl-0">
              <v-btn @click="backNavigation" color="secondary" small text>
                <v-icon size="37">mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card flat tile align="center">
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-1">
              <v-avatar size="180px" color="#F5F5F5" justify="center">
                <v-icon color="primary" class="lockIcon" size="120">mdi-email-outline</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="mt-12" justify="center">
              <span  style="font-size: 25px">Verify your email</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <span style="font-size: 16px; text-align: center; opacity: 0.9" class="font-weight-light enterCodeMssg">Please enter the 4 digit code sent to {{email}}</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6" style="text-align:center">
              <v-col cols="2" class="pl-1 pr-1" style="text-align: center" v-for="i in codeLength" :key='i'>
                <v-textarea @input="changeFocus(i)" @focus="selectVal(i-1)" v-model="digits[i-1]" no-resize maxlength="1" class="centered-input text--darken-3 mt-3 digits" height="4" solo single-line outlined></v-textarea>
              </v-col>              
            </v-row>
            <v-row class="d-flex justify-center">
              <v-col cols="10" class="d-flex justify-center">
                <div style="color: red; font-size: 14px; text-align: center" v-if="codeErrorMssg != ''">{{codeErrorMssg}}</div>
              </v-col>
            </v-row>
          </v-card>
          <v-btn text @click="sendEmail" class="mt-0 mb-1">
            <div class="body-1 font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Resend</div>
          </v-btn>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
           <div class="row d-flex flex-column align-center mx-8">
              <v-btn @click="confirmCode" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Confirm</v-btn>
              <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
           </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-if="isMobile" v-show="step == 3">
        <v-card class="mx-auto" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-0 pr-0 pl-0">
              <v-btn @click="backNavigation" color="secondary" small text>
                <v-icon size="37">mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card flat tile>
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-1">
              <v-avatar size="180px" color="#F5F5F5" justify="center" >
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px" v-for="asterisk in 4" :key="asterisk">mdi-asterisk</v-icon>
                <!-- <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon> -->
              </v-avatar>
            </v-row>
            <v-row class="mt-12" justify="center">
              <span  style="font-size: 25px">New Password</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <span style="font-size: 16px; text-align: center; opacity: 0.9" class="font-weight-light">Please enter your new password</span>
            </v-row>
            <v-row justify="center" class="mt-7 mb-6">
              <v-col cols="10" >
                <v-text-field v-model="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="passwordErrors" :type="showPassword ? 'text' : 'password'" label="Password" required @blur="$v.password.$touch()" @click:append="showPassword = !showPassword"></v-text-field>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-col cols="10" class="d-flex justify-center">
                <div style="color: red; font-size: 14px; text-align: center" v-if="passErrorMssg != ''">{{passErrorMssg}}</div>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
           <div class="row d-flex flex-column align-center mx-8">
              <v-btn @click="submitPass" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Submit Password</v-btn>
              <v-progress-circular v-show=isLoading indeterminate color="primary mt-1"></v-progress-circular>
           </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

      <v-overlay v-if="isMobile" relative opacity="0.25" :value="alert" z-index="10">
        <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
          <v-icon size="33px" color="white" v-text="'mdi-lock-reset'"></v-icon>
        </v-avatar>
        <v-alert color="white" transition="scale-transition" class="alert" align="center" style="margin-top: 20px">
          <div style="font-size: 22px !important; color: #343434" class="pl-8 pr-8 mt-8">Password updated</div>
          <div class="mt-2" style="font-size: 16px !important; color: #343434">Your password was successfully updated</div>
          <v-btn text @click="goToLogin" class="mt-6 mb-1">
            <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Login</div>
          </v-btn>
        </v-alert>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { validationMixin } from 'vuelidate'
import { required, minLength, email } from 'vuelidate/lib/validators'
import $ from 'jquery';
import DesktopForgetPassword from "../../components/usermanagement/DesktopForgetPassword.vue"

export default {
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required, minLength: minLength(8) },
  },
  components: {
    DesktopForgetPassword
  },
  data() {
    return {
     email: '',
     token: '',
     errorMssg: '',
     codeErrorMssg: '',
     passErrorMssg: '',
     alert: false,
     digits: [],
     codeLength: 4,
     showPassword: false,
     step: 1,
     errorMsg: '',
     password: '',
     isLoading: false,
     isMobile: false,
    }
  },
  mounted:function(){
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  methods: {
    backNavigation () {
      if (this.step != 2)
        this.$router.go(-1) 
      else 
        this.step = this.step - 1;
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    resetPass () {
      this.isLoading = true
      if (this.emailErrors.length > 0  || this.email.length == 0) {
        this.$v.$touch()
        this.isLoading = false
      } else {
        this.sendEmail()
        // this.step = this.step + 1;
      }
      // this.isLoading = false
      
    },
    changeFocus(index) {
      var inputVal = $(".digits textarea").eq(index-1).val();
      if (inputVal != '') {
        var inputField = $(".digits textarea").eq(index);
        if (inputField) {
          inputField.focus();
        }
      } 
    },
    selectVal(index) {
      var inputVal = $(".digits textarea").eq(index);
      if (inputVal.val() != '')
        inputVal.select();
    },
    async confirmCode () {
      this.codeErrorMssg = ''
      let incomplete = false
      for (let i = 0; i < this.codeLength; i++) {
        if (this.digits[i] == undefined)
          incomplete = true;
      }

      if (incomplete) {
        this.codeErrorMssg = 'You must fill in the 4 digit code'
      } else {
        let data = {
          "email": this.email,
          "code": this.digits.join("")
        }

        await this.verifyCode(data).then(result => {
          console.log(result)
          if (result.status == 201) {
            this.codeErrorMssg = ''
            this.step = this.step + 1;
          } else {
            this.codeErrorMssg = result.data.reason
          }
        })
      }
    },
    async submitPass () {
      this.passErrorMssg = ''
      this.isLoading = true
      if (this.passwordErrors.length > 0  || this.password.length < 8) {
        this.$v.$touch()
        // this.isLoading = false
      } else {
        
        let data = {
          "email": this.email,
          "password": this.password
        }

        await this.updatePassword(data).then(result => {
          if (result.status == 201) {
            this.alert = true;
          } else {
            this.passErrorMssg = result.data.reason
          }
        })
      }
      this.isLoading = false
    },
    async sendEmail () {
      
      let data = {
        "email": this.email
      }

      await this.validateEmail(data).then(result => {
        // console.log(result)
        if (result.status == 200) {
          this.token = result;
          this.errorMssg = '';
          this.step = this.step + 1;
        } else {
          this.errorMssg = result.data.reason;
        }
      })
      this.isLoading = false;
    },
    goToLogin() {
      this.alert = false;
      this.$router.push('/login') 
    },
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      errors: 'getErrors',
    }),
    ...mapActions({
      validateEmail: 'CustomerStore/resetPassword',
      verifyCode: 'CustomerStore/verifyCode',
      updatePassword: 'CustomerStore/updatePassword',
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
      !this.$v.password.minLength && errors.push('Password must be at least 8 characters long')
      return errors
    },
  },
};
</script>

<style>
.lockIcon {
    transform: rotate(180deg) scaleY(-1);
}

.digits{
  border-radius:5px !important;
  font-size: 30px;
}
.digits textarea {
  text-align: center;
  line-height: 40px;
}

</style>