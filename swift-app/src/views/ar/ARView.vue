<template>
 <a-scene embedded arjs>
    <!-- TODO: Fix Z-Index issue -->
    <a-obj-model  v-bind:src="model.obj" v-bind:mtl="model.mtl" position="0 0.5 0" scale="5 5 5" />
    <!-- define a camera which will move according to the marker position -->
   <a-marker-camera preset='custom' type='pattern'  v-bind:url="markerPattern"></a-marker-camera>
  </a-scene>
</template>

<script>
export default {
  data () {
    return {
      //TODO: Move to swift.ml server
      markerPattern: "https://sitecheck.co.za/ar/Swift.patt",
      model:
        {
          obj: "https://sitecheck.co.za/ar/model/AppleStrudel.obj",
          mtl: "https://sitecheck.co.za/ar/model/AppleStrudel.mtl"
        }
    }
  },
  methods: {
   
  },
  
}
</script>