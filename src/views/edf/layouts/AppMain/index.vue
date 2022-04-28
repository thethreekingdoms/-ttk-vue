<template>
  <section class="app-main-container">
    <span>
      <keep-alive v-if="routerView" :include="cachedRoutes" :max="keepAliveMaxNum">
        <router-view class="app-main-height" :key="key" />
      </keep-alive>
    </span>
  </section>
</template>

<script>
import { VabKeel, VabKeelHeading, VabKeelText } from "@/plugins/vabKeel";
import { mapGetters } from "vuex";
import {
  keepAliveMaxNum,
  title,
} from "@/config/settings";

export default {
  name: "AppMain",
  components: {
    VabKeel,
    VabKeelHeading,
    VabKeelText,
  },
  data() {
    return {
      show: true,
      fullYear: new Date().getFullYear(),
      title,
      keepAliveMaxNum,
      routerView: true
    };
  },
  computed: {
    ...mapGetters({
      visitedRoutes: "tagsBar/visitedRoutes",
      device: "settings/device",
      skeleton: "settings/skeleton",
    }),
    cachedRoutes() {
      const cachedRoutesArr = [];
      this.visitedRoutes.forEach((item) => {
        if (!item.meta.noKeepAlive) {
          cachedRoutesArr.push(item.name);
        }
      });
      return cachedRoutesArr;
    },
    key() {
      return this.$route.path;
    },
  },
  watch: {
    $route: {
      handler(route) {
        if ("mobile" === this.device) {
          this.$store.dispatch("settings/foldSideBar");
        }
      },
      immediate: true,
    },
  },
  created() {
    //重载所有路由
    this.$baseEventBus.$on("reloadRouterView", () => {
      this.routerView = false;
      this.$nextTick(() => {
        this.routerView = true;
      });
    });
  },
  mounted() {
    // this.handleSkeleton();
  },
  methods: {

  },
};
</script>

<style lang="scss" scoped>
.app-main-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 100%;
  .app-main-height {
    min-height: $base-app-main-height;
  }
}
</style>
