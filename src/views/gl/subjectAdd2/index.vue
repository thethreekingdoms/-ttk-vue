<template></template>

<script>
import * as env from "@/utils/environment.js";
export default {
  props: {
    subjectAddProps: Object,
  },
  components: {},
  data() {
    return {
      form: {

      },
      other: {

      },
      rules: {

      }
    };
  },
  computed: {

  },
  methods: {
    async init() {
      let win = top.window.frames[0];
      if (!!win) {
        if (!!window.postMessage) {
          window.parent.postMessage(
            {
              method: "taxOpenModal",
              data: {
                title: "新增科目",
                appName: 'app-proof-of-charge-subjects-add',
                columnCode: "subjects",
                active: 'certificate',
                useFooter: true,
                width: 450,
                height: 500
              },
            },
            "*"
          );
        }
      }
    },
  },
  created() {
    this.init();
  },
  mounted() { },
};
</script>

<style lang="scss">
</style>
