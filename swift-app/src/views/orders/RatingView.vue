<template>
  <v-container fluid>
    <v-row v-for="(ratingType, index) in itemToRate().rating" :key="index">
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
                <v-row class="mt-6 d-flex justify-center" style="text-align: center">
                  <div style="font-size: 22px">{{item.name}}</div>
                </v-row>
                <v-row justify="center" class="mt-2">
                  <v-rating size="30" @input="changeFeedback(ind, Array.isArray(ratingType.info))" v-model="ratingValueMenuItem[ind]" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
                </v-row>
                <v-row justify="center" class="mt-2 mb-5">
                  <div style="font-size: 17px; opacity: 0.7" class="font-weight-light">{{ratingFeedbackMenuItem[ind]}}</div>
                </v-row>
                <v-divider></v-divider>
              </v-card>
              <v-list-item-group multiple class="mt-6">
                <template v-for="(rating, i) in ratingType.ratingPhrases">
                  <v-list-item class="px-2 attributeValues" :key="`item-${i}`">
                    <template>
                      <v-card class="mx-auto mt-2 rounded-card" flat width="100%" height="50px" color="#F5F5F5" style="border-radius: 30px">
                        <v-row class="px-4">
                          <v-col cols="7">
                            <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">{{rating.phraseDescription}}</span>
                          </v-col>
                          <v-col cols="5">
                            <v-list-item-action class="my-0 mx-0">
                              <v-rating size="18" @input="addPhraseItemScore($event, ind, i)" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
                            </v-list-item-action>
                          </v-col>
                        </v-row>
                      </v-card>
                    </template>
                  </v-list-item>
                </template>
              </v-list-item-group>

              <v-row justify="center" class="mt-5">
                <v-col cols="11" class="pt-1 pb-2" width="100%">
                  <span class="subtitle-1 " style="font-size: 17px !important;">Share your feedback</span>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="11" class="pt-0 pb-0">
                  <v-textarea class="commentSection" v-model="commentMenuItem[ind]" label="Tell us what you liked..." outlined single-line auto-grow rows="5" row-height="20"></v-textarea>
                </v-col>
              </v-row>
              <v-row class="mt-1" justify="center">
                <v-col cols="11" class="pt-0" width="100%">
                  <v-checkbox v-model="publicValueMenuItem[ind]" class="pt-0" label="Share with public"></v-checkbox>
                </v-col>
              </v-row>
                  
              <v-row class="mt-6 mb-4" justify="center">
                <v-col cols="11" class="pt-0" width="100%">
                  <v-row class="d-flex justify-space-around">
                    <v-col cols="5" class="pa-0" align="center">
                      <v-btn v-show="currentIndex != 0" rounded color="#F5F5F5" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showPrevious">Previous</v-btn>
                    </v-col>
                    <v-col cols="5" class="pa-0" align="center">
                      <v-btn v-show="currentIndex != (itemToRate().rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showNext">Next</v-btn>
                      <v-btn v-show="currentIndex == (itemToRate().rating.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="submitRating">Submit</v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
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
            <v-row class="mt-6 d-flex justify-center" style="text-align: center">
              <div style="font-size: 22px">{{ratingType.info.name}}</div>
            </v-row>
            <v-row justify="center" class="mt-2">
              <v-rating size="30" @input="changeFeedback(index, Array.isArray(ratingType.info))" dense color="yellow darken-3" v-model="ratingValue[index]" background-color="secondary" :value=0></v-rating>
            </v-row>
            <v-row justify="center" class="mt-2 mb-5">
              <div style="font-size: 17px; opacity: 0.7" class="font-weight-light">{{ratingFeedback[index]}}</div>
            </v-row>
            <v-divider></v-divider>
          </v-card>
          <v-list-item-group multiple class="mt-6">
            <template v-for="(rating, i) in ratingType.ratingPhrases">
              <v-list-item class="px-2 attributeValues" :key="`item-${i}`" :value="i">
                <template>
                  <v-card class="mx-auto mt-2 rounded-card" flat width="100%" height="50px" color="#F5F5F5" style="border-radius: 30px">
                    <v-row class="px-4">
                      <v-col cols="7">
                        <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">{{rating.phraseDescription}}</span>
                      </v-col>
                      <v-col cols="5">
                        <v-list-item-action class="my-0 mx-0">
                          <v-rating @input="addPhraseScore($event, i)" size="18" dense color="yellow darken-3" background-color="secondary" :value=0></v-rating>
                        </v-list-item-action>
                      </v-col>
                    </v-row>
                  </v-card>
                </template>
              </v-list-item>
            </template>
          </v-list-item-group>

          <v-row justify="center" class="mt-5">
            <v-col cols="11" class="pt-1 pb-2" width="100%">
              <span class="subtitle-1 " style="font-size: 17px !important;">Share your feedback</span>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="11" class="pt-0 pb-0">
              <v-textarea class="commentSection" v-model="comment[index]" label="Tell us what you liked..." outlined single-line auto-grow rows="5" row-height="20"></v-textarea>
            </v-col>
          </v-row>
          <v-row class="mt-1" justify="center">
            <v-col cols="11" class="pt-0" width="100%">
              <v-checkbox v-model="publicValue[index]" class="pt-0" label="Share with public"></v-checkbox>
            </v-col>
          </v-row>

          <v-row class="mt-6 mb-4" justify="center">
            <v-col cols="11" class="pt-0" width="100%">
              <v-row class="d-flex justify-space-around">
                <v-col cols="5" class="pa-0" align="center">
                  <v-btn v-show="currentIndex != 0" rounded color="#F5F5F5" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showPrevious">Previous</v-btn>
                </v-col>
                <v-col cols="5" class="pa-0" align="center">
                  <v-btn v-show="currentIndex != (itemToRate().rating.length.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="showNext">Next</v-btn>
                  <v-btn v-show="currentIndex == (itemToRate().rating.length.length - 1)" rounded color="primary" elevation="2" class="mr-2 body-2" width="90%" height="41px" @click="submitRating">Submit</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
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

      // attributes:{
      //   type:Array
      // },

      // rating1R: [],
      // rating2R: [],
      // rating3R: [],

      // rating1I: [],
      // rating2I: [],
      // rating3I: [],

      ratingFeedback: [],
      ratingFeedbackMenuItem: [],

      ratingValue: [],
      ratingValueMenuItem: [],
      phraseRating: [],
      phraseRatingMenuItem: [[],[]],
      comment: [],
      commentMenuItem: [],
      publicValue: [],
      publicValueMenuItem: [],

      submitted: false,
      icons: ['mdi-silverware-fork-knife', 'mdi-pasta', 'mdi-account',],
      currentIndex: 0,
      currentTab: 0,
      // rating: [
      //   {
      //     type: 'Restaurant',
      //     info: {
      //       name: 'Mugg and Bean',
      //       img: '',
      //     },
      //     ratingPhrases: [
      //       'Atmosphere', 'Good Food', 'Service'
      //     ],
      //   },
      //   {
      //     type: 'Items',
      //     info: [{
      //       name: 'Avo on Toast',
      //       img: '',
      //     },
      //     {
      //       name: 'Classic Breakfast',
      //       img: '',
      //     }],
      //     ratingPhrases: [
      //       'Taste', 'Presentation', 'Value'
      //     ],
      //   },
      //   {
      //     type: 'Waiter',
      //     info: {
      //       name: 'John Doe',
      //       img: 'https://source.unsplash.com/800x800/?man',
      //     },
      //     ratingPhrases: [
      //       'Quick', 'Attentive', 'Service'
      //     ],
      //   },
      // ]
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
      if (this.currentIndex != this.itemToRate().rating.length - 1)
        this.currentIndex++;
    },
    changeTab: function(index) {
      currentTab = index;
    },
    submitRating () {
      console.log(this.ratingValue);
      console.log(this.ratingValueMenuItem);

      console.log(this.phraseRating);
      console.log(this.phraseRatingMenuItem);

      console.log(this.comment);
      console.log(this.commentMenuItem);

      console.log(this.publicValue);
      console.log(this.publicValueMenuItem);

      let ratings = [];

      for (let i = 0; i < this.itemToRate().rating.length; i++) {
        let data = {}
        if (!Array.isArray(this.itemToRate().rating[i].info)) {
          let phrases = [];
          for (let j = 0; j < this.itemToRate().rating[i].ratingPhrases.length; j++) {
            let phrase = {
              "phraseId": this.itemToRate().rating[i].ratingPhrases[j].phraseId,
              "phraseScore": (this.phraseRating[j] != undefined) ? this.phraseRating[j] : 0
            }
            phrases.push(phrase)
          }

          data = {
            "type": "restaurant",
            "itemId": this.itemToRate().rating[i].info.itemId,
            "orderId": this.itemToRate().orderId,
            "ratingScore": (this.ratingValue[i] != undefined) ? this.ratingValue[i] : 0,
            "comment": (this.comment[i] != undefined) ? this.comment[i] : null,
            "public": (this.publicValue[i] != undefined) ? this.publicValue[i] : false,
            "phrases": phrases
          }
          ratings.push(data)
        } else {
            for (let j = 0; j < this.itemToRate().rating[i].info.length; j++) {
              let phrases = [];
              for (let y = 0; y < this.itemToRate().rating[i].ratingPhrases.length; y++) {
                let phrase = {
                  "phraseId": this.itemToRate().rating[i].ratingPhrases[y].phraseId,
                  "phraseScore": (this.phraseRatingMenuItem[j][y] != undefined) ? this.phraseRatingMenuItem[j][y] : 0
                }
                phrases.push(phrase)
              }

              data = {
                "type": "menuItem",
                "itemId": this.itemToRate().rating[i].info[j].itemId,
                "orderId": this.itemToRate().orderId,
                "ratingScore": (this.ratingValueMenuItem[j] != undefined) ? this.ratingValueMenuItem[j] : 0,
                "comment": (this.commentMenuItem[j] != undefined) ? this.commentMenuItem[j] : null,
                "public": (this.publicValueMenuItem[j] != undefined) ? this.publicValueMenuItem[j] : false,
                "phrases": phrases
              }
              ratings.push(data)
            }
        }

        
      }
      let rate = {
        "ratings": ratings
      }

      console.log(rate)

      // console.log("restaurant")
      // console.log(ratings)
      // console.log("item")
      // console.log(this.rating1I)

      this.submitRatingVals(rate)
      this.$router.push("/orders");

    },
    addPhraseItemScore(score, tab, id) {
      this.phraseRatingMenuItem[tab][id] = score;
      console.log(this.phraseRatingMenuItem[tab][id])
    },
    addPhraseScore(score, id) {
      this.phraseRating[id] = score;
    },
    hideAlert () {
      this.$router.push('/')
    },
    backNavigation () {
      this.$router.go(-1)
    },
    changeFeedback(i, isArray) {
      let updatedFeedback = "";
      let itemRating = [];

      if (isArray)
       itemRating = this.ratingValueMenuItem;
      else 
        itemRating = this.ratingValue;

      if (itemRating[i] <= 2)
        updatedFeedback = "Poor"
      else if (itemRating[i] == 3)
        updatedFeedback = "Average"
      else if (itemRating[i] == 4)
        updatedFeedback = "Good"
      else
        updatedFeedback = "Excellent"

        if (isArray)
          this.ratingFeedbackMenuItem[i] = updatedFeedback;
        else
          this.ratingFeedback[i] = updatedFeedback;

    },
    ...mapActions({
      submitRatingVals: "OrderStore/submitRating",
    }),
    ...mapGetters({
      orderHistory: 'OrderStore/getOrderHistory',
      itemToRate: 'OrderStore/getItemToRate',
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
    // this.rating[0].info.name = this.filteredList(16).restaurantName
    // this.rating[2].info.name = this.filteredList(16).orderEmployeeName + ' ' + this.filteredList(16).orderEmployeeSurname
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