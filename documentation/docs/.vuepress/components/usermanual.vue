<template>
  <div>
    <p class="demo">
      {{ msg }}
    </p>
    <!-- <a href="../../static/user-manual.pdf" target="_blank">User Manual</a> -->
  </div>
</template>

<script>
  export default {
    data() {
      return {
        msg: 'Hello this is <user-manual>'
      }
    }
  }
</script>
