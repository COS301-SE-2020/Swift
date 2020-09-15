<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Employees</h2>
      </div>
      <vs-button @click="addEmployeeActive = true">Add Employee</vs-button>
    </div>

    <vs-popup class="text-center" title="Add Employee" :active.sync="addEmployeeActive">
      <h5 class="mb-2 mt-4">Employee Details</h5>
      <div class="flex flex-wrap">
        <vs-input
          class="mb-1 ml-2 mr-2 mt-2 w-full md:w-1/3 lg:w-1/3 xl:w-1/3 ml-auto"
          icon-pack="feather"
          icon="icon-mail"
          placeholder="Employee Email"
          v-model="newEmployeeEmail"
          icon-no-border
        />

        <vs-input
          icon-pack="feather"
          icon="icon-briefcase"
          placeholder="Employee Role"
          v-model="newEmployeeRole"
          icon-no-border
          class="mb-1 ml-2 mr-2 mt-2 w-full md:w-1/3 lg:w-1/3 xl:w-1/3 mr-auto"
        />
      </div>

      <h5 class="mb-2 mt-4">Employee Permissions</h5>
      <p
        class="mb-4"
        style="max-width:400px;margin:0 auto"
      >Which sections of the restaurant management dashboard the employee has access to</p>
      <ul class="flex flex-wrap centerx mb-6">
        <li
          v-for="right in accessRights"
          :key="right.permissionId"
          class="w-full sm:w-full md:w-1/2 lg:w-1/3 xl:w-1/3 mb-4"
        >
          <vs-checkbox v-model="right.value">{{ right.description }}</vs-checkbox>
        </li>
      </ul>
      <vs-button type="border" @click="submitNewEmployee">Add Employee</vs-button>
    </vs-popup>
  </div>
</template>
<script>
import employeesDataList from "@/store/employees/employeesDataList.js";

export default {
  data() {
    return {
      addEmployeeActive: false,
      newEmployeeEmail: "",
      newEmployeeRole: "",
    };
  },
  computed: {
    employees() {
      if (this.$store.state.employeesData) {
        return this.$store.state.employeesData.employees;
      } else return null;
    },
    accessRights() {
      if (this.$store.state.employeesData) {
        return this.$store.state.employeesData.accessRights;
      } else return null;
    },
  },
  methods: {
    listEmployees() {
      return;
    },
    listAccessRights() {
      this.$store.dispatch("employeesData/getAccessRights", {
        authKey: this.getAuthToken(),
      });
    },
    submitNewEmployee() {
      var newEmployeePriviliges = [];

      this.accessRights.forEach((right) => {
        if (right.value) newEmployeePriviliges.push(right.permissionId);
        //reset rights for next addition
        right.value = false;
      });
      this.$store
        .dispatch("employeesData/addNewEmployee", {
          email: this.newEmployeeEmail,
          role: this.newEmployeeRole,
          priviliges: newEmployeePriviliges,
          restaurantId: this.getCurrentRestaurantId(),
          authKey: this.getAuthToken(),
        })
        .then((res) => {
          if (res.status == 405) {
            this.$vs.notify({
              time: 6000,
              title: "The employee does not yet have a Swift account",
              text:
                "Please register the employee first: <a style='color:white; text-decoration:underline' href='https://app.swiftapp.ml/#/register'>Register</a>",
              color: "warning",
            });
          }
          if (res.status == 201 || res.status == 200) {
            //this.listEmployees();
            this.$vs.notify({
              title: "Employee successfully created!",
              text: "Wohoo!",
              color: "success",
            });
          }
        });
      this.addEmployeeActive = false;
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!employeesDataList.isRegistered) {
        this.$store.registerModule("employeesData", employeesDataList);
        employeesDataList.isRegistered = true;
      }

      if (this.employees == null)
        // this.$vs.loading();
        this.listEmployees();
      this.listAccessRights();
    }
  },
  watch: {
    employees(newCount, oldCount) {
      this.$vs.loading.close();
    },
    accessRights: function (val) {
      val.forEach((right) => {
        right["value"] = false;
      });
    },
  },
};

/* "requestType": "addEmployee",
  "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUN",
  "restaurantId": 1,
  "email": "john@gmail.com",
  "role": "Waiter",
  "priviliges": [1,3]
  */
</script>

