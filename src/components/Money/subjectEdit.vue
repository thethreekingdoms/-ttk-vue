<template>
  <div
    class="subject-edit"
    @keydown.down="keySelectD"
    @keydown.up="keySelectU"
    @keyup.left="keyLeft"
    @keyup.right="keyRight"
    @keydown.enter="keySelectE"
    slot="reference"
  >
    <div>
      <el-input
        @focus="showSubject"
        @blur="hideSubject"
        class="subject-select"
        ref="editEle"
        @input="enterSubject"
        @keyup.native="handleKeyDown"
        v-model="value"
      ></el-input>
      <el-popover
        ref="popList"
        v-model="isShow"
        :width="popWidth"
        popper-class="subject-pop"
      >
        <ul
          @click="editSubject"
          class="infinite-list"
          v-infinite-scroll="load"
          style="overflow: auto"
          ref="subjectNode"
        >
          <li
            v-for="(item, index) in list"
            class="infinite-list-item"
            :key="item.id"
            :title="item.codeAndName"
            :lindex="index"
            :class="{ keySelect: index === keyIndex }"
          >
            {{ item.codeAndName }}
          </li>
        </ul>
        <el-button
          class="subject-add"
          @click="
            (e) => {
              editSubject(e, 'add');
            }
          "
        >
          新增科目
        </el-button>
      </el-popover>
    </div>
    <el-dialog
      title="新增科目"
      :visible.sync="showAddSubModal"
      class="subjectAdd-dialog"
      v-if="showPortal"
    >
      <subject-add
        @subject-add="addSubject"
        :subjectAddProps="subjectAddProps"
      ></subject-add>
    </el-dialog>   
  </div>
