<template>
<<<<<<< HEAD
	<h4>Reviews List</h4>
</template>
=======
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Restaurant Reviews</h2>
      </div>
    </div>
    <div class="vx-row">
      <div class="vx-col w-full lg:w-1/2 sm:w-1/2 w-full mb-base">
        <vx-card title="Rating Phrases" collapse-action>
          <p>These are the phrases customers use when describing your restaurant:</p>
          <vs-chip color="success">
            <vs-avatar color="success" text="4" />Atmosphere
          </vs-chip>
          <vs-chip color="success">
            <vs-avatar color="success" text="4" />Good Food
          </vs-chip>
          <vs-chip color="success">
            <vs-avatar color="success" text="4" />Service
          </vs-chip>
          <vs-divider border-style="solid" color="white"></vs-divider>
        </vx-card>
      </div>
      <div class="vx-col w-full lg:w-1/2 sm:w-1/2 mb-base">
        <vx-card title="Latest Review" collapse-action class="overflow-hidden">
          <template slot="no-body">
            <div class="chat-card-log">
              <VuePerfectScrollbar
                ref="chatLogPS"
                class="scroll-area pt-6 px-6"
                :settings="settings"
                :key="$vs.rtl"
              >
                <ul ref="chatLog">
                  <li
                    class="flex items-start"
                    :class="{'flex-row-reverse': msg.isSent, 'mt-4': index}"
                    v-for="(msg, index) in chatLog"
                    :key="index"
                  >
                    <vs-avatar
                      size="40px"
                      class="m-0 flex-shrink-0"
                      :class="msg.isSent ? 'ml-3' : 'mr-3'"
                      :src="msg.senderImg"
                    ></vs-avatar>
                    <div
                      class="msg relative bg-white shadow-md py-3 px-4 mb-2 rounded-lg max-w-md"
                      :class="{'chat-sent-msg bg-primary-gradient text-white': msg.isSent, 'border border-solid d-theme-border-grey-light': !msg.isSent}"
                    >
                      <span>{{ msg.msg }}</span>
                    </div>
                  </li>
                </ul>
              </VuePerfectScrollbar>
            </div>
            <div class="flex bg-white p-6 chat-input-container">
              <vs-input
                class="mr-3 w-full"
                v-model="chatMsgInput"
                @keyup.enter="chatMsgInput = ''"
                placeholder="Type Your Message"
              ></vs-input>
              <vs-button icon-pack="feather" icon="icon-send" @click="chatMsgInput = ''"></vs-button>
            </div>
          </template>
        </vx-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatLog: [
        {
          index: 0,
          msg:
            "I had a wonderful time at this restaurant. Service was fast and everyone was friendly",
          senderImg: require("@/assets/images/portrait/small/avatar-s-12.jpg")
        },
        {
          index: 1,
          msg:
            "Thank you for the review. We are glad that you had such a positive experience with us.",
          isSent: true,
          senderImg: require("@/assets/images/portrait/small/avatar-s-11.jpg")
        }
      ]
    };
  }
};
</script>


<style scoped>
.con-vs-chip {
  margin-top: 17px;
}
.chat-card-log {
  max-width: 90%;
  margin: 0 auto;
}
</style>
>>>>>>> feature-notification
