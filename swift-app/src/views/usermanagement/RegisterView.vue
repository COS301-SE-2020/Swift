<template>
  <v-container fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="display-2 mb-2">Swift</div>
      <div class="title">Contactless Dining</div>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-col cols="10" >
        <v-text-field
          :rules="[rules.required]"
          name="username"
          label="Username"
          color="secondary"
        ></v-text-field>
      </v-col>
      <v-col cols="10" >
          <v-text-field
            :rules="[rules.required, rules.emailMatch]"
            name="email"
            label="Email"
            value=""
            @click:append="showPlaceholder = !showPlaceholder"
          ></v-text-field>
        </v-col>
      <v-col cols="10" >
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[rules.required, rules.min]"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          label="Password"
          hint="At least 8 characters"
          counter
          @click:append="showPassword = !showPassword"
          color="secondary"
        ></v-text-field>
      </v-col>
    </div>
    <div class="row d-flex flex-column align-center mx-8">
      <v-btn @click="goToHome" block rounded class="py-5" color="primary">Register</v-btn>
    </div>
    <div class="row d-flex flex-column align-center ">
      <p>Not your first time here? <a @click="goToLogin"><u>Login</u></a>.</p>
    </div>
  </v-container>

</template>

<script>
export default {
  data () {
    return {
      showPassword: false,
      showPlaceholder: false,
      password: '',
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
    goToHome () {
      this.$router.push('/')
    },
  },
}
</script>