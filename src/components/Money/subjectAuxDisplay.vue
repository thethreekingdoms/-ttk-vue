<template>
  <div @keydown.enter="enterCallback">
    <el-form
      ref="auxsform"
      :rules="rules"
      :model="auxData"
      label-width="100px"
      class="aux-dispaly-show"
    >
      <el-form-item
        v-for="auxitem in getAuxLists"
        :label="auxitem.label"
        :key="auxitem.key"
        :prop="auxitem.fieldName"
        :rules="{
          required: true,
          message: `${auxitem.label.replace('：', '')}不能为空!`,
          trigger: ['blur', 'change'],
        }"
        :id="auxitem.fieldName"
      >
        <el-select
          class="aux-select"
          :value="auxData[auxitem.fieldName]"
          v-model="auxData[auxitem.fieldName]"
          :filter-method="_filter"
          :ref="auxitem.field"
          placeholder="请选择"
          id="el-select"
          filterable
        >
          <el-option
            v-for="item in list[auxitem.field]"
            :key="item.id"
            :value="item.id"
            :label="getAubjectWithAuxName(auxitem.field, item)"
            :disabled="item.disabled"
          >
            {{ getAubjectWithAuxName(auxitem.field, item) }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="aux-footer-btn">
        <el-button @click="handlecancel">取消</el-button>
        <el-button type="primary" @click="handlesubmit('auxsform')">
          确定
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import { docGetAllBaseArchives } from "@/api/gl/gl_vouchercard";
  import XEUtils from "xe-utils/methods/xe-utils";
  import { mapState, mapMutations, mapActions } from "vuex";
  export default {
    props: {
      auxAccountSubjects: {
        type: Object,
        default: function () {
          return {};
        },
      },
      auxOptions: {
        type: Object,
        default: function () {
          return {};
        },
      },
      currentAccount: {
        type: Object,
        default: function () {
          return {};
        },
      },
      isAuxShow: false,
    },
    data() {
      return {
        rules: {},
        list: {},
        auxData: {},
      };
    },
    created() {
      this.auxData = { ...this.auxAccountSubjects };
    },
    watch: {
      isAuxShow(newValue, oldValue) {
        // watch监听props里status的变化，然后执行操作
        if (newValue) {
          this.setAuxPopoverShow(true);
          this.list = { ...this.auxOptions };
          this.auxData = { ...this.auxAccountSubjects };
          this.$nextTick((_) => {
            const firstItem = this.getAuxLists;
            if (firstItem && firstItem[0] && firstItem[0].field) {
              const field = firstItem[0].field;
              const ele = this.$refs[field][0];
              ele.focus && ele.focus();
            }
          });
        } else {
          this.setAuxPopoverShow(false);
        }
      },
    },
    mounted() {
      this.auxData = { ...this.auxAccountSubjects };
      this.list = { ...this.auxOptions };
    },
    /**
     * 销毁
     */
    destroyed() {},
    /**
     * 计算属性
     */
    computed: {
      ...mapState({
        accounts: (state) => state.gl_vouchercard.glAccounts,
        calcDict: (state) => state.gl_vouchercard.calcDict,
        orderAux: (state) => state.gl_vouchercard.orderAux,
      }),
      getAuxLists: function () {
        let auxArray = [];
        // `this` 指向 vm 实例
        const array = this.orderAux || [];
        for (let index = 0; index < array.length; index++) {
          const key = array[index];
          if (this.currentAccount && this.currentAccount[key]) {
            const _field =
              `${key}`.toLowerCase().indexOf("excalc") > -1
                ? `${key}`.replace("isExCalc", "exCalc")
                : `${key}`.replace("isCalc", "").toLowerCase();
            auxArray.push({
              key: key,
              label: `${this.calcDict[key]}：`,
              field: _field,
              fieldName:
                _field.indexOf("exCalc") > -1 ? `${_field}` : `${_field}Id`,
            });
          }
        }
        return auxArray;
      },
      copyList: function () {
        var obj = {};
        //this.auxOptions是父组件传递的对象
        obj = JSON.parse(JSON.stringify(this.auxOptions));
        return obj;
      },
    },
    methods: {
      ...mapActions({
        setAuxPopoverShow: "gl_vouchercard/setAuxPopoverShow",
      }),

      /**
       * 模糊搜索
       */
      _filter(val) {
        // 对绑定数据赋值
        const curEle = this.editKey;
        const _copyOptions = { ...this.copyList };
        if (val) {
          const filterData = _copyOptions[curEle].filter((item) => {
            if (
              (item && item.code && item.code.indexOf(val) > -1) ||
              (item && item.name && item.name.indexOf(val) > -1)
            ) {
              return true;
            }
          });
          this.list[curEle] = filterData;
        } else {
          this.list = _copyOptions;
        }
        this.$forceUpdate();
      },

      /**
       * 辅助项大类
       */
      getAubjectWithAuxName(archiveName, fieldData) {
        let subjectWithAuxName = "";
        if (!fieldData) {
          return "";
        }
        switch (archiveName) {
          case "inventory":
            subjectWithAuxName = `${fieldData.code} ${
              fieldData.categoryHierarchyName
                ? fieldData.categoryHierarchyName + "/"
                : ""
            }${fieldData.name} ${
              fieldData.specification
                ? "(" + fieldData.specification + ")"
                : fieldData.specification || ""
            }`;
            break;
          case "department":
            subjectWithAuxName = `${
              fieldData.categoryHierarchyName
                ? fieldData.categoryHierarchyName
                : fieldData.name
            }`;
            break;
          case "person":
            subjectWithAuxName = `${
              fieldData.categoryHierarchyName
                ? fieldData.categoryHierarchyName + "/"
                : ""
            }${fieldData.name}`;
            break;
          case "customer":
          case "supplier":
            subjectWithAuxName = `${fieldData.code} ${
              fieldData.categoryHierarchyName
                ? fieldData.categoryHierarchyName + "/"
                : ""
            }${fieldData.name}`;
            break;
          default:
            subjectWithAuxName = `${fieldData.code} ${fieldData.name}`;
            break;
        }
        return subjectWithAuxName;
      },

      /**
       * 确定
       */
      handlesubmit(formName) {
        const _res = { ...this.auxData };
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$emit("handle-aux-submit", _res, this.auxOptions);
          } else {
            return false;
          }
        });
      },
      /**
       * 取消
       */
      handlecancel() {
        const _res = this.auxAccountSubjects;
        this.$emit("handle-aux-cancel", _res, this.auxOptions);
      },

      /**
       * 递归查找元素
       */
      findFormItem(el) {
        const parent = el.parentElement;
        if (!parent) return document.body;
        if (
          parent.className.includes("el-form-item") &&
          parent.className.includes("el-form-item--small")
        ) {
          return parent;
        }
        return this.findFormItem(parent);
      },

      /**
       * 查找下一个焦点元素
       */
      findNextFocusEle(container) {
        let nextEl = container.nextElementSibling;
        if (!nextEl) return;
        const input = nextEl.querySelector("input");
        if (input && input.className.includes("el-input__inner")) {
          return input;
        }
        const btn = nextEl.querySelector("button");
        if (btn && btn.className.includes("el-button--default")) {
          const nextSibEl = btn.nextSibling;
          if (!nextSibEl) return;
          return nextSibEl;
        }
      },

      /**
       * enter键
       */
      enterCallback() {
        const container = this.findFormItem(document.activeElement);
        const _fcEle = container.id.replace("Id", "");
        this.$refs[_fcEle][0] && this.$refs[_fcEle][0].blur();
        const ele = this.findNextFocusEle(container);
        if (
          ele.className &&
          ele.className.includes("el-button") &&
          ele.className.includes("el-button--primary")
        ) {
          ele && ele.click();
        } else {
          ele && ele.focus();
          ele && ele.select();
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .aux-dispaly-show {
    text-align: left;
    width: 420px;
    .aux-select {
      width: 300px;
      height: 35px !important;
      .el-input__inner,
      .vxe-input--inner {
        height: 35px !important;
      }
    }
  }
  .aux-footer-btn {
    margin-left: 52px;
  }
  .el-select-dropdown__item {
    font-size: 13px !important;
  }
</style>
