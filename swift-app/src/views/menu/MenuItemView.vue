<template>
  <v-card class="mx-auto" flat>
    <div v-if="arActive" fill-height fill-width>
      <v-btn width="30px" height="30px" @click="exitAR" color="secondary" absolute small fab style="z-index:11; top: 20px; left: 15px">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <span class="title black--text" style=" position: absolute; z-index:11; top: 20px; left: 65px">{{newMenuItem.menuItemName}}</span>
      <iframe style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:10;" :src="(newMenuItem.arAsset != null) ? newMenuItem.arAsset : ''"  frameborder="0"></iframe>
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
    <v-btn v-if="!arActive && newMenuItem.arAsset != null" @click="openARScanner" color="secondary" absolute small fab style="top: 175px; right: 65px;">
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
    </v-card-text>

    
    <v-tabs v-if="!arActive" v-model="tab" background-color="white" grow>
      <v-tab v-if="newMenuItem.attributes != null && checkedIn()">
        Details
      </v-tab>
      <v-tab>
        Reviews ({{ comments.length }})
      </v-tab>
    </v-tabs>
    

    <v-tabs-items v-if="!arActive" v-model="tab">
      <v-tab-item v-if="newMenuItem.attributes != null && checkedIn()">
        <v-card flat>
          <v-card-title class="pb-0 pt-4">Customise Order</v-card-title>
          <v-container class="pl-0">
            <v-list shaped>
              <v-list-group class="attributeElements" v-for="(attribute, i) in newMenuItem.attributes.attributes" :key="i" no-action value="true">
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title class="label pl-3" v-text="attribute.attributeName"></v-list-item-title>
                  </v-list-item-content>
                </template>
                <v-list-item-group class="pl-4" :multiple="(parseInt(attribute.max) > 1) ? true : false" :mandatory="(attribute.min == '1') ? true : false" v-model="model[i]">
                  <template v-for="(value, j) in attribute.values">
                      <v-list-item @click="checkInput(i, j, value)" class="px-2 attributeValues" :key="`item-${j}`" :value="value.name">
                        <template v-slot:default="{ active }">
                          <v-row>
                            <v-col cols="8">
                              <v-list-item-title v-text="value.name"></v-list-item-title>
                            </v-col>
                            <v-col>
                              <v-list-item-title v-if="'fee' in value" v-text="`+ R${(value.fee).toFixed(2)}`"></v-list-item-title>
                            </v-col>
                          </v-row>
                          <v-list-item-action>
                            <v-radio :id="`${i}${j}${(value.name).replace(/\s+/g, '')}`" checked v-if="attribute.max == '1' && attribute.min == '1'" :input-value="active" ></v-radio>
                            <v-checkbox v-else :input-value="active"></v-checkbox>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </template>
                </v-list-item-group>
              </v-list-group>
            </v-list>

            

            <v-row v-if="expandOrderBtn" class="d-flex justify-space-around px-2 mt-4">
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
                <v-btn @click="addToOrder" style="border-radius: 13px; color: white" height="45px" color="accent">R {{total.toFixed(2)}} | Add to order</v-btn>
              </v-col>
            </v-row>

          </v-container>
          
        </v-card>
      </v-tab-item>
      <v-tab-item class="overflow-x-hidden">
        <v-card flat class="mt-2 mb-5">
          <v-row v-for="phrase in ratingPhrases" :key="phrase.phrase">
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
          <v-row v-for="(comment, index) in comments" :key="comment.commentDate">
            <v-card-text class="pb-0 pt-1 mt-0">
              <v-row class="mx-0 pb-0 pt-3">
                <v-col cols="3" class="mr-0 pb-0 pt-1">
                  <v-avatar color="grey" size="50px">
                    <img :src=comment.profileImage alt="">
                  </v-avatar>
                </v-col>
                <v-col cols="9" class="pl-1 pb-0 pt-1">
                  <v-row class="pt-0">
                    <v-col cols="6" class="pt-0 pl-0 pb-0">
                      <span class="black--text" style="font-size: 15px">{{comment.name}} {{comment.surname}}</span>
                    </v-col>
                    <v-col cols="6" class="pt-0 pl-0 pb-0" style="text-align: right">
                      <span style="font-size: 12px; text-align: right">{{comment.commentDate}}</span>
                    </v-col>
                  </v-row>
                  <v-row class="pt-0">
                    <v-col cols="8" class="py-0 pt-0 pl-0 pb-0">
                      <v-rating readonly size="18" dense color="yellow darken-3" background-color="secondary" :value="parseInt(comment.rating)"></v-rating>
                    </v-col>
                    <v-col cols="4" class="py-0 pt-0 pl-0 pb-0" style="text-align: right">
                        <v-btn @click="changeFavouriteComment(comment)" :color="activateFavouriteComment(comment).color" class="pl-0 pr-1" text small min-width="0">
                          <v-icon>{{ activateFavouriteComment(comment).icon }}</v-icon>
                        </v-btn>
                        <div v-if="comment.likes != '0'" style="display: inline">
                          {{comment.likes}}
                        </div>
                    </v-col>
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
                  <v-row class="mt-2" v-if="comment.adminName != ''">
                    <v-col cols="3" class="mr-0 ml-0 pl-0 pb-0 pt-1">
                      <v-avatar color="grey" size="50px">
                        <img :src=comment.adminProfileImage alt="">
                      </v-avatar>
                    </v-col>
                    <v-col cols="9" class="pl-1 pb-0 pt-1">
                      <v-row class="pt-0">
                        <v-col cols="12" class="pt-0 pl-0 pb-0">
                          <span class="black--text" style="font-size: 15px">{{comment.adminName}}</span>
                        </v-col>
                        <v-col cols="12" class="pt-0 pl-0 pb-0">
                          <span style="font-size: 12px;">{{comment.responseDate}}</span>
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

  /* .attributeElements > .v-list-item--active.v-list-item--link {
    background-color: rgba(247, 85, 100, 0.1) !important;
  } */

