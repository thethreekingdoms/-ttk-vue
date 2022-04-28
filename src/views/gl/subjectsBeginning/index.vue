<template>
  <div class="subjectBeginning">
    <div class="tabList">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane
          v-for="item in tabList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div class="content">
      <!-- <component :is="currentView"></component> -->
      <router-view @router-emit="handleRouter" />
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import VueRouter from "vue-router";
import accountingSubject from "../accountingSubject/index";
import beginBalance from "../beginBalance/index";
import cashFlow from "../cashFlow/index";
Vue.use(VueRouter);
const routes = [
  { path: "/accountingSubject", component: accountingSubject },
  { path: "/beginBalance", component: beginBalance },
  { path: "/cashFlow", component: cashFlow },
];
const router = new VueRouter({ routes });
export default {
  name: "subjectBeginning",
  components: {
    accountingSubject,
    beginBalance,
    cashFlow,
  },
  router,
  data() {
    return {
      activeName: "accountingSubject",
      currentView: "accountingSubject",
      tabList: [
        // {
        //   name: "accountingSubject",
        //   label: "科目",
        // },
        // {
        //   name: "beginBalance",
        //   label: "期初余额",
        // },
        // {
        //   name: "cashFlow",
        //   label: "期初现金流量",
        // },
      ],
    };
  },
  mounted() {
    if (this.$store.state.routes.org.enabledMonth == 1) {
      this.tabList = [
        {
          name: "accountingSubject",
          label: "科目",
        },
        {
          name: "beginBalance",
          label: "期初余额",
        },
      ];
    } else {
      this.tabList = [
        {
          name: "accountingSubject",
          label: "科目",
        },
        {
          name: "beginBalance",
          label: "期初余额",
        },
        {
          name: "cashFlow",
          label: "期初现金流量",
        },
      ];
    }
    this.$router.push({
      path: `/accountingSubject`,
    });
  },
  methods: {
    handleRouter(data) {
      if (data === 1) {
        this.tabList = [
          {
            name: "accountingSubject",
            label: "科目",
          },
          {
            name: "beginBalance",
            label: "期初余额",
          },
        ];
        if (this.activeName === "cashFlow") {
          this.activeName = "beginBalance";
          this.$router.push({
            path: `/beginBalance`,
          });
        }
      } else {
        this.tabList = [
          {
            name: "accountingSubject",
            label: "科目",
          },
          {
            name: "beginBalance",
            label: "期初余额",
          },
          {
            name: "cashFlow",
            label: "期初现金流量",
          },
        ];
      }

      console.log(this.activeName);
    },
    handleClick(tab, event) {
      this.$router.push({
        path: `/${tab.name}`,
        query: {
          type: tab.name,
        },
      });
    },
  },
};
</script>
<style lang="scss">
.subjectBeginning {
  .tabList {
    .el-tabs__nav-scroll {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
