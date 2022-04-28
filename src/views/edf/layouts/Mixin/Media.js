import store from "@/store";

export default {
  beforeMount() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
  mounted() {
    const isMobile = this.handleIsMobile();
    if (isMobile) {
      store.dispatch("settings/toggleDevice", "mobile");
      setTimeout(() => {
        store.dispatch("settings/foldSideBar");
      }, 2000);
    } else {
      store.dispatch("settings/openSideBar");
    }
  },
  methods: {
    handleIsMobile() {
      return document.body.getBoundingClientRect().width - 1 < 992;
    },
    handleResize() {
      if (!document.hidden) {
        const isMobile = this.handleIsMobile();
        store.dispatch(
          "settings/toggleDevice",
          isMobile ? "mobile" : "desktop"
        );
      }
    },
  },
};
