<template>
  <div class="accounting-subject" v-on:keydown.enter="searchKeyDown">
    <div class="subject-header">
      <div class="headerLeft">
        <el-input
          placeholder="请输入编码/名称"
          suffix-icon="el-icon-search"
          v-model="searchValue"
        ></el-input>
      </div>
      <div class="headerRight">
        <el-button
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="addPrimarySubject"
        >
          新增一级科目
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-delete"
          @click="batchDelSubject"
        >
          删除
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-setting"
          @click="setSubjectCode"
        >
          设置
        </el-button>
      </div>
    </div>
    <div class="subject-content">
      <el-tabs v-model="activeName" @tab-click="handleClick" ref="tabs">
        <el-tab-pane
          v-for="item in activeTabList"
          :key="item.key"
          :label="item.label"
          :name="item.key"
        ></el-tab-pane>
      </el-tabs>
      <vxe-table
        border
        highlight-hover-row
        ref="xTable"
        row-id="docId"
        @checkbox-all="selectAllEvent"
        @checkbox-change="selectChangeEvent"
        height="600"
        :align="allAlign"
        show-header-overflow
        header-align="center"
        auto-resize
        show-overflow
        highlight-current-row
      >
        <vxe-table-column
          type="checkbox"
          width="50"
          fixed="left"
        ></vxe-table-column>
        <vxe-table-column
          field="code"
          width="130"
          title="编码"
          :align="getAlign('code')"
        ></vxe-table-column>
        <vxe-table-column
          field="name"
          width="250"
          title="名称"
          :align="getAlign('name')"
        >
          <template v-slot="{ row }">
            <div
              class="name"
              :title="row.name"
              :style="{ paddingLeft: (row.grade - 1) * 12 + 8 + 'px' }"
            >
              {{ row.name }}
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="balanceDirectionName"
          width="60"
          title="方向"
          :align="getAlign('balanceDirectionName')"
        ></vxe-table-column>
        <vxe-table-column
          field="AuxAccCalcInfo"
          width="230"
          title="辅助核算"
          :align="getAlign('isAuxAccProject')"
        ></vxe-table-column>
        <vxe-table-column
          field="currencyName"
          width="100"
          title="外币"
          :align="getAlign('currencyName')"
        ></vxe-table-column>
        <vxe-table-column
          field="unitName"
          width="80"
          title="数量"
          :align="getAlign('unitName')"
        ></vxe-table-column>
        <vxe-table-column
          field="statue"
          width="60"
          title="停用"
          :align="getAlign('statue')"
        >
          <template v-slot="{ row }">
            <div>{{ row.isEnable ? "否" : "是" }}</div>
          </template>
        </vxe-table-column>
        <vxe-table-column field="blank">
          <template v-slot>
            <div></div>
          </template>
        </vxe-table-column>
        <vxe-table-column width="180" title="操作" fixed="right">
          <template v-slot="{ row }">
            <div class="operate">
              <el-link
                type="primary"
                title="新增"
                style="margin-right: 6px"
                @click="() => addSubject(row)"
                :disabled="disabledState(row, 'add')"
              >
                新增
              </el-link>
              <el-link
                type="primary"
                title="批量新增"
                style="margin-right: 6px"
                @click="() => batchAddSubject(row)"
                :disabled="disabledState(row, 'add')"
              >
                批量新增
              </el-link>
              <el-link
                type="primary"
                title="编辑"
                style="margin-right: 6px"
                @click="() => editSubject(row)"
                :disabled="disabledState(row, 'edit')"
              >
                编辑
              </el-link>
              <el-link
                title="删除"
                type="primary"
                @click="() => deleteSubject(row)"
                :disabled="disabledState(row, 'delete')"
              >
                删除
              </el-link>
            </div>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>
    <el-dialog
      title="新增科目"
      :visible.sync="showAddSubject"
      class="addSubject-dialog"
      v-if="showAddSubject"
    >
      <subject-add
        @subject-add="addSubjectSetting"
        :subjectAddProps="subjectAddProps"
      ></subject-add>
    </el-dialog>
    <el-dialog
      title="编码设置"
      :visible.sync="showSubjectCode"
      v-if="showSubjectCode"
    >
      <subjectCode-set
        @subjectCode-set="subjectCodeSetting"
        :subjectCodeProps="subjectCodeProps"
      ></subjectCode-set>
    </el-dialog>
    <el-dialog
      title="删除科目"
      :visible.sync="showDelSubject"
      v-if="showDelSubject"
      class="redDashed-dialog"
    >
      <div style="color: #ff0000; margin-bottom: 10px; font-weight: bold">
        注：删除过程不可逆，删除后数据无法恢复，请谨慎删除
      </div>
      <div style="display: flex">
        <div style="margin-right: 10px">
          删除科目后，原科目的历史数据将会更新至
        </div>
        <el-form ref="delform" :model="form" :rules="rules">
          <el-form-item prop="selectedAccountId">
            <el-select v-model="form.selectedAccountId">
              <el-option
                v-for="item in delData"
                class="infinite-list-item"
                :key="item.id"
                :label="item.codeAndName"
                :value="item.id"
                :title="item.codeAndName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleDelSubject">确 定</el-button>
        <el-button @click="showDelSubject = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="可粘贴科目名称，多个科目请换行"
      :visible.sync="showBatchAddSubject"
      class="batchAddSubject-dialog"
      v-if="showBatchAddSubject"
    >
      <batch-add-subject
        @batchSubject-add="batchAddSubjectSetting"
        :batchsubjectAddProps="batchsubjectAddProps"
      ></batch-add-subject>
    </el-dialog>
  </div>
