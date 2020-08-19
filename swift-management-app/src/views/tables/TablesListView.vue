<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Restaurant Tables</h2>
      </div>
    </div>
    <div :key="'rowUpdate '+viewUpdateNum" class="vx-row">
      <div
        v-for="table in tables"
        :key="table.tableId"
        class="vx-col w-full lg:w-1/6 sm:w-1/1 w-full mb-base"
      >
        <vx-card
          :title="'Table ' + table.tableNumber"
          :subtitle="'Status: ' + getTableStatus(table.checkedIn)"
          collapse-action
        >
          <vs-chip color="primary">Seats: {{table.numSeats}}</vs-chip>
          <vs-chip color="primary">Checked In: {{ getLength(table.checkedIn) }}</vs-chip>
          <vs-divider border-style="solid" color="white"></vs-divider>
          <span class="vs-input--label mb-4" v-if="getLength(table.checkedIn) != 0">Customers</span>
          <div
            v-for="customer in table.checkedIn"
            :key="customer.name+customer.surname+customer.profileImageURL"
          >
            <vs-avatar
              v-if="!customer.profileImageURL"
              :text="customer.name + ' ' + customer.surname"
            />
            <vs-avatar v-if="customer.profileImageURL" src="customer.profileImageURL" />
            <span class="customerName">{{ customer.name +" " + customer.surname }}</span>
          </div>
          <qrcode-vue
            class="tableQR"
            :id="'qrCodeDisplay'+table.tableId"
            :value="table.qrcode"
            :size="qrSize"
            level="H"
          ></qrcode-vue>
          <vs-button
            @click="downloadQrCode($event, table.tableId)"
            size="small"
            type="line"
            class="mb-2 mr-4"
            icon-pack="feather"
            icon="icon-save"
          >
            <a href :download="'QRCode-Table'+table.tableNumber+'.png'">Download Table QRCode</a>
          </vs-button>
        </vx-card>
      </div>

      <div class="vx-col w-full lg:w-1/6 sm:w-1/6 w-full mb-base">
        <vx-card title="Add New">
          <vs-button @click="addTablePopupActive=true" color="primary" type="filled">Add New Table</vs-button>
        </vx-card>
      </div>
    </div>

    <vs-popup
      class="addTablePopup"
      title="Add new Restaurant Table"
      :active.sync="addTablePopupActive"
    >
      <h5 class="popupTitles">Table Number:</h5>
      <vs-input-number
        style="max-width: 200px; margin: 0 auto"
        v-model="newTableNumber"
        icon-inc="expand_less"
        icon-dec="expand_more"
      />
      <h5 class="popupTitles">Number of Seats:</h5>
      <vs-input-number
        style="max-width: 200px; margin: 0 auto"
        v-model="newTableSeats"
        icon-inc="expand_less"
        icon-dec="expand_more"
      />
      <vs-button @click="addTable()" style="margin-top:15px" color="primary" type="filled">Add Table</vs-button>
    </vs-popup>
  </div>
</template>

<script>
import moduleDataList from "@/store/tables/tablesDataList.js";
import QrcodeVue from "qrcode.vue";

export default {
  components: {
    QrcodeVue,
  },
  data() {
    return {
      qrSize: 250,
      viewUpdateNum: 1,
      isMounted: false,
      addTablePopupActive: false,
      newTableNumber: 1,
      newTableSeats: 1,
    };
  },
  computed: {
    tables() {
      if (this.$store.state.tableList)
        return this.$store.state.tableList.tables;
      else return null;
    },
    tableCount() {
      if (this.$store.state.tableList.tables)
        return this.$store.state.tableList.tables.length;
      else return null;
    },
  },
  methods: {
    getLength(array) {
      if (!array) return 0;
      else return array.length;
    },
    addFirstItemPrompt() {
      this.$vs.dialog({
        color: "primary",
        title: "Let's create your table!",
        text:
          "It looks like the current restaurant doesn't have any tables yet. Let's create your first table and get those customers checked in.",
        accept: this.addFirstItem,
        acceptText: "Add Table",
      });
    },
    addFirstItem(){
      this.addTablePopupActive = true;
    },
    listTables() {
      this.$store.dispatch("tableList/listTables", {
        authKey: this.getAuthToken(),
      });
    },
    closeCardAnimationDemo(card) {
      card.removeRefreshAnimation(3000);
    },
    addTable() {
      this.$store
        .dispatch("tableList/addTable", {
          tableNum: this.newTableNumber,
          tableSeats: this.newTableSeats,
          authKey: this.getAuthToken(),
        })
        .then((res) => {
          //TODO: update table seat count
          if (res.status == 409) {
            this.$vs.notify({
              title: "Table number already exists",
              text: "You cannot create two tables with the same Table Number.",
              color: "danger",
            });
          } else if (res.status == 201) {
            this.listTables();
            this.$vs.notify({
              title: "Table successfully created!",
              text: "Wohoo!",
              color: "success",
            });
          }
        });
      this.addTablePopupActive = false;
      this.rowUpdateNum = this.rowUpdateNum + 1;
    },
    goToOrder(tableId) {
      this.$router.push("/orders");
    },
    downloadQrCode(event, tableId) {
      var QRCode = document.querySelector(
        "#qrCodeDisplay" + tableId + " canvas"
      );
      var image = QRCode.toDataURL("image/png").replace(
        /^data:image\/[^;]+/,
        "data:application/octet-stream"
      );
      event.target.href = image;
    },
    getTableStatus(checkedIn) {
      if (checkedIn)
        if (checkedIn.length == 0) return "Vacant";
        else return "Ordering";
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("tableList", moduleDataList);
        moduleDataList.isRegistered = true;
      }
      if (this.tables == null) this.$vs.loading();

      this.listTables();

      setInterval(() => {
        //  this.listTables();
      }, 5000);
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    tables(newCount, oldCount) {
      this.$vs.loading.close();
      if (this.tableCount <= 0) this.addFirstItemPrompt();
    },
  },
};
</script>

<style scoped>
.customerName {
  position: absolute;
  margin-top: 10px;
}
.tableQR >>> canvas {
  display: none !important;
}
.vs-button-primary {
  width: 100%;
}
.addTablePopup >>> .vs-popup {
  max-width: 300px;
}
.popupTitles {
  text-align: center;
  margin: 10px;
}
.tableQR >>> canvas {
  padding-left: 0;
  padding-right: 0;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  display: block;
}
</style>