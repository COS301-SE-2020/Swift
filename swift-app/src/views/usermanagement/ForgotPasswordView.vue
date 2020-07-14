<template>
  <v-container fluid>
      <v-container v-show="step == 1">
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

      <v-container v-show="step == 2">
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
              <span style="font-size: 16px; text-align: center; opacity: 0.9" class="font-weight-light">Please enter the 4 digit code sent to {{email}}</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6" style="text-align:center">
              <v-col cols="2" class="pl-1 pr-1" style="text-align: center">
                <v-textarea maxlength="1" class="centered-input text--darken-3 mt-3 digits" height="4" solo single-line outlined></v-textarea>
              </v-col>
              <v-col cols="2" class="pl-1 pr-1">
                <v-textarea maxlength="1" class="centered-input text--darken-3 mt-3 digits" height="4" solo single-line outlined></v-textarea>
              </v-col>
              <v-col cols="2" class="pl-1 pr-1"> 
                <v-textarea maxlength="1" class="centered-input text--darken-3 mt-3 digits" height="4" solo single-line outlined></v-textarea>
              </v-col>
              <v-col cols="2" class="pl-1 pr-1">
                <v-textarea maxlength="1" class="centered-input text--darken-3 mt-3 digits" height="4" solo single-line outlined></v-textarea>
              </v-col>
            </v-row>
          </v-card>
          <v-btn text @click="resendEmail" class="mt-0 mb-1">
            <div class="body-1 font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Resend</div>
          </v-btn>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
           <div class="row d-flex flex-column align-center mx-8">
              <v-btn @click="confirmEmail" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Confirm</v-btn>
           </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-show="step == 3">
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
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
                <v-icon color="primary" class="lockIcon pr-0" size="25" style="width: 27px">mdi-asterisk</v-icon>
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
          </v-card>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
           <div class="row d-flex flex-column align-center mx-8">
              <v-btn @click="submitPass" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Submit Password</v-btn>
           </div>
          </v-col>
        </v-row>
      </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
    data() {
    return {
     email: 'peterjames@gmail.com',
     step: 1
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
      this.step = this.step + 1;
    },
    confirmEmail () {
      this.step = this.step + 1;
    },
    submitPass () {
      this.$router.push('login')
    }
  },
  computed: {
  
  },
};
</script>

<style>
.lockIcon {
    transform: rotate(180deg) scaleY(-1);
}

.digits {
  border-radius:5px !important;
  font-size: 30px;
}

.v-application--is-ltr .v-textarea.v-text-field--enclosed .v-text-field__slot textarea {
  text-align: center;
  line-height: 40px;
}
</style>