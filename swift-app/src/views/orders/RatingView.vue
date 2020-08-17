<template>
  <v-container fluid>
    <v-row v-for="(ratingType, index) in rating" :key="index">
      <v-container v-show="currentIndex == index">
        <v-card class="mx-auto" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-1 pr-0">
              <v-btn @click="backNavigation" color="secondary" small text>
                <v-icon size="35">mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="9" class="mt-0 pt-0" align="left">
              <span style="font-size: 27px">Rate {{ratingType.type}}</span>
            </v-col>
          </v-row>
        </v-card>
        <v-tabs v-if="Array.isArray(ratingType.info)" height="20px" width="auto" v-model="tab" hide-slider centered>
          <v-tab active-class="no-active" v-for="(item, ind) in ratingType.info" :key="ind" :href="`#tab-${ind}`" class="ratingItems">
            <v-icon v-if="ratingType.info.length > 1" size="10px">mdi-circle-outline</v-icon>
          </v-tab>
          <v-tab-item v-for="(item, ind) in ratingType.info" :key="ind" :value="'tab-' + ind">
            <v-card flat tile>
              <v-card class="mx-auto" flat>
                <v-row justify="center" class="mt-2">
                  <v-avatar size="110px" color="#F5F5F5" justify="center">
                    <v-icon v-if="item.img == ''" color="primary" size="65">{{icons[index]}}</v-icon>
                    <img v-else :src="item.img" alt />
                  </v-avatar>
                </v-row>
                <v-row class="mt-8" justify="center">
                  <span  style="font-size: 25px">{{item.name}}</span>
                </v-row>
                <v-row justify="center" class="mt-3">
                  <v-rating size="30" @input="changeFeedback(ind)" dense color="yellow darken-3" v-model="itemRating[ind]" background-color="secondary" :value=0></v-rating>
                </v-row>
                <v-row justify="center" class="mt-3 mb-6">
                  <span  style="font-size: 17px; opacity: 0.7" class="font-weight-light">{{ratingFeedback}}</span>
                </v-row>
                <v-divider></v-divider>
              </v-card>
              <v-card class="mx-auto mt-6" flat>
                <v-row v-for="(rating, i) in ratingType.ratingPhrases" :key="i" justify="center">
                  <v-col cols="11" class="pt-1">
                    <v-card class="mx-auto mt-0 rounded-card" flat width="100%" height="50px" color="#F5F5F5">
                      <v-row>
                        <v-col cols="7" align="left" class="pl-8">
                          <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">{{rating}}</span>
                        </v-col>
                        <v-col cols="5" class="pr-6">
                          <v-rating size="18" v-model="itemPhraseRatings[i]" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row justify="center" class="mt-4">
                  <v-col cols="11" class="pt-1 pb-2" width="100%">
                    <span class="subtitle-1 " style="font-size: 17px !important;">Share your feedback</span>
                  </v-col>
                </v-row>
                <v-row justify="center">
                  <v-col cols="11" class="pt-0 pb-0">
                    <v-textarea v-model="comment" class="commentSection" label="Tell us what you liked..." outlined single-line auto-grow rows="5" row-height="20"></v-textarea>
                  </v-col>
                </v-row>
                <v-row class="mt-1" justify="center" v-if="currentIndex != (rating.length - 1)">
                  <v-col cols="11" class="pt-0" width="100%">
                    <v-checkbox class="pt-0" v-model="share[ind]" label="Share with public"></v-checkbox>
                    <!-- <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">Share with public</span> -->
                  </v-col>
                </v-row>
                <v-row class="mt-6 mb-4" justify="center">
                  <v-col cols="11" class="pt-0" width="100%">
                    <v-row class="d-flex justify-space-around">
                      <v-col cols="5" class="pa-0" align="center">
                        <v-btn v-show="currentIndex != 0" rounded color="#F5F5F5" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showPrevious">Previous</v-btn>
                      </v-col>
                      <v-col cols="5" class="pa-0" align="center">
                        <v-btn v-show="currentIndex != (rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showNext">Next</v-btn>
                        <v-btn v-show="currentIndex == (rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="submitRating">Submit</v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <v-card v-else flat tile>
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-2">
              <v-avatar size="110px" color="#F5F5F5" justify="center">
                <v-icon v-if="ratingType.info.img == ''" color="primary" size="65">{{icons[index]}}</v-icon>
                <img v-else :src="ratingType.info.img" alt />
              </v-avatar>
            </v-row>
            <v-row class="mt-8" justify="center">
              <span  style="font-size: 25px">{{ratingType.info.name}}</span>
            </v-row>
            <v-row justify="center" class="mt-3">
              <v-rating size="30" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
            </v-row>
            <v-row justify="center" class="mt-3 mb-6">
              <span  style="font-size: 17px; opacity: 0.7" class="font-weight-light">{{ratingFeedback}}</span>
            </v-row>
            <v-divider></v-divider>
          </v-card>
          <v-card class="mx-auto mt-6" flat>
            <v-row v-for="(rating, i) in ratingType.ratingPhrases" :key="i" justify="center">
              <v-col cols="11" class="pt-1">
                <v-card class="mx-auto mt-0 rounded-card" flat width="100%" height="50px" color="#F5F5F5">
                  <v-row>
                    <v-col cols="7" align="left" class="pl-8">
                      <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">{{rating}}</span>
                    </v-col>
                    <v-col cols="5" class="pr-6">
                      <v-rating size="18" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
            <v-row justify="center" class="mt-4">
              <v-col cols="11" class="pt-1 pb-2" width="100%">
                <span class="subtitle-1 " style="font-size: 17px !important;">Share your feedback</span>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="11" class="pt-0 pb-0">
                <v-textarea class="commentSection" label="Tell us what you liked..." outlined single-line auto-grow  rows="5" row-height="20"></v-textarea>
              </v-col>
            </v-row>
            <v-row class="mt-1" justify="center" v-if="currentIndex != (rating.length - 1)">
              <v-col cols="11" class="pt-0" width="100%">
                <v-checkbox class="pt-0" v-model="share[ind]" label="Share with public"></v-checkbox>
                <!-- <v-btn icon @click="togglePublicRestaurant">
                  <v-icon color="secondary" v-text="(selectedRestaurant ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline')"></v-icon>
                </v-btn>
                <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">Share with public</span> -->
              </v-col>
            </v-row>
            <v-row class="mt-6 mb-4" justify="center">
              <v-col cols="11" class="pt-0" width="100%">
                <v-row class="d-flex justify-space-around">
                  <v-col cols="5" class="pa-0" align="center">
                    <v-btn v-show="currentIndex != 0" rounded color="#F5F5F5" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showPrevious">Previous</v-btn>
                  </v-col>
                  <v-col cols="5" class="pa-0" align="center">
                    <v-btn v-show="currentIndex != (rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showNext">Next</v-btn>
                    <v-btn v-show="currentIndex == (rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="submitRating">Submit</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-card>

        <v-overlay relative opacity="0.25" :value="submitted" z-index="10">
          <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
            <v-icon size="33px" color="white" v-text="'mdi-check'"></v-icon>
          </v-avatar>
          <v-alert color="white" transition="scale-transition" class="alert" align="center" style="margin-top: 20px">
            <div style="font-size: 22px !important; color: #343434" class="pl-8 pr-8 mt-8">Review successful</div>
            <div class="font-weight-light mt-2" style="font-size: 16px !important; color: #343434">Thank you for your feedback!</div>
            <v-btn text @click="hideAlert" class="mt-6 mb-1">
              <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Continue</div>
            </v-btn>
          </v-alert>
        </v-overlay>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
    data() {
    return {
      tab: null,
      comment: "",
      ratingFeedback: "",
      share: [],
      itemPhraseRatings: [],
      itemRating: [],
      selectedRestaurant: false,
      selectedItemPublic: [],
      submitted: false,
      icons: ['mdi-silverware-fork-knife', 'mdi-pasta', 'mdi-account',],
      currentIndex: 0,
      currentTab: 0,
      rating: [
        {
          type: 'Restaurant',
          info: {
            name: 'Mugg and Bean',
            img: '',
          },
          ratingPhrases: [
            'Atmosphere', 'Good Food', 'Service'
          ],
        },
        {
          type: 'Items',
          info: [{
            name: 'Avo on Toast',
            img: '',
          },],
          ratingPhrases: [
            'Taste', 'Presentation', 'Value'
          ],
        },
        {
          type: 'Waiter',
          info: {
            name: 'John Doe',
            img: 'https://source.unsplash.com/800x800/?man',
          },
          ratingPhrases: [
            'Quick', 'Attentive', 'Service'
          ],
        },
      ]
    }
  },
  methods: {
    togglePublicRestaurant () {
      this.selectedRestaurant = !this.selectedRestaurant;
    },
    togglePublic: function (index) {
      this.selectedItemPublic.includes(index) ? this.selectedItemPublic.splice(this.selectedItemPublic.indexOf(index), 1) : this.selectedItemPublic.push(index);
    },
    showPrevious () {
      if (this.currentIndex != 0)
        this.currentIndex--;
    },
    showNext () {
      if (this.currentIndex != this.rating.length - 1)
        this.currentIndex++;
    },
    changeTab: function(index) {
      currentTab = index;
    },
    submitRating () {
      // console.log(this.comment);
      // console.log(this.share);
      // console.log(this.itemPhraseRatings[1]);
      // console.log(this.itemRating);
      this.submitted = !this.submitted;
    },
    hideAlert () {
      this.$router.push('/')
    },
    backNavigation () {
      this.$router.go(-1)
    },
    changeFeedback(i) {
      // console.log("entered")
      if (this.itemRating[i] <= 3)
        this.ratingFeedback = "Poor"
      else if (this.itemRating[i] == 4)
        this.ratingFeedback = "Good"
      else
        this.ratingFeedback = "Excellent"
    },
    ...mapGetters({
      orderHistory: 'OrderStore/getOrderHistory',
    }),
  },
  computed: {
    selectTab () {
      if (!this.favourited) {
        return 'mdi-heart-outline'
      } else {
        return 'mdi-heart'
      }
    },
    filteredList: function (id) {
      return this.orderHistory().find(orderItem => {
        return orderItem.orderId == id
      })
    },
    
  },
  mounted: function () {
    this.rating[0].info.name = this.filteredList(16).restaurantName
    this.rating[2].info.name = this.filteredList(16).orderEmployeeName + ' ' + this.filteredList(16).orderEmployeeSurname
  }
};
</script>

<style>
.rounded-card {
    border-radius:150px !important;
}

.commentSection {
    border-radius:12px !important;
}

.commentSection .v-text-field__details {
    display: none !important;
}

.commentSection .v-application .primary--text {
  color: black !important;
}

.ratingItems {
  min-width: 0px;
  width: 20px;
  height: 20px;
  padding-left: 0;
  padding-right: 0;
}

.alert {
  border-radius: 30px !important;
}

.v-overlay__content {
  display: flex; 
  justify-content: center;
}
</style>