</template>
<script>
  import SubjectAdd from "@/views/gl/subjectAdd";  
  export default {
    props: {
      column_: [String, Object],
      rowIndex_: Number,
      row_: [String, Object],
    },
    components: {
      SubjectAdd     
    },
    data() {
      return {
        value: "",
        property: "",
        isShow: false,
        showAddSubModal: false,
        count: 200,
        popWidth: "100px",
        popHeight: 202,
        list: [],
        keyIndex: -1,
        subjectAddProps: {
          columnCode: "subjects",
          active: "certificate",
        },
      };
    },
    watch: {
      popHeight: function (newvalue, oldvalue) {
        this.popHeight = newvalue;
      },
    },
    computed: {
      glAccounts() {
        return this.$store.state.gl_vouchercard.glAccounts;
      },
    },
    methods: {
      init() {
        this.property = this.column_.property;
        this.value = this.row_[this.property] || "";
        this.showPortal =
          location.href.indexOf("showPortal") > -1 ? false : true;
      },
      showSubject() {
        this.isShow = true;
        if (!this.value) {
          this.list = this.glAccounts.slice(0, 200);
        } else {
          this.list = this.glAccounts.slice(0, 1);
        }
      },
      addSubject() {
        this.showAddSubModal = false;
      },
      enterSubject(inputValue) {
        let conditionLeft, conditionRight;
        if (!inputValue) {
          this.list = this.glAccounts.slice(0, 200);
        } else {
          if (inputValue.indexOf(" ") > -1) {
            const index = inputValue.indexOf(" ");
            conditionLeft =
              inputValue.slice(0, index) ||
              inputValue.slice(index).replace(/\s*/g, "");
            conditionRight = inputValue.slice(index).replace(/\s*/g, "");
          } else {
            conditionLeft = inputValue;
          }
          this.list = this.glAccounts.filter((itemData) => {
            if (
              itemData &&
              this.getSearchCondition(itemData, {
                conditionLeft,
                conditionRight,
              })
            ) {
              return true;
            } else {
              return false;
            }
          });
          this.keyIndex = 0;
        }
      },
      /**
       * 科目模糊查询条件，支持（编码 名称）
       */
      getSearchCondition(item, searchValue) {
        const data = `${item["code"]}${item["gradeName"]}${item["helpCode"]}${item["helpCodeFull"]}`;
        const { conditionLeft, conditionRight } = searchValue;
        if (/^[0-9]+$/.test(conditionLeft)) {
          return (
            data.toUpperCase().indexOf(conditionLeft.toUpperCase()) == 0 &&
            (conditionRight
              ? data.toUpperCase().indexOf(conditionRight.toUpperCase()) != -1
              : true)
          );
        } else {
          return (
            data.toUpperCase().indexOf(conditionLeft.toUpperCase()) != -1 &&
            (conditionRight
              ? data.toUpperCase().indexOf(conditionRight.toUpperCase()) != -1
              : true)
          );
        }
      },
      hideSubject() {
        this.isShow = false;
      },
      async editSubject(e, type) {
        if (e.stopPropagation) e.stopPropagation();

        if (type && type === "add") {
          this.showAddSubModal = true;
          return;
        } else {
          await this.edit(e);
        }
      },
      async edit(e) {
        let n = e.target.innerText;
        this.value = n;
        const cloneRow = { ...this.row_ };
        cloneRow[this.property] = n;
        const activeIndex = e.target.attributes.lindex.value;
        let activeSubjectInfo = this.list[activeIndex];
        // this.column_.editRender.props.changeCb(
        //   cloneRow,
        //   this.rowIndex_,
        //   activeSubjectInfo
        // );
        this.$emit("changeCb", cloneRow, this.rowIndex_, activeSubjectInfo);
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
      keySelectU() {
        let len = this.list.length - 1;
        if (this.keyIndex <= 0) {
          this.keyIndex = len;
        } else {
          this.keyIndex -= 1;
        }
        this.selectScroll();
      },
      keyLeft(e) {
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
      keyRight(e) {
        // this.column_.editRender.props.arrowOption(
        //   this.row_,
        //   this.rowIndex_,
        //   this.property,
        //   e.code
        // );
        this.keyLeft(e);
      },
      keySelectE() {
        const n = this.list[this.keyIndex]
          ? this.list[this.keyIndex].codeAndName
          : "";
        this.value = n;
        const cloneRow = { ...this.row_ };
        cloneRow[this.property] = n;
        const activeIndex = this.keyIndex;
        const activeSubjectInfo = this.list[activeIndex];
        // this.column_.editRender.props.changeCb(
        //   cloneRow,
        //   this.rowIndex_,
        //   activeSubjectInfo,
        //   "enterKey"
        // );
        this.$emit(
          "changeCb",
          cloneRow,
          this.rowIndex_,
          activeSubjectInfo,
          "enterKey"
        );
      },
      selectScroll() {
        if (this.keyIndex * 26 > 150) {
          this.$refs["subjectNode"].scrollTop = this.keyIndex * 26 - 150;
        } else {
          this.$refs["subjectNode"].scrollTop = 0;
        }
      },
      load() {
        if (this.count > this.glAccounts.length) return;
        if (this.value) {
          this.enterSubject(this.value);
        } else {
          if (this.count + 2 > this.glAccounts.length) {
            this.list = this.glAccounts;
          } else {
            this.list = this.glAccounts.slice(0, this.count + 2);
          }
          this.count += 2;
        }
      },
      /**
       * 键盘处理
       */
      handleKeyDown(e) {
        if ((e.key && e.key.toLowerCase() == "f10") || e.keyCode == 121) {
          this.showAddSubModal = true;
        }
        this.reCalcPosition();
      },
      reCalcPosition() {
        const offsetTop =
          this.$refs["editEle"].$el.offsetParent.offsetParent.offsetTop -
          this.$refs["editEle"].$el.offsetParent.offsetParent.offsetParent
            .scrollTop;
        if (offsetTop >= 170) {
          //向上浮动
          // document.getElementsByClassName("subject-pop")[0].style.display = "block"
          window.setTimeout(() => {
            let calcHeight = parseInt(
              document.getElementsByClassName("subject-pop")[0].offsetHeight
            );
            if (calcHeight >= this.popHeight) {
              this.$refs["popList"].$el.children[0].style.top =
                parseInt(-this.popHeight) + "px";
            } else {
              this.$refs["popList"].$el.children[0].style.top =
                parseInt(-this.popHeight + (this.popHeight - calcHeight)) +
                "px";
            }
          });
        }
      },
    },
    created() {
      this.init();
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
            document.getElementsByClassName("subject-pop")[0].offsetHeight
          );
          if (calcHeight >= this.popHeight) {
            this.$refs["popList"].$el.children[0].style.top =
              parseInt(-this.popHeight) + "px";
          } else {
            this.$refs["popList"].$el.children[0].style.top =
              parseInt(-this.popHeight + (this.popHeight - calcHeight)) + "px";
          }
        });
      }
      this.popWidth = this.$refs["editEle"].$el.offsetWidth || "200px";
    },
  };
</script>

<style lang="scss">
  .subject-edit {
    position: relative;

    .subject-pop {
      padding: 0;
      min-width: 200px;
      position: absolute;
    }
    .infinite-list {
      max-height: 170px;
      width: 100%;
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
    .subject-add {
      height: 30px;
      width: 100%;
      bottom: 0;
      text-align: center;
    }
  }
</style>
