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
        class="vx-col w-full lg:w-1/6 sm:w-1/6 w-full mb-base"
      >
        <vx-card
          :title="'Table ' + table.tableNumber"
          :subtitle="'Status: ' + table.status"
          collapse-action
        >
          <vs-chip color="primary">Seats: {{table.numSeats}}</vs-chip>
          <vs-chip color="primary">Checked In: {{getCheckInCount(table.status)}}</vs-chip>
          <vs-divider border-style="solid" color="white"></vs-divider>
          <qrcode-vue class="tableQR" :value="table.qrcode" :size="qrSize" level="H"></qrcode-vue>
          <vs-button
            :disabled="table.status === 'Vacant'"
            color="primary"
            @click="goToOrder(table.tableId)"
            type="filled"
          >View order</vs-button>
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
      qrSize: 120,
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
      if (this.$store.state.tableList)
        return this.$store.state.tableList.tables.length;
      else return null;
    },
  },
  methods: {
    listTables() {
      this.$store.dispatch("tableList/listTables", {
        authKey: this.getAuthToken(),
      });
    },
    closeCardAnimationDemo(card) {
      card.removeRefreshAnimation(3000);
    },
    addTable() {
      this.$store.dispatch("tableList/addTable", {
        tableNum: this.newTableNumber,
        tableSeats: this.newTableSeats,
        authKey: this.getAuthToken(),
      });
      this.addTablePopupActive = false;
      this.rowUpdateNum = this.rowUpdateNum + 1;
    },
    getCheckInCount(status) {
      if (status == "Vacant") return 0;
      else return status.split(" ")[0];
    },
    goToOrder(tableId) {
      this.$router.push("/orders");
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("tableList", moduleDataList);
        moduleDataList.isRegistered = true;
      }
      if (!this.tableCount > 0) this.$vs.loading();

      this.listTables();
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    tableCount(newCount, oldCount) {
      this.$vs.loading.close();
    },
  },
};
</script>

<style scoped>
.vs-button-primary {
  width: 100%;
}
.addTablePopup .vs-popup {
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