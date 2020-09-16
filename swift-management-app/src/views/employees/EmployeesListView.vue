<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Employees</h2>
      </div>
    </div>

    <vs-table ref="table" search :data="employees">
      <div slot="header" class="flex flex-wrap-reverse items-center flex-grow justify-between">
        <vs-button type="border" @click="addEmployeeActive = true">Add Employee</vs-button>
      </div>

      <template slot="thead">
        <vs-th>Profile Image</vs-th>
        <vs-th>Name</vs-th>
        <vs-th>Rating</vs-th>
        <vs-th>Role</vs-th>
        <vs-th>Action</vs-th>
      </template>

      <template slot-scope="{data}">
        <tbody>
          <vs-tr :data="tr" :key="indextr" v-for="(tr, indextr) in data">
            <vs-td>
              <vs-avatar size="large" :src="tr.profileImage" />
            </vs-td>

            <vs-td>
              <p class="font-medium truncate">{{ tr.name }} {{ tr.surname }}</p>
              <p>{{ tr.email }}</p>
            </vs-td>

            <vs-td>
              <vs-chip :color="getRatingColor(tr.averageRating)">{{ getRating(tr.averageRating) }}</vs-chip>
            </vs-td>

            <vs-td>
              <p>{{ tr.role }}</p>
            </vs-td>

            <vs-td class="whitespace-no-wrap">
              <feather-icon icon="EditIcon" svgClasses="w-5 h-5 hover:text-primary stroke-current" />
              <feather-icon
                icon="TrashIcon"
                svgClasses="w-5 h-5 hover:text-danger stroke-current"
                class="ml-2"
                @click.stop="deleteData(tr.employeeId)"
              />
            </vs-td>
          </vs-tr>
        </tbody>
      </template>
    </vs-table>

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
      itemsPerPage: 10,
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
    getRating(rating) {
      if (rating === 0) return "Unrated";
      else return rating.toString() + "/5";
    },
    getRatingColor(rating) {
      if (rating === "Unrated") return "primary";
      if (rating > 3.5) return "success";
      if (rating > 2.5) return "warning";
      if (rating <= 2.5) return "danger";
    },
    listEmployees() {
      this.$store.dispatch("employeesData/listEmployees", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
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
          this.listEmployees();
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

      if (this.employees == null) this.$vs.loading();
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
</script>

