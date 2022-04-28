<template>
  <div class="more-container">
    <el-divider content-position="left"></el-divider>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
        <el-card></el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
        <el-card></el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8"></el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "More",
  components: {},
  data() {
    return { nodeEnv: process.env.NODE_ENV };
  },
  created() { },
  mounted() { },
  methods: {},
};
</script>
<style lang="scss" scoped>
.more-container {
  ::v-deep {
    .el-card__body {
      > div {
        min-height: 70vh;
        padding: 20px;

        > ul {
          > li {
            line-height: 30px;
          }
        }

        > img {
          display: block;
          margin: 40px auto;
          border: 1px solid #dedede;
        }
      }
    }
  }
}
</style>
