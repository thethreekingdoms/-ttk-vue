<template>
  <div
    class="sumarry-edit"
    @keydown.down="keySelectD"
    @keydown.up="keySelectU"
    @keyup.right="keyRight"
    @keydown.enter="keySelectE"
  >
    <el-input
      @focus="showSummary"
      @blur="hideSummary"
      class="sumarry-select"
      ref="editEle"
      @input="enterSummary"
      v-model="value"
    ></el-input>
    <el-popover
      placement="bottom"
      ref="popSummaryList"
      v-model="isShow"
      :width="popWidth"
      popper-class="sumarry-pop"
    >
      <ul
        v-on:mousedown="editSummary"
        class="infinite-list"
        style="overflow: auto"
        ref="summaryNode"
      >
        <li
          v-for="(item, index) in list"
          class="infinite-list-item"
          :class="{ keySelect: index === keyIndex }"
          :key="item.docTemplateId"
          :title="item.docTemplateName"
          :lindex="`${item.docTemplateCode}`"
        >
          {{
            !item.docTemplateCode
              ? item.docTemplateName
              : `${item.docTemplateCode} ${item.docTemplateName}`
          }}
        </li>
      </ul>
    </el-popover>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";

  export default {
    props: {
      column_: [String, Object],
      rowIndex_: Number,
      row_: [String, Object],
    },
    data() {
      return {
        value: "",
        property: "",
        isShow: false,
        showAddSubModal: false,
        list: [],
        keyIndex: -1,
        popWidth: "100px",
        popHeight: 202,
        isSelect: false,
      };
    },
    created() {
      this.init();
    },
    watch: {
      popHeight: function (newvalue, oldvalue) {
        this.popHeight = newvalue;
      },
    },
    mounted() {
      this.$refs["editEle"].focus();
      this.$refs["editEle"].select();
      const offsetTop =
        this.$refs["editEle"].$el.offsetParent.offsetParent.offsetTop -
        this.$refs["editEle"].$el.offsetParent.offsetParent.offsetParent
          .scrollTop;
      let obj = this.$refs["editEle"].$el,
        tmp = obj.offsetTop,
        node = obj.offsetParent;
      while (node != null) {
        tmp += node.offsetTop;
        node = node.offsetParent;
      }
      if (offsetTop >= 170) {
        //向上浮动
        window.setTimeout(() => {
          let calcHeight = parseInt(
            document.getElementsByClassName("sumarry-pop")[0].offsetHeight
          );
          if (calcHeight >= this.popHeight) {
            this.$refs["popSummaryList"].$el.children[0].style.top =
              parseInt(-this.popHeight) + "px";
          } else {
            this.$refs["popSummaryList"].$el.children[0].style.top =
              parseInt(-this.popHeight + (this.popHeight - calcHeight)) + "px";
          }
        });
      }
      this.popWidth = this.$refs["editEle"].$el.offsetWidth || "100px";
    },
    computed: {
      summaryList() {
        return this.$store.getters["gl_vouchercard/summaryList"];
      },
    },
    methods: {
      init() {
        this.property = this.column_.property;
        this.value = this.row_[this.property];
      },
      showSummary() {
        this.isShow = true;
        this.list = this.summaryList;
        if (this.value) {
          this.enterSummary(this.value);
        }
      },
      hideSummary(e) {
        if (!this.isSelect) {
          this.editOpt(e);
        }
        this.isShow = false;
      },
      enterSummary(v) {
        if (!v) {
          this.list = this.summaryList;
        } else {
          this.list = this.summaryList.filter((o) => {
            const ele = `${o.docTemplateCode
              .toUpperCase()
              .trim()} ${o.docTemplateName.toUpperCase().trim()}`;
            return (
              ele.includes(v.toUpperCase()) || ele.includes(v.toUpperCase())
            );
          });
        }
        this.value = v;
      },
      editSummary(e) {
        this.isSelect = true;
        if (e.stopPropagation) e.stopPropagation();
        let n = e.target.innerText;
        n = n.split(" ")[0];
        this.value = n;
        if (n) {
          this.enterSummary(n);
        }
        const cloneRow = { ...this.row_ };
        cloneRow[this.property] = n;
        const activeIndex = e.target.attributes.lindex.value;
        const templateInfo = this.summaryList.find(
          (item) => item.docTemplateCode == n
        );
        this.$emit(
          "changeCb",
          cloneRow,
          this.rowIndex_ < 0 ? 0 : this.rowIndex_,
          templateInfo
        );
        // this.column_.editRender.props.changeCb(
        //   cloneRow,
        //   this.rowIndex_ < 0 ? 0 : this.rowIndex_,
        //   templateInfo
        // );
      },
      editOpt(e) {
        this.value = e.target.value;
        const cloneRow = { ...this.row_ };
        cloneRow[this.property] = e.target.value;
        // this.column_.editRender.props.changeCb(cloneRow, this.rowIndex_);
        this.$emit("changeCb", cloneRow, this.rowIndex_);
      },
      keySelectD() {
        let len = this.list.length - 1;
        if (this.keyIndex >= len) {
          this.keyIndex = 0;
        } else {
          this.keyIndex += 1;
        }
        this.selectScroll();
      },
      keyRight(e) {
        // this.column_.editRender.props.arrowOption(
        //   this.row_,
        //   this.rowIndex_,
        //   this.property,
        //   e.code
        // );
        this.$emit(
          "arrowOption",
          this.row_,
          this.rowIndex_,
          this.property,
          e.code
        );
      },
      keySelectU() {
        let len = this.list.length - 1;
        if (this.keyIndex <= 0) {
          this.keyIndex = len;
        } else {
          this.keyIndex -= 1;
        }
        this.selectScroll();
      },
      /**
       * enter回车键
       */
      keySelectE() {
        const n = this.list[this.keyIndex]
          ? this.list[this.keyIndex].docTemplateName
          : this.value;
        this.value = n;
        const cloneRow = { ...this.row_ };
        cloneRow[this.property] = n;
        const activeIndex = this.keyIndex;
        const templateInfo =
          activeIndex == -1
            ? this.summaryList[activeIndex]
            : this.summaryList.find(
                (item) =>
                  item.docTemplateCode.indexOf(n) > -1 ||
                  item.docTemplateName.indexOf(n) > -1
              );
        // this.column_.editRender.props.changeCb(
        //   cloneRow,
        //   this.rowIndex_,
        //   templateInfo,
        //   "enterKey"
        // );
        this.$emit(
          "changeCb",
          cloneRow,
          this.rowIndex_,
          templateInfo,
          "enterKey"
        );
      },
      selectScroll() {
        if (this.keyIndex * 26 > 150) {
          this.$refs["summaryNode"].scrollTop = this.keyIndex * 26 - 150;
        } else {
          this.$refs["summaryNode"].scrollTop = 0;
        }
      },
    },
  };
</script>

<style lang="scss">
  .sumarry-edit {
    position: relative;
    .sumarry-pop {
      padding: 0;
      min-width: 200px;
      position: absolute;
    }
    .infinite-list {
      max-height: 170px;
      font-size: 13px;
      &-item {
        font-size: 13px;
        height: 26px;
        line-height: 22px;
        padding: 2px 12px;
        white-space: nowrap;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background 0.3s ease;
      }
      &-item:hover {
        background-color: #d4e8ff;
      }
      .keySelect {
        background-color: #d4e8ff;
      }
    }
  }
</style>
