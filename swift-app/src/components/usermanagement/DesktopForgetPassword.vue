<template>
  <v-container id="signinup-form" class="fill-height hello">
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="8" class="">
        <v-card class="evelation-12 card">
          <v-window v-model="step">
            <!--PW Rest-->
            <v-window-item :value="1">
              <v-row class="fill-height">
                <v-col cols="12" md="4" class="vcenter" :class="`${bgColor}`">
                  <div>
                    <v-card-text :class="`${fgColor}--text`">
                      <h1 class="text-center headline mb-3">Already a user?</h1>
                      <h5 class="text-center overline mb-3">Please Sign In</h5>
                    </v-card-text>
                    <div class="text-center mb-6">
                      <v-btn dark outlined rounded @click="goToLogin">Sign In</v-btn>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="8" class="pt-6 pb-6">
                  <v-card-text>
                    <v-form class="signup-form-form">
                      <v-row class="mb-6 d-flex justify-center flex-column">
                        <v-avatar size="140px" color="#F5F5F5" style="display: block; margin: 0 auto;" justify="center">
                          <v-icon color="primary" class="lockIcon" size="100">mdi-lock-reset</v-icon>
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
                      <v-row class="mt-6 mb-4" justify="center">
                        <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
                        <div class="row d-flex flex-column align-center mx-8">
                            <v-btn @click="resetPass" rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Reset Password</v-btn>
                        </div>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item :value="2">
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
                      <v-textarea @input="changeFocus(i)" @focus="selectVal(i-1)" v-model="digits[i-1]" no-resize maxlength="1" class="centered-input mt-3 digits" height="4" solo single-line outlined></v-textarea>
                    </v-col>              
                  </v-row>
                  <v-row class="d-flex justify-center">
                    <v-col cols="10" class="d-flex justify-center">
                      <div style="color: red; font-size: 14px; text-align: center; padding-top: 10px;" v-if="codeErrorMssg != ''">{{codeErrorMssg}}</div>
                    </v-col>
                  </v-row>
                </v-card>
                <v-btn text @click="sendEmail" class="mt-0 mb-1">
                  <div class="body-1 font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Resend</div>
                </v-btn>
              </v-card>
              <v-row class="mt-6 mb-4" justify="center">
                <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0px;">
                <div class="row d-flex flex-column align-center mx-8">
                    <v-btn @click="confirmCode" rounded class="py-2 body-2 font-weight-light mb-6" color="primary" style="font-size: 17px !important">Confirm</v-btn>
                    <v-progress-circular v-show=isLoading indeterminate color="primary"></v-progress-circular>
                </div>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item :value="3">
              <v-container>
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
                      <v-col cols="6" >
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
                      <v-btn @click="submitPass" rounded class="py-2 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Submit Password</v-btn>
                      <v-progress-circular v-show=isLoading indeterminate color="primary mt-1"></v-progress-circular>
                  </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { validationMixin } from 'vuelidate'
import { required, minLength, email } from 'vuelidate/lib/validators'
import $ from 'jquery';

export default {
  name: 'DesktopForgetPassword',
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
    email: { required, email },
    password: { required, minLength: minLength(8) },
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
    }
  },
  
  methods: {
    backNavigation () {
      if (this.step != 2)
        this.$router.go(-1) 
      else 
        this.step = this.step - 1;
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
        if (inputField)
          inputField.focus();
          inputField.select();
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
}
</script>

<style scoped lang="scss">
.container {
  min-height: 100% !important;
}
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
</style>