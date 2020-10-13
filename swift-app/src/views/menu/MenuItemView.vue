<template>
  <v-card class="mx-auto" flat>
    <DesktopMenuItem v-if="!isMobile"></DesktopMenuItem>
    <v-container v-if="isMobile" class="pa-0">
      <div v-if="arActive" fill-height fill-width>
        <v-btn width="30px" height="30px" @click="exitAR" color="secondary" absolute small fab style="z-index:11; top: 20px; left: 15px">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <span class="title black--text" style=" position: absolute; z-index:11; top: 20px; left: 65px">{{newMenuItem.menuItemName}}</span>
        <iframe style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:10;" :src="(newMenuItem.arAsset != '') ? newMenuItem.arAsset : ''"  frameborder="0"></iframe>
      </div>
      <v-carousel v-if="!arActive && newMenuItem.images.length != 0" height="200px" :show-arrows="false" hide-delimiter-background continuous>
        <v-carousel-item v-for="(imageSrc,i) in newMenuItem.images" :key="i" :src="imageSrc"></v-carousel-item>
      </v-carousel>
      <v-carousel v-if="!arActive && newMenuItem.images.length == 0" height="200px" :show-arrows="false" hide-delimiter-background continuous>
        <v-carousel-item v-for="(imageSrc,i) in newMenuItem.images" :key="i" src="../../assets/menuItemImages/item-placeholder.png"></v-carousel-item>
      </v-carousel>
      <v-btn v-if="!arActive" width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 20px; left: 15px">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn v-if="!arActive && (newMenuItem.arAsset != '')" @click="openARScanner" color="secondary" absolute small fab style="top: 175px; right: 65px;">
        <v-icon>mdi-cube-scan</v-icon>
      </v-btn>
      <v-fab-transition v-if="!arActive">
        <v-btn @click="changeFavourite" :key="activateFavourite.icon" :color="activateFavourite.color" style="top: 175px;" absolute small fab  right >
          <v-icon>{{ activateFavourite.icon }}</v-icon>
        </v-btn>
      </v-fab-transition>

      <v-card-text v-if="!arActive" class="pb-0 pt-3">
        <v-row class="mx-0">
          <v-col cols="8" class="pl-0 pb-0">
            <span class="title black--text">{{newMenuItem.menuItemName}}</span>
          </v-col>
          <v-col cols="4" class="pl-0 pb-0 d-flex justify-end">
            <span class="title black--text">R{{(newMenuItem.price).toFixed(2)}}</span>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-if="!arActive" class="pt-0" >
        <v-row align="center" class="mx-0 my-4" >
          <v-col cols="8" class="px-0 py-0">
            <v-rating readonly size="18" dense color="yellow darken-3" background-color="secondary" :value="newMenuItem.rating"></v-rating>
          </v-col>
          <v-col cols="4" class="py-0 d-flex justify-end">
            <div color="secondary"><v-icon color="secondary">mdi-clock</v-icon> 15 min</div>
          </v-col>
        </v-row>
        <div class="justify">{{newMenuItem.menuItemDescription}}</div>
        <!-- <v-row>
          <v-col v-for="(dietaryLabel, i) in newMenuItem.dietaryLabels" :key="i" cols="4" class="py-0">
            <v-chip x-small class="mt-2 pb-0">
            {{dietaryLabel.name}}
          </v-chip>
          </v-col>
        </v-row> -->
        <div v-show="newMenuItem.dietaryLabels.length != 0" v-for="(dietaryLabel, i) in newMenuItem.dietaryLabels" :key="i" style="display: inline;">
          <v-chip small class="mt-2 pb-0 mr-1" >
            {{dietaryLabel.name}}
          </v-chip>
        </div>
      </v-card-text>

      
      <v-tabs v-if="!arActive" v-model="tab" background-color="white" grow>
        <v-tab v-if="checkedIn()">
          Details
        </v-tab>
        <v-tab>
          Reviews ({{ newMenuItem.reviews.length  }})
        </v-tab>
      </v-tabs>
      

      <v-tabs-items v-if="!arActive" v-model="tab">
        <v-tab-item v-if="checkedIn()" class="customiseTab">
          <v-card flat>
            <v-card-title v-if="newMenuItem.attributes != null" class="pb-0 pt-4">Customise Order</v-card-title>
            <v-container>
              <v-list  v-if="newMenuItem.attributes != null"> 
                <v-list-group sub-group  class="attributeElements" v-for="(attribute, i) in newMenuItem.attributes.attributes" :key="i"  no-action value="true">
                  <template v-slot:activator>
                    <v-list-item-content @click="rotateIcon(i)">
                      <v-list-item-title class="label pl-0 itemGroup" :value="attribute.id" v-text="attribute.attributeName"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action @click="rotateIcon(i)">
                      <v-icon class="chevron-icon mx-1">mdi-chevron-up</v-icon>
                    </v-list-item-action>
                  </template>

                  <!-- <v-list-item-group  class="pl-2" :multiple="(parseInt(attribute.max) > 1) ? true : false" :mandatory="(attribute.min == '1') ? true : false" v-model="model[i]"> -->
                  <v-list-item-group  class="pl-2" :multiple="(parseInt(attribute.max) > 1) ? true : false" :mandatory="(parseInt(attribute.min) != 0) ? true : false" :max="parseInt(attribute.max)"  v-model="model[i]">
                    <template v-for="(value, j) in attribute.values">
                      <v-list-item @click="checkInput(i, j, attribute)" ref="attributeVal" class="px-2 attributeValues" :key="`item-${j}`" :value="j">
                        <template v-slot:default="{ active }">
                          <v-row>
                            <v-col cols="8">
                              <v-list-item-title v-text="value.name"></v-list-item-title>
                            </v-col>
                            <v-col>
                              <v-list-item-title v-if="parseFloat(value.price) != 0" v-text="`+ R${(parseFloat(value.price)).toFixed(2)}`"></v-list-item-title>
                            </v-col>
                          </v-row>
                          <v-list-item-action class="customiseIcon">
                            <v-radio :id="`${i}${j}${(value.name).replace(/\s+/g, '')}`" checked v-if="attribute.max == '1' && attribute.min == '1'" :input-value="active" ></v-radio>
                            <v-checkbox v-else :input-value="active"></v-checkbox>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </template>
                  </v-list-item-group>

                </v-list-group>
              </v-list>

              

              <v-row class="d-flex justify-space-around px-2 mt-4">
                <v-col cols="4" class="d-flex justify-center px-0">
                  <div class="px-1 d-flex align-center quantityButton" height="45px">
                    <v-btn @click="detractPrice" icon class="mr-2"><v-icon size="22">mdi-minus</v-icon></v-btn>
                    {{quantity}}
                    <v-btn @click="addPrice" icon class="ml-2"><v-icon size="22">mdi-plus</v-icon></v-btn>
                  </div>

                  <!-- <v-btn @click="quantity--" fab elevation="2" width="22px" height="22px" class="mr-2">
                      <v-icon size="15px">mdi-minus</v-icon>
                  </v-btn>
                  <div class="body-2 secondary--text" style="display: inline;">{{quantity}}</div>
                  <v-btn @click="quantity++" fab elevation="2" width="22px" height="22px" class="ml-2">
                      <v-icon size="15px">mdi-plus</v-icon>
                  </v-btn> -->
                </v-col>
                <v-col cols="7" class="d-flex justify-center px-0">
                  <v-btn v-if="item == null" @click="addToOrder" style="border-radius: 13px; color: white" height="45px" color="accent">R {{total.toFixed(2)}} | Add to order</v-btn>
                  <v-btn v-else @click="editMenuItem" style="border-radius: 13px; color: white" height="45px" color="accent">R {{total.toFixed(2)}} | Edit Item</v-btn>
                </v-col>
              </v-row>

            </v-container>
            
          </v-card>
        </v-tab-item>
        <v-tab-item class="overflow-x-hidden">
          <v-card flat class="mt-2 mb-5">
            <v-row v-for="phrase in newMenuItem.ratingPhrases" :key="phrase.phrase">
              <v-card-text class="pb-0 pt-1 mt-0 ml-5">
                <v-row class="mx-0 pb-0 pt-1">
                  <v-col cols="8" class="pt-0 pl-0 pb-0">
                    <span class="black--text" style="font-size: 15px">{{phrase.phrase}}</span>
                  </v-col>
                  <v-col cols="4" class="py-0 pt-0 pl-0 pb-0">
                    <v-rating readonly size="18" dense color="yellow darken-3" background-color="secondary" :value="parseInt(phrase.rating)"></v-rating>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-row>
          </v-card>
          <v-divider style="opacity: 0.6"></v-divider>
          <v-card flat class="mt-2 mb-5">
            <v-row v-for="(comment, index) in newMenuItem.reviews" :key="index">
              <v-card-text class="pb-0 pt-1 mt-0">
                <!-- <v-row v-if="comment.public == true" class="mx-0 pb-0 pt-3"> only show public reviews --> 
                <v-row class="mx-0 pb-0 pt-3">
                  <v-col cols="3" class="mr-0 pb-0 pt-1">
                    <v-avatar color="grey" size="50px">
                      <v-img :src="comment.customerImage" cover ></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col cols="9" class="pl-1 pb-0 pt-1">
                    <v-row class="pt-0">
                      <v-col cols="6" class="pt-0 pl-0 pb-0">
                        <span class="black--text" style="font-size: 15px">{{comment.customerName}} {{comment.customerSurname}}</span>
                      </v-col>
                      <v-col cols="6" class="pt-0 pl-0 pb-0" style="text-align: right">
                        <span style="font-size: 12px; text-align: right">{{getDate(comment.reviewDateTime)}}</span>
                      </v-col>
                    </v-row>
                    <v-row class="pt-0">
                      <v-col cols="8" class="py-0 pt-0 pl-0 pb-0">
                        <v-rating readonly size="18" dense color="yellow darken-3" background-color="secondary" :value="parseInt(comment.ratingScore)"></v-rating>
                      </v-col>
                      <!-- <v-col cols="4" class="py-0 pt-0 pl-0 pb-0" style="text-align: right">
                          <v-btn @click="changeFavouriteComment(comment)" :color="activateFavouriteComment(comment).color" class="pl-0 pr-1" text small min-width="0">
                            <v-icon>{{ activateFavouriteComment(comment).icon }}</v-icon>
                          </v-btn>
                          <div v-if="comment.totalLikes != 0" style="display: inline">
                            {{comment.totalLikes}}
                          </div>
                      </v-col> -->
                    </v-row>
                    <v-row class="pt-0 pr-2 mt-3">
                      <v-col cols="12" class="py-0 pt-0 pl-0 pb-0 mr-0">
                        <div class="justify commentInfo" style="font-size: 12px" :id="'comment' + index">{{limitComment(comment, index).commentText}}</div>
                      </v-col>
                      <v-col style="text-align: center" class="pb-0 pt-1" v-if="getCommentLength(comment)">
                        <v-btn @click="revealComment(index)" color="secondary" class="pl-0 pr-1" text small min-width="0">
                          <v-icon size="35">{{limitComment(comment, index).icon}}</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row class="mt-2" v-if="comment.response != null">
                      <v-col cols="3" class="mr-0 ml-0 pl-0 pb-0 pt-1">
                        <v-avatar v-if="comment.adminImage != null" color="grey" size="50px">
                          <v-img :src="comment.adminImage" cover ></v-img>
                        </v-avatar>
                        <v-avatar v-else color="grey" size="50px">
                          <v-img :src="menu.image" cover ></v-img>
                        </v-avatar>
                      </v-col>
                      <v-col cols="9" class="pl-1 pb-0 pt-1">
                        <v-row class="pt-0">
                          <v-col cols="12" class="pt-0 pl-0 pb-0">
                            <span v-if="comment.adminName != null" class="black--text" style="font-size: 15px">{{comment.adminName}} {{comment.adminSurname}}</span>
                            <span v-else class="black--text" style="font-size: 15px">{{menu.name}}</span>
                          </v-col>
                          <v-col cols="12" class="pt-0 pl-0 pb-0">
                            <span style="font-size: 12px;">{{getDate(comment.responseDate)}}</span>
                          </v-col>
                        </v-row>
                        <v-row class="pt-0 pr-2 mt-3">
                          <v-col cols="12" class="py-0 pt-0 pl-0 pb-0 mr-0">
                            <div class="justify" style="font-size: 12px">{{comment.response}}</div>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-row>

          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </v-card>
