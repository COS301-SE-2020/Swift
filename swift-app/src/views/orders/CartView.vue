<template>
<v-container class="pa-0 ma-0" fill-height>
  <DesktopCart v-if="!isMobile"></DesktopCart>
  <v-container v-else fill-height class="pa-0 cartOrders overflow-x-hidden" fluid>
      <v-toolbar elevation='2' class="cartHeader">
        <v-container>
          <v-row>
            <v-col cols='1' class="pl-0">
              <v-btn icon @click="goBack">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
            <v-col cols='11' class="pl-0 d-flex justify-center align-self-center">
              <v-toolbar-title >Your Order</v-toolbar-title>
            </v-col>
          </v-row>
        </v-container>
      </v-toolbar>
      <v-container v-if="Object.keys(orderInfo()).length === 0 && Object.keys(orderedItems()).length === 0" py-0 fill-height>
        <div class="row d-flex flex-column align-stretch align-self-stretch">
          <v-container fluid fill-height class="pa-0">
            <div class="row d-flex flex-column align-self-center align-center">
              <v-avatar class="mb-8" height="140px" width="140px" fab color="primary">
                <v-icon size="65px" class="font-weight-light" color="white">mdi-cart-outline</v-icon>
              </v-avatar>
              <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
              <div class="subtitle-1 secondary--text">Order some food or drinks here</div>
              <v-btn @click="goToRestaurantMenu" class="mt-6" height="45px" width="130px" large color="primary" style="border-radius: 10px">Menu</v-btn>
            </div>
          </v-container>
        </div>
      </v-container>
      <v-container v-else class="orderDetailsCart d-flex align-content-space-between flex-wrap">
        <!-- <template> -->
          <div style="width: 100%">
            <!-- <v-card v-for="(item,i) in orderInfo()" :key="i" flat> -->
              <v-list v-for="(orderMenuItem,j) in orderedItems().orderItems" :key="j" class="py-2">
                <v-card disabled >
                  <v-list-item class="pt-1">
                    <v-list-item-content>
                      <v-row>
                        <v-col cols="9" class="pb-1">
                          <v-list-item-title>{{ getItemName(orderMenuItem.menuItemId) }}</v-list-item-title>
                        </v-col>
                        <v-col cols="3" class="d-flex justify-end pb-1">
                          <div>
                            <v-list-item-title><span style="color: #f75564; font-size: 14px" class="pr-1">{{orderMenuItem.quantity}}x </span><span :class="discounts.length > 0 && discounts.some(promo => promo.index == j && promo.id == orderMenuItem.menuItemId) ? 'promoApplied' : ''">R{{((orderMenuItem.itemTotal != null) ? orderMenuItem.itemTotal : (0)).toFixed(2)}}</span></v-list-item-title>
                          </div>
                        </v-col>
                      </v-row>
                      <v-row v-if="discounts.length > 0 && discounts.some(promo => promo.index == j && promo.id == orderMenuItem.menuItemId)" class="mt-0 pt-0">
                        <v-col cols="8" class="mt-0 pt-0">
                          <v-list-item-title><span style="color: #76C5BA; font-size: 14px" class="pr-1">Discount applied</span></v-list-item-title>
                        </v-col>
                        <v-col cols="4" class="d-flex justify-end mt-0 pt-0">
                          <div>
                            <v-list-item-title><span style="color: #76C5BA; font-size: 14px" class="pr-1">R{{(discounts.find(promo => promo.index == j && promo.id == orderMenuItem.menuItemId).newPrice).toFixed(2)}}</span></v-list-item-title>
                          </div>
                        </v-col>
                      </v-row>
                      <v-row >
                        <v-col cols="8" class="py-0">
                          <div v-if="(orderMenuItem.orderSelections != undefined)">
                            <div v-for="(orderItem, index) in orderMenuItem.orderSelections.selections" :key="index">
                              <v-list-item-subtitle v-if="!Array.isArray(orderItem.values)">- {{orderItem.name}}: {{orderItem.values}}</v-list-item-subtitle>
                              <v-list-item-subtitle v-else>- {{orderItem.name}}: {{(orderItem.values).join(', ')}}</v-list-item-subtitle>
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                    
                  </v-list-item>
                </v-card>
              </v-list>


              <v-list v-for="(orderMenuItem,j) in orderInfo().orderItems" :key="j" class="py-2" width="100%">
                <v-card   width="100%">
                  <v-list-item class="pt-1">
                    <v-list-item-content >
                      <v-row @click="editItem(orderMenuItem)">
                        <v-col cols="8" class="pb-1">
                          <v-list-item-title>{{ getItemName(orderMenuItem.menuItemId) }}</v-list-item-title>
                        </v-col>
                        <v-col cols="4" class="d-flex justify-end pb-1">
                          <div>
                            <v-list-item-title><span style="color: #f75564; font-size: 14px" class="pr-1">{{orderMenuItem.quantity}}x </span><span :class="discounts.length > 0 && discounts.some(promo => promo.index == j && promo.id == orderMenuItem.menuItemId) ? 'promoApplied' : ''">R{{((orderMenuItem.itemTotal != null) ? orderMenuItem.itemTotal : (0)).toFixed(2)}}</span></v-list-item-title>
                          </div>
                        </v-col>
                      </v-row>
                      <v-row v-if="discounts.length > 0 && discounts.some(promo => promo.index == j && promo.id == orderMenuItem.menuItemId)" @click="editItem(orderMenuItem)" class="mt-0 pt-0">
                        <v-col cols="8" class="mt-0 pt-0">
                          <v-list-item-title><span style="color: #76C5BA; font-size: 14px" class="pr-1">Discount applied</span></v-list-item-title>
                        </v-col>
                        <v-col cols="4" class="d-flex justify-end mt-0 pt-0">
                          <div>
                            <v-list-item-title><span style="color: #76C5BA; font-size: 14px" class="pr-1">R{{(discounts.find(promo => promo.index == j && promo.id == orderMenuItem.menuItemId).newPrice).toFixed(2)}}</span></v-list-item-title>
                          </div>
                        </v-col>
                      </v-row>
                      <v-row >
                        <v-col cols="8" class="py-0" @click="editItem(orderMenuItem)">
                          <div v-if="(orderMenuItem.orderSelections != undefined)">
                            <div v-for="(orderItem, index) in orderMenuItem.orderSelections.selections" :key="index">
                              <v-list-item-subtitle v-if="!Array.isArray(orderItem.values)">- {{orderItem.name}}: {{orderItem.values}}</v-list-item-subtitle>
                              <v-list-item-subtitle v-else>- {{orderItem.name}}: {{(orderItem.values).join(', ')}}</v-list-item-subtitle>
                            </div>
                          </div>
                        </v-col>
                        <v-col @click="removeCartItem(orderMenuItem)" cols="4" class="py-0 d-flex justify-end  px-0">
                          <div >
                            <v-list-item-icon  class="mb-0 mt-1 mr-2" >
                              <v-icon color="primary">mdi-delete-outline</v-icon>
                            </v-list-item-icon>
                          </div>
                        </v-col>
                        <!-- <v-col cols="4" class="py-0 d-flex justify-end">
                          <div v-if="checkedIn()">
                            <v-btn @click="decreaseQuantity(orderMenuItem)" fab elevation="2" width="22px" height="22px" class="mr-2">
                              <v-icon size="15px">mdi-minus</v-icon>
                            </v-btn>
                            <div class="body-2 secondary--text" style="display: inline;">{{orderMenuItem.quantity}}</div>
                            <v-btn @click="increaseQuantity(orderMenuItem)" fab elevation="2" width="22px" height="22px" class="ml-2" color="primary">
                              <v-icon size="15px">mdi-plus</v-icon>
                            </v-btn>
                          </div>
                        </v-col> -->
                      </v-row>
                    </v-list-item-content>
                    
                  </v-list-item>
                </v-card>
              </v-list>
            <!-- </v-card> -->
          </div>
        <!-- </template> -->
        <div class="ma-0 pa-0 pt-4" style="width: 100%">
          <v-row class="d-flex justify-space-between">
            <v-col cols="auto" class="pb-0">
              <span style="font-weight:bold">Tip:</span>
            </v-col>
            <v-col class="pb-0 pl-0" v-for="(tip, index) in tipOptions" :key="index">
              <v-chip v-model="selected" style="min-width: 100%;" class="justify-center" :outlined="selected != index" @click="changeTip(index)" label color="primary">{{tip}}</v-chip>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center pb-1">
              <v-card width="100%" class="pa-1 pr-2">
                <v-container py-0>
                  <v-row>
                    <v-col cols="9" class="pb-0">
                      <div class="body-1 secondary--text">Subtotal</div>
                    </v-col>
                    <v-col cols="3" class="pb-0 px-0"> 
                      <div class="body-1 secondary--text d-flex justify-end">R {{subtotal.toFixed(2)}}</div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="9" class="pb-0">
                      <div class="body-1 secondary--text">Tax(14% VAT)</div>
                    </v-col>
                    <v-col cols="3" class="pb-0 px-0">
                      <div class="body-1 secondary--text d-flex justify-end">R {{(subtotal  * 0.14).toFixed(2)}}</div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="9">
                      <div class="body-1 secondary--text">Waiter Tip</div>
                    </v-col>
                    <v-col cols="3" class="px-0">
                      <div class="body-1 secondary--text d-flex justify-end">R {{tip.toFixed(2)}}</div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-divider></v-divider>
                  </v-row>
                  <v-row>
                    <v-col cols="9">
                      <div class="body-1 secondary--text font-weight-bold">Total</div>
                    </v-col>
                    <v-col cols="3" class="px-0">
                      <div class="body-1 secondary--text d-flex justify-end font-weight-bold">R {{calculateTotal()}}</div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-space-around mt-5 mb-3" >
            <v-col v-show="Object.keys(orderInfo()).length != 0" cols="5" class="pa-0">
                <v-btn rounded color="primary" elevation="2" class="body-2" width="100%" @click="goToOrder">Order Now, Pay Later</v-btn>
            </v-col>
            <v-col :cols="Object.keys(orderInfo()).length != 0 ? 5 : 7" class="pa-0">
                <v-btn :rounded="Object.keys(orderInfo()).length != 0" color="accent" elevation="2" class="body-2" width="100%" @click="goToPayment">Pay Now</v-btn>
            </v-col>
          </v-row>
        </div>
      </v-container>

      <v-overlay relative opacity="0.25" :value="editTip" z-index="10">
        <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
            <v-icon size="30px" color="white" v-text="'mdi-cash-multiple'"></v-icon>
        </v-avatar>
        <v-alert color="white" transition="scale-transition" class="alert" align="center" width="300px" style="margin-top: 20px;">
          <div style="font-size: 22px !important; color: #343434;" class="pl-8 pr-8 mt-8">Enter amount</div>
          <!-- <div class="mt-2" style="font-size: 16px !important; color: #343434">Please note that once you make payment, <br/>you will be checked out of the system.</div> -->
          <v-text-field v-model="tipVal" class="tipSlot mt-3" color="primary" label="Tip amount"></v-text-field>
          <v-row justify="center" class="d-flex align-content-center" style="max-height: 60px">
            <v-col cols="12" class="d-flex justify-space-around pt-0" flat>
              <v-btn text @click="toggleTipAlert" class="mt-6 mb-1">
                <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Cancel</div>
              </v-btn>
              <v-btn text @click="changeTipManual" class="mt-6 mb-1">
                <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Continue</div>
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-overlay>
      

      <v-btn v-if="checkedIn()" @click="goToCart" fixed app color="primary" width="52px" height="52px" elevation="1" absolute dark bottom style="right: 50%; transform: translateX(50%); bottom: 30px; z-index: 100;" fab>
        <v-icon>mdi-cart-outline</v-icon>
      </v-btn>
      <NavBar></NavBar>
    </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import NavBar from '@/components/layout/NavBar';
