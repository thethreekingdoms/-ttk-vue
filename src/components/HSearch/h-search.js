import "./style/index.scss";
import itemRender from "./components/itemRender.js";

export default {
  name: "HSearch",
  render(h) {
    const _this = this;

    function contentERender(ele, h) {
      return h("el-form-item", {
        props: {
          label: ele.label,
        },
        attrs: {
          prop: ele.name,
        },
        scopedSlots: {
          default: (_) => itemRender(h, ele.children,_this.$attrs, _this.updateForm, _this.cacheRefs)
          // default: (_) => itemRender.call(_this, h, ele.children),
        },
      });
    }
    function contentRender(c, h, a) {
      return h(
        "el-form",
        {
          ref: "hsearchForm",
          props: {
            rules: a.rules,
            model: a.ruleForm,
          },
        },
        [
          c.map((ele) => {
            return contentERender(ele, h);
          }),
        ]
      );
    }

    function footerRender(h) {
      let search = () => {
        _this.$emit("search", _this.form, _this.$refs.hsearchForm);
      };
      let clear = () => {
        _this.clear();
      };
      let cancel = () => {
        _this.$emit("search");
      };
      return h(
        "div",
        {
          class: {
            "h-search-footer": true,
          },
        },
        [
          h(
            "el-button",
            {
              props: {
                type: "primary",
              },
              on: {
                click: search,
              },
            },
            "查询"
          ),
          h(
            "el-button",
            {
              on: {
                click: clear,
              },
            },
            "清空"
          ),
          h(
            "el-button",
            {
              on: {
                click: cancel,
              },
            },
            "取消"
          ),
        ]
      );
    }

    const searchRender = h(
      "el-popover",
      {
        ref: "hSearch",
        props: {
          ...this.$attrs,
        },
        class: {
          "h-search": true,
        },
        on: {
          ...this.$listeners,
        },
      },
      [
        contentRender(this.$attrs.content_, h, this.$attrs),
        this.$slots.default, //  slot columns
        this.$slots.append && h("div", { slot: "append" }, this.$slots.append), // slot append
        footerRender(h),
      ]
    );

    return searchRender;
  },

  computed: {
    hListeners() {
      return {
        "item-change": this.itemChange,
      };
    },
  },

  methods: {
    initData() {
      if (this.$attrs.content_ && this.$attrs.content_.length) {
        const form = {};
        this.$attrs.content_.forEach((o) => {
          form[o.name] = o.children.defaultValue || null;
        });
        this.form = form;
      }
    },
    updateForm(v, t) {
      let rulsForm = this.$attrs.ruleForm;
      if (t in rulsForm) {
        rulsForm[t] = v;
      }
      this.$set(this.form, t, v);
      this.$set(this.$attrs, "ruleForm", rulsForm);
    },
    clear() {
      for (let item in this.form) {
        if (hasValue(this.form[item])) {
          this.$set(this.form, item, null);
          this.refsObj[item] && this.refsObj[item]();
        }
      }
    },
    cacheRefs(t, f) {
      if (!f) return;
      this.refsObj[t] = f;
    },
  },

  created() {
    this.initData();
  },
  mounted() {},

  props: {
    content: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data() {
    return {
      form: {},
      refsObj: {},
    };
  },

  watch: {},
};

function hasValue(v) {
  return !!v || v === 0;
}
