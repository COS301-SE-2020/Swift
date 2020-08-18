<template>
  <div max-widt>
    <vs-row>
      <vs-col
        class="mb-4"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-lg="6"
        vs-sm="12"
      >
        <vs-input label="Restaurant Name" placeholder="Mug & Bean" v-model="value1" />
      </vs-col>
      <vs-col
        class="mb-4"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-lg="6"
        vs-sm="12"
      >
        <vs-input label="Branch" placeholder="Centurion Mall" v-model="value1" />
      </vs-col>
    </vs-row>
    <vs-row>
      <vs-col
        vs-offset="1"
        class="mb-4"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-lg="10"
        vs-sm="12"
      >
        <vs-textarea label="Description" v-model="textarea" />
      </vs-col>
    </vs-row>
  </div>
</template>