import DesktopCart from "../../components/orders/DesktopCartView"

export default {
  components: {
    'DesktopCart': DesktopCart,
    'NavBar': NavBar
  },
  data () {
    return {
      editTip: false,
      subtotal: 0,
      tipVal: '',
      selected: 1,
      tip: 0,
      quantity: [],
      discounts: [],
      tipOptions: [
        '0%', '10%', '15%', 'Other'
      ],
      tab: null,
      idVal: 0,
      items: [
        { img: 'https://source.unsplash.com/uVPV_nV17Tw/800x800/', name: 'Buttermilk Chicken Burger', price: '95.00'},
        { img: 'https://source.unsplash.com/2NaeHe0-p1I/800x800/', name: 'Fruit Salad', price: '85.00'}
      ],
      isMobile: false,
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    changeTip(index) {
      // console.log(index === this.tipOptions.length - 1)
      if (index != this.tipOptions.length - 1) {
        this.selected = index;
        let percent = this.tipOptions[index].slice(0,-1)
        this.tip = this.subtotal * parseInt(percent) / 100

        let data = {
          "tip": this.tip,
          "index": this.selected
        }
        this.setTip(data)
      } else {
        if (this.selected != this.tipOptions.length - 1)
          this.tipVal = ''
        this.toggleTipAlert()
      }      
    },
    changeTipManual () {
        this.tip = parseFloat(this.tipVal)
        this.selected = this.tipOptions.length - 1;
        this.toggleTipAlert()

        let data = {
          "tip": this.tip,
          "index": this.selected
        }
        this.setTip(data)
    },
    toggleTipAlert() {
      this.editTip = !this.editTip
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    async goToOrder () {
      // this.updateOrderFlag(true);
      console.log("ADD ITEM")
      let data = {
        "tip": this.tip
      }
      await this.submitOrder(data);
      console.log(this.orderHistory())
      this.$router.push('/orders')
    },
    toggleAlert() {
        this.paymentMade = !this.paymentMade
    },
    async goToPayment () {
      let orderId;
      if (Object.keys(this.orderInfo()).length != 0) {
        // this.updateOrderFlag(true);
        // console.log("ADD ITEM")
        let data = {
          "tip": this.tip
        }
        orderId = await this.submitOrder(data);
      } else {
        orderId = await this.orderHistory()[0].orderId
      }

      let data = {
        "orderId": orderId,
        "paymentMethod": "Card",
        "restaurantName": this.getRestaurantName(Object.keys(this.orderedItems()).length != 0 ? this.orderedItems().restaurantId : this.orderInfo().restaurantId),
        "menuItemName": this.getItemName((Object.keys(this.orderedItems()).length != 0 && this.orderedItems().orderItems.length > 0) ? this.orderedItems().orderItems[0].menuItemId : this.orderInfo().orderItems[0].menuItemId),
        "amountPaid": parseFloat(this.calculateTotal()),
        "waiterTip": parseFloat(this.tip),
        "orderTax": parseFloat(this.subtotal * 0.14)
      }

      // console.log(data)

      this.addPaymentInfo(data);
      this.$router.push("/paymentinformation");
    },
    decreaseQuantity(item) {
      // console.log(item)
      if (item.quantity > 1) {
        let singlePrice = this.subtotal/item.quantity
        item.quantity--;
        item.itemTotal -= parseFloat(singlePrice)
        this.subtotal -= parseFloat(singlePrice)
      }
    },
    editItem(item) {
      // console.log("pressed")
      this.addItemToEdit(item)
      this.$router.push("/menuItem/" + item.menuItemId);
    },
    async removeCartItem(item) {
      await this.removeItem(item.menuItemId)
      this.subtotal = 0;
      this.quantity = [];
      this.calculateCartTotal(this.orderInfo())
      this.calculateCartTotal(this.orderedItems())
    },
    goToCart() {
      // this.$router.push('/cart')
    },
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        if (this.orderInfo().restaurantId == this.checkedInRestaurantId) {
          return true;
        }
      } else {
        return false;
      }
    },
    goToRestaurantMenu() {
      // console.log(this.checkedInRestaurantId)
      this.$router.push("/menu/" + this.checkedInRestaurantId());
    },
    calculateCartTotal(arr) {
      if (Object.keys(arr).length != 0) {
        for (let i = 0; i < arr.orderItems.length; i++) {
          let price = this.discounts.some(promo => promo.index == i && promo.id == arr.orderItems[i].menuItemId) ? this.discounts.find(promo => promo.index == i && promo.id == arr.orderItems[i].menuItemId).newPrice : arr.orderItems[i].itemTotal
          this.subtotal += (price != null) ? parseFloat(price) * parseFloat(arr.orderItems[i].quantity) : 0;
          this.quantity[i] = parseFloat(arr.orderItems[i].quantity)
        }
      }
    },
    applyPromotionsToCart(arr) {
      let applyPromo = true;
      let promoArr = [];
      if (Object.keys(arr).length != 0) {
        for (let i = 0; i < this.restaurantPromos().length; i++) {
          let promo = this.restaurantPromos()[i];
          for (let j = 0; j < promo.promotions.length; j++) {
            let group = promo.promotions[j];
            for (let y = 0; y < group.items.length; y++) {
              let item = group.items[y];
              let itemIndex = -1;
              let addedToCart = arr.orderItems.find((orderItem, index) => {
                if (item.attributeId != null) {
                  if (orderItem.menuItemId === item.itemId && orderItem.orderSelections.selections.some(selection => selection.id == item.attributeId && selection.values == item.attributeVal)) 
                    itemIndex = index
                  
                  return orderItem.menuItemId === item.itemId 
                    && orderItem.orderSelections.selections.some(selection => selection.id == item.attributeId && selection.values == item.attributeVal)
                } else {
                  if (orderItem.menuItemId === item.itemId)
                    itemIndex = index

                  return orderItem.menuItemId === item.itemId
                }
              })

              if (addedToCart != undefined) {
                console.log(addedToCart)
                let percentage = (100 - promo.value) / 100
                if (promo.type != "percent") {
                  let total = this.calculateTotalPromoGroupPrice(group);
                  percentage = promo.value / total;
                }
                addedToCart.promoPrice = addedToCart.itemTotal * percentage;
                let data = {
                  "id": addedToCart.menuItemId,
                  "newPrice": addedToCart.promoPrice,
                  "index": itemIndex
                }
                promoArr.push(data);
              } else {
                applyPromo = false
              }
            }

            if (applyPromo) {
              promoArr.forEach((promo) => {
                this.discounts.push(promo)
              })
            }
            promoArr = [];
            applyPromo = true;
            console.log(this.discounts)
          }
        }
      }
    },
    calculateTotalPromoGroupPrice(promoGroup) {
      let total = 0;
      let itemIndex = -1;
      for (let i = 0; i < promoGroup.items.length; i++) {
        let item = promoGroup.items[i];
        let addedToCart = this.orderInfo().orderItems.find((orderItem, index) => {
          if (item.attributeId != null) {
            if (orderItem.menuItemId === item.itemId && orderItem.orderSelections.selections.some(selection => selection.id == item.attributeId && selection.values == item.attributeVal)) 
              itemIndex = index
            
            return orderItem.menuItemId === item.itemId 
              && orderItem.orderSelections.selections.some(selection => selection.id == item.attributeId && selection.values == item.attributeVal)
          } else {
            if (orderItem.menuItemId === item.itemId)
              itemIndex = index

            return orderItem.menuItemId === item.itemId
          }
        })

        if (addedToCart != undefined)
          total += addedToCart.itemTotal;
      }

      return total;    
    },
    increaseQuantity(item) {
      let singlePrice = this.subtotal/item.quantity
      item.quantity++
      item.itemTotal += parseFloat(singlePrice)
      this.subtotal += parseFloat(singlePrice)
    },
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        return true;
      } else {
        return false;
      }
    },
    ...mapActions({
      updateOrderFlag: 'OrderStore/updateOrderFlag',
      addItemToEdit: 'MenuItemsStore/addItemToEdit',
      removeItem: 'OrderStore/removeItem',
      submitOrder: 'OrderStore/submitOrder',
      setTip: 'OrderStore/setWaiterTip',
      addPaymentInfo: "OrderStore/addPaymentInfo",
      // clearItem: "MenuItemsStore/clearItem",
    }),
    ...mapGetters({
      menu: "MenuStore/getMenu",
      allRestaurants: 'RestaurantsStore/getAllRestaurants',
      restaurantPromos: 'RestaurantsStore/getCheckedInRestaurantPromotions',
      orderInfo: "OrderStore/getOrderInfo",
      orderedItems: "OrderStore/getOrderedItems",
      orderHistory: 'CustomerStore/getCustomerOrderHistory',
      wTip: 'OrderStore/getWaiterTip',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
    calculateTotal() {
      let tax = (this.subtotal * 0.14).toFixed(2);
      // let tip = (Object.keys(this.orderedItems()).length != 0) ? this.orderedItems().waiterTip : (this.subtotal * 0.1).toFixed(2);
      return (parseFloat(this.subtotal) + parseFloat(tax) + parseFloat(this.tip)).toFixed(2);
    },
    getItemName(id) {
      // console.log("here")
      // console.log(this.menu())
      
      let category = this.menu().categories.find(
        category => {if (category != undefined && category.menuItems != undefined) return category.menuItems.find(menuItem => menuItem.menuItemId === id )}
      )

      let item = category.menuItems.find(menuItem => menuItem.menuItemId === id )
      return item.menuItemName;
    },
    getRestaurantName(id) {
      return this.allRestaurants().find(
        restaurant => restaurant.restaurantId === id
      ).name
    }
  },
  mounted: function() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })

    // console.log(this.restaurantPromos())
    // console.log(this.orderInfo())
    
    this.applyPromotionsToCart(this.orderInfo())
    this.applyPromotionsToCart(this.orderedItems())

    // this.clearItem;
    this.calculateCartTotal(this.orderInfo())
    this.calculateCartTotal(this.orderedItems())

    this.tip = this.subtotal * 0.1;
    if (Object.keys(this.wTip()).length != 0) {
      this.tip = this.wTip().tip;
      this.selected = this.wTip().index;
      if (this.wTip().index === this.tipOptions.length - 1)
        this.tipVal = (this.wTip().tip).toString()
    } else if (Object.keys(this.orderedItems()).length != 0) {
      // console.log(this.orderedItems().waiterTip)
      let total = 0;
      if (this.orderedItems().orderItems.length > 0) {
        for (let i = 0; i < this.orderedItems().orderItems.length; i++) {
          if (this.orderedItems().orderItems[i].promoPrice == null)
            total += this.orderedItems().orderItems[i].itemTotal * this.orderedItems().orderItems[i].quantity
          else
            total += this.orderedItems().orderItems[i].promoPrice * this.orderedItems().orderItems[i].quantity
        }
      }

      let itemIndex = -1;
      this.tipOptions.find((item, index) => {
        if (index != this.tipOptions.length - 1) {
          if ((total * parseFloat(parseInt(this.tipOptions[index].slice(0,-1)) / 100)) === parseFloat(this.orderedItems().waiterTip))
            itemIndex = index;
          return (total * parseFloat(parseInt(this.tipOptions[index].slice(0,-1)) / 100)) === parseFloat(this.orderedItems().waiterTip)
        } 
      });

      if (itemIndex != -1) {
        this.selected = itemIndex;
        this.tip = this.subtotal * parseInt(this.tipOptions[itemIndex].slice(0,-1)) / 100
      } else {
        this.selected = this.tipOptions.length - 1
        this.tip = parseFloat(this.orderedItems().waiterTip)
        this.tipVal = (this.orderedItems().waiterTip).toString()
      }
    }
  }
}
</script>

<style scoped>
  .cartOrders.container.fill-height {
    align-items: inherit !important;
  }

  .cartOrders {
    display: flex;
    flex-flow: column;
    min-height: 100%;
  }

  .orderDetailsCart {
    display: block;
    flex: 1 1 auto;
  }

  .tipSlot.theme--dark.v-text-field:not(.v-input--has-state):hover > .v-input__control > .v-input__slot:before {
    border: 1px solid #f75564 ;
  }
  
  .tipSlot.v-text-field > .v-input__control > .v-input__slot:after {
    border: 1px solid #f75564 ;
  }

  .cartHeader {
    max-height: 56px !important;
    flex: 0 1 auto;
    width: 100%;
  }

</style>

<style>
  .tipSlot.v-text-field > .v-input__control > .v-input__slot {
    border-bottom: 1px solid #f75564 !important;
  }

  .promoApplied {
    text-decoration: line-through;
  }
</style>