</template>
<script>
import {
  query,
  findFirstUnusedCode,
  getAccountGrade,
  setAccountGrade,
  getMaxSizeForBatchInsert,
  getSyncBABatch,
  createBatchForSubSyncBA,
  availableDeleteAccounts,
  deleteWithOne,
  checkBeforeDeleteWithBatch,
  deleteWithBatch,
} from "@/api/gl/gl_accountingSubject";
import * as consts from "@/utils/consts.js";
import SubjectAdd from "../subjectAdd/index";
import BatchAddSubject from "../component/batchAddSubject";
import SubjectCodeSet from "../component/subjectCodeSet";
export default {
  name: "accountingSubject",
  components: {
    SubjectAdd,
    BatchAddSubject,
    SubjectCodeSet,
  },
  data() {
    return {
      list: [],
      calcDict: {},
      allAlign: "center",
      gradeSetting: undefined,
      activeName: "all",
      currentView: "all",
      targetKey: null,
      selectRows: [],
      subjectAddProps: {},
      showBatchAddSubject: false,
      showSubjectCode: false,
      showAddSubject: false,
      subjectCodeProps: {},
      batchsubjectAddProps: {},
      selectedAccountId: null,
      showDelSubject: false,
      currentRow: null,
      searchValue: undefined,
      matchIndex: -1,
      matchBacktoZero: true,
      form: {
        selectedAccountId: null,
      },
      rules: {
        selectedAccountId: [
          { required: true, trigger: "blur change", message: "科目不能为空" },
        ],
      },
      tabList: [
        {
          name: "all",
          label: "全部",
          key: "all",
        },
        {
          name: "assets",
          label: "资产",
          key: "5000010001",
        },
        {
          name: "liabilities",
          label: "负债",
          key: "5000010002",
        },
        {
          name: "common",
          label: "共同",
          key: "5000010003",
        },
        {
          name: "rightsInterests",
          label: "权益",
          key: "5000010004",
        },
        {
          name: "cost",
          label: "成本",
          key: "5000010005",
        },
        {
          name: "profitLoss",
          label: "损益",
          key: "5000010006",
        },
        {
          name: "netAssets",
          label: "净资产",
          key: "5000010007",
        },
        {
          name: "income",
          label: "收入",
          key: "5000010008",
        },
        {
          name: "expenses",
          label: "费用",
          key: "500001000",
        },
        {
          name: "budgetrevenue",
          label: "预算收入",
          key: "5000010010",
        },
        {
          name: "budgetexpenditure",
          label: "预算支出",
          key: "5000010011",
        },
        {
          name: "budgetbalance",
          label: "预算结余",
          key: "5000010012",
        },
      ],
    };
  },
  created() {
    this.requestData();
  },
  mounted() {
    // this.requestData();
  },
  computed: {
    activeTabList: function () {
      return this.tabList.filter((item, index) => {
        return this.isTabDisplay(item.name, index);
      });
    },
  },
  methods: {
    disabledState(subject, type) {
      let state = false,
        // btnDisabled = this.metaAction.gf('data.other.btnDisabled'),
        { code, grade, cashTypeId, maxGrade } = subject;
      // if (btnDisabled) {
      //     state = true
      // } else {
      if (type == "add") {
        if (grade >= maxGrade) {
          state = true;
        }
      } else if (type == "delete") {
        if (
          !(
            !(subject.isSystem && !subject.isAllowDel) &&
            subject.isEndNode &&
            subject.isEnable
          )
        ) {
          state = true;
        } else {
          state = false;
        }
      } else {
        state = false;
      }
      // }
      return state;
    },
    searchKeyDown(e) {
      let value;
      if (e.target) {
        value = e.target.value;
      } else {
        value = e;
      }

      let list = [...this.list],
        matchIndex = this.matchIndex,
        matchBacktoZero = this.matchBacktoZero,
        firstMatchIndex = -1,
        aryMatch = [],
        condition = (value && value.trim()) + "";
      if (condition != "") {
        list = list.map((item, index) => {
          // 编码按照左匹配，名称按照模糊匹配
          if (
            item.code.indexOf(condition) == 0 ||
            item.name.indexOf(condition) > -1
          ) {
            aryMatch.push(index);
            if (firstMatchIndex == -1) {
              firstMatchIndex = index;
            }
          }
          return item;
        });
        if (matchBacktoZero) {
          matchIndex = firstMatchIndex;
        } else {
          let aryIndex = aryMatch.findIndex((x) => x > matchIndex);

          if (aryIndex == -1) {
            matchIndex = firstMatchIndex;
          } else {
            matchIndex = parseInt(aryMatch[aryIndex]);
          }
        }
      } else {
        matchIndex = -1;
        matchBacktoZero = true;
      }
      if (matchIndex > -1) {
        this.matchIndex = matchIndex;
        this.matchBacktoZero = false;
        this.$refs.xTable.setCurrentRow(this.list[matchIndex]);
        this.$refs.xTable.scrollToRow(this.list[matchIndex]);
      } else {
        this.matchBacktoZero = true;
        this.matchIndex = -1;
        this.$refs.xTable.clearCurrentRow();
      }
    },
    searchChange(value) {
      if (!value) value = this.searchValue;
      this.searchKeyDown(value);

      // let list = [...this.list],
      //   matchIndex = this.matchIndex,
      //   matchBacktoZero = this.matchBacktoZero,
      //   firstMatchIndex = -1,
      //   aryMatch = [],
      //   condition = (value && value.trim()) + "";
      // if (condition != "") {
      //   list = list.map((item, index) => {
      //     // 编码按照左匹配，名称按照模糊匹配
      //     if (
      //       item.code.indexOf(condition) == 0 ||
      //       item.name.indexOf(condition) > -1
      //     ) {
      //       aryMatch.push(index);
      //       if (firstMatchIndex == -1) {
      //         firstMatchIndex = index;
      //       }
      //     }
      //     return item;
      //   });
      //   if (matchBacktoZero) {
      //     matchIndex = firstMatchIndex;
      //   } else {
      //     let aryIndex = aryMatch.findIndex((x) => x > matchIndex);

      //     if (aryIndex == -1) {
      //       matchIndex = firstMatchIndex;
      //     } else {
      //       matchIndex = parseInt(aryMatch[aryIndex]);
      //     }
      //   }
      // } else {
      //   matchIndex = -1;
      //   matchBacktoZero = true;
      // }
      // if (matchIndex > -1) {
      //   this.matchIndex = matchIndex;
      //   this.matchBacktoZero = false;
      //   this.$refs.xTable.setCurrentRow(this.list[matchIndex]);
      //   this.$refs.xTable.scrollToRow(this.list[matchIndex])
      // } else {
      //   this.matchBacktoZero = true
      //   this.matchIndex = -1
      //   this.$refs.xTable.clearCurrentRow();
      // }
    },
    /**
     * 批量删除科目
     */
    async batchDelSubject() {
      let list = this.list;
      let selectRows = this.selectRows;
      if (selectRows.length === 0) {
        this.$baseMessage("请选择要删除的科目", "warning");
        return;
      }
      let subjectIds = [];
      selectRows.forEach((item) => subjectIds.push(item.id));
      let checkResponse = await checkBeforeDeleteWithBatch({
        accountIds: subjectIds,
      });
      let checkIds = [];
      let hasDataArr = [];
      let noDataArr = [];
      let copyNoDataArr = [...subjectIds];
      let temp01 = [];
      checkResponse = checkResponse.value;
      checkResponse.map((item) => {
        if (item.status == 2) {
          checkIds.push(item.accountId);
        }
      });
      for (let i in checkIds) {
        temp01[checkIds[i]] = true;
        hasDataArr.push(checkIds[i]);
      }
      for (var k in copyNoDataArr) {
        if (!temp01[copyNoDataArr[k]]) {
          noDataArr.push(copyNoDataArr[k]);
        }
      }
      if (hasDataArr.length == 0) {
        //选择的科目是没有数据的
        let delResponse = await deleteWithBatch({
          accountIds: subjectIds,
          isReturnValue: true,
        });
        //判断后端是否删除成功
        if (
          delResponse &&
          delResponse.error &&
          delResponse.error.code == "UsedInTemplateOrGlTable"
        ) {
          //校验通过，可以删除
          this.$confirm(
            this.getMessage(delResponse.error.message),
            "删除科目",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
              customClass: "delSubject-confirm",
            }
          ).then(() => {
            this.$confirm("再次确认是否删除？", "删除科目", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
              customClass: "delSubject-confirm",
            })
              .then(async () => {
                let delResponse1 = await deleteWithBatch({
                  accountIds: subjectIds,
                  confirmFlag: true,
                  isReturnValue: true,
                });
                if (delResponse1 && delResponse1.error) {
                  this.$baseMessage(delResponse1.error.message, "error");
                  this.requestData();
                } else {
                  this.$baseMessage("删除成功", "success");
                  this.requestData();
                }
              })
              .catch(() => {
                return;
              });
          });
        } else {
          this.$baseMessage("删除成功", "success");
          this.requestData();
        }
      } else {
        let selectedSubjectCodes = [];
        //批量选择的科目存在有数据的
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < hasDataArr.length; j++) {
            if (hasDataArr[j] == list[i].id) {
              // this.selectRows = this.selectRows.map(item=>{

              // })
              // list = list.update(i, (item) => item.set("selected", false));
              selectedSubjectCodes.push(list[i]["codeAndName"]);
            }
          }
        }
        this.$alert(this.getTips(selectedSubjectCodes), "提示", {
          confirmButtonText: "确定",
          // cancelButtonText: null,
          type: "warning",
          // customClass: "delDocConfirm",
        }).then(async () => {
          if (noDataArr.length == 0) {
            // this.metaAction.sf("data.list", fromJS(list));
            return;
          }
          let delResponse2 = await deleteWithBatch({
            accountIds: noDataArr,
            isReturnValue: true,
          });
          if (
            delResponse2 &&
            delResponse2.error &&
            delResponse2.error.code == "UsedInTemplateOrGlTable"
          ) {
            this.$confirm(
              this.getMessage(delResponse2.error.message),
              "删除科目",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "delSubject-confirm",
              }
            )
              .then(() => {
                this.$confirm("再次确认是否删除？", "删除科目", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  customClass: "delSubject-confirm",
                })
                  .then(async () => {
                    let delResponse3 = await deleteWithBatch({
                      accountIds: noDataArr,
                      confirmFlag: true,
                      isReturnValue: true,
                    });
                    if (delResponse3 && delResponse3.error) {
                      this.$baseMessage(delResponse3.error.message, "error");
                      // this.metaAction.toast("error", delResponse3.error.message);
                      this.requestData();
                    } else {
                      this.$baseMessage("删除成功", "success");
                      this.requestData();
                    }
                  })
                  .catch(() => {
                    return;
                  });
                // let deleteRes = await this.metaAction.modal("confirm", {
                //   title: "删除科目",
                //   className: "deleteSubjects-modal hasNoDataModal",
                //   content: <div>再次确认是否删除？</div>,
                // });
                // if (deleteRes) {

                // } else {
                //   return;
                // }
              })
              .catch(() => {
                return;
              });
            // const ret3 = await this.metaAction.modal("show", {
            //   title: "提示",
            //   className: "deleteSubjects-modal",
            //   children: this.getMessage(delResponse2.error.message),
            //   cancelText: "取消",
            //   okText: "确定",
            //   width: 400,
            //   height: 250,
            // });
            // if (ret3) {

            // }
          } else {
            this.$baseMessage("删除成功", "success");
            this.requestData();
          }
        });
        // const ret2 = await this.metaAction.modal("show", {
        //   title: "提示",
        //   className: "deleteSubjects-modal",
        //   children: this.getMessage(selectedSubjectCodes),
        //   cancelText: "取消",
        //   okText: "关闭",
        //   width: 500,
        //   // height: 250,
        //   wrapClassName: "delBatchSubjects-modal",
        // });
        // if (noDataArr.length == 0) {
        //   this.metaAction.sf("data.list", fromJS(list));
        //   return;
        // }

        // this.metaAction.sf("data.list", fromJS(list));
      }
    },
    getTips(message) {
      return (
        <div>
          {message.map((item, index) => {
            if (index == message.length - 1) {
              return <div>{item}</div>;
            } else {
              return <div>{item}、</div>;
            }
          })}
          <div>科目已经产生数据，请确认后逐一删除</div>
        </div>
      );
    },
    handleDelSubject() {
      let row = this.currentRow;
      this.$refs["delform"].validate(async (valid) => {
        if (valid) {
          this.$confirm(
            <div>
              <div>此次删除科目将备份账套，此过程可能会占用您少许时间</div>
              <div class="deleteText">
                <i class="el-icon-warning-outline"></i>
                <div style="font-weight: bold">请再次确认删除!</div>
              </div>
            </div>,
            "删除科目",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
              customClass: "delSubject-confirm",
            }
          )
            .then(async () => {
              // this.showDelSubject = false
              let selectedAccountId = this.form.selectedAccountId;
              let hasDataDeleteReponse = await deleteWithOne({
                deleteAccountId: row.id,
                selectedAccountId: selectedAccountId,
                isReturnValue: true,
              });
              if (hasDataDeleteReponse && hasDataDeleteReponse.value == true) {
                this.$baseMessage("删除成功", "success");
                this.requestData();
              } else if (
                hasDataDeleteReponse &&
                hasDataDeleteReponse.error &&
                hasDataDeleteReponse.error.code == "UsedInTemplateOrGlTable"
              ) {
                //删除科目已经在报表公式中使用过或者有凭证模板等，需要提示异常信息进行交互
                this.$confirm(
                  this.delmessage(hasDataDeleteReponse.error.message),
                  "删除科目",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    customClass: "delSubject-confirm",
                  }
                )
                  .then(async () => {
                    let hasDataDeleteReponseFlag = await deleteWithOne({
                      deleteAccountId: row.id,
                      selectedAccountId: selectedAccountId,
                      isReturnValue: true,
                      confirmFlag: true,
                    });
                    if (
                      hasDataDeleteReponseFlag &&
                      hasDataDeleteReponseFlag.value == true
                    ) {
                      this.$baseMessage("删除成功", "success");
                      this.requestData();
                    } else if (
                      hasDataDeleteReponseFlag &&
                      hasDataDeleteReponseFlag.error
                    ) {
                      this.$baseMessage(
                        hasDataDeleteReponseFlag.error.message,
                        "error"
                      );
                      return;
                    }
                  })
                  .catch(() => {
                    return;
                  });
              } else if (
                hasDataDeleteReponse &&
                hasDataDeleteReponse.error &&
                !hasDataDeleteReponse.error.code
              ) {
                this.metaAction.toast(
                  "error",
                  hasDataDeleteReponse.error.message
                );
                this.metaAction.sf("data.other.btnDisabled", false);
                return;
              }
            })
            .catch(() => {
              return;
            });
        } else {
          this.$baseMessage("请按页面提示信息修改信息后才可提交", "error");
          return;
        }
      });
    },
    delmessage(message) {
      message = message.split("<br/>");
      return (
        <div>
          {message.map((o, i) => {
            return <div>{o}</div>;
          })}
        </div>
      );
    },
    handleClick(tab, event) {
      this.targetKey = tab.name;
      setTimeout(() => {
        this.requestData();
      });
    },
    async addPrimarySubject() {
      this.subjectAddProps = {
        active: "addPrimarySubject",
      };
      this.showAddSubject = true;
    },
    async requestData() {
      let targetKey = this.targetKey;
      let response = await query({
        accountTypeId: targetKey === "all" ? null : targetKey,
      });
      let list;
      if (response && response.result) {
        list = [...response.value.glAccounts];
        list = list.map((item) => {
          return this.transSubject(item, response.value.calcDict);
        });
        this.$refs.xTable.reloadData(list);
        this.list = response.value.glAccounts;
        // this.$refs.xTable.setCurrentRow(list[1])
        this.calcDict = { ...response.value.calcDict };
        this.gradeSetting = { ...response.value.gradeSetting };
      }
    },
    getAlign(type) {
      if (
        type === "code" ||
        type === "name" ||
        type === "isAuxAccProject" ||
        type === "unitName" ||
        type === "currencyName"
      ) {
        return "left";
      } else {
        return "center";
      }
    },
    selectAllEvent({ checked, records }) {
      this.selectRows = records;
    },
    selectChangeEvent({ checked, records, row, $rowIndex }) {
      this.selectRows = records;
    },
    isTabDisplay(tabName, index) {
      let { accountingStandards } = this.$store.state.routes.org,
        isDisplay = true;
      if (accountingStandards == consts.otherConsts.ACCOUNTINGSTANDARDS_2007) {
        // 共同 权益 成本 损益
        if (
          tabName == "common" ||
          tabName == "rightsInterests" ||
          tabName == "cost" ||
          tabName == "profitLoss"
        ) {
          isDisplay = true;
          // 净资产 收入 费用 预算收入 预算支出 预算结余
        } else if (
          tabName == "netAssets" ||
          tabName == "income" ||
          tabName == "expenses" ||
          tabName == "budgetrevenue" ||
          tabName == "budgetexpenditure" ||
          tabName == "budgetbalance"
        ) {
          isDisplay = false;
        }
      } else if (
        accountingStandards == consts.otherConsts.ACCOUNTINGSTANDARDS_2013
      ) {
        // 权益 成本 损益
        if (
          tabName == "rightsInterests" ||
          tabName == "cost" ||
          tabName == "profitLoss"
        ) {
          isDisplay = true;
          // 共同 净资产 收入 费用 预算收入 预算支出 预算结余
        } else if (
          tabName == "common" ||
          tabName == "netAssets" ||
          tabName == "income" ||
          tabName == "expenses" ||
          tabName == "budgetrevenue" ||
          tabName == "budgetexpenditure" ||
          tabName == "budgetbalance"
        ) {
          isDisplay = false;
        }
      } else if (
        accountingStandards ==
        consts.otherConsts.ACCOUNTINGSTANDARDS_nonProfitOrganization
      ) {
        // 共同 权益 成本 损益 预算收入 预算支出 预算结余
        if (
          tabName == "common" ||
          tabName == "rightsInterests" ||
          tabName == "cost" ||
          tabName == "profitLoss" ||
          tabName == "budgetrevenue" ||
          tabName == "budgetexpenditure" ||
          tabName == "budgetbalance"
        ) {
          isDisplay = false;
          // 净资产 收入 费用
        } else if (
          tabName == "netAssets" ||
          tabName == "income" ||
          tabName == "expenses"
        ) {
          isDisplay = true;
        }
      } else if (
        accountingStandards ==
        consts.otherConsts.ACCOUNTINGSTANDARDS_causeCompany
      ) {
        if (
          tabName == "common" ||
          tabName == "rightsInterests" ||
          tabName == "cost" ||
          tabName == "profitLoss"
        ) {
          // 共同 权益 成本 损益
          isDisplay = false;
        } else {
          isDisplay = true;
        }
      }
      return isDisplay;
    },
    /**
     * 新增单个科目
     */
    async addSubject(row) {
      let { id, code, grade, cashTypeId, maxGrade } = row;
      let gradeList = this.gradeSetting;
      let gradeArr = Object.keys(gradeList);
      let item = gradeArr.find(
        (item) => `${item}`.charAt(item.length - 1) == grade + 1
      );
      let newCode;
      if (grade === 5) {
        this.$baseMessage("已经是第五级科目，无法再增加下级科目", "warning");
        return;
      }
      if (grade >= maxGrade) {
        return;
      }
      let findFirstUnusedCodeRes = await findFirstUnusedCode({
        id,
        code,
        grade,
      });
      if (findFirstUnusedCodeRes && findFirstUnusedCodeRes.result) {
        newCode = findFirstUnusedCodeRes.value.newCode.substr(code.length);
      } else {
        this.$baseMessage(findFirstUnusedCodeRes.error.message, "error");
        return;
      }
      if (
        findFirstUnusedCodeRes &&
        findFirstUnusedCodeRes.value.newCode == ""
      ) {
        /**
         * //编码长度超过了原编码位数的最大值
         */
        this.$confirm(
          <div>
            {code}科目下级科目编码已经超过了
            {findFirstUnusedCodeRes.value.maxCodeSize9}
            位，请确认是否要增加对应科目级次的编码长度
          </div>,
          "设置",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "addSubject-confirm",
          }
        )
          .then(async () => {
            let gradeResponse = await getAccountGrade();
            if (gradeResponse && gradeResponse.result) {
              gradeResponse = gradeResponse.value;
              gradeResponse[item] += 1;
              let parmas = {
                ...gradeResponse,
                isReturnValue: true,
              };
              const res = await setAccountGrade(parmas);
              if (res) {
                if (res.error && res.error.message) {
                  this.$baseMessage(res.error.message, "error");
                  return false;
                } else {
                  this.$baseMessage("科目编码设置成功", "success");
                  this.requestData();
                }
              }
            }
          })
          .catch(() => {
            return;
          });
      }
      this.subjectAddProps = {
        active: "add",
        newCode: newCode,
        data: row,
      };
      this.showAddSubject = true;
    },
    /**
     * 批量新增科目
     */
    batchAddSubject(row) {
      let { id, code, grade, cashTypeId, maxGrade } = row;
      if (grade === 5) {
        this.$baseMessage("已经是第五级科目，无法再增加下级科目", "warning");
        return;
      }
      if (grade >= maxGrade) {
        return;
      }
      this.showBatchAddSubject = true;
      this.batchsubjectAddProps = {
        parentId: row.id,
        row: row,
      };
    },
    /**
     * 编辑科目
     */
    editSubject(row) {
      this.subjectAddProps = {
        active: "edit",
        data: row,
        parentSubject: this.getParentSubject(this.list, row.parentId),
      };
      this.showAddSubject = true;
    },
    addSubjectSetting(type) {
      if (type === "submit") {
        this.requestData();
      }
      this.showAddSubject = false;
    },
    getParentSubject(subjectList, parentSubjectId) {
      if (!parentSubjectId) {
        return {
          id: null,
          code: "无父级科目",
          name: "",
          codeAndName: null,
          accountTypeId: null,
        };
      }
      let parentSubject = subjectList.filter((subItem) => {
        return parseInt(subItem.id) == parseInt(parentSubjectId);
      });

      let ret;
      if (parentSubject && parentSubject.length > 0)
        ret = {
          id: parentSubject[0].id,
          code: parentSubject[0].code,
          name: parentSubject[0].name,
          codeAndName: parentSubject[0].codeAndName,
          accountTypeId: parentSubject[0].accountTypeId,
        };
      else
        ret = {
          id: null,
          code: "无父级科目",
          name: null,
          codeAndName: null,
          accountTypeId: null,
        };

      return ret;
    },
    async batchAddSubjectSetting(batchData) {
      if (batchData) {
        let { nameList, row } = batchData;
        let { id, code, grade, cashTypeId, maxGrade } = row;
        let option = {
          parentId: id,
          accountNameList: nameList,
        };
        let tip = "",
          isSyncBaseArchive;
        let maxSizeRes = await getMaxSizeForBatchInsert({ id });
        if (maxSizeRes && maxSizeRes.result) {
          if (nameList.length > maxSizeRes.value.maxSize) {
            this.$confirm(
              <div>
                {code}科目下级科目编码已经超过了
                {maxSizeRes.value.maxCodeSize9}
                位，请确认是否要增加对应科目级次的编码长度
              </div>,
              "设置",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "addSubject-confirm",
              }
            )
              .then(async () => {
                let setGradeResponse = await setAccountGrade(
                  maxSizeRes.value.gradeSettingDto
                );
                if (setGradeResponse && setGradeResponse.error) {
                  return;
                }
              })
              .catch(() => {
                if (maxSizeRes.value.maxSize == 0) {
                  return;
                }
              });
          }
          if (code.slice(0, 4) == "1122" || code.slice(0, 4) == "2202") {
            let response = await getSyncBABatch(option);
            if (response && response.result) {
              if (
                response.value.syncBADtoUnExists.isParentEndNode &&
                response.value.syncBADtoUnExists.hasRelationRecord
              ) {
                tip = `注：原创建${
                  code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                }内的${
                  code.slice(0, 4) == "1122" ? "应收" : "应付"
                }科目变为非末级，请档案内对应科目。`;
              }
              if (response.value.nameListUnExists.length !== 0) {
                //无与此下级科目同名称的客户档案
                if (
                  response.value.syncBADtoUnExists.isParentEndNode &&
                  response.value.syncBADtoUnExists.hasRelationRecord
                ) {
                  tip = `注：原创建${
                    code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }内的${
                    code.slice(0, 4) == "1122" ? "应收" : "应付"
                  }科目变为非末级，请档案内对应科目。`;
                }
                this.$confirm(
                  `是否生成同名${
                    code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }
                    ，并关联${code.slice(0, 4) == "1122" ? "应收" : "应付"}
                    科目？${tip}`,
                  "设置",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    customClass: "addSubject-confirm",
                  }
                )
                  .then(async () => {
                    isSyncBaseArchive = true;
                    response.value.syncBADtoExists.isSyncBaseArchive = null;
                    response.value.syncBADtoUnExists.isSyncBaseArchive =
                      isSyncBaseArchive != undefined ? isSyncBaseArchive : null;
                    option.batchSyncBADto = response.value;
                    const res = await createBatchForSubSyncBA(option);
                    if (res && res.result) {
                      this.$baseMessage(
                        this.getMessage(res.value.message),
                        "success"
                      );
                    }
                  })
                  .catch(async () => {
                    isSyncBaseArchive = false;
                    response.value.syncBADtoExists.isSyncBaseArchive = null;
                    response.value.syncBADtoUnExists.isSyncBaseArchive =
                      isSyncBaseArchive != undefined ? isSyncBaseArchive : null;
                    option.batchSyncBADto = response.value;
                    const res = await createBatchForSubSyncBA(option);
                    if (res && res.result) {
                      this.$baseMessage(
                        this.getMessage(res.value.message),
                        "success"
                      );
                    }
                  });
              }
              if (response.value.nameListExists.length !== 0) {
                //有与此下级科目同名称的客户档案
                if (
                  response.value.syncBADtoExists.isParentEndNode &&
                  response.value.syncBADtoExists.hasRelationRecord
                ) {
                  tip = `注：原创建${
                    code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"
                  }内的${
                    code.slice(0, 4) == "1122" ? "应收" : "应付"
                  }科目变为非末级，请档案内对应科目。`;
                }
                this.$confirm(
                  `${code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"}
                    有与此科目名称相同的档案，是否关联同名$
                    {code.slice(0, 4) == "1122" ? "客户档案" : "供应商档案"}
                    内的${code.slice(0, 4) == "1122" ? "应收" : "应付"}科目?$
                    {tip}`,
                  "设置",
                  {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    customClass: "addSubject-confirm",
                  }
                )
                  .then(async () => {
                    isSyncBaseArchive = true;
                    response.value.syncBADtoUnExists.isSyncBaseArchive = null;
                    response.value.syncBADtoExists.isSyncBaseArchive =
                      isSyncBaseArchive != undefined ? isSyncBaseArchive : null;
                    option.batchSyncBADto = response.value;
                    const res = await createBatchForSubSyncBA(option);
                    if (res && res.result) {
                      this.$baseMessage(
                        this.getMessage(res.value.message),
                        "success"
                      );
                    }
                  })
                  .catch(async () => {
                    isSyncBaseArchive = false;
                    response.value.syncBADtoUnExists.isSyncBaseArchive = null;
                    response.value.syncBADtoExists.isSyncBaseArchive =
                      isSyncBaseArchive != undefined ? isSyncBaseArchive : null;
                    option.batchSyncBADto = response.value;
                    const res = await createBatchForSubSyncBA(option);
                    if (res && res.result) {
                      this.$baseMessage(
                        this.getMessage(res.value.message),
                        "success"
                      );
                    }
                  });
              }
            } else {
              this.$baseMessage(response.error.message, "error");
              return;
            }
          } else {
            let response = await createBatchForSubSyncBA(option);
            if (response && response.result) {
              this.$baseMessage(
                this.getMessage(response.value.message),
                "success"
              );
            }
          }
        } else {
          this.$baseMessage(maxSizeRes.error.message, "error");
          return;
        }
        this.showBatchAddSubject = false;
        this.requestData();
      } else {
        this.showBatchAddSubject = false;
      }
    },
    transSubject(subject, calcDict) {
      if (subject.isCalc == true) {
        subject.AuxAccCalcInfo = this.genAuxAccCalcInfo(subject, calcDict);
      }
      subject.balanceDirectionName =
        subject.balanceDirection === 1 ? "贷" : "借";

      return subject;
    },
    genAuxAccCalcInfo(subject, calcDict) {
      let retStr,
        calcDictKeys = [
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
        ],
        value = calcDictKeys.filter((item) => {
          if (subject[item] == true) {
            retStr = retStr
              ? retStr + calcDict[item] + "/"
              : calcDict[item] + "/";
          }
        });

      if (retStr && retStr.endsWith("/")) {
        retStr = retStr.substring(0, retStr.length - 1);
      }

      return retStr;
    },
    getMessage(message) {
      message = message.split("<br/>");
      return (
        <div>
          {message.map((o, i) => {
            return <div>{o}</div>;
          })}
        </div>
      );
    },
    async deleteSubject(row) {
      this.currentRow = row;
      if (
        !(!(row.isSystem && !row.isAllowDel) && row.isEndNode) ||
        !row.isEnable
      )
        return;
      this.btnDisabled = true;
      let deleteAccountsResponse = await availableDeleteAccounts({
        deleteAccountId: row.id,
        isReturnValue: true,
      });
      if (deleteAccountsResponse && deleteAccountsResponse.result) {
        if (deleteAccountsResponse.value.length > 0) {
          this.showDelSubject = true;
          this.delData = deleteAccountsResponse.value;
        } else if (
          deleteAccountsResponse &&
          deleteAccountsResponse.value.length == 0
        ) {
          //无数据
          this.$confirm("确认是否删除？", "删除科目", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "addSubject-confirm",
          })
            .then(() => {
              this.next(row);
            })
            .catch(() => {
              return;
            });
        }
      } else if (
        deleteAccountsResponse &&
        deleteAccountsResponse.result == false
      ) {
        this.$baseMessage("同级科目内找不到相同核算属性的可用科目", "error");
        return;
      }
    },
    async next(row) {
      let noDataDeleteReponse = await deleteWithOne({
        deleteAccountId: row.id,
        isReturnValue: true,
      });
      if (noDataDeleteReponse && noDataDeleteReponse.value == true) {
        this.$baseMessage("删除成功", "success");
        this.requestData();
      } else if (
        noDataDeleteReponse &&
        noDataDeleteReponse.error &&
        noDataDeleteReponse.error.code == "UsedInTemplateOrGlTable"
      ) {
        this.$confirm(
          this.delmessage(noDataDeleteReponse.error.message),
          "删除科目",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "delSubject-confirm",
          }
        )
          .then(async () => {
            let noDataDeleteReponseFlag = await deleteWithOne({
              deleteAccountId: row.id,
              isReturnValue: true,
              confirmFlag: true,
            });
            if (
              noDataDeleteReponseFlag &&
              noDataDeleteReponseFlag.value == true
            ) {
              this.$baseMessage("删除成功", "success");
              this.requestData();
            } else if (
              noDataDeleteReponseFlag &&
              noDataDeleteReponseFlag.error
            ) {
              this.$baseMessage(noDataDeleteReponseFlag.error.message, "error");
              return;
            }
          })
          .catch(() => {
            return;
          });
      } else if (
        noDataDeleteReponse &&
        noDataDeleteReponse.error &&
        !noDataDeleteReponse.error.code
      ) {
        this.metaAction.toast("error", noDataDeleteReponse.error.message);
        this.metaAction.sf("data.other.btnDisabled", false);
        return;
      }
    },
    setSubjectCode() {
      this.showSubjectCode = true;
    },
    async subjectCodeSetting(form) {
      if (form) {
        let response = await setAccountGrade(form);
        if (response && response.error) {
          this.$baseMessage(response.error.message, "error");
          return;
        } else {
          this.$baseMessage("科目编码设置成功", "success");
          this.showSubjectCode = false;
          this.requestData();
        }
      } else {
        this.showSubjectCode = false;
      }
    },
  },
};
</script>
<style lang="scss">
.accounting-subject {
  .addSubject-dialog {
    .el-dialog {
      width: 450px;
    }
  }
  .batchAddSubject-dialog {
    .el-dialog {
      width: 380px;
    }
  }
  .subject-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 8px 0px 8px;
  }
  .subject-content {
    .vxe-table {
      .vxe-table--header-wrapper .vxe-header--row .vxe-header--column {
        text-align: center !important;
        .vxe-cell {
          justify-content: center;
        }
      }
    }
    .vxe-table--body {
      .vxe-body--column {
        padding: 0px 0px;
        height: 36px;
        .vxe-cell {
          padding-left: 6px;
          padding-right: 6px;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          .name {
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }
}
.delSubject-confirm {
  width: 450px;
  .deleteText {
    color: #ff0000;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
}
</style>