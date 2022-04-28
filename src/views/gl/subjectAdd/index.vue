<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="编码规则">
        <span>{{ renderAccountRule() }}</span>
      </el-form-item>
      <el-form-item
        label="科目属性:"
        prop="accountTypeId"
        v-show="visibleAccountType()"
      >
        <el-select v-model="form.accountTypeId">
          <el-option
            v-for="item in other.propertyList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
            :title="item.name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="科目编码:" prop="code">
        <el-input v-model="form.code">
          <template slot="prepend" v-if="other.active !== 'addPrimarySubject'">
            {{ other.addonBefore }}
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="科目名称:" prop="name">
        <el-input
          v-model="form.name"
          :disabled="disabledState('name')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="上级科目:"
        prop="subjectId"
        v-if="
          other.codeAndName !== null && other.active !== 'addPrimarySubject'
        "
      >
        <el-select
          v-model="form.subjectId"
          v-if="other.active === 'certificate' || other.active === 'archives'"
        >
          <el-option
            v-for="item in other.subjectList"
            :key="item.id"
            :value="item.id"
            :label="item.codeAndName"
            :title="item.codeAndName"
          ></el-option>
        </el-select>
        <span v-else class="parentSubject">{{ other.codeAndName }}</span>
      </el-form-item>
      <el-form-item label="科目方向">
        <el-radio-group
          v-model="form.balanceDirection"
          :disabled="subjectDirectionDisabled()"
        >
          <el-radio :label="0">借</el-radio>
          <el-radio :label="1">贷</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="辅助核算" class="calcOption-item">
        <el-checkbox
          name="isCalc"
          v-model="form.isCalc"
          :disabled="disabledState('isCalc')"
        ></el-checkbox>
        <el-form-item v-if="form.isCalc" prop="calc">
          <!-- <el-checkbox-group v-model="other.calcOption"> -->
          <el-checkbox
            v-for="item in other.newCalcDict"
            :key="item.key"
            :label="item.name"
            name="type"
            :disabled="disabledState(item.name)"
            v-model="form[item.name]"
          >
            {{ item.title }}
          </el-checkbox>
          <!-- </el-checkbox-group> -->
        </el-form-item>
      </el-form-item>
      <el-form-item label="数量核算" class="calcQuantity-item">
        <el-checkbox
          name="isCalcQuantity"
          v-model="form.isCalcQuantity"
        ></el-checkbox>
        <el-form-item label="计量单位" v-if="form.isCalcQuantity">
          <el-select v-model="form.unitId">
            <el-option
              v-for="item in other.unitList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form-item>
      <el-form-item label="外币核算" class="calcMulti-item">
        <el-checkbox
          name="isCalcMulti"
          v-model="form.isCalcMulti"
        ></el-checkbox>
        <el-form-item label="默认币种" v-if="form.isCalcMulti">
          <el-select v-model="form.currencyId">
            <el-option
              v-for="item in other.currencyList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form-item>
      <el-form-item label="停用">
        <el-checkbox name="isEnable" v-model="form.isNotEnable"></el-checkbox>
      </el-form-item>
      <el-form-item style="text-align: right">
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="档案明细选择"
      :visible.sync="showSubjectArchives"
      class="addSubject-dialog"
      v-if="showSubjectArchives"
      append-to-body
    >
      <subject-archives
        @subjectArchives-set="subjectArchivesSetting"
        :subjectArchivesProps="subjectArchivesProps"
      ></subject-archives>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAccountTypeList,
  findSonListByPCodeList,
  findFirstUnusedCode,
  getSonListByPidList,
  createRevenueAccount,
  createRevenueAccountForArrival,
  afterOperateTargetGlAccount,
  findGradeOneCode,
  canModifyAccountType,
  setAccountGrade,
  getAccountGrade,
  getSyncBA,
  createSubject,
  isUsedInCertificate,
  updateSubject,
  getById,
  quertSubjects,
  queryCurrency,
  queryUnit,
} from "@/api/gl/gl_accountingSubject";
import * as consts from "@/utils/consts.js";
import SubjectArchives from "../component/subjectArchives";
export default {
  props: {
    subjectAddProps: Object,
  },
  components: {
    SubjectArchives,
  },
  data() {
    return {
      form: {
        // subjectName: "",
        subjectId: "",
        accountTypeId: "",
        measurementUnit: "",
        currencyId: 1,
        unitId: 1,
        isCalc: true,
        type: [],
        name: "",
        code: "",
        gradeName: "",
        balanceDirection: 0,
        isCalc: false,
        isCalcDepartment: false,
        isCalcPerson: false,
        isCalcCustomer: false,
        isCalcSupplier: false,
        isCalcProject: false,
        isCalcInventory: false,
        isCalcBankAccount: false,
        isCalcQuantity: false,
        isCalcMulti: false,
        unitName: "",
        currencyName: "",
        isNotEnable: false,
        isExCalc1: false,
        isExCalc2: false,
        isExCalc3: false,
        isExCalc4: false,
        isExCalc5: false,
        isExCalc6: false,
        isExCalc7: false,
        isExCalc8: false,
        isExCalc9: false,
        isExCalc10: false,
        isSystem: false,
        isEndNode: true,
        canDisabledQuantity: true,
        canDisabledMulti: true,
      },
      other: {
        active: this.subjectAddProps.active,
        calcOption: [],
        calcDict: [],
        subjectList: [],
        accountRule: {
          grade1: 4,
          grade2: 2,
          grade3: 2,
          grade4: 2,
          grade5: 2,
        },
        isUsed: false, //是否已使用
        // unitList: [],	//计量单位可选项
        // currencyList: [],	//外币核算可选项
        isExist: false,
        superiorSubject: [],
        isDisplayAuxAcc: true, //辅助核算项是否显示
        isDisplayBankAccountAux: false, //银行账号辅助核算是否显示
        codeAndName: null,
        multiUnit: true,
        canModifyAccountType: false,
      },
      rules: {
        subjectId: [
          {
            required:
              this.subjectAddProps.active === "certificate" ||
              this.subjectAddProps.active === "archives"
                ? true
                : false,
            trigger: "blur",
            message: "上级科目不能为空",
          },
        ],
        accountTypeId: [
          { required: true, trigger: "blur", message: "科目属性不能为空" },
        ],
        code: [{ required: true, trigger: "blur", message: "编码不能为空" }],
        name: [{ required: true, trigger: "blur", message: "名称不能为空" }],
        // calc: [{ required: true, trigger: "blur", validator: this.checkAge}],
      },
      auxAccMap: {},
      calcDictShow: false,
      showSubjectArchives: false,
      subjectArchivesProps: {},
    };
  },
  computed: {
    "form.isEnable": function () {
      return !this.form.isNotEnable;
    },
  },
  watch: {
    "other.calcOption": {
      handler: function (newVal, oldVal) {
        if (newVal != oldVal) {
          newVal.forEach((item) => {
            this.$set(this.form, item, true);
          });
        }
      },
      deep: true,
    },
  },
  methods: {
    subjectDirectionDisabled() {
      let subject = this.form;
      let { isUsed, codeAndName, active, oldSubject } = this.other;
      let status = false;
      if (active == "edit") {
        if (!subject.isEndNode) {
          status = false;
        } else {
          if (isUsed) {
            status = true;
          }
        }
      } else {
        if (oldSubject) {
          if (isUsed && oldSubject.isEndNode) {
            status = true;
          } else if (!oldSubject.isEndNode) {
            status = false;
          }
        } else {
          status = false;
        }
      }
      return status;
    },
    disabledState(title) {
      let subject = this.form;
      let { isUsed, codeAndName, active, oldSubject } = this.other,
        status = false;
      if (active == "edit") {
        if (!subject.isEndNode) {
          // 非末级科目：辅助核算不可修改；
          // let disabled = ['isCalc','isCalcDepartment','isCalcPerson','isCalcCustomer','isCalcSupplier','isCalcInventory','isCalcProject','isCalcBankAccount','isCalcQuantity','unitId','isCalcMulti','currencyId','isEnable','isExCalc1','isExCalc2','isExCalc3','isExCalc4','isExCalc5','isExCalc6','isExCalc7','isExCalc8','isExCalc9','isExCalc10']
          // if(disabled.indexOf(title) >= 0){
          // 	status = true
          // }

          //非末级科目-预置科目
          if (subject.isSystem) {
            // 	//6.3【预置】的科目：【科目名称】不允许修改；
            if (title == "name") {
              // status = true
              if (
                codeAndName == "1002  银行存款" ||
                codeAndName == "1002 银行存款"
              ) {
                status = false;
              }
            }
          }
          //末级科目
        } else if (subject.isEndNode) {
          //6.6 所有的末级科目，都可以修改【停用】标识；
          if (subject.isSystem) {
            //末级科目-预制科目
            //6.3【预置】的科目：【科目编码、科目名称、余额方向】不允许修改；
            let disabled = ["code", "name", "balanceDirection"];

            if (title == "name") {
              // status = true
              if (
                codeAndName == "1002  银行存款" ||
                codeAndName == "1002 银行存款"
              ) {
                status = false;
              }
            }
            //末级科目-预制科目-已经使用的科目
            if (isUsed) {
              // 6.2已经使用的科目：
              // 科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
              // 科目名称：允许修改，同一上级的科目名称不能重复；
              // 【余额方向】不允许修改；
              // 【辅助核算】不允许取消，允许启用新的辅助核算项；
              // 【数量核算】属性不允许修改；允许修改计量单位；（前提是启用了数量核算）
              // 【外币核算】属性不允许修改；允许修改默认币种；（前提是启用了外币核算）

              let disabled = [
                "isCalc",
                "isCalcDepartment",
                "isCalcPerson",
                "isCalcInventory",
                "isCalcCustomer",
                "isCalcSupplier",
                "isCalcProject",
                "isCalcBankAccount",
                "isCalcQuantity",
                "isCalcMulti",
                "isExCalc1",
                "isExCalc2",
                "isExCalc3",
                "isExCalc4",
                "isExCalc5",
                "isExCalc6",
                "isExCalc7",
                "isExCalc8",
                "isExCalc9",
                "isExCalc10",
              ];
              if (disabled.indexOf(title) >= 0) {
                status = oldSubject[title];
              }
              //
            } else {
              //末级科目-预制科目-未使用的科目
              //6.4【预置】并且【未使用】的【末级】科目：【辅助外币、数量核算、外币核算】允许修改；
            }
          } else {
            //末级科目-非预制科目

            //末级科目-非预制科目-已经使用的科目
            if (isUsed) {
              // 6.2已经使用的科目：
              // 科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
              // 科目名称：允许修改，同一上级的科目名称不能重复；
              // 【余额方向】不允许修改；
              // 【辅助核算】不允许取消，允许启用新的辅助核算项；
              // 【数量核算】属性不允许修改；允许修改计量单位；（前提是启用了数量核算）
              // 【外币核算】属性不允许修改；允许修改默认币种；（前提是启用了外币核算）

              let disabled = [
                "isCalc",
                "isCalcDepartment",
                "isCalcPerson",
                "isCalcInventory",
                "isCalcCustomer",
                "isCalcSupplier",
                "isCalcProject",
                "isCalcBankAccount",
                ,
                "isExCalc1",
                "isExCalc2",
                "isExCalc3",
                "isExCalc4",
                "isExCalc5",
                "isExCalc6",
                "isExCalc7",
                "isExCalc8",
                "isExCalc9",
                "isExCalc10",
              ];
              if (disabled.indexOf(title) >= 0) {
                status = oldSubject[title];
              }

              //末级科目-非预制科目-未使用的科目
            } else {
              //6.5 【非预置】并且【未使用】的【末级】科目：
              //科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
              //科目名称：允许修改，同一上级的科目名称不能重复；
              //其它数据项可以随意修改；
            }
          }
        }
      } else {
        if (oldSubject) {
          if (isUsed && oldSubject.isEndNode) {
            let disabled = [
              "isCalc",
              "isCalcDepartment",
              "isCalcPerson",
              "isCalcInventory",
              "isCalcCustomer",
              "isCalcSupplier",
              "isCalcProject",
              "isCalcBankAccount",
              ,
              "isExCalc1",
              "isExCalc2",
              "isExCalc3",
              "isExCalc4",
              "isExCalc5",
              "isExCalc6",
              "isExCalc7",
              "isExCalc8",
              "isExCalc9",
              "isExCalc10",
            ];
            if (disabled.indexOf(title) >= 0) {
              status = true;
            }
          } else if (!oldSubject.isEndNode) {
            status = false;
          }
        } else {
          status = false;
        }
      }
      return status;
    },
    async subjectArchivesSetting(result) {
      if (result) {
        let form = { ...this.form };
        let oldSubject = { ...this.other.oldSubject };
        let newCalc = this.subjectArchivesProps.newCalc;
        this.auxAccMap = result;
        // console.log(newCalc)
        // newCalc.forEach((item) => {
        //   form[item] = true
        //   oldSubject[item] = true
        // })

        // console.log(oldSubject)
        // this.form = form
        // this.$set(this.other, "oldSubject", oldSubject)
        this.showSubjectArchives = false;
        // this.onSubmit()
      } else {
        this.showSubjectArchives = false;
      }
    },
    checkAge(rule, value, callback) {
      console.log(rule, value, callback);
    },
    onSubmit() {
      this.$refs["form"].validate(async (valid) => {
        if (valid) {
          const { createRevenueAccount = false } = this.subjectAddProps;
          let other = { ...this.other };
          let form = { ...this.form },
            { isCalcQuantity, isCalcMulti, unitId, currencyId, isCalc } = form,
            {
              unitList,
              currencyList,
              oldSubject,
              isUsed,
              calcDict,
              active,
            } = other,
            result = {};
          //数量或者外币有选中值时改变对应name值
          if (isCalcQuantity && unitId) {
            let item = unitList.filter((o) => o && o.id == unitId);
            form.unitName = item[0].name;
          }
          if (isCalcMulti && currencyId) {
            let item = currencyList.filter((o) => o && o.id == currencyId);
            form.currencyName = item[0].name;
          }
          let checkCalc = undefined;
          let checkStyle = {
            textAlign: "left",
            display: "inline-block",
            verticalAlign: "top",
          };
          if (form.isCalc) {
            let isCalcList = Object.keys(calcDict),
              select = isCalcList.filter((i) => {
                if (form[i]) return i;
              });
            checkCalc = this.checkCalc(select);
          }
          if (checkCalc) {
            this.$baseMessage(
              <div style={checkStyle}>
                {checkCalc ? (
                  <p style={{ marginBottom: "0" }}>{checkCalc}</p>
                ) : null}
              </div>,
              "warning"
            );
            return false;
          }
          if (isCalcQuantity && !unitId) {
            this.$baseMessage(
              <div style={checkStyle}>
                <p style={{ marginBottom: "0" }}>请选择计量单位</p>
              </div>,
              "warning"
            );
            return false;
          }
          if (isCalcMulti && !currencyId) {
            this.$baseMessage(
              <div style={checkStyle}>
                <p style={{ marginBottom: "0" }}>请选择默认币种</p>
              </div>,
              "warning"
            );
            return false;
          }
          form.name = form.name.trim();
          form.code = form.code.trim();
          if (
            active === "certificate" ||
            active === "add" ||
            active === "archives" ||
            active === "addPrimarySubject"
          ) {
            delete form.ts;
            delete form.orgId;
            delete form.exchangeRate;
            delete form.AuxAccCalcInfo;
            delete form.helpCode;
            delete form.gradeName;
            delete form.id;
            delete form.codeAndName;
          }
          if (!form.isCalcMulti) {
            form.currencyId = null;
          }
          if (!form.isCalcQuantity) {
            form.unitId = null;
          }
          //判断辅助核算是否开启
          if (!oldSubject) {
            //
            if (form.isCalc == false) {
              let isCalcList = Object.keys(calcDict);
              for (let i in isCalcList) {
                form[isCalcList[i]] = false;
              }
            }
          } else {
            if (oldSubject.isCalc != form.isCalc && form.isCalc == false) {
              let isCalcList = Object.keys(calcDict);
              for (let i in isCalcList) {
                form[isCalcList[i]] = false;
              }
            } else if (isUsed) {
              if (active === "edit") {
                let isCalcList = Object.keys(calcDict),
                  newCalc = [];
                if (!form.isCalc) {
                  let isCalcList = Object.keys(calcDict);
                  for (let i in isCalcList) {
                    form[isCalcList[i]] = false;
                  }
                } else {
                  for (let i in isCalcList) {
                    if (
                      oldSubject[isCalcList[i]] != form[isCalcList[i]] &&
                      form[isCalcList[i]]
                    ) {
                      newCalc.push(isCalcList[i]);
                    }
                  }
                }

                //已使用科目新增辅助核算;
                if (newCalc.length != 0 && form.isEndNode) {
                  result.auxAccMap = {};
                  this.showSubjectArchives = true;
                  this.subjectArchivesProps = {
                    calcDict: calcDict,
                    newCalc: newCalc,
                  };

                  result.auxAccMap = this.auxAccMap;
                }
              }
            }
            if (oldSubject.isEndNode && active !== "edit" && isUsed) {
              this.$confirm(
                "新增下级科目，原科目的历史数据将会结转至新增的下级科目。此操作不能恢复，是否继续？",
                "新增科目",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  customClass: "addSubject-confirm",
                }
              )
                .then(async () => {
                  if (active == "add") {
                    let {
                      code,
                      accountTypeId,
                      grade,
                      id,
                      cashTypeId,
                    } = oldSubject;
                    form.code = code + form.code;
                    form.accountTypeId = accountTypeId ? accountTypeId : null;
                    form.grade = grade + 1;
                    form.cashTypeId = cashTypeId ? cashTypeId : null;
                    form.parentId = id ? id : null;
                    form.isEndNode = true;
                    if (!form.isCalcMulti) {
                      form.currencyId = null;
                    }
                    if (!form.isCalcQuantity) {
                      form.unitId = null;
                    }
                    let tip = "",
                      isSyncBaseArchive;
                    if (
                      (form.code && form.code.slice(0, 4) == "1122") ||
                      (form.code && form.code.slice(0, 4) == "2202")
                    ) {
                      const res = await getSyncBA(form);
                      if (
                        res.value.isParentEndNode &&
                        res.value.hasRelationRecord
                      ) {
                        tip = `注：原创建${
                          form.code.slice(0, 4) == "1122"
                            ? "客户档案"
                            : "供应商档案"
                        }内的${
                          form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                        }科目变为非末级，请档案内对应科目。`;
                      }
                      if (res.value.hasSameNameBaseArchive) {
                        this.$confirm(
                          `${
                            form.code.slice(0, 4) == "1122"
                              ? "客户档案"
                              : "供应商档案"
                          }有与此科目名称相同的档案，是否关联同名${
                            form.code.slice(0, 4) == "1122"
                              ? "客户档案"
                              : "供应商档案"
                          }内的${
                            form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                          }科目?${tip}`,
                          "提示",
                          {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            customClass: "addSubject-confirm",
                            callback: (action, instance) =>
                              this.confirmCallback(
                                action,
                                instance,
                                form,
                                res.value
                              ),
                          }
                        );
                      } else {
                        this.$confirm(
                          `是否生成同名${
                            form.code.slice(0, 4) == "1122"
                              ? "客户档案"
                              : "供应商档案"
                          }，并关联${
                            form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                          }科目?${tip}`,
                          "提示",
                          {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            type: "warning",
                            customClass: "addSubject-confirm",
                            callback: (action, instance) =>
                              this.confirmCallback(
                                action,
                                instance,
                                form,
                                res.value
                              ),
                          }
                        );
                      }
                    } else {
                      let response;
                      if (createRevenueAccount === true) {
                        response = await createRevenueAccount(form);
                      } else if (createRevenueAccount === null) {
                        response = await createRevenueAccountForArrival(form);
                      } else {
                        response = await createSubject(form);
                      }

                      if (response && response.result) {
                        if (this.subjectAddProps.item) {
                          await this.afterOperateDataModal({
                            ...this.subjectAddProps.item,
                            operateType: "0",
                          });
                        }
                        this.$baseMessage("新增会计科目成功", "success");
                        this.$emit("subject-add", "submit", response.value);
                      }
                    }
                  } else if (active == "archives") {
                    if (
                      (form.code && form.code.slice(0, 4) == "1122") ||
                      (form.code && form.code.slice(0, 4) == "2202")
                    ) {
                      const res = await getSyncBA(form);
                      form.syncBaseArchiveDto = {
                        hasSameNameBaseArchive: false,
                        isParentEndNode: false,
                        hasRelationRecord: false,
                        isSyncBaseArchive: false,
                      };
                    }
                    let response;
                    if (createRevenueAccount === true) {
                      response = await createRevenueAccount(form);
                    } else if (createRevenueAccount === null) {
                      response = await createRevenueAccountForArrival(form);
                    } else {
                      response = await createSubject(form);
                    }

                    if (response && response.result) {
                      if (this.subjectAddProps.item) {
                        await this.afterOperateDataModal({
                          ...this.subjectAddProps.item,
                          operateType: "0",
                          isReturnValue: true,
                        });
                      }
                      this.$baseMessage("新增会计科目成功", "success");
                      this.$emit("subject-add", "submit", response.value);
                    }
                  }
                })
                .catch(() => {
                  return false;
                });
            }
          }

          result.form = form;
          if (!form.isCalc) {
            let isCalcList = Object.keys(calcDict);
            for (let i in isCalcList) {
              form[isCalcList[i]] = false;
            }
          }
          if (active === "edit") {
            debugger;
            let code =
              oldSubject.code.length > 4
                ? oldSubject.code.slice(
                    0,
                    oldSubject["code"].length - this.form.code.length
                  ) + this.form.code
                : form.code;
            form.code = code;
            let isEndNode = form.isEndNode;
            let option = { glAccountDto: form, purpose: 1, isUpdateSelf: 1 };
            let aProps = Object.getOwnPropertyNames(oldSubject);
            let bProps = Object.getOwnPropertyNames(form);
            let isEqual = { name: true, otherProperty: true };
            if (oldSubject["name"] == form["name"]) {
              isEqual.name = true;
            } else {
              isEqual.name = false;
            }
            for (let i = 0; i < aProps.length; i++) {
              let propName = aProps[i];
              if (propName != "name") {
                if (oldSubject[propName] !== form[propName]) {
                  isEqual.otherProperty = false;
                  break;
                }
              }
            }
            console.log(isEqual)
            if (isEqual.name == false && isEqual.otherProperty == true) {
              //仅仅修改科目名称，只提示名称，不提示同步下级
              this.$confirm("此科目已存在历史数据，确认是否修改？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "addSubject-confirm",
              })
                .then(async () => {
                  form.name = form.name;
                  if (
                    result.hasOwnProperty("auxAccMap") &&
                    Object.keys(result.auxAccMap).length != 0
                  ) {
                    option.auxAccMap = result.auxAccMap;
                  }
                  if (
                    result.hasOwnProperty("auxAccMap") &&
                    Object.keys(result.auxAccMap).length == 0
                  ) {
                    return false;
                  }
                  let newUnitName;
                  if (unitId) {
                    let unitList = this.other.unitList && this.other.unitList;
                    newUnitName = unitList.find((item) => item.id == unitId);
                  }

                  let tipMsgQuantity;
                  let newValue,
                    isUpdateCertificateByUnit = false;
                  //修改了计量单位
                  if (isUsed == true && oldSubject.isCalcQuantity == true) {
                    //已生成凭证
                    if (
                      newUnitName &&
                      newUnitName.name !== oldSubject.unitName
                    ) {
                      //启用了数量辅助核算
                      tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                      this.$confirm(tipMsgQuantity, "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                        customClass: "addSubject-confirm",
                      })
                        .then(async () => {
                          isUpdateCertificateByUnit = true;
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        })
                        .catch(async () => {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        });
                    }
                  } else {
                    option.auxAccMap = this.auxAccMap;
                    option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                    const response = await updateSubject(option);
                    if (response && response.result) {
                      if (
                        !!response.value.errMsgs &&
                        !!response.value.errMsgs[0]
                      ) {
                        this.$baseMessage(
                          this.getMessage(response.value.errMsgs),
                          "warning"
                        );
                      }
                      this.$emit("subject-add", "submit", response.value);
                      this.$baseMessage("更新会计科目成功", "success");
                    }
                  }
                })
                .catch(async () => {
                  if (
                    result.hasOwnProperty("auxAccMap") &&
                    Object.keys(result.auxAccMap).length != 0
                  ) {
                    option.auxAccMap = result.auxAccMap;
                  }
                  if (
                    result.hasOwnProperty("auxAccMap") &&
                    Object.keys(result.auxAccMap).length == 0
                  ) {
                    return false;
                  }
                  let newUnitName;
                  if (unitId) {
                    let unitList = this.other.unitList && this.other.unitList;
                    newUnitName = unitList.find((item) => item.id == unitId);
                  }

                  let tipMsgQuantity;
                  let newValue,
                    isUpdateCertificateByUnit = false;
                  //修改了计量单位
                  if (isUsed == true && oldSubject.isCalcQuantity == true) {
                    //已生成凭证
                    if (
                      newUnitName &&
                      newUnitName.name !== oldSubject.unitName
                    ) {
                      //启用了数量辅助核算
                      tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                      this.$confirm(tipMsgQuantity, "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                        customClass: "addSubject-confirm",
                      })
                        .then(async () => {
                          isUpdateCertificateByUnit = true;
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        })
                        .catch(async () => {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        });
                    }
                  } else {
                    option.auxAccMap = this.auxAccMap;
                    option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                    const response = await updateSubject(option);
                    if (response && response.result) {
                      if (
                        !!response.value.errMsgs &&
                        !!response.value.errMsgs[0]
                      ) {
                        this.$baseMessage(
                          this.getMessage(response.value.errMsgs),
                          "warning"
                        );
                      }
                      this.$emit("subject-add", "submit", response.value);
                      this.$baseMessage("更新会计科目成功", "success");
                    }
                  }
                });
            } else if (
              (isEqual.name == true && isEqual.otherProperty == false) ||
              (isEqual.name == true && isEqual.otherProperty == true)
            ) {
              if (!isEndNode) {
                this.$confirm("是否同步所有下级科目？", "提示", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  customClass: "addSubject-confirm",
                })
                  .then(async () => {
                    option.isUpdateSelf = 0;
                    if (
                      result.hasOwnProperty("auxAccMap") &&
                      Object.keys(result.auxAccMap).length != 0
                    ) {
                      option.auxAccMap = result.auxAccMap;
                    }
                    if (
                      result.hasOwnProperty("auxAccMap") &&
                      Object.keys(result.auxAccMap).length == 0
                    ) {
                      return false;
                    }
                    let newUnitName;
                    if (unitId) {
                      let unitList = this.other.unitList && this.other.unitList;
                      newUnitName = unitList.find((item) => item.id == unitId);
                    }

                    let tipMsgQuantity;
                    let newValue,
                      isUpdateCertificateByUnit = false;
                    //修改了计量单位
                    if (isUsed == true && oldSubject.isCalcQuantity == true) {
                      //已生成凭证
                      if (
                        newUnitName &&
                        newUnitName.name !== oldSubject.unitName
                      ) {
                        //启用了数量辅助核算
                        tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                        this.$confirm(tipMsgQuantity, "提示", {
                          confirmButtonText: "确定",
                          cancelButtonText: "取消",
                          type: "warning",
                          customClass: "addSubject-confirm",
                        })
                          .then(async () => {
                            option.auxAccMap = this.auxAccMap;
                            isUpdateCertificateByUnit = true;
                            option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                            const response = await updateSubject(option);
                            if (response && response.result) {
                              if (
                                !!response.value.errMsgs &&
                                !!response.value.errMsgs[0]
                              ) {
                                this.$baseMessage(
                                  this.getMessage(response.value.errMsgs),
                                  "warning"
                                );
                              }
                              this.$emit(
                                "subject-add",
                                "submit",
                                response.value
                              );
                              this.$baseMessage("更新会计科目成功", "success");
                            }
                          })
                          .catch(async () => {
                            option.auxAccMap = this.auxAccMap;
                            option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                            const response = await updateSubject(option);
                            if (response && response.result) {
                              if (
                                !!response.value.errMsgs &&
                                !!response.value.errMsgs[0]
                              ) {
                                this.$baseMessage(
                                  this.getMessage(response.value.errMsgs),
                                  "warning"
                                );
                              }
                              this.$emit(
                                "subject-add",
                                "submit",
                                response.value
                              );
                              this.$baseMessage("更新会计科目成功", "success");
                            }
                          });
                      }
                    } else {
                      option.auxAccMap = this.auxAccMap;
                      option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                      const response = await updateSubject(option);
                      if (response && response.result) {
                        if (
                          !!response.value.errMsgs &&
                          !!response.value.errMsgs[0]
                        ) {
                          this.$baseMessage(
                            this.getMessage(response.value.errMsgs),
                            "warning"
                          );
                        }
                        this.$emit("subject-add", "submit", response.value);
                        this.$baseMessage("更新会计科目成功", "success");
                      }
                    }
                  })
                  .catch(async () => {
                    if (
                      result.hasOwnProperty("auxAccMap") &&
                      Object.keys(result.auxAccMap).length != 0
                    ) {
                      option.auxAccMap = result.auxAccMap;
                    }
                    if (
                      result.hasOwnProperty("auxAccMap") &&
                      Object.keys(result.auxAccMap).length == 0
                    ) {
                      return false;
                    }
                    let newUnitName;
                    if (unitId) {
                      let unitList = this.other.unitList && this.other.unitList;
                      newUnitName = unitList.find((item) => item.id == unitId);
                    }

                    let tipMsgQuantity;
                    let newValue,
                      isUpdateCertificateByUnit = false;
                    //修改了计量单位
                    if (isUsed == true && oldSubject.isCalcQuantity == true) {
                      //已生成凭证
                      if (
                        newUnitName &&
                        newUnitName.name !== oldSubject.unitName
                      ) {
                        //启用了数量辅助核算
                        tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                        this.$confirm(tipMsgQuantity, "提示", {
                          confirmButtonText: "确定",
                          cancelButtonText: "取消",
                          type: "warning",
                          customClass: "addSubject-confirm",
                        })
                          .then(async () => {
                            isUpdateCertificateByUnit = true;
                            option.auxAccMap = this.auxAccMap;
                            option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                            const response = await updateSubject(option);
                            if (response && response.result) {
                              if (
                                !!response.value.errMsgs &&
                                !!response.value.errMsgs[0]
                              ) {
                                this.$baseMessage(
                                  this.getMessage(response.value.errMsgs),
                                  "warning"
                                );
                              }
                              this.$emit(
                                "subject-add",
                                "submit",
                                response.value
                              );
                              this.$baseMessage("更新会计科目成功", "success");
                            }
                          })
                          .catch(async () => {
                            option.auxAccMap = this.auxAccMap;
                            option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                            const response = await updateSubject(option);
                            if (response && response.result) {
                              if (
                                !!response.value.errMsgs &&
                                !!response.value.errMsgs[0]
                              ) {
                                this.$baseMessage(
                                  this.getMessage(response.value.errMsgs),
                                  "warning"
                                );
                              }
                              this.$emit(
                                "subject-add",
                                "submit",
                                response.value
                              );
                              this.$baseMessage("更新会计科目成功", "success");
                            }
                          });
                      }
                    } else {
                      option.auxAccMap = this.auxAccMap;
                      option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                      const response = await updateSubject(option);
                      if (response && response.result) {
                        if (
                          !!response.value.errMsgs &&
                          !!response.value.errMsgs[0]
                        ) {
                          this.$baseMessage(
                            this.getMessage(response.value.errMsgs),
                            "warning"
                          );
                        }
                        this.$emit("subject-add", "submit", response.value);
                        this.$baseMessage("更新会计科目成功", "success");
                      }
                    }
                  });
              } else {
                if (
                  result.hasOwnProperty("auxAccMap") &&
                  Object.keys(result.auxAccMap).length == 0
                ) {
                  return false;
                }
                let newUnitName;
                if (unitId) {
                  let unitList = this.other.unitList && this.other.unitList;
                  newUnitName = unitList.find((item) => item.id == unitId);
                }

                let tipMsgQuantity;
                let newValue,
                  isUpdateCertificateByUnit = false;
                //修改了计量单位
                if (isUsed == true && oldSubject.isCalcQuantity == true) {
                  //已生成凭证
                  if (newUnitName && newUnitName.name !== oldSubject.unitName) {
                    //启用了数量辅助核算
                    tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                    this.$confirm(tipMsgQuantity, "提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消",
                      type: "warning",
                      customClass: "addSubject-confirm",
                    })
                      .then(async () => {
                        option.auxAccMap = this.auxAccMap;
                        isUpdateCertificateByUnit = true;
                        option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                        const response = await updateSubject(option);
                        if (response && response.result) {
                          if (
                            !!response.value.errMsgs &&
                            !!response.value.errMsgs[0]
                          ) {
                            this.$baseMessage(
                              this.getMessage(response.value.errMsgs),
                              "warning"
                            );
                          }
                          this.$emit("subject-add", "submit", response.value);
                          this.$baseMessage("更新会计科目成功", "success");
                        }
                      })
                      .catch(async () => {
                        option.auxAccMap = this.auxAccMap;
                        option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                        const response = await updateSubject(option);
                        if (response && response.result) {
                          if (
                            !!response.value.errMsgs &&
                            !!response.value.errMsgs[0]
                          ) {
                            this.$baseMessage(
                              this.getMessage(response.value.errMsgs),
                              "warning"
                            );
                          }
                          this.$emit("subject-add", "submit", response.value);
                          this.$baseMessage("更新会计科目成功", "success");
                        }
                      });
                  }else{
                     option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                        const response = await updateSubject(option);
                        if (response && response.result) {
                          if (
                            !!response.value.errMsgs &&
                            !!response.value.errMsgs[0]
                          ) {
                            this.$baseMessage(
                              this.getMessage(response.value.errMsgs),
                              "warning"
                            );
                          }
                          this.$emit("subject-add", "submit", response.value);
                          this.$baseMessage("更新会计科目成功", "success");
                        }
                  }
                } else {
                  option.auxAccMap = this.auxAccMap;
                  option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                  const response = await updateSubject(option);
                  if (response && response.result) {
                    if (
                      !!response.value.errMsgs &&
                      !!response.value.errMsgs[0]
                    ) {
                      this.$baseMessage(
                        this.getMessage(response.value.errMsgs),
                        "warning"
                      );
                    }
                    this.$emit("subject-add", "submit", response.value);
                    this.$baseMessage("更新会计科目成功", "success");
                  }
                }
              }
            } else if (
              isEqual.name == false &&
              isEqual.otherProperty == false
            ) {
              //名称和别的属性都做了修改
              this.$confirm("此科目已存在历史数据，确认是否修改？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "addSubject-confirm",
              })
                .then(async () => {
                  if (!isEndNode) {
                    this.$confirm("是否同步下级科目？", "提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消",
                      type: "warning",
                      customClass: "addSubject-confirm",
                    })
                      .then(async () => {
                        option.isUpdateSelf = 0;
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length != 0
                        ) {
                          option.auxAccMap = result.auxAccMap;
                        }
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length == 0
                        ) {
                          return false;
                        }
                        let newUnitName;
                        if (unitId) {
                          let unitList =
                            this.other.unitList && this.other.unitList;
                          newUnitName = unitList.find(
                            (item) => item.id == unitId
                          );
                        }

                        let tipMsgQuantity;
                        let newValue,
                          isUpdateCertificateByUnit = false;
                        //修改了计量单位
                        if (
                          isUsed == true &&
                          oldSubject.isCalcQuantity == true
                        ) {
                          //已生成凭证
                          if (
                            newUnitName &&
                            newUnitName.name !== oldSubject.unitName
                          ) {
                            //启用了数量辅助核算
                            tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                            this.$confirm(tipMsgQuantity, "提示", {
                              confirmButtonText: "确定",
                              cancelButtonText: "取消",
                              type: "warning",
                              customClass: "addSubject-confirm",
                            })
                              .then(async () => {
                                isUpdateCertificateByUnit = true;
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              })
                              .catch(async () => {
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              });
                          }
                        } else {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        }
                      })
                      .catch(async () => {
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length != 0
                        ) {
                          option.auxAccMap = result.auxAccMap;
                        }
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length == 0
                        ) {
                          return false;
                        }
                        let newUnitName;
                        if (unitId) {
                          let unitList =
                            this.other.unitList && this.other.unitList;
                          newUnitName = unitList.find(
                            (item) => item.id == unitId
                          );
                        }

                        let tipMsgQuantity;
                        let newValue,
                          isUpdateCertificateByUnit = false;
                        //修改了计量单位
                        if (
                          isUsed == true &&
                          oldSubject.isCalcQuantity == true
                        ) {
                          //已生成凭证
                          if (
                            newUnitName &&
                            newUnitName.name !== oldSubject.unitName
                          ) {
                            //启用了数量辅助核算
                            tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                            this.$confirm(tipMsgQuantity, "提示", {
                              confirmButtonText: "确定",
                              cancelButtonText: "取消",
                              type: "warning",
                              customClass: "addSubject-confirm",
                            })
                              .then(async () => {
                                isUpdateCertificateByUnit = true;
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              })
                              .catch(async () => {
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              });
                          }
                        } else {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        }
                      });
                  }else{
                    if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length != 0
                        ) {
                          option.auxAccMap = result.auxAccMap;
                        }
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length == 0
                        ) {
                          return false;
                        }
                        let newUnitName;
                        if (unitId) {
                          let unitList =
                            this.other.unitList && this.other.unitList;
                          newUnitName = unitList.find(
                            (item) => item.id == unitId
                          );
                        }

                        let tipMsgQuantity;
                        let newValue,
                          isUpdateCertificateByUnit = false;
                        //修改了计量单位
                        if (
                          isUsed == true &&
                          oldSubject.isCalcQuantity == true
                        ) {
                          //已生成凭证
                          if (
                            newUnitName &&
                            newUnitName.name !== oldSubject.unitName
                          ) {
                            //启用了数量辅助核算
                            tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                            this.$confirm(tipMsgQuantity, "提示", {
                              confirmButtonText: "确定",
                              cancelButtonText: "取消",
                              type: "warning",
                              customClass: "addSubject-confirm",
                            })
                              .then(async () => {
                                isUpdateCertificateByUnit = true;
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              })
                              .catch(async () => {
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              });
                          }
                        } else {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        }
                  }
                })
                .catch(async () => {
                  form.name = form.name;
                  if (!isEndNode) {
                    this.$confirm("是否同步下级科目？", "提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消",
                      type: "warning",
                      customClass: "addSubject-confirm",
                    })
                      .then(async () => {
                        option.isUpdateSelf = 0;
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length != 0
                        ) {
                          option.auxAccMap = result.auxAccMap;
                        }
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length == 0
                        ) {
                          return false;
                        }
                        let newUnitName;
                        if (unitId) {
                          let unitList =
                            this.other.unitList && this.other.unitList;
                          newUnitName = unitList.find(
                            (item) => item.id == unitId
                          );
                        }

                        let tipMsgQuantity;
                        let newValue,
                          isUpdateCertificateByUnit = false;
                        //修改了计量单位
                        if (
                          isUsed == true &&
                          oldSubject.isCalcQuantity == true
                        ) {
                          //已生成凭证
                          if (
                            newUnitName &&
                            newUnitName.name !== oldSubject.unitName
                          ) {
                            //启用了数量辅助核算
                            tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                            this.$confirm(tipMsgQuantity, "提示", {
                              confirmButtonText: "确定",
                              cancelButtonText: "取消",
                              type: "warning",
                              customClass: "addSubject-confirm",
                            })
                              .then(async () => {
                                isUpdateCertificateByUnit = true;
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              })
                              .catch(async () => {
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              });
                          }
                        } else {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        }
                      })
                      .catch(async () => {
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length != 0
                        ) {
                          option.auxAccMap = result.auxAccMap;
                        }
                        if (
                          result.hasOwnProperty("auxAccMap") &&
                          Object.keys(result.auxAccMap).length == 0
                        ) {
                          return false;
                        }
                        let newUnitName;
                        if (unitId) {
                          let unitList =
                            this.other.unitList && this.other.unitList;
                          newUnitName = unitList.find(
                            (item) => item.id == unitId
                          );
                        }

                        let tipMsgQuantity;
                        let newValue,
                          isUpdateCertificateByUnit = false;
                        //修改了计量单位
                        if (
                          isUsed == true &&
                          oldSubject.isCalcQuantity == true
                        ) {
                          //已生成凭证
                          if (
                            newUnitName &&
                            newUnitName.name !== oldSubject.unitName
                          ) {
                            //启用了数量辅助核算
                            tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`;
                            this.$confirm(tipMsgQuantity, "提示", {
                              confirmButtonText: "确定",
                              cancelButtonText: "取消",
                              type: "warning",
                              customClass: "addSubject-confirm",
                            })
                              .then(async () => {
                                isUpdateCertificateByUnit = true;
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              })
                              .catch(async () => {
                                option.auxAccMap = this.auxAccMap;
                                option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                                const response = await updateSubject(option);
                                if (response && response.result) {
                                  if (
                                    !!response.value.errMsgs &&
                                    !!response.value.errMsgs[0]
                                  ) {
                                    this.$baseMessage(
                                      this.getMessage(response.value.errMsgs),
                                      "warning"
                                    );
                                  }
                                  this.$baseMessage(
                                    "更新会计科目成功",
                                    "success"
                                  );
                                  this.$emit(
                                    "subject-add",
                                    "submit",
                                    response.value
                                  );
                                }
                              });
                          }
                        } else {
                          option.auxAccMap = this.auxAccMap;
                          option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit;
                          const response = await updateSubject(option);
                          if (response && response.result) {
                            if (
                              !!response.value.errMsgs &&
                              !!response.value.errMsgs[0]
                            ) {
                              this.$baseMessage(
                                this.getMessage(response.value.errMsgs),
                                "warning"
                              );
                            }
                            this.$emit("subject-add", "submit", response.value);
                            this.$baseMessage("更新会计科目成功", "success");
                          }
                        }
                      });
                  }
                });
            } else if (isEqual.name == true && isEqual.otherProperty == true) {
            }
          } else if (active == "add") {
            let { code, accountTypeId, grade, id, cashTypeId } = oldSubject;
            form.code = code + form.code;
            form.accountTypeId = accountTypeId ? accountTypeId : null;
            form.grade = grade + 1;
            form.cashTypeId = cashTypeId ? cashTypeId : null;
            form.parentId = id ? id : null;
            form.isEndNode = true;
            if (!form.isCalcMulti) {
              form.currencyId = null;
            }
            if (!form.isCalcQuantity) {
              form.unitId = null;
            }
            let tip = "",
              isSyncBaseArchive;
            if (
              (form.code && form.code.slice(0, 4) == "1122") ||
              (form.code && form.code.slice(0, 4) == "2202")
            ) {
              const res = await getSyncBA(form);
              if (res.value.isParentEndNode && res.value.hasRelationRecord) {
                tip = `注：原创建${
                  form.code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                }内的${
                  form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                }科目变为非末级，请档案内对应科目。`;
              }
              if (res.value.hasSameNameBaseArchive) {
                this.$confirm(
                  `${
                    form.code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }有与此科目名称相同的档案，是否关联同名${
                    form.code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }内的${
                    form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                  }科目?${tip}`,
                  "提示",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    customClass: "addSubject-confirm",
                    callback: (action, instance) =>
                      this.confirmCallback(action, instance, form, res.value),
                  }
                );
                // .then(() => {
                //   isSyncBaseArchive = true;
                // })
                // .catch(() => {
                //   isSyncBaseArchive = false;
                // });
              } else {
                this.$confirm(
                  `是否生成同名${
                    form.code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }，并关联${
                    form.code.slice(0, 4) == "1122" ? "应收" : "应付"
                  }科目?${tip}`,
                  "提示",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    customClass: "addSubject-confirm",
                    callback: (action, instance) =>
                      this.confirmCallback(action, instance, form, res.value),
                  }
                );
                // .then(() => {
                //   isSyncBaseArchive = true;
                // })
                // .catch(() => {
                //   isSyncBaseArchive = false;
                // });
              }
            } else {
              let response;
              if (createRevenueAccount === true) {
                response = await createRevenueAccount(form);
              } else if (createRevenueAccount === null) {
                response = await createRevenueAccountForArrival(form);
              } else {
                response = await createSubject(form);
              }

              if (response && response.result) {
                if (this.subjectAddProps.item) {
                  await this.afterOperateDataModal({
                    ...this.subjectAddProps.item,
                    operateType: "0",
                  });
                }
                this.$baseMessage("新增会计科目成功", "success");
                this.$emit("subject-add", "submit", response.value);
              }
            }
          } else if (active == "archives") {
            if (
              (form.code && form.code.slice(0, 4) == "1122") ||
              (form.code && form.code.slice(0, 4) == "2202")
            ) {
              const res = await getSyncBA(form);
              form.syncBaseArchiveDto = {
                hasSameNameBaseArchive: false,
                isParentEndNode: false,
                hasRelationRecord: false,
                isSyncBaseArchive: false,
              };
            }
            let response;
            if (createRevenueAccount === true) {
              response = await createRevenueAccount(form);
            } else if (createRevenueAccount === null) {
              response = await createRevenueAccountForArrival(form);
            } else {
              response = await createSubject(form);
            }

            if (response && response.result) {
              if (this.subjectAddProps.item) {
                await this.afterOperateDataModal({
                  ...this.subjectAddProps.item,
                  operateType: "0",
                  isReturnValue: true,
                });
              }
              this.$baseMessage("新增会计科目成功", "success");
              this.$emit("subject-add", "submit", response.value);
            }
          } else if (active == "addPrimarySubject") {
            form.accountTypeId = form.accountTypeId ? form.accountTypeId : null;
            form.grade = 1;
            form.cashTypeId = form.cashTypeId ? form.cashTypeId : "5000020004";
            form.parentId = form.id ? form.id : null;
            form.isEndNode = true;
            if (!form.isCalcMulti) {
              form.currencyId = null;
            }
            if (!form.isCalcQuantity) {
              form.unitId = null;
            }
            let response;
            if (createRevenueAccount === true) {
              response = await createRevenueAccount(form);
            } else if (createRevenueAccount === null) {
              response = await createRevenueAccountForArrival(form);
            } else {
              response = await createSubject(form);
            }
            if (response && response.result) {
              if (this.subjectAddProps.item) {
                await this.afterOperateDataModal({
                  ...this.subjectAddProps.item,
                  operateType: "0",
                  isReturnValue: true,
                });
              }
              this.$baseMessage("新增会计科目成功", "success");
              // if (this.subjectAddProps.type == 'importData') {
              // 	let str = <div>
              // 		<span style={{ fontSize: '13px' }}>新增一级科目，请在导账完成后在【财务核算】-【报表】内报表自定义公式功能内调整对应科目的报表公式，避免报表出现错误</span>
              // 	</div>

              // 	const ret2 = await this.metaAction.modal('show', {
              // 		height: 285,
              // 		width: 320,
              // 		title: '提示',
              // 		okText: '关闭',
              // 		closeModal: this.close,
              // 		closeBack: (back) => { this.closeTip = back },
              // 		// closable: false,
              // 		wrapClassName: 'initcomplete-tip',
              // 		children: str
              // 	})
              // } else {
              this.$alert(this.getContent(response.value), "提示", {
                confirmButtonText: "确定",
                // cancelButtonText: null,
                type: "warning",
                // customClass: "delDocConfirm",
              }).then(() => {
                this.$emit("subject-add", "submit", response.value);
              });
            }
          }
        } else {
          return false;
        }
      });
    },
    onCancel() {
      this.$emit("subject-add", "cancel");
    },
    getContent(content) {
      return (
        <div>
          <span>新增一级科目后，请在 </span>
          <a>报表自定义公式功能</a>
          <span> 内调整对应科目的报表公式，避免报表出现错误</span>
        </div>
      );
    },
    async confirmCallback(action, instance, form, res) {
      if (action === "confirm") {
        form.syncBaseArchiveDto = {
          hasSameNameBaseArchive: res.hasSameNameBaseArchive,
          isParentEndNode: res.isParentEndNode,
          hasRelationRecord: res.hasRelationRecord,
          isSyncBaseArchive: true,
        };
        let response;
        if (createRevenueAccount === true) {
          response = await createRevenueAccount(form);
        } else if (createRevenueAccount === null) {
          response = await createRevenueAccountForArrival(form);
        } else {
          response = await createSubject(form);
        }

        if (response && response.result) {
          if (this.subjectAddProps.item) {
            await this.afterOperateDataModal({
              ...this.subjectAddProps.item,
              operateType: "0",
            });
          }
          this.$baseMessage("新增会计科目成功", "success");
          this.$emit("subject-add", "submit", response.value);
        }
      } else if (action === "cancel") {
        form.syncBaseArchiveDto = {
          hasSameNameBaseArchive: res.hasSameNameBaseArchive,
          isParentEndNode: res.isParentEndNode,
          hasRelationRecord: res.hasRelationRecord,
          isSyncBaseArchive: false,
        };
        let response;
        if (createRevenueAccount === true) {
          response = await createRevenueAccount(form);
        } else if (createRevenueAccount === null) {
          response = await createRevenueAccountForArrival(form);
        } else {
          response = await createSubject(form);
        }

        if (response && response.result) {
          if (this.subjectAddProps.item) {
            await this.afterOperateDataModal({
              ...this.subjectAddProps.item,
              operateType: "0",
            });
          }
          this.$baseMessage("新增会计科目成功", "success");
          this.$emit("subject-add", "submit", response.value);
        }
      }
    },
    async afterOperateDataModal(param) {
      let afterOperateData;
      let importdata;
      importdata = await afterOperateTargetGlAccount(param);
      if (importdata && importdata.error) {
        return;
      }
      if (importdata && importdata.value.status == false) {
        this.$confirm(importdata.value.errMessage, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          customClass: "addSubject-confirm",
        })
          .then(async () => {
            await this.afterOperateDataModal({
              ...this.component.props.item,
              operateType: "0",
              newGradeSetting: importdata.value.newGradeSetting,
              isReturnValue: true,
            });
          })
          .catch(async () => {
            await this.afterOperateDataModal({
              ...this.component.props.item,
              operateType: "0",
              isIgnoreNoEnoughCode: true,
              isReturnValue: true,
            });
          });
        // const importRet = await this.metaAction.modal('show', {
        // 	title: '设置',
        // 	children: (
        // 		<div >
        // 			{importdata.errMessage}
        // 		</div>
        // 	),
        // 	cancelText: '取消',
        // 	okText: '确定',
        // 	width: 400,
        // 	height: 250
        // })
        // if (importRet) {

        // 	// do {
        // 	await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', newGradeSetting: importdata.newGradeSetting, isReturnValue: true })
        // 	// } while (importdata && importdata.status == false)
        // } else {

        // 	// do {
        // 	await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', isIgnoreNoEnoughCode: true, isReturnValue: true })
        // 	// } while (importdata && importdata.status == false)
        // }
      }
    },
    getMessage(message) {
      message = message.split("<br>");
      return (
        <div>
          {message.map((o, i) => {
            return <div>{o}</div>;
          })}
        </div>
      );
    },
    checkCalc(select) {
      let message;
      if (select.length == 0) message = "请选择辅助核算";
      return message;
    },
    renderAccountRule() {
      return this.other.accountRule.gradeStr;
    },
    visibleAccountType() {
      let form = this.form,
        active = this.other.active;
      if (active == "addPrimarySubject") {
        //新增一级科目
        return true;
      } else {
        if (
          active == "add" ||
          active == "certificate" ||
          active == "archives"
        ) {
          //新增下级科目
          return false;
        } else {
          if (form.isSystem == false && form.grade == 1) {
            return true;
          } else {
            return false;
          }
        }
      }
    },
    async init() {
      let { active } = this.other;
      let newData = { form: { ...this.form }, other: { ...this.other } };
      let subjectAddProps = this.subjectAddProps;
      let { data } = subjectAddProps;
      let canModifyAccountType = true;
      let accountRule;
      let list = [
        "isCalcCustomer",
        "isCalcSupplier",
        "isCalcProject",
        "isCalcDepartment",
        "isCalcPerson",
        "isCalcInventory",
        "isExCalc1",
        "isExCalc2",
        "isExCalc3",
        "isExCalc4",
        "isExCalc5",
        "isExCalc6",
        "isExCalc7",
        "isExCalc8",
        "isExCalc9",
        "isExCalc10",
      ];
      let newCalcDict = [];
      let unitList = await queryUnit({});
      let currencyList = await queryCurrency({});
      if (unitList && unitList.result)
        newData.other.unitList = unitList.value.list;
      if (currencyList && currencyList.result)
        newData.other.currencyList = currencyList.value.list;
      if (
        active === "certificate" ||
        active === "archives" ||
        active === "addPrimarySubject"
      ) {
        let response,
          sonListByPidList =
            subjectAddProps.initData &&
            subjectAddProps.initData.sonListByPidList,
          sonListByPcodeList =
            subjectAddProps.initData &&
            subjectAddProps.initData.sonListByPcodeList,
          onlyEndNode =
            subjectAddProps.initData && subjectAddProps.initData.isOnlyEndNode,
          isEnable =
            subjectAddProps.initData && subjectAddProps.initData.isEnable;
        if (sonListByPidList) {
        } else if (sonListByPcodeList) {
        } else {
          response = await quertSubjects({});
          if (active == "addPrimarySubject") {
            //新增和编辑一级科目时调用此接口
            let gradeOneCode = await findGradeOneCode();
            newData.form.code = gradeOneCode.value;
            newData.form.isEnable = true;
          }
          if (response && response.result) {
            accountRule = response.value.gradeSetting;
            newData.other.subjectList = response.value.glAccounts;
            // newData.other.accountRule = response.value.gradeSetting;
            newData.other.calcDict = response.value.calcDict;

            for (let i in list) {
              if (newData.other.calcDict[list[i]]) {
                newCalcDict.push({
                  name: list[i],
                  title: newData.other.calcDict[list[i]],
                  check: newData.form[list[i]],
                });
              }
            }
            newData.other.newCalcDict = newCalcDict;
            // this.form = newData.form;
            // this.other = newData.other;
            //   let calcList = [];
            //   for (let item in response.value.calcDict) {
            //     calcList.push({
            //       key: item,
            //       name: response.value.calcDict[item],
            //     });
            //   }
            //   this.$set(this.other, "calcDict", calcList)
          }
        }
      } else if (active !== "addPrimarySubject") {
        let oldSubject = await getById({ id: data.id });
        let isUsed = await isUsedInCertificate({ id: data.id });
        let accountRuleRes = await getAccountGrade();
        oldSubject = oldSubject.value;
        isUsed = isUsed.value;
        accountRule = accountRuleRes.value;
        newData.form = { ...oldSubject.glAccount };
        newData.other.oldSubject = { ...oldSubject.glAccount };
        newData.other.calcDict = { ...oldSubject.calcDict };
        for (let i in list) {
          if (newData.other.calcDict[list[i]]) {
            newCalcDict.push({
              name: list[i],
              title: newData.other.calcDict[list[i]],
              check: newData.form[list[i]],
            });
          }
        }
        newData.other.newCalcDict = newCalcDict;
        let {
            code,
            codeAndName,
            isCalcMulti,
            isCalcQuantity,
            cashTypeId,
            grade,
            currencyId,
          } = newData.form,
          isDisplayAuxAcc = !(
            cashTypeId == consts.otherConsts.CASHTYPE_001 ||
            cashTypeId == consts.otherConsts.CASHTYPE_003
          ),
          isDisplayBankAccountAux = false; //【现金】【银行存款】的科目不显示辅助核算
        if (active === "edit") {
          newData.form.code =
            code.length > 4
              ? oldSubject["glAccount"][
                  `codeGrade${oldSubject.glAccount.grade}`
                ]
              : code;
          newData.other.addonBefore =
            code.length > 4
              ? code.slice(
                  0,
                  oldSubject.glAccount.code.length -
                    oldSubject["glAccount"][
                      `codeGrade${oldSubject.glAccount.grade}`
                    ].length
                )
              : "";
          newData.other.isUsed = isUsed;
          newData.other.active = active;
          newData.other.codeAndName = subjectAddProps.parentSubject.codeAndName;
          newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux;
          if (!data.isEndNode) {
            newData.form.canDisabledMulti = true;
            newData.form.canDisabledQuantity = true;
          }
        } else if (active === "add") {
          //code初始值
          newData.form.code = subjectAddProps.newCode;
          newData.form.isSystem = false;
          newData.form.isEndNode = true;
          newData.form.gradeName = "";
          newData.form.name = "";
          newData.other.codeAndName = codeAndName;
          newData.other.addonBefore = code;
          newData.other.isUsed = isUsed;
          newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux;
          if (data.isEndNode) {
            if (isUsed) {
              //如果科目已使用，新增时辅助核算项、外币、数量全部置灰，不可修改
              newData.form.canDisabledMulti = false;
              newData.form.canDisabledQuantity = false;
            } else {
              newData.form.canDisabledMulti = true;
              newData.form.canDisabledQuantity = true;
            }
          } else {
            newData.form.canDisabledMulti = true;
            newData.form.canDisabledQuantity = true;
          }
        }
        //外币有选中值时判断当前选择外币是否停用，如选中值停用默认显示第一个
        if (isCalcMulti && currencyId) {
          let item = newData.other.currencyList.filter(
            (o) => o && o.id == currencyId
          );
          if (item.length == 0) {
            newData.form.currencyName = newData.other.currencyList[0].name;
            newData.form.currencyId = newData.other.currencyList[0].id;
          }
        }
        let isExist =
            grade > 1
              ? newData.other.addonBefore != ""
                ? newData.other.addonBefore.indexOf("2221")
                : null
              : code
              ? code.indexOf("2221")
              : null,
          multiUnit = cashTypeId == consts.otherConsts.CASHTYPE_005; //是否显示外币核算、计量单位
        newData.other.isExist = isExist == 0 && typeof isExist == "number";
        newData.other.multiUnit = !(
          (isExist == 0 && typeof isExist == "number") ||
          multiUnit
        );
        newData.other.isDisplayAuxAcc =
          isDisplayAuxAcc && !(isExist == 0 && typeof isExist == "number");
      } else if (active === "addPrimarySubject") {
        // let accountRuleRes = await getAccountGrade();
        // accountRule = accountRuleRes.value;
      }
      newData.other.accountRule = accountRule;
      let accountTypeIsVisible = false; //科目属性这一项是否显示
      if (active === "addPrimarySubject") {
        //新增一级科目
        accountTypeIsVisible = true;
      } else {
        if (
          active == "add" ||
          active == "certificate" ||
          active == "archives"
        ) {
          //新增下级科目
          accountTypeIsVisible = false;
        } else {
          if (newData.form.isSystem == false && newData.form.grade == 1) {
            accountTypeIsVisible = true;
          } else {
            accountTypeIsVisible = false;
          }
        }
      }
      if (accountTypeIsVisible) {
        let propertyList = await getAccountTypeList();
        if (data) {
          canModifyAccountType = await canModifyAccountType({ id: data.id });
        }
        newData.other.propertyList = [...propertyList.value];
      }
      newData.other.canModifyAccountType = canModifyAccountType.value;
      this.form = newData.form;
      this.other = newData.other;
    },
  },
  created() {
    this.init();
  },
  mounted() {},
};
</script>

<style lang="scss">
.addSubject-dialog {
  .el-dialog {
    width: 450px;
    .el-form {
      .el-form-item {
        height: 40px;
        margin-bottom: 10px;
        .el-form-item__content {
          .el-form-item__error {
            padding-top: 5px;
            line-height: 8px;
          }
          .el-select {
            width: 100%;
          }
          // height: 100%;
          input {
            height: 30px;
          }
          .parentSubject {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            display: inline-block;
          }
        }
      }
      .calcOption-item {
        height: auto;
        .el-form-item {
          height: auto;
        }
      }
      .calcQuantity-item,
      .calcMulti-item {
        .el-form-item__content {
          display: flex;
        }
      }
    }
  }
}
</style>