</style>

<script>
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from "vuex";
import $ from 'jquery';

$('.commentInfo').text($('.commentInfo').text().substring(0,200))

export default {
  data() {
    return {
      model: [],
      total: 0,
      addOns: 0,
      valid: true,
      quantity: 1,
      radioGroup: 1,
      // itemTotal: 0,
      activeComments: [],
      menuItemId: this.$route.params.itemid,
      expandOrderBtn: true,
      items: [
        { img: 'https://source.unsplash.com/kZeUekYF9Jw/800x800/' },
        { img: 'https://source.unsplash.com/hrlvr2ZlUNk/800x800/' },
        { img: 'https://source.unsplash.com/8manzosDSGM/800x800/' },
        { img: 'https://source.unsplash.com/nTZOILVZuOg/800x800/' },
      ],
      tab: null,
      favourited: false,
      muesliSelected: true,
      honeySelected: false,
      arActive: false,
      // menuItemSelections: [
      //   {
      //     title: 'Choose fruit:',
      //     active: false,
      //     items: [
      //       { title: '- Strawberry', icon: 'mdi-check-box-outline', toggleIcon: '', extra: '', selected: true },
      //       { title: '- Mango', icon: 'mdi-check-box-outline', extra: '+ R2.00', selected: true },
      //       { title: '- Berry', icon: 'mdi-checkbox-blank-outline', extra: '', selected: false },
      //     ],
      //   },
      //   {
      //     title: 'Choose Yogurt type:',
      //     active: false,
      //     items: [
      //       { title: '- Greek', icon: 'mdi-radiobox-marked', extra: '', selected: true },
      //       { title: '- Low Fat', icon: 'mdi-radiobox-blank', extra: '', selected: false },
      //       { title: '- Strawberry', icon: 'mdi-radiobox-blank', extra: '+ R4.50', selected: false },
      //     ],
      //   },
      // ],
      selected: ['John'],
      text: 'small',
      selection: 0,
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
          response: 'Thank you for your feedback! We appreciate your help.',
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
    
    changeFavouriteComment: function (comment) {
      comment.liked = !comment.liked
      if (comment.liked)
        comment.likes = (Number(comment.likes) + 1).toString()
      else 
        if (comment.likes != '0')
          comment.likes = (Number(comment.likes) - 1).toString()
    },
    activateFavouriteComment: function (comment) {
      if (!comment.liked) {
        return { color: 'secondary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
    checkInput(i, j, value) {
      // console.log($(".attributeElements").eq(i).find(".v-radio i").html());
      $(".attributeElements").eq(i).find(".v-radio i").removeClass("mdi-radiobox-marked");
      $("#" + i + j + (value.name).replace(/\s+/g, '')).parent().children("i").addClass("mdi-radiobox-marked");

      let checked = $(".attributeElements").eq(i).find(".attributeValues").eq(j).hasClass("v-item--active v-list-item--active");

      if ('fee' in value && checked) {
        this.addOns -= value.fee
      } else if ('fee' in value && !checked) {
        this.addOns += value.fee
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
      for (let i = 0; i < this.newMenuItem.attributes.attributes.length; i++) {
        let data = {
          "name": $('.label').eq(i).text(),
          "values": this.model[i]
        };
        selectionValues[i] = data;
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
              "itemTotal": this.total,
              "quantity": this.quantity,
              "orderSelections": {
                "selections": selectionValues
              }
            }
          ]
        }
      }

      console.log(data);
      
      this.addItemToOrder(data)
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
      addItemToOrder: "OrderStore/addItemToOrder"
    }),
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        return true;
      } else {
        return false;
      }
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
      // console.log(this.customer.favourites)
      if (this.customer.favourites.length != 0)
        return this.customer.favourites.some(favourite => favourite.menuItemId === parseInt(this.menuItemId))
      return false
    },
    // removeActive() {
    //   $(".attributeValues").removeClass("v-item--active v-list-item--active");
    // },
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
    ...mapGetters({
      menu: "MenuStore/getMenu",
      customer: "CustomerStore/getCustomerProfile",
      itemToEdit: "OrderStore/getItemToEdit",
      checkedInTableId: "CustomerStore/getCheckedInTableId",
      
      // checkedInStatus: 'CustomerStore/getCheckedInStatus',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
  },
  mounted: function() {
    // console.log($(".attributeElements").find(".attributeValues").html())
    // $(".attributeElements").find(".attributeValues").removeClass("v-item--active v-list-item--active");
    this.total = this.newMenuItem.price
    // this.itemTotal = this.newMenuItem.price
  }
}
</script>