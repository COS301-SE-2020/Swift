<template>
  <v-card class="mx-auto" flat>
    <v-carousel height="200px" :show-arrows="false" hide-delimiter-background continuous>
      <v-carousel-item v-for="(item,i) in items" :key="i" :src="item.img"></v-carousel-item>
    </v-carousel>
    <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 10px; left: 10px;">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn @click="openARScanner" color="secondary" absolute small fab style="top: 175px; right: 65px;">
      <v-icon>mdi-cube-scan</v-icon>
    </v-btn>
    <v-fab-transition>
      <v-btn @click="changeFavourite" :key="activateFavourite.icon" :color="activateFavourite.color" style="top: 175px;" absolute small fab  right >
        <v-icon>{{ activateFavourite.icon }}</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-card-text class="pb-0 pt-3">
      <v-row class="mx-0">
        <v-col cols="9" class="pl-0 pb-0">
          <span class="title black--text">{{newMenuItem.menuItemName}}</span>
        </v-col>
        <v-col cols="3" class="pl-0 pb-0">
          <span class="title black--text">R{{newMenuItem.price}}0</span>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text class="pt-0" >
      <v-row align="center" class="mx-0" >
        <v-col cols="8" class="px-0 py-0">
          <v-rating readonly size="18" dense color="yellow darken-3" background-color="secondary" :value="newMenuItem.rating"></v-rating>
        </v-col>
        <v-col cols="4" class="py-0">
          <div color="secondary" class="ml-2 my-4"><v-icon color="secondary">mdi-clock</v-icon> {{newMenuItem.estimatedWaitingTime}}</div>
        </v-col>
      </v-row>
      <div class="justify">{{newMenuItem.menuItemDescription}}</div>
    </v-card-text>

    
    <v-tabs v-model="tab" background-color="white" grow>
      <v-tab v-if="newMenuItem.attributes != null">
        Details
      </v-tab>
      <v-tab>
        Reviews ({{ comments.length }})
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item v-if="newMenuItem.attributes != null">
        <v-card flat>
          <v-card-title class="pb-0 pt-4">Customise Order</v-card-title>
          <v-container>
            <div>
              <v-list class="py-0">
                <v-list-group  v-for="(attribute, i) in newMenuItem.attributes.attributes" :key="i" no-action>
                  <template expand v-slot:activator>
                    <v-list-item-content>
                      <v-list-item-title  v-text="attribute.name"></v-list-item-title>
                    </v-list-item-content>
                  </template>

                  <v-list-item @click="value.selected = !value.selected" ripple v-for="(value, j) in attribute.values" :key="j" height="20px" class="pl-5 py-0 my-0">
                    <v-list-item-content>
                      <v-list-item-title v-text="value.name"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon class="my-1 ml-5 mr-0 pr-2">
                      <span v-if="Object.keys(value).includes('fee')" class="d-flex align-center">+ R{{value.fee}}0</span>
                      <v-btn @click="Object.keys(value).includes('fee') ? (value.selected ? itemTotal = itemTotal -= parseInt(value.fee) : itemTotal = itemTotal += parseInt(value.fee)) : itemTotal" icon>
                        <v-icon class="ml-2" color="secondary" v-text="value.selected ? optionIcon(attribute.field.type).selected : optionIcon(attribute.field.type).unselected"></v-icon>
                      </v-btn>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list-group>
              </v-list>
            </div>
            <!-- <v-row> -->
              <!-- <v-col cols="12" class="d-flex align-center justify-center"> -->
                <!-- <v-slide-x-transition> -->
                  <v-row v-if="expandOrderBtn" class="d-flex justify-space-between">
                    <!-- <v-btn @click="changeOrderBtn" rounded class="py-6 mt-5" color="grey">Remove</v-btn> -->
                    <v-col cols="4" class="mt-2 px-0 d-flex justify-center">
                      <v-btn @click="quantity--" fab elevation="2" width="22px" height="22px" class="mr-2">
                          <v-icon size="15px">mdi-minus</v-icon>
                      </v-btn>
                      <div class="body-2 secondary--text" style="display: inline;">{{quantity}}</div>
                      <v-btn @click="quantity++" fab elevation="2" width="22px" height="22px" class="ml-2">
                          <v-icon size="15px">mdi-plus</v-icon>
                      </v-btn>
                    </v-col>
                    <v-col cols="8" class="d-flex justify-center px-0">
                      <v-btn @click="addToOrder" rounded class="" color="accent">R {{calculatePrice(itemTotal)}} | Add to order</v-btn>
                    </v-col>
                  </v-row>
                <!-- </v-slide-x-transition> -->
              <!-- </v-col> -->
            <!-- </v-row> -->
          </v-container>
          
          <!-- <v-container>
            <v-card-text class="py-0 pr-0">
              <v-row>
                <v-col class="pl-0" cols="3">
                  <span class="subtitle-1" >Size:</span>
                </v-col>
                <v-col cols="9" class="py-0 d-flex  justify-end">
                  <v-chip-group v-model="selection" active-class="primary" mandatory>
                    <v-chip>Small</v-chip>
                    <v-chip>Medium</v-chip>
                    <v-chip>Large</v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text @click="muesliSelected = !muesliSelected" v-ripple class="py-0 pr-0">
              <v-row>
                <v-col class="pl-0 pb-2" cols="3">
                  <span class="subtitle-1" >Muesli:</span>
                </v-col>
                <v-col cols="9" class="pb-0 pt-1 d-flex justify-end">
                  <v-btn icon>
                    <v-icon color="secondary" v-text="muesliSelected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text  @click="honeySelected = !honeySelected"  v-ripple class="py-0 pr-0">
              <v-row>
                <v-col class="pl-0 pb-2" cols="3">
                  <span class="subtitle-1" >Honey:</span>
                </v-col>
                <v-col cols="9" class="pb-0 pt-1 d-flex justify-end">
                  <v-btn icon>
                    <v-icon color="secondary" v-text="honeySelected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider></v-divider>

            <v-list class="py-0">
              <v-list-group  v-for="item in menuItemSelections" :key="item.title" v-model="item.active"  no-action>
                <template expand v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title  v-text="item.title"></v-list-item-title>
                  </v-list-item-content>
                </template>

                <v-list-item @click="subItem.selected = !subItem.selected" ripple v-for="subItem in item.items" :key="subItem.title" height="20px" class="pl-5 py-0 my-0">
                  <v-list-item-content>
                    <v-list-item-title v-text="subItem.title"></v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-icon class="my-1 ml-5 mr-0 pr-2">
                    <span class="d-flex align-center">{{subItem.extra}}</span>
                    <v-btn icon>
                      <v-icon class="ml-2" color="secondary" v-text="subItem.selected ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline'"></v-icon>
                    </v-btn>
                  </v-list-item-icon>
                </v-list-item>
              </v-list-group>
              
            </v-list>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-center">
                <v-slide-x-transition>
                  <div v-if="expandOrderBtn" id="orderButton">
                    <v-btn @click="changeOrderBtn" rounded class="py-6 mt-5" color="primary" width="150px">Add To Order</v-btn>
                  </div>
                  <div v-if="!expandOrderBtn">
                    <v-btn @click="changeOrderBtn" rounded class="py-6 mt-5" color="grey">Remove</v-btn>
                    <v-btn @click="addToOrder" rounded class="py-6 mt-5 ml-5" color="accent">R85 | Place Order</v-btn>
                  </div>
                </v-slide-x-transition>
              </v-col>
            </v-row>
          </v-container> -->
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

 
  /* .comment {
    white-space: nowrap;
    width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
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
      quantity: 1,
      itemTotal: 0,
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
      menuItemSelections: [
        {
          title: 'Choose fruit:',
          active: false,
          items: [
            { title: '- Strawberry', icon: 'mdi-check-box-outline', toggleIcon: '', extra: '', selected: true },
            { title: '- Mango', icon: 'mdi-check-box-outline', extra: '+ R2.00', selected: true },
            { title: '- Berry', icon: 'mdi-checkbox-blank-outline', extra: '', selected: false },
          ],
        },
        {
          title: 'Choose Yogurt type:',
          active: false,
          items: [
            { title: '- Greek', icon: 'mdi-radiobox-marked', extra: '', selected: true },
            { title: '- Low Fat', icon: 'mdi-radiobox-blank', extra: '', selected: false },
            { title: '- Strawberry', icon: 'mdi-radiobox-blank', extra: '+ R4.50', selected: false },
          ],
        },
      ],
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
      this.$router.back()
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
    calculatePrice (price) {
      return (price * this.quantity).toFixed(2)
    },
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
      return this.$ionic.alertController
        .create({
          header: 'Augmented Reality',
          subHeader: 'Coming Soon',
          message: 'This feature will be added in a future build.',
          buttons: ['OK']
        })
        .then(a => a.present())  
    },
    addToOrder() {
      let data = {
        "orderInfo": {
          "restaurantId": 1,
          "tableId": 1,
          "employeeId": 7,
          "orderItems": [
            {
              "menuItemId": this.newMenuItem.menuItemId,
              "quantity": this.quantity,
              "orderSelections": {
                "selections": [
                  {
                    "name": "Preparation of Eggs",
                    "values": ["poached"]
                  },
                  {
                    "name": "Eggs Done",
                    "values": ["Hard"]
                  },
                  {
                    "name": "Toast",
                    "values": ["White Toast"]
                  },
                  {
                    "name": "Add-on",
                    "values": ["Chicken Strips"]
                  }
                ]
              }
            }
          ]
        },
        "menuItemName": this.newMenuItem.menuItemName,
        "total": this.itemTotal * this.quantity,
      }
      
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
  },
  computed: {
    menuItem() {
      return store.state.MenuItemsStore.menuItems.find(
        menuItem => menuItem.id === this.menuItemId
      )      
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
      checkedIn: "RestaurantsStore/getCheckInFlag",
      menu: "MenuStore/getMenu",
      customer: "CustomerStore/getCustomerProfile"
    }),
  },
  mounted: function() {
    this.itemTotal = this.newMenuItem.price
  }
}
</script>