</template>

<style >
  .v-list-group__header {
    padding-left: 4px;
    padding-right: 5px;
  }

  .icons .v-input--selection-controls {
    padding-top: 0px;
    margin-top: 0px;
  }

  .quantityButton {
    border-radius: 13px; 
    background-color: white; box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  }

  .radioCustomise .v-messages {
    display: none;
  }

  .v-application--is-ltr .v-list-group--sub-group .v-list-group__header {
    padding-left: 5px !important;
  }

  .attributeElements .v-list-item__icon.v-list-group__header__prepend-icon {
    display: none !important;
  }

  .rotate {
    transform: rotateX(180deg);
  }

</style>

<script>
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from "vuex";
import $ from 'jquery';
import moment from 'moment'
import DesktopMenuItem from "../../components/menu/DesktopMenuItem"

$('.commentInfo').text($('.commentInfo').text().substring(0,200))

export default {
  components: {
    'DesktopMenuItem': DesktopMenuItem,
  },
  data() {
    return {
      model: [[],[]],
      total: 0,
      addOns: 0,
      valid: true,
      quantity: 1,
      radioGroup: 1,
      isMobile: false,
      // itemTotal: 0,
      activeComments: [],
      menuItemId: this.$route.params.itemid,
      expandOrderBtn: true,
      tab: null,
      favourited: false,
      muesliSelected: true,
      honeySelected: false,
      arActive: false,
      selected: ['John'],
      text: 'small',
      selection: 0,
      prevVal: 0,
      prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
      comments: [
        {
          name: 'Peter',
          surname: 'Jackson',
          profileImage: 'https://source.unsplash.com/800x800/?man',
          commentDate: '11:00 June 24, 2020',
          rating: '4',
          comment: 'The perfect breakfast to start your day. There are never leftovers when I order this! This is one of my favorite dishes, as I think the grilled tomato and hashbrown really tie everything together. This breakfast is a must if you visit Mugg and Bean. All my friends love it as well. Enjoy.',
          liked: false,
          likes: '11',
          adminName: 'Mugg and Bean',
          adminProfileImage: 'https://source.unsplash.com/800x800/?restaurant',
          response: 'Thank you for your pricedback! We appreciate your help.',
          responseDate: '09:30 June 25, 2020'
        },
        {
          name: 'Sandra',
          surname: 'Menice',
          profileImage: 'https://source.unsplash.com/800x800/?woman',
          commentDate: '15:00 June 22, 2020',
          rating: '2',
          comment: "My eggs were overdone when I requested them to be soft and the portion was very small for the price.",
          liked: true,
          likes: '10',
          adminName: '',
          response: '',
          responseDate: ''
        },
        {
          name: 'James',
          surname: 'Franklin',
          profileImage: 'https://source.unsplash.com/800x800/?profile',
          commentDate: '10:30 June 20, 2020',
          rating: '5',
          comment: "I love this breakfast item. It is always prepared well and it is very filling!",
          liked: false,
          likes: '0',
          adminName: '',
          response: '',
          responseDate: ''
        }
      ],
      ratingPhrases: [
        {
          phrase: 'Delicious',
          rating: '4'
        },
        {
          phrase: 'Value',
          rating: '4'
        },
        {
          phrase: 'Presentation',
          rating: '5'
        },
        {
          phrase: 'Service',
          rating: '4'
        }
      ]
    }
  },
  methods: {
    backNavigation () {
      this.clearItem
      this.$router.go(-1)
    },
    detractPrice() {
      if (this.quantity > 1) 
        this.quantity--;
      this.changeTotal;
    },
    addPrice() {
      this.quantity++;
      this.changeTotal;
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    getDate(date) {
      return moment(String(date.slice(0, 10))).format('DD MMM YYYY')
    },
    findSelected(i,j) {
      let selected = this.model[i] === j;
      if (selected) {
        // console.log('hey')
        console.log($('.customiseTab'))
        // $('.mdi-radiobox-blank').eq().addClass('mdi-radiobox-blank');
      }
    },
    changeFavouriteComment: function (comment) {
      this.liked = !this.liked
      if (this.liked)
        comment.totalLikes = (Number(comment.totalLikes) + 1).toString()
      else 
        if (comment.totalLikes != null)
          comment.totalLikes = (Number(comment.totalLikes) - 1).toString()
    },
    activateFavouriteComment: function (comment) {
      if (!comment.liked) {
        return { color: 'secondary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
    checkInput(i, j, attribute) {
      // console.log($(".attributeElements").eq(i).find(".v-radio i").html());
      let values = attribute.values;
      $(".attributeElements").eq(i).find(".v-radio i").removeClass("mdi-radiobox-marked");
      $("#" + i + j + (values[j].name).replace(/\s+/g, '')).parent().children("i").addClass("mdi-radiobox-marked");
      let radio = attribute.max == '1' && attribute.min == '1';
      let checked = $(".attributeElements").eq(i).find(".attributeValues").eq(j).hasClass("v-item--active v-list-item--active");
      
      if (radio) {
        this.addOns -= this.prevVal
        this.addOns += values[j].price
        this.prevVal = values[j].price
      } else {
        if (checked) {
          this.addOns -= values[j].price
        } else {
          this.addOns += values[j].price
        }
      }
      this.changeTotal;
    },
    optionIcon: function (type) {
      if (type == "checkbox") {
        return { selected: 'mdi-check-box-outline', unselected: 'mdi-checkbox-blank-outline' }
      } else if (type == "radio") {
        return { selected: 'mdi-radiobox-marked', unselected: 'mdi-radiobox-blank' }
      }
    },
    getCommentLength: function (comment) {
      if (comment.comment.length > 150)
        return true
      else 
        return false
    },
    // calculatePrice (price) {
    //   return (price * this.quantity).toFixed(2)
    // },
    limitComment: function (userInput, index) {
      if (userInput.comment.length > 150 && !this.activeComments.includes(index)) {
        var truncated = userInput.comment.substr(0,150) + '...';
        return { commentText: truncated, icon: 'mdi-chevron-down' }
      } else {
        return { commentText: userInput.comment, icon: 'mdi-chevron-up' }
      }
    },
    changeOrderBtn () {
      this.expandOrderBtn = !this.expandOrderBtn
    },
    revealComment: function (index) {
      this.activeComments.includes(index) ? this.activeComments.splice(this.activeComments.indexOf(index), 1) : this.activeComments.push(index);
    },
    openARScanner() {
      /* return this.$ionic.alertController
        .create({
          header: 'Augmented Reality',
          subHeader: 'Coming Soon',
          message: 'This feature will be added in a future build.',
          buttons: ['OK']
        })
        .then(a => a.present())   */
      this.arActive = true;
    },
    exitAR() {
      this.arActive = false;
    },
    addToOrder() {;
      let selectionValues = [];
      if(this.newMenuItem.attributes != null) {
        for (let i = 0; i < this.newMenuItem.attributes.attributes.length; i++) {
          if (this.model[i].length != 0) {
            let values = [];
            for (let j = 0; j < this.model[i].length; j++)
              values.push(this.newMenuItem.attributes.attributes[i].values[this.model[i][j]].name)
            // console.log($('.label').eq(i).attr('value'))
            let data = {
              "name": $('.label').eq(i).text(),
              "id": $('.label').eq(i).attr('value'),
              "values": (this.model[i].length > 1) ? values 
                : this.newMenuItem.attributes.attributes[i].values[this.model[i]].name
            };
            selectionValues[i] = data;
          }

          
        }
      }

      let data = {
        "orderInfo": {
          "restaurantId": this.checkedInRestaurantId,
          "tableId": this.checkedInTableId,
          "employeeId": 6,
          "waiterTip": 0,
          "orderItems": [
            {
              "menuItemId": this.newMenuItem.menuItemId,
              "itemTotal": this.total / this.quantity,
              "quantity": this.quantity,
              "orderSelections": {
                "selections": selectionValues
              }
            }
          ]
        }
      }
      
      this.addItemToOrder(data)
      this.$router.push("/cart");
    },
    editMenuItem() {;
      let selectionValues = [];
      if(this.newMenuItem.attributes != null) {
        for (let i = 0; i < this.newMenuItem.attributes.attributes.length; i++) {
          if (this.model[i].length != 0) {
            let values = [];
            for (let j = 0; j < this.model[i].length; j++)
              values.push(this.newMenuItem.attributes.attributes[i].values[this.model[i][j]].name)
            let data = {
              "name": $('.label').eq(i).text(),
              "id": $('.label').eq(i).attr('value'),
              "values": (this.model[i].length > 1) ? values 
                : this.newMenuItem.attributes.attributes[i].values[this.model[i]].name
            };
            selectionValues[i] = data;
          }

          
        }
      }

      let data = {
        "menuItemId": this.newMenuItem.menuItemId,
        "itemTotal": this.total / this.quantity,
        "quantity": this.quantity,
        "orderSelections": {
          "selections": selectionValues
        }
      }
      
      this.editOrder(data);
      this.$router.push("/cart");
    },
    changeFavourite () {
      let data = {
        menuItemId: this.menuItemId
      }
      this.isFavourite ? this.removeFavourite(data) : this.addFavourite(data)
    },
    ...mapActions({
      addFavourite: "CustomerStore/addFavourite",
      removeFavourite: "CustomerStore/removeFavourite",
      addItemToOrder: "OrderStore/addItemToOrder",
      editOrder: "OrderStore/editOrder",
      clearItem: "MenuItemsStore/clearItem",
    }),
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      var checkedInRestaurant = this.filterRestaurants

      if (checkedInVal != null && checkedInRestaurant) {
        return true;
      } else {
        return false;
      }
    },
    rotateIcon(index) {
      $('.chevron-icon').eq(index).toggleClass('rotate')
    }
  },
  computed: {
    menuItem() {
      return store.state.MenuItemsStore.menuItems.find(
        menuItem => menuItem.id === this.menuItemId
      )      
    },
    changeTotal() {
      this.total = this.newMenuItem.price * this.quantity + this.addOns * this.quantity;
    },
    findCategory() {
      return this.menu.categories.find(
        category => category.menuItems.find(menuItem => menuItem.menuItemId === parseInt(this.menuItemId) )
      )
    },
    isFavourite() {
      if (this.customer.favourites.length != 0)
        return this.customer.favourites.some(favourite => favourite.menuItemId === parseInt(this.menuItemId))
      return false
    },
    newMenuItem() {
      return this.findCategory.menuItems.find(menuItem => menuItem.menuItemId === parseInt(this.menuItemId) )
    },
    activateFavourite () {
      if (!this.isFavourite) {
        return { color: 'primary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
    filterRestaurants() {
      var list = this.allRestaurants.filter(restaurant => {
        return (restaurant.name == this.menu.name) && (restaurant.restaurantId === this.checkedInRestaurantId);
      })

      if (list.length > 0) {
        return true
      } else { 
        return false
      }
    },
    ...mapGetters({
      menu: "MenuStore/getMenu",
      customer: "CustomerStore/getCustomerProfile",
      item: "MenuItemsStore/getMenuItem",
      // itemToEdit: "OrderStore/getItemToEdit",
      checkedInTableId: "CustomerStore/getCheckedInTableId",
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
      allRestaurants: 'RestaurantsStore/getAllRestaurants',
    }),
  },
  mounted: function() {
    // this.$nextTick(function () {
    //   // console.log('hey')
    //   // console.log($('.radioButtonItem:first').html())
    // })
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })

    this.total = this.newMenuItem.price
    if (this.item != null) {
      this.quantity = this.item.quantity
      this.total = this.total * this.quantity
      // console.log(this.item)
    }

    for (let i = 0; i < this.newMenuItem.attributes.attributes.length; i++) {
      // console.log(this.newMenuItem.attributes.attributes[i].max)
      if (this.newMenuItem.attributes.attributes[i].max == 1) {
        var item = 0;
        this.newMenuItem.attributes.attributes[i].values.find((val, index) => {
          item = index
          if (this.item == null || this.item.orderSelections.selections[i] == undefined)
            return val.selectedByDefault 
          else {
            return val.name == this.item.orderSelections.selections[i].values
          } 
        });

        this.model[i] = item;
      }
      else {
        var item = [];
        if (this.item == null || this.item.orderSelections.selections[i] == undefined) {
          this.newMenuItem.attributes.attributes[i].values.filter((val, index) => {
            if (val.selectedByDefault)
              item.push(index);
            return val.selectedByDefault 
          });
        } else {
          this.newMenuItem.attributes.attributes[i].values.filter((val, index) => {
            // console.log(this.item.orderSelections.selections[i].values)
            if (Array.isArray(this.item.orderSelections.selections[i].values)) {
              if (val.name == this.item.orderSelections.selections[i].values[index])
                item.push(index);
              return val.name == this.item.orderSelections.selections[i].values[index]
            } else {
              if (val.name == this.item.orderSelections.selections[i].values)
                item.push(index);
              return val.name == this.item.orderSelections.selections[i].values
            }
          });
        }

        this.model[i] = item;
      }
    }
    
  }
}
</script>