<template>
  <div class="money-cell-edit" slot="reference">
    <span>
      <el-input
        @blur="handleBlur($event)"
        @focus="handleFocus"
        ref="editEle"
        v-model.trim="value"
        v-numberInt:2="value_"
        @keyup.native="handleKeyDown"
        @input="handleInput"
        class="money-input"
      ></el-input>
      <Calculator
        class="money-calculator"
        @calculator-confirm="handleCalc"
        :calcVisible="calcVisible"
      ></Calculator>
    </span>
  </div>
</template>

<script>
  import Calculator from "../Calculator/index.vue";
  import XEUtils from "xe-utils/methods/xe-utils";
  import * as env from "../../utils/environment";
  const DR = "amountDr";
  const CR = "amountCr";

  export default {
    props: {
      row_: [String, Object],
      rowIndex_: Number,
      column_: [String, Object],
    },
    components: { Calculator },
    data() {
      return {
        value: undefined,
        value_: "",
        property: "",
        tableData: [],
        isAutoEqualAmount: false,
        spaceOpt: false,
        calcVisible: false,
      };
    },
    methods: {
      init() {
        this.property = this.column_.property;
        this.value = this.row_[this.property] || undefined;
        this.tableData = this.column_.editRender.props.tableData;
        this.isAutoEqualAmount = this.column_.editRender.props.isAutoEqual;
      },
      formatMoney(v) {
        return XEUtils.toNumber(v).toFixed(2);
      },
      /**
       * 焦点进入
       */
      handleFocus(e) {
        // 凭证焦点放入借贷自动找平
        let drTotalAmount = 0,
          crTotalAmount = 0;
        this.tableData.forEach((o, i) => {
          if (i !== this.rowIndex_) {
            drTotalAmount += XEUtils.toNumber(o[DR]) || 0;
            crTotalAmount += XEUtils.toNumber(o[CR]) || 0;
          }
        });
        let cloneRow = { ...this.row_ };
        let cr_ = XEUtils.toNumber(cloneRow[CR]),
          dr_ = XEUtils.toNumber(cloneRow[DR]),
          differAmount = drTotalAmount - crTotalAmount;
        //1、借方 如果当前分录借方小于贷方的值,并且当前分录对应的借贷金额都没有录入，自动找平借方,否则不管
        if (
          drTotalAmount < crTotalAmount &&
          this.property == DR &&
          !cr_ &&
          !dr_
        ) {
          if (this.isAutoEqualAmount) {
            //借方
            cloneRow[DR] = (dr_ - differAmount).toFixed(2);
            cloneRow[CR] = (0).toFixed(2);
            this.value = cloneRow[this.property];
            this.column_.editRender.props.changeCb(
              cloneRow,
              this.rowIndex_,
              this.property
            );
          }
        }
        //2、贷方 如果当前分录贷方方小于借方的值,并且当前分录对应的借贷金额都没有录入， 自动找平借方,否则不管
        if (
          crTotalAmount < drTotalAmount &&
          this.property == CR &&
          !cr_ &&
          !dr_
        ) {
          if (this.isAutoEqualAmount) {
            //贷方
            cloneRow[DR] = (0).toFixed(2);
            cloneRow[CR] = (cr_ + differAmount).toFixed(2);
            this.value = cloneRow[this.property];
            this.column_.editRender.props.changeCb(
              cloneRow,
              this.rowIndex_,
              this.property
            );
          }
        }
        this.$nextTick(() => {
          this.$refs["editEle"].select();
        });
      },
      /**
       * 文本改变
       */
      handleInput(e) {
        this.$nextTick((_) => {
          this.value = this.value
            .replace(/[^\d.\=\-]/g, "")
            .replace(".", "$#$")
            .replace(/\./g, "")
            .replace("$#$", ".");
          // this.value = XEUtils.toNumber(this.value).toFixed(2)
          const cloneRow = { ...this.row_ };
          //借贷清空，保证界面借贷只能有一个方向有值，并且只有切换才走，保证效率
          if (this.property === DR && this.value && cloneRow[CR]) {
            cloneRow[CR] = 0;
            this.column_.editRender.props.changeCb(
              cloneRow,
              this.rowIndex_,
              this.property
            );
          } else if (this.property === CR && this.value && cloneRow[DR]) {
            cloneRow[DR] = 0;
            this.column_.editRender.props.changeCb(
              cloneRow,
              this.rowIndex_,
              this.property
            );
          }
        });
        //safari不触发onblur事件？？？
        let browserType = env.getBrowserVersion();
        if (browserType.safari) {
          this.handleBlur(e);
        }
      },
      /**
       * 失去焦点
       */
      handleBlur(e) {
        if (this.spaceOpt) {
          return (this.spaceOpt = false);
        }
        if (typeof e == "string") {
          this.updateRowInfo(e);
        } else {
          let n = e.target.value;
          this.updateRowInfo(n);
        }
      },
      /**
       * 计算器处理
       */
      handleCalc(value) {
        //计算器计算余额逻辑
        this.value = XEUtils.toNumber(value).toFixed(2) || undefined;
        this.updateRowInfo(value);
      },
      /**
       * 键盘处理
       */
      handleKeyDown(e) {
        e.stopPropagation();
        e.preventDefault();
        if (
          e.code === "ArrowLeft" ||
          e.code === "ArrowUp" ||
          e.code === "ArrowRight" ||
          e.code === "ArrowDown"
        ) {
          this.column_.editRender.props.arrowOption(
            this.row_,
            this.rowIndex_,
            this.property,
            e.code
          );
          return;
        }
        let v = e.target.value;
        if (!v || v === ".") {
          this.value = undefined;
        }
        if (e.key === "-") {
          const oldValue = this.row_[this.property];
          if (isNaN(XEUtils.toNumber(v))) {
            return (this.value = "-");
          } else {
            if (XEUtils.toNumber(v) === 0 && oldValue == 0) {
              return (this.value = "-");
            } else if (XEUtils.toNumber(v) > 0) {
              this.value = "-" + XEUtils.toNumber(v);
            } else {
              this.value = Math.abs(XEUtils.toNumber(v));
            }
          }
          if (v == "-") {
            if (oldValue > 0) {
              this.value = "-" + XEUtils.toNumber(oldValue);
            } else {
              this.value = Math.abs(XEUtils.toNumber(oldValue));
            }
            this.updateRowInfo(this.value);
          }

          this.$nextTick(() => {
            this.$refs["editEle"].select();
          });
        }
        if (
          e.target.value &&
          0 < e.target.value.indexOf(".") &&
          e.target.value.indexOf(".") <= e.target.value.length - 2
        ) {
          this.value = e.target.value.slice(0, e.target.value.indexOf(".") + 3);
          //不可以return
        }
        //按下等号, 填写当前焦点,清空对方金额, 使得借贷平衡
        if (e.key === "=") {
          this.makeEqualBalance();
          this.$nextTick(() => {
            this.$refs["editEle"].select();
          });
        }
        if (e.code === "Space") {
          this.spaceOpt = true;
          const oldEntry = { ...this.row_ };
          const property = this.property === DR ? CR : DR;
          const temp = this.row_[this.property];
          this.row_[this.property] = this.row_[property];
          this.row_[property] = temp;
          this.column_.editRender.props.switchCrDr(
            this.row_,
            oldEntry,
            this.rowIndex_,
            property
          );
        }
        if (e.key === "j" && e.ctrlKey && !e.altKey) {
          this.calcVisible = true;
        }
      },
      /**
       * 	按下等号, 填写当前焦点,清空对方金额, 使得借贷平衡
       */
      makeEqualBalance() {
        let drTotalAmount = 0,
          crTotalAmount = 0,
          cloneRow = { ...this.row_ };

        this.tableData.forEach((o, i) => {
          drTotalAmount += XEUtils.toNumber(o[DR]) || 0;
          crTotalAmount += XEUtils.toNumber(o[CR]) || 0;
        });
        let cr_ = XEUtils.toNumber(cloneRow[CR]),
          dr_ = XEUtils.toNumber(cloneRow[DR]),
          differAmount = drTotalAmount - crTotalAmount;

        if (this.property === DR) {
          //借方
          cloneRow[DR] = (dr_ - differAmount).toFixed(2);
          cloneRow[CR] = (0).toFixed(2);
        } else if (this.property === CR) {
          //贷方
          cloneRow[DR] = (0).toFixed(2);
          cloneRow[CR] = (cr_ + differAmount).toFixed(2);
        }
        this.value = cloneRow[this.property];
        this.updateRowInfo(this.value, cloneRow);
      },
      updateRowInfo(v, cloneRow = null) {
        if (!cloneRow) {
          cloneRow = { ...this.row_ };
        }
        if (v === "0") v = undefined;
        if (this.property === DR) {
          cloneRow[DR] = v || undefined;
          cloneRow[CR] = v ? undefined : cloneRow[CR];
        } else {
          cloneRow[CR] = v || undefined;
          cloneRow[DR] = v ? undefined : cloneRow[DR];
        }
        this.column_.editRender.props.changeCb(
          cloneRow,
          this.rowIndex_,
          this.property
        );
      },
    },
    created() {
      this.init();
    },
    mounted() {
      this.$refs["editEle"].focus();
      this.$refs["editEle"].select();
      if (this.row_[DR] === "0") this.row_[DR] = undefined;
      if (this.row_[CR] === "0") this.row_[CR] = undefined;
      if (!this.row_[DR] && !this.row_[CR]) {
      }
    },
  };
</script>

<style lang="scss">
  .money-cell-edit {
    position: relative;
    height: 48px;
    line-height: 48px;

    .el-input {
      width: 100%;

      .el-input__inner {
        padding-right: 30px;
        text-align: right;
      }
    }
    .money-calculator {
      position: absolute;
      right: 5px;
      top: 3px;
      .calculator-btn {
        padding: 0px;
        font-size: 20px;
      }
    }
    .money-input {
      font-size: 18px;
      font-family: "Microsoft Yahei", "Helvetica Neue", Helvetica, Arial,
        sans-serif;
      color: #333;
      min-height: 100%;
    }
  }
</style>
