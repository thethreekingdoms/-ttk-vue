<template>
  <div class="subject-show">
    <el-popover
      placement="bottom-start"
      v-model="isAuxPopoverShow"
      trigger="manual"
    >
      <subject-aux-display
        :auxAccountSubjects="auxAccountSubjects_"
        :currentAccount="accountingSubject_"
        :auxOptions="auxOptions"
        @handle-aux-submit="handleAuxSubmit"
        @handle-aux-cancel="handleAuxCancel"
        :isAuxShow="isAuxPopoverShow"
      ></subject-aux-display>
      <div
        slot="reference"
        :class="[isShowBalance ? 'account-showtwo' : 'account-showthree']"
        :style="isCalc ? { width: '94%' } : { width: '100%' }"
        :title="subjectAndAuxName"
      >
        {{ subjectAndAuxName }}
      </div>
      <div slot="reference" class="balancetxt">
        <a @click.stop="handleClick" v-if="isShowBalance">
          <span @click.stop="handleClick">余额 :</span>
          <span
            :style="balance < 0 ? { color: 'red' } : {}"
            @click.stop="handleClick"
          >
            {{ balance.toFixed(2) }}
          </span>
        </a>
        <span v-show="isShowQuantity && this.editStatus_ === 1">
          <span>数量 :</span>
          <span :style="quantity < 0 ? { color: 'red' } : {}">
            {{ quantity.toFixed(6) }}
          </span>
        </span>
      </div>
      <a
        slot="reference"
        v-if="isCalc"
        class="auxlink"
        @click.stop="auxHandleClick"
      >
        辅助项
      </a>
    </el-popover>
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from "vuex";
  import SubjectAuxDisplay from "@/components/Money/subjectAuxDisplay.vue";
  import {
    docGetAllBaseArchives,
    getAccountsBalance,
    getAccountBalance,
  } from "@/api/gl/gl_vouchercard";
  import * as consts from "@/utils/consts.js";
  import XEUtils from "xe-utils/methods/xe-utils";
  import { type } from "os";
  export default {
    props: {
      column_: [String, Object],
      rowIndex_: Number,
      row_: [String, Object],
      editStatus_: Number,
      certificateStatus: Number,
      renderComponent: [String, Boolean],
    },
    components: {
      SubjectAuxDisplay,
    },
    data() {
      return {
        subjectAndAuxName: "",
        property: "",
        accountingSubject_: null,
        auxAccountSubjects_: {},
        isAuxPopoverShow: false,
        isShowBalance: false,
        isShowQuantity: false,
        isCalc: false,
        auxOptions: {},
        balance: 0,
        quantity: 0,
      };
    },
    async created() {     
      this.init();
      await this.showAuxSubject();
    },    
    computed: {
      /**
       * 方式一
       */
      // glAccounts() {
      //   return this.$store.state.gl_vouchercard.glAccounts;
      // },
      // calcDict() {
      //   return this.$store.state.gl_vouchercard.calcDict;
      // },
      // orderAux() {
      //   return this.$store.state.gl_vouchercard.orderAux;
      // },
      /**
       * 方式二
       */
      ...mapState({
        glAccounts: (state) => state.gl_vouchercard.glAccounts,
        calcDict: (state) => state.gl_vouchercard.calcDict,
        orderAux: (state) => state.gl_vouchercard.orderAux,
      }),
    },
    watch: {
      renderComponent: {
        async handler(n, o) {
          if (n !== o) {
            this.init();
            await this.showAuxSubject();
          }
        },
        deep: true,
      },
    },
    methods: {
      init() {
        this.property = this.column_.property;
        this.subjectAndAuxName = this.getSubjectWithAuxName();
      },
      async showAuxSubject(eventKey = "") {
        const {
          accountingSubject,
          quantityAndForeignCurrency,
          amountDr,
          amountCr,
        } = this.row_;
        if (accountingSubject) {
          if (
            (accountingSubject.isCalc &&
              !accountingSubject.activeAuxPopoverList) ||
            eventKey == "showPopover"
          ) {
            await this.getServerAuxOptions();
            //互斥
            this.isAuxPopoverShow = true;
            this.accountingSubject_ = accountingSubject;
          } else {
            this.isShowBalance = accountingSubject.isShowBalance || false;
            this.isCalc = accountingSubject.isCalc || false;
            this.isShowQuantity = accountingSubject.isCalcQuantity || false;
          }
          this.auxAccountSubjects_ =
            accountingSubject.auxAccountSubjects ||
            accountingSubject.activeAuxPopoverList;
          this.balance = XEUtils.toNumber(
            accountingSubject.balance ? accountingSubject.balance : 0
          );
          const entryQuantity = XEUtils.toNumber(
            quantityAndForeignCurrency ? quantityAndForeignCurrency.quantity : 0
          );
          let curQuantity = 0;
          if (entryQuantity && accountingSubject.isCalcQuantity) {
            if (
              (accountingSubject.balanceDirectionName == "借" && amountCr) ||
              (accountingSubject.balanceDirectionName == "贷" && amountDr)
            ) {
              curQuantity = -entryQuantity;
            } else {
              curQuantity = entryQuantity;
            }
          }
          this.quantity =
            XEUtils.toNumber(
              accountingSubject["initBalance"] &&
                accountingSubject["initBalance"].quantity
                ? accountingSubject["initBalance"].quantity
                : 0
            ) + curQuantity;
        } else {
          this.isShowBalance = false;
          this.isShowQuantity = false;
          this.isCalc = false;
        }
      },
      /**
       * 辅助项-确定
       */
      handleAuxSubmit(auxAccountSubjects, auxOptions) {
        const accountingSubject = this.row_.accountingSubject;
        let newAccountingSubject = Object.assign({}, accountingSubject),
          auxTmpData_ = {};
        this.isAuxPopoverShow = false;
        this.isShowBalance = true;
        this.isCalc = true;
        this.isShowQuantity = true;

        newAccountingSubject.auxAccountSubjects = auxAccountSubjects;
        newAccountingSubject.isShowBalance = true;
        newAccountingSubject.isCalc = true;
        this.auxOptions = auxOptions;
        const array = this.calcDict;
        for (const [key, value] of Object.entries(this.calcDict)) {
          const _field =
            `${key}`.toLowerCase().indexOf("excalc") > -1
              ? `${key}`.replace("isExCalc", "exCalc")
              : `${key}`.replace("isCalc", "").toLowerCase();
          if (accountingSubject && accountingSubject[key]) {
            let auxData = {},
              _rsdata;
            if (_field.indexOf("exCalc") > -1) {
              auxData[_field] = auxAccountSubjects[_field];
              _rsdata = auxOptions[`${_field}`].filter(
                (ele) => ele.id == auxAccountSubjects[`${_field}`]
              )[0];
            } else {
              auxData[`${_field}Id`] = auxAccountSubjects[`${_field}Id`];
              _rsdata = auxOptions[`${_field}`].filter(
                (ele) => ele.id == auxAccountSubjects[`${_field}Id`]
              )[0];
            }
            auxData[`${_field}Name`] = _rsdata.name;
            auxData[`categoryHierarchyName`] = _rsdata.categoryHierarchyName;
            if (_field == "inventory") {
              auxData["specification"] = _rsdata["specification"]; //规格型号//规格型号
            }
            auxTmpData_[`${_field}`] = auxData;
          }
        }

        // this.column_.editRender.props.changeAuxSubjects(
        //   newAccountingSubject,
        //   auxTmpData_,
        //   this.rowIndex_,
        //   "submit"
        // );

        this.$emit(
          "changeAuxSubjects",
          newAccountingSubject,
          auxTmpData_,
          this.rowIndex_,
          "submit"
        );

        this.subjectAndAuxName = this.getSubjectWithAuxName();
      },
      /**
       * 辅助项-取消
       */
      handleAuxCancel(auxAccountSubjects, auxOptions) {
        this.isAuxPopoverShow = false;
        // this.column_.editRender.props.changeAuxSubjects(
        //   auxAccountSubjects,
        //   null,
        //   this.rowIndex_,
        //   "cancel"
        // );
        this.$emit(
          "changeAuxSubjects",
          auxAccountSubjects,
          null,
          this.rowIndex_,
          "cancel"
        );
      },
      /**
       * 余额-联查（明细账、辅助明细账）
       */
      async handleClick() {
        // this.column_.editRender.props.clickBalance(this.row_.accountingSubject);
        this.$emit("clickBalance", this.row_.accountingSubject);
      },
      /**
       * 辅助项-超链接
       */
      async auxHandleClick() {
        //互斥、未审核
        if (
          this.certificateStatus == consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
        ) {
          await this.showAuxSubject("showPopover");
        }
      },
      async getServerAuxOptions() {
        const response = await docGetAllBaseArchives({
          isEnable: true,
          includingHierarchyName: true,
        });
        if (response && response.result) {
          await this.setAuxOptions(response.value);
        }
      },
      async setAuxOptions(options) {
        for (const [key, value] of Object.entries(this.calcDict)) {
          const _auxKey =
            `${key}`.toLowerCase().indexOf("excalc") > -1
              ? `${key}`.replace("isExCalc", "exCalc")
              : `${key}`.replace("isCalc", "").toLowerCase();
          if (key.indexOf("isExCalc") != -1) {
            this.auxOptions[_auxKey] = this.getUserdefineDS(options, key);
          } else {
            this.auxOptions[_auxKey] = options[value];
          }
        }
      },
      /**
       * 获取自定义辅助项列表
       */
      getUserdefineDS(allArchiveDS, archiveName) {
        let dsArray = allArchiveDS["自定义档案"],
          userDefineDS = [];
        for (var i = 0; i < dsArray.length; i++) {
          if (dsArray[i].calcName == archiveName) {
            userDefineDS = dsArray[i].userDefineArchiveDataList;
          }
        }
        return userDefineDS;
      },
      /**
       * 辅助项显示 大类、规格型号等
       * 例如：1001 库存现金_一级 / 二级 / A客户_一级部门 / 二级部门 / B部门_一级 / 二级 / A存货（规格型号）进行显示
       */
      getSubjectWithAuxName() {
        const { accountingSubject, auxTmpData_ } = this.row_,
          orderAux = this.orderAux;
        let subjectWithAuxName = "";
        if (!accountingSubject) return subjectWithAuxName;
        subjectWithAuxName = accountingSubject["codeAndName"];
        const auxAccountSubjects =
          accountingSubject.auxAccountSubjects ||
          accountingSubject.activeAuxPopoverList;
        if (!auxAccountSubjects) return subjectWithAuxName;
        for (let index = 0; index < orderAux.length; index++) {
          const key = orderAux[index];
          let _auxKey =
            `${key}`.toLowerCase().indexOf("excalc") > -1
              ? `${key}`.replace("isExCalc", "exCalc")
              : `${key}`.replace("isCalc", "").toLowerCase();
          if (
            (accountingSubject[key] && auxAccountSubjects[`${_auxKey}Id`]) ||
            auxAccountSubjects[`${_auxKey}`]
          ) {
            const categoryHierarchyName =
                auxTmpData_[`${_auxKey}`]["categoryHierarchyName"],
              name = auxTmpData_[`${_auxKey}`][`${_auxKey}Name`];
            if (_auxKey == "project" || _auxKey.indexOf("exCalc") > -1) {
              subjectWithAuxName = `${subjectWithAuxName}_${name}`;
            } else if (_auxKey == "department") {
              //部门分类默认分类是他自己，但是不需要显示
              subjectWithAuxName = `${subjectWithAuxName}_${
                categoryHierarchyName ? categoryHierarchyName : name
              }`;
            } else if (_auxKey == "inventory") {
              const specification = auxTmpData_[`${_auxKey}`]["specification"];
              //存货有规格型号
              subjectWithAuxName = `${subjectWithAuxName}_${
                categoryHierarchyName ? categoryHierarchyName + "/" : ""
              }${name}${specification ? "(" + specification + ")" : ""}`;
            } else {
              subjectWithAuxName = `${subjectWithAuxName}_${
                categoryHierarchyName ? categoryHierarchyName + "/" : ""
              }${name}`;
            }
          }
        }
        return subjectWithAuxName;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .subject-show {
    padding-top: 1px;
    padding-left: 4px;
    width: 100%;
    height: 100%;
    font-size: 13px;
  }
  .account-showtwo {
    color: #333333;
    line-height: 15px;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    max-height: 100%;
    -webkit-line-clamp: 2;
    height: 30px;
    white-space: normal;
  }
  .account-showthree {
    color: #333333;
    line-height: 15px;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    max-height: 100%;
    -webkit-line-clamp: 3;
    height: 47px;
    white-space: normal;
  }
  .balancetxt {
    position: absolute;
    bottom: -1px;
  }
  .linkApp1 {
    cursor: pointer;
    display: inline;
  }
  .auxlink {
    width: 14px;
    display: inline-block;
    line-height: 14px;
    font-size: 12px;
    right: 5px;
    z-index: 9;
    position: absolute;
    top: -10px;
    white-space: pre-wrap;
  }
</style>
