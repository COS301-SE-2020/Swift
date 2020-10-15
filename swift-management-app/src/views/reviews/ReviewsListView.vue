<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Restaurant Reviews</h2>
      </div>
    </div>
    <div class="flex flex-wrap">
      <div class="vx-row">
        <div
          v-for="(review, index) in reviews"
          :key="index"
          class="vx-col w-full lg:w-1/3 md:w-1/2 sm:w-1/1 mb-base"
        >
          <vx-card
            title="Review"
            :subtitle="formatDate(review.reviewDateTime)"
            collapse-action
          >
            <template slot="no-body">
              <div class="chat-card-log">
                <ul class="mt-6" ref="chatLog">
                  <li
                    class="flex items-start"
                    :class="{ 'flex-row-reverse': false, 'mt-4': 1 }"
                  >
                    <vs-avatar
                      size="40px"
                      class="m-0 flex-shrink-0"
                      :class="false ? 'ml-3' : 'mr-3'"
                      :src="review.customerImage"
                    ></vs-avatar>

                    <div
                      class="msg relative bg-white shadow-md py-3 px-4 mb-2 rounded-lg max-w-md"
                      :class="{
                        'chat-sent-msg bg-primary-gradient text-white': false,
                        'border border-solid d-theme-border-grey-light': !false,
                      }"
                    >
                      <span>{{ review.comment }}</span>
                      <vs-chip style="float: right"
                        >{{ review.customerName }}
                        {{ review.customerSurname }}</vs-chip
                      >
                    </div>
                  </li>
                  <li
                    v-if="review.response"
                    class="flex items-start"
                    :class="{ 'flex-row-reverse': true, 'mt-4': 2 }"
                  >
                    <vs-avatar
                      size="40px"
                      class="m-0 flex-shrink-0"
                      :class="true ? 'ml-3' : 'mr-3'"
                      :src="review.adminImage"
                    ></vs-avatar>
                    <div
                      class="msg relative bg-white shadow-md py-3 px-4 mb-2 rounded-lg max-w-md"
                      :class="{
                        'chat-sent-msg bg-primary-gradient text-white': true,
                        'border border-solid d-theme-border-grey-light': !true,
                      }"
                    >
                      <span>{{ review.response }}</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="flex bg-white p-6 chat-input-container">
                <vs-input
                  class="mr-3 w-full"
                  v-model="chatMsgInput[index]"
                  placeholder="Type Your Message"
                ></vs-input>
                <vs-button
                  icon-pack="feather"
                  icon="icon-send"
                  @click="replyToComment(review.reviewId, index)"
                ></vs-button>
              </div>
            </template>
          </vx-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios.js";
import moduleDataList from "@/store/mybusiness/mybusinessDataList.js";

export default {
  data() {
    return {
      chatMsgInput: [],
    };
  },
  computed: {
    myRestaurants() {
      if (this.$store.state) return this.$store.state.myRestaurants;
      else return null;
    },
    reviews() {
      if (this.$store.state.myRestaurants) {
        for (var i = 0; i < this.$store.state.myRestaurants.length; i++)
          if (
            this.$store.state.myRestaurants[i].restaurantId ==
            this.getCurrentRestaurantId()
          ) {
            return this.$store.state.myRestaurants[i].reviews;
          }
      } else {
        return null;
      }
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toDateString();
    },
    replyToComment(rId, rInd) {
      axios
        .post(process.env.VUE_APP_BASEURL, {
          requestType: "replyToComment",
          token: this.getAuthToken(),
          reviewId: rId,
          response: this.chatMsgInput[rInd],
        })
        .then((result) => {
          this.$store.dispatch(
            "retrieveMyRestaurants",
            {
              authKey: this.getAuthToken(),
              currentRestaurantName: this.getCurrentRestaurantName(),
            },
            {
              root: true,
            }
          );

          this.$vs.notify({
            title: "Response sent!",
            text: "Wohoo!",
            color: "success",
          });
          console.log(response);
        })
        .catch(({ response }) => {
          console.log(response);
        });
      this.chatMsgInput = "";
    },
    listMyRestaurants() {
      this.$store.dispatch("retrieveMyRestaurants", {
        authKey: this.getAuthToken(),
        currentRestaurantName: this.getCurrentRestaurantName(),
      });
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("mybusinessData", moduleDataList);
        moduleDataList.isRegistered = true;
      }

      if (this.myRestaurants == null) this.$vs.loading();

      this.listMyRestaurants();
    }
  },
  watch: {
    reviews(newCount, oldCount) {
      this.chatMsgInput = [];
      for(var i = 0; i < this.reviews.length; i++){
        this.chatMsgInput.push("");
      }
    },
    myRestaurants(newCount, oldCount) {
      this.$vs.loading.close();
      if (this.myRestaurants.length <= 0) this.addFirstItemPrompt();
    },
  },
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