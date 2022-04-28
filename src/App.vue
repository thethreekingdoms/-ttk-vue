<template>
  <div id="app2">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {},
};
</script>
<style lang="scss" scoped>
#app2 {
  height: 100%;
  .app-main-container {
    height: 100%;
  }
  & > div {
    height: 100%;
    // & > div {
    //   height: 100%;
    //   &>div{
    //     height: 100%;
    //   }
    // }
  }
}
</style>
