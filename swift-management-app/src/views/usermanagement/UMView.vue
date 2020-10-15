<template>
  <div class="h-screen flex w-full bg-img vx-row no-gutter items-center justify-center" id="page-login">
    <div class="vx-col sm:w-1/2 md:w-1/2 lg:w-3/4 xl:w-3/5 sm:m-0 m-4">
      <vx-card style="border-radius: 10px">
        <div slot="no-body" class="full-page-bg-color">

          <div class="managementBackground vx-row no-gutter justify-center items-center">

            <div class="vx-col hidden lg:block lg:w-1/3">
             <div class="vx-card__title mb-4">
                  <h1 style="color:white" class="text-center">Management</h1>
                  <p style="color:white" class="mb-4 text-center">Dashboard</p>
                </div>
            </div>

            <div class="loginCard vx-col sm:w-full md:w-full lg:w-2/3 d-theme-dark-bg">
              <div class="px-8 pt-8 login-tabs-container">

                <div class="vx-card__title mb-4">
                  <h1 class="mt-4 text-center">Swift</h1>
                  <p class="mb-4 text-center">Contactless Dining</p>
                </div>

                <vs-tabs>
                  <vs-tab label="Login">
                    <login-form></login-form>
                  </vs-tab>
                  <vs-tab label="Register">
                    <register-form></register-form>
                  </vs-tab>
                </vs-tabs>

              </div>
            </div>
          </div>
        </div>
      </vx-card>
    </div>
  </div>
</template>


<script>
import LoginForm from "./UMLoginForm.vue"
import RegisterForm from "./UMRegisterForm.vue"

export default {
  components: {
    LoginForm,
    RegisterForm
  }
}
</script>

<style lang="scss">
.loginCard{
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  
}
.managementBackground{
  background: #f75564;
  border-radius: 6px;
}
.login-tabs-container {
  min-height: 505px;

  .con-tab {
    padding-bottom: 14px;
  }

  .con-slot-tabs {
    margin-top: 1rem;
  }
}
</style>
