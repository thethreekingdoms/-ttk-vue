<template>
  <div class="beginBalance">
    <div class="beginBalance-Head">
      <div
        class="beginBalance-Head-left"
        v-on:keydown.enter="handleSearchChange"
      >
        <el-input
          placeholder="请输入编码/名称"
          suffix-icon="el-icon-search"
          class="input-search"
          v-model="other.positionCondition"
        ></el-input>
        <div class="dateDiv">
          <span>启用期间</span>
          <el-date-picker
            value-format="yyyy-MM"
            v-model="other.settedPeriod"
            align="right"
            type="month"
            :clearable="false"
            :disabled="!other.isResetVisible"
            @change="(e) => changeEnabledPeriod(e)"
          ></el-date-picker>
          <span class="tipOrg">注：存在已结账的期间，不能修改启用期间！</span>
        </div>
      </div>
      <div class="beginBalance-Head-right">
        <el-popover
          placement="left-end"
          width="200"
          trigger="manual"
          v-model="balanceShow"
        >
          <div class="balancePop">
            <div
              v-for="(item, index) in balanceData"
              :key="index"
              class="balancePop-head"
            >
              <div>{{ item.name }}：{{ item.num }}</div>
              <i
                class="el-icon-close"
                v-if="index == 0"
                @click="() => balanceSetting('close')"
              ></i>
            </div>
            <div class="balancePop-footer">
              <el-checkbox v-model="isPrompt">下次不再提示</el-checkbox>
              <el-button @click="() => balanceSetting('sure')">确定</el-button>
            </div>
          </div>
          <el-button
            slot="reference"
            type="primary"
            @click="handleClickBalance"
          >
            试算平衡
          </el-button>
        </el-popover>
        <el-button
          type="primary"
          v-if="isShowResetBtn('reset')"
          @click="resetAccountPeriodBegin"
        >
          重置列表
        </el-button>
        <el-button type="primary" @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="beginBalance-Body">
      <el-tabs v-model="filter.targetKey" @tab-click="handleTabClick">
        <el-tab-pane
          :key="item.key"
          v-for="item in tabList"
          :label="item.tab"
          :name="item.key"
        ></el-tab-pane>
        <div>
          <vxe-table
            ref="beginBalanceTable"
            :loading="loading"
            border
            highlight-hover-row
            height="500"
            row-id="id"
            align="center"
            header-align="center"
            resizable
            @resizable-change="resizeChangeEvent"
            show-overflow
            show-header-overflow
            highlight-current-row
          >
            <vxe-table-column
              v-for="item in other.columnDto"
              v-show="item.children"
              :key="item.id"
              :width="item.width"
              :title="item.caption"
              show-overflow
              show-header-overflow
              :visible="item.customDecideVisible"
              :align="getAlign(item.fieldName)"
            >
              <vxe-table-column
                v-for="obj in item.children"
                :key="obj.id"
                :field="obj.fieldName"
                :width="obj.width"
                :title="obj.caption"
                show-overflow
                show-header-overflow
                v-show="item.children"
                :visible="obj.customDecideVisible"
                :align="getAlign(obj.fieldName)"
              >
                <template v-slot="{ row, rowIndex }">
                  <el-input
                    :value="row[obj.fieldName]"
                    v-if="inputNumberEditable(row, obj.fieldName)"
                    :disabled="inputNumberDisabled(row, obj.fieldName)"
                    @input="
                      ($event) => handleInput(rowIndex, obj.fieldName, $event)
                    "
                    @blur="
                      ($event) =>
                        handleInputBlur(rowIndex, obj.fieldName, $event)
                    "
                    :class="
                      errorInput[`${obj.fieldName}${rowIndex}`]
                        ? 'errorInputClass'
                        : ''
                    "
                  ></el-input>
                  <span v-else class="text">
                    {{ row[obj.fieldName] || "" }}
                  </span>
                </template>
              </vxe-table-column>

              <template v-slot="{ row, rowIndex }" v-show="!item.children">
                <el-input
                  :value="row[item.fieldName]"
                  v-if="inputNumberEditable(row, item.fieldName)"
                  :disabled="inputNumberDisabled(row, item.fieldName)"
                  @input="
                    ($event) => handleInput(rowIndex, item.fieldName, $event)
                  "
                  @blur="
                    ($event) =>
                      handleInputBlur(rowIndex, item.fieldName, $event)
                  "
                  :class="
                    errorInput[`${item.fieldName}${rowIndex}`]
                      ? 'errorInputClass'
                      : ''
                  "
                ></el-input>
                <div v-else>
                  <span
                    class="text"
                    v-if="item.fieldName == 'accountName'"
                    :style="{ paddingLeft: (row.accountGrade - 1) * 14 + 'px' }"
                  >
                    {{ row[item.fieldName] || "" }}
                  </span>
                  <span v-else class="text">
                    {{ row[item.fieldName] || "" }}
                  </span>
                </div>
              </template>
            </vxe-table-column>
            <vxe-table-column>
              <template v-slot>
                <div></div>
              </template>
            </vxe-table-column>
            <vxe-table-column fixed="right" field="id" title="操作" width="120">
              <template v-slot:header>
                <span>操作</span>
              </template>
              <template v-slot="{ row, rowIndex }">
                <div
                  class="operate"
                  v-if="
                    (row.isCalcMulti || row.isCalc) &&
                    !row.isDetailData &&
                    row.isEndNode
                  "
                >
                  <a
                    href="javascript:;"
                    style="margin-right: 6px"
                    @click="() => handleAddAuxItem(row, rowIndex, 'add')"
                  >
                    新增
                  </a>
                  <a
                    href="javascript:;"
                    @click="() => handleDeleteAuxItem(row, rowIndex, 'all')"
                    v-if="row.isCalc && !row.isDetailData && row.isEndNode"
                  >
                    删除明细
                  </a>
                </div>
                <div class="operateIcon" v-else-if="row.isDetailData">
                  <i
                    class="el-icon-edit-outline"
                    title="编辑"
                    @click="() => handleAddAuxItem(row, rowIndex, 'edit')"
                  ></i>
                  <i
                    title="删除"
                    class="el-icon-delete"
                    @click="() => handleDeleteAuxItem(row, rowIndex, 'self')"
                  ></i>
                </div>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>
      </el-tabs>
      <div class="checkboxRight">
        <el-checkbox
          v-model="filter.isNullData"
          @change="(e) => handleCheckBoxChange(e, 'isNullData')"
        >
          隐藏空数据
        </el-checkbox>
        <el-checkbox
          v-model="filter.isCalcQuantity"
          @change="(e) => handleCheckBoxChange(e, 'isCalcQuantity')"
        >
          数量
        </el-checkbox>
        <el-checkbox
          v-model="filter.isCalcMulti"
          @change="(e) => handleCheckBoxChange(e, 'isCalcMulti')"
        >
          外币
        </el-checkbox>
        <el-checkbox
          v-model="filter.isCalc"
          @change="(e) => handleCheckBoxChange(e, 'isCalc')"
        >
          辅助核算
        </el-checkbox>
      </div>
    </div>
    <div class="beginBalance-Footer">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagination.currentPage"
        :page-sizes="[300, 500]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.totalCount"
      ></el-pagination>
    </div>
    <el-dialog
      title="辅助核算明细"
      :visible.sync="showAddMultiauxItem"
      class="addMultiItem-dialog"
      v-if="showAddMultiauxItem"
    >
      <addMultiauxItem
        :initData="addMultiauxItemRowData"
        @addMultiauxItem-setting="addMultiauxSetting"
      ></addMultiauxItem>
    </el-dialog>
    <el-dialog
      title="试算平衡"
      :visible.sync="showBalanceDialog"
      v-if="showBalanceDialog"
      class="banlance-dialog"
    >
      <vxe-table
        border
        highlight-hover-row
        height="200"
        :data="balanceDialogData.dataSource"
        align="center"
        row-id="id"
      >
        <vxe-table-column title="项目" field="project"></vxe-table-column>
        <vxe-table-column title="借方科目" field="debit">
          <template v-slot:header>
            <span>借方科目</span>
            <el-popover placement="top" width="270" trigger="hover">
              <div>
                请注意资产类科目中，累计折旧、累计摊销科目为“贷方科目”，期初余额计入贷方科目余额
              </div>
              <i class="el-icon-question" slot="reference"></i>
            </el-popover>
          </template>
        </vxe-table-column>
        <vxe-table-column title="贷方科目" field="credit"></vxe-table-column>
        <vxe-table-column title="差额" field="balance"></vxe-table-column>
      </vxe-table>
      <vxe-table
        border
        highlight-hover-row
        height="150"
        align="center"
        :data="balanceDialogData.subdataSource"
        row-id="id"
      >
        <vxe-table-column title="项目" field="accountName"></vxe-table-column>
        <vxe-table-column title="资产" field="amountZc"></vxe-table-column>
        <vxe-table-column title="负债" field="amountFz"></vxe-table-column>
        <vxe-table-column
          :title="balanceDialogData.liabilitiesTitle"
          field="amountSyzqy"
        ></vxe-table-column>
        <vxe-table-column title="差额" field="amountBalance"></vxe-table-column>
      </vxe-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showBalanceDialog = false">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getPageSetting,
  init,
  updatePeriod,
  clearImportDate,
  exportData,
  setPageSetting,
  updateColumnWidth,
  setNotShowNextTime,
  deleteAuxItem,
  createAndUpdateBatch,
  deleteDetails,
} from "@/api/gl/gl_beginbalance";
import addMultiauxItem from "../addMultiauxItem/index";
import XEUtils from "xe-utils";
export default {
  name: "beginBalance",
  components: {
    addMultiauxItem,
  },
  props: {
    appExtendParams: Object,
  },
  data() {
    return {
      flag: false,
      list: [],
      loading: false,
      showAddMultiauxItem: false,
      other: {},
      balanceShow: false,
      balanceCheckList: [],
      showBalanceDialog: false, //试算平衡 弹框显示
      isPrompt: false, //试算平衡 是否下次提示
      balanceData: [], //试算平衡popver数据
      balanceDialogData: {}, //试算平衡弹框数据
      errorInput: {}, //错误提示
      matchIndex: -1,
      matchBacktoZero: true,
      filter: {
        targetKey: "5000010001",
        isCalcQuantity: false,
        isCalcMulti: false,
        isNullData: false,
        isCalc: false,
      },
      pagination: {
        currentPage: 1,
        totalCount: 0,
        pageSize: 300,
        totalPage: 0,
      },
      digits6: [
        "beginQuantityCr",
        "beginQuantityDr",
        "quantityDr",
        "quantityCr",
        "yearBeginQuantityDr",
        "yearBeginQuantityCr",
      ],
      digits2: [
        "beginOrigAmountDr",
        "beginOrigAmountCr",
        "beginAmountDr",
        "beginAmountCr",
        "origAmountDr",
        "amountDr",
        "origAmountCr",
        "amountCr",
        "yearBeginOrigAmountDr",
        "yearBeginOrigAmountCr",
        "yearBeginAmountDr",
        "yearBeginAmountCr",
      ],
      consts: {
        ACCOUNTINGSTANDARDS_2007: "2000020001", //会计准则: 2000020001 企业会计准则
        ACCOUNTINGSTANDARDS_2013: "2000020002", //会计准则: 2000020002 小企业会计准则
        ACCOUNTINGSTANDARDS_causeCompany: "2000020064", //行政事业单位会计制度 2000020064
        ACCOUNTINGSTANDARDS_nonProfitOrganization: "2000020008", //会计准则: 民间非营利组织会计制度
        ACCOUNTTYPE_ASSETS: 5000010001, //资产
        ACCOUNTTYPE_LIABILITIES: 5000010002, //负债
        ACCOUNTTYPE_COMMON: 5000010003, //共同
        ACCOUNTTYPE_RIGHTSANDINTERSETS: 5000010004, //权益
        ACCOUNTTYPE_COST: 5000010005, //成本
        ACCOUNTTYPE_PROFITANDLOSS: 5000010006, //损益
        ACCOUNTTYPE_NETASSETS: 5000010007, //净资产
        ACCOUNTTYPE_INCOME: 5000010008, //收入
        ACCOUNTTYPE_EXPENSES: 5000010009, //费用
        PERIODBEGIN_ACCOUNTPERIODBEGIN: 1001, //科目期初
      },
      tabs: [
        {
          name: "assets",
          key: "5000010001",
          tab: "资产",
        },
        {
          name: "liabilities",
          key: "5000010002",
          tab: "负债",
        },
        {
          name: "common",
          key: "5000010003",
          tab: "共同",
        },
        {
          name: "rightsInterests",
          key: "5000010004",
          tab: "权益",
        },
        {
          name: "cost",
          key: "5000010005",
          tab: "成本",
        },
        {
          name: "profitLoss",
          key: "5000010006",
          tab: "损益",
        },
        {
          name: "netAssets",
          key: "5000010007",
          tab: "净资产",
        },
        {
          name: "income",
          key: "5000010008",
          tab: "收入",
        },
        {
          name: "expenses",
          key: "5000010009",
          tab: "费用",
        },
        {
          name: "budgetrevenue",
          key: "5000010010",
          tab: "预算收入",
        },
        {
          name: "budgetexpenditure",
          key: "5000010011",
          tab: "预算支出",
        },
        {
          name: "budgetbalance",
          key: "5000010012",
          tab: "预算结余",
        },
      ],
    };
  },
  created() {
    // console.log(this.$store.state.routes.org, 'this.$store.state.routes.org')
    this.initLoad();
  },
  //   watch: {
  //     list: {
  //       handler(newVal, oldVal) {
  // oldVal[index1].xxx[index2] ===
  //         console.log('深度监听', newVal, oldVal)
  //         for (let i = 0; i < newVal.length; i++) {
  // 　　　　　　　　if (oldVal[i].toString() != newVal[i].toString()) {
  // 　　　　　　　　　　console.log(newVal)
  // 　　　　　　　　}
  //         }
  //     },
  //     deep: true
  //     }
  //   },
  computed: {
    tabList: function () {
      return this.tabs.filter((item, index) => {
        return this.isTabDisplay(item.name, index);
      });
    },
  },
  methods: {
    handleKeyDown(e) {
      console.log(e, "999***9999***6666");
    },
    addMultiauxSetting(value, accountingSubject, rowIndex, type) {
      console.log(value, accountingSubject, rowIndex, type);
      if (!value) {
        this.showAddMultiauxItem = false;
        return;
      }
      let selectedYear = this.other.settedPeriod.split("-")[0], //不在受年份控制
        list = [...this.list],
        auxItems = [],
        accountId = accountingSubject.accountId,
        accountCode = accountingSubject.accountCode,
        direction = accountingSubject.direction,
        cashTypeId = accountingSubject.cashTypeId,
        id = accountingSubject.id;
      const resultList = value;
      console.log(resultList);
      for (let i = 0; i < resultList.length; i++) {
        let item = resultList[i],
          auxItem = this.addFileToBalance(
            item,
            selectedYear,
            accountId,
            accountCode,
            direction,
            cashTypeId,
            accountingSubject
          );
        auxItems.push(auxItem);
      }

      let arrAuxItems = list.filter((subItem) => {
        return (
          subItem["accountId"] == accountId && subItem["isDetailData"] == true
        );
      });
      console.log(arrAuxItems, auxItems);
      for (let i = 0; i < auxItems.length; i++) {
        let filterItem = arrAuxItems.filter((subItem) => {
          if (auxItems[i].currencyId) {
            return (
              subItem["accountCode"] + "_" + subItem["currencyCode"] ==
              auxItems[i].accountCode + "_" + auxItems[i].currencyCode
            );
          } else {
            return subItem["accountCode"] == auxItems[i].accountCode;
          }
        });
      }

      let addAuxItems = [];
      for (let i = 0; i < auxItems.length; i++) {
        if (auxItems[i].addFlg != 0) {
          addAuxItems.push(auxItems[i]);
        }
      }
      if (addAuxItems.length == 0) {
        // clearMessage()
        // return
      }

      // 若当前期初余额还未入库，则逐级次找出上级科目期初余额数据准备入库
      // let id = getterByField(`list.${rowIndex}.id`), //期初余额id
      //     accountGrade = getterByField(`list.${rowIndex}.accountGrade`)

      // 判断是否有选择了币种
      let isSelectCurrency = false;

      for (let i = 0; i < value.length; i++) {
        let auxItem = value[i];
        if (
          !!auxItem.currencyId &&
          (!!auxItem.currencyId.code ||
            auxItem.currencyId.id ||
            auxItem.currencyId.name)
        ) {
          isSelectCurrency = true;
          break;
        }
      }

      // console.log(auxItems)
      this.addBatch(
        addAuxItems,
        rowIndex,
        isSelectCurrency,
        accountId,
        id,
        type
      );
      this.showAddMultiauxItem = false;
      // return res;
    },
    addFileToBalance(
      selectedFiles,
      currentYear,
      accountId,
      accountCode,
      direction,
      cashTypeId,
      accountingSubject
    ) {
      console.log(selectedFiles);
      const calcDict = this.other.calcDict;
      let assistList = [];
      let customer = selectedFiles.customer,
        department = selectedFiles.department,
        person = selectedFiles.person,
        inventory = selectedFiles.inventory,
        supplier = selectedFiles.supplier,
        project = selectedFiles.project,
        currency = selectedFiles.currency;
      let auxItem = {
        // currentYear: currentYear,
        year: currentYear,
        accountId: accountId,
        direction: direction,
        directionName: direction == 0 ? "借" : "贷",
        accIsAuxAccCalc: true, //会计科目，是否启用辅助核算
        // isAuxAccCalc: true,     //期初余额，是否辅助核算项目
        isDetailData: true, //期初余额，是否辅助核算项目
        accountCode: accountCode,
        accountName: "",
        isEndNode: true,
        cashTypeId: cashTypeId,
      };

      for (let item in calcDict) {
        if (calcDict.hasOwnProperty(item) === true) {
          if (item.includes("isExCalc") && accountingSubject[item]) {
            assistList.push(item);
          }
        }
      }

      assistList.sort((a, b) => {
        //科目期初名称自定义档案排序
        let aNumber = parseInt(a.slice(8));
        let bNumber = parseInt(b.slice(8));
        return a > b;
      });

      if (currency) {
        auxItem.currencyId = currency.id;
        auxItem.currencyCode = currency.code;
        auxItem.currencyName = currency.name;
        auxItem.isMultiCalc = true;
      }

      auxItem = this.combineItem(auxItem, customer, "customerId");
      auxItem = this.combineItem(auxItem, supplier, "supplierId");
      auxItem = this.combineItem(auxItem, project, "projectId");
      auxItem = this.combineItem(auxItem, department, "departmentId");
      auxItem = this.combineItem(auxItem, person, "personId");
      auxItem = this.combineItem(auxItem, inventory, "inventoryId");

      if (assistList.length != 0) {
        for (let i = 0; i < assistList.length; i++) {
          const num = assistList[i].replace(/[^0-9]/gi, "");
          auxItem = this.combineItem(
            auxItem,
            selectedFiles[assistList[i]],
            `exCalc${num}`
          );
        }
      }

      if (auxItem.accountCode.substring(0, 1) == "_") {
        auxItem.accountCode = auxItem.accountCode.substring(1);
      }
      if (auxItem.accountName.substring(0, 1) == "_") {
        auxItem.accountName = auxItem.accountName.substring(1);
      }

      if (!!selectedFiles.beginAmount) {
        auxItem.beginAmount = this.clearThousandsPosition(
          selectedFiles.beginAmount
        );
      }
      if (!!selectedFiles.beginAmountDr) {
        auxItem.beginAmountDr = this.clearThousandsPosition(
          selectedFiles.beginAmountDr
        );
      }
      if (!!selectedFiles.beginAmountCr) {
        //期初借方余额
        auxItem.beginAmountCr = this.clearThousandsPosition(
          selectedFiles.beginAmountCr
        );
      }
      if (!!selectedFiles.beginOrigAmount) {
        auxItem.beginOrigAmount = this.clearThousandsPosition(
          selectedFiles.beginOrigAmount
        );
      }
      if (!!selectedFiles.beginOrigAmountDr) {
        auxItem.beginOrigAmountDr = this.clearThousandsPosition(
          selectedFiles.beginOrigAmountDr
        );
      }
      if (!!selectedFiles.beginOrigAmountCr) {
        auxItem.beginOrigAmountCr = this.clearThousandsPosition(
          selectedFiles.beginOrigAmountCr
        );
      }
      if (!!selectedFiles.beginQuantity) {
        auxItem.beginQuantity = this.clearThousandsPosition(
          selectedFiles.beginQuantity
        );
      }
      if (!!selectedFiles.beginQuantityDr) {
        auxItem.beginQuantityDr = this.clearThousandsPosition(
          selectedFiles.beginQuantityDr
        );
      }
      if (!!selectedFiles.beginQuantityCr) {
        auxItem.beginQuantityCr = this.clearThousandsPosition(
          selectedFiles.beginQuantityCr
        );
      }
      if (!!selectedFiles.quantityCr) {
        auxItem.quantityCr = this.clearThousandsPosition(
          selectedFiles.quantityCr
        );
      }
      if (!!selectedFiles.quantityDr) {
        auxItem.quantityDr = this.clearThousandsPosition(
          selectedFiles.quantityDr
        );
      }
      if (!!selectedFiles.origAmountCr) {
        auxItem.origAmountCr = this.clearThousandsPosition(
          selectedFiles.origAmountCr
        );
      }
      if (!!selectedFiles.origAmountDr) {
        auxItem.origAmountDr = this.clearThousandsPosition(
          selectedFiles.origAmountDr
        );
      }
      if (!!selectedFiles.amountCr) {
        auxItem.amountCr = this.clearThousandsPosition(selectedFiles.amountCr);
      }
      if (!!selectedFiles.amountDr) {
        auxItem.amountDr = this.clearThousandsPosition(selectedFiles.amountDr);
      }

      return auxItem;
    },
    clearThousandsPosition(num) {
      if (num && num.toString().indexOf(",") > -1) {
        let x = num.toString().split(",");
        return parseFloat(x.join(""));
      } else {
        return num;
      }
    },

    combineItem(auxItem, resourceAuxItems, fieldId) {
      // console.log(auxItem, resourceAuxItems, fieldId)
      if (resourceAuxItems) {
        if (fieldId == "personId" || fieldId == "bankAccountId") {
          auxItem[fieldId] = resourceAuxItems.id;
          auxItem.accountCode =
            auxItem.accountCode + "_" + resourceAuxItems.name;
          auxItem.accountName =
            auxItem.accountName + "_" + resourceAuxItems.name;
        } else if (fieldId == "levyAndRetreatId") {
          auxItem[fieldId] = resourceAuxItems.enumItemId;
          auxItem.accountCode =
            auxItem.accountCode + "_" + resourceAuxItems.enumItemId;
          auxItem.accountName =
            auxItem.accountName + "_" + resourceAuxItems.enumItemName;
        } else if (fieldId == "inputTaxId") {
          auxItem[fieldId] = resourceAuxItems.enumItemId;
          auxItem.accountCode =
            auxItem.accountCode + "_" + resourceAuxItems.enumItemId;
          auxItem.accountName =
            auxItem.accountName + "_" + resourceAuxItems.enumItemName;
        } else {
          auxItem[fieldId] = resourceAuxItems.id;
          auxItem.accountCode =
            auxItem.accountCode + "_" + resourceAuxItems.code;
          auxItem.accountName =
            auxItem.accountName + "_" + resourceAuxItems.name;
        }
      }

      return auxItem;
    },
    handleInput(rowIndex, columnName, e) {
      this.flag = true;
      let list = [...this.list];

      let oldValue = this.list[rowIndex][columnName];

      console.log(oldValue, e);
      let newItem = list[rowIndex];
      newItem[columnName] = e;
      this.$set(this.list, rowIndex, newItem);

      // this.index1 = index1
      // this.index2 = rowIndex
    },
    async initLoad() {
      let { enabledYear, accountingStandards } = this.$store.state.routes.org;
      let pageParam = {
        moduleKey: "ttk-gl-app-finance-periodbegin",
        resourceKey: "ttk-gl-app-finance-periodbegin-table",
      };
      this.loading = true;
      let pageResponse = await getPageSetting(pageParam);
      let page = this.pagination;
      if (
        pageResponse.result &&
        pageResponse.value &&
        pageResponse.value.pageSize
      ) {
        page.pageSize = +pageResponse.value.pageSize;
      }
      // this.pagination = page

      let option = {
        accountTypeId: this.consts.ACCOUNTTYPE_ASSETS,
        year: Number(enabledYear),
        isCalcQuantity: false,
        isCalcMulti: false,
        noDataNoDisplay: false,
        page: {
          currentPage: page.currentPage,
          pageSize: page.pageSize,
          // totalCount: page.totalCount,
          // totalPage: page.totalPage
        },
      };
      let res = await init(option);
      if (res.result && res.value) {
        let response = res.value;

        let list = this.formatBeginBalances(response.dataList);
        // let list = response.dataList
        this.$refs.beginBalanceTable.reloadData(list);
        // this.$refs.beginBalanceTable.loadData(list)
        this.list = list;

        let enabledPeriod = {
            enabledYear: response.enabledYear ? response.enabledYear : "",
            enabledMonth: response.enabledMonth ? response.enabledMonth : "",
            ts: response.ts ? response.ts : "",
          },
          selectedYear,
          calcDict = response.calcDict,
          haveMonthlyClosing = response.haveMonthlyClosing,
          settedPeriod = `${response.enabledYear}-${response.enabledMonth}`;

        let columnDetails = [];
        if (response.columnDto.columnDetails) {
          response.columnDto.columnDetails.map((o) => {
            // if(!o.parentId) {
            // if (!o.parentId && o.customDecideVisible) {
            columnDetails.push(o);
            // }
          });
          columnDetails.forEach((item) => {
            let arr = response.columnDto.columnDetails.filter(
              (el) => el.parentId == item.id
            );
            if (arr.length) {
              item.children = arr;
            }
          });
        }

        let other = {
          columnDto: columnDetails,
          code: response.columnDto.code,
          notShowNextTime: response.notShowNextTime,
          enabledPeriod: `启用月份:${enabledPeriod.enabledYear}年${enabledPeriod.enabledMonth}月`,
          enabledYear: enabledPeriod.enabledYear,
          disabledDate: enabledPeriod.enabledMonth,
          calcDict,
          settedPeriod,
          haveMonthlyClosing,
          accountingStandards,
          ts: enabledPeriod.ts,
          tryCacuBalance: response.PeriodBeginDto,
          isResetVisible: response.isResetVisible,
        };
        this.other = other;
        this.balanceCheckList = response.balanceCheckList;
        this.pagination = response.page;
        // 		//期初余额试算平衡
        // this.setBalancePageState(response, selectedYear, enabledPeriod, this.consts.ACCOUNTTYPE_ASSETS)
        // //启用期间为空时，系统弹出启用期间选择对话框，供操作员选择启用的期间；COMMENT START 0102 TODO
        // if (!response.enabledYear) {
        //     this.changeEnabledPeriod()
        // }
        this.handleBalanceShow();
      }
      // this.pagination = page;
      this.loading = false;
    },
    handleTabClick(tab, event) {
      this.$set(this.filter, "targetKey", tab.name);
      this.loadBalanceData();
    },
    handleSearchChange(e) {
      console.log(e, "eeeee");
      let value = e.target.value;
      // this.other.positionCondition = value;

      let list = this.list,
        matchIndex = this.matchIndex,
        matchBacktoZero = this.matchBacktoZero,
        firstMatchIndex = -1,
        aryMatch = [],
        condition = (value && value.trim()) + "";
      console.log(condition, "condition3333..222222");
      if (condition != "") {
        list.forEach((item, index) => {
          // 编码按照左匹配，名称按照模糊匹配
          if (item.accountCode && item.accountName) {
            if (
              item.accountCode.indexOf(condition) == 0 ||
              item.accountName.indexOf(condition) > -1
            ) {
              aryMatch.push(index); //所有满足匹配条件的
              if (firstMatchIndex == -1) {
                firstMatchIndex = index; //拿到第一个匹配的index
              }
            }
          }
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
      console.log(matchIndex, "matchIndexmatchIndexmatchIndex");
      if (matchIndex > -1) {
        this.matchIndex = matchIndex;
        this.matchBacktoZero = false;
        this.$refs.beginBalanceTable.setCurrentRow(this.list[matchIndex]);
        this.$refs.beginBalanceTable.scrollToRow(this.list[matchIndex]);
      } else {
        this.matchBacktoZero = true;
        this.matchIndex = -1;
        this.$refs.beginBalanceTable.clearCurrentRow();
      }
    },
    handleCheckBoxChange(e, name) {
      this.$set(this.filter, `${name}`, e);
      this.loadBalanceData();
    },

    handleAddAuxItem(row, rowIndex, type) {
      this.showAddMultiauxItem = true;
      row.accountType = this.filter.targetKey;
      this.addMultiauxItemRowData = {
        row: { ...row, calcDict: this.other.calcDict },
        rowIndex,
        type,
        isResetVisible: this.other.isResetVisible,
      };
      // console.log(row, rowIndex, type, '9999****666')
    },
    //删除辅助项
    async handleDeleteAuxItem(row, rowIndex, type) {
      if (type && type == "all") {
        this.$baseConfirm("确定删除吗", "", async () => {
          let year = this.other.settedPeriod.split("-")[0];
          const res = await deleteDetails({ accountId: row.accountId });
          if (res.result) {
            this.$message({
              type: "success",
              message: "期初余额删除成功",
            });
            this.loadBalanceData();
          }
        });
      } else {
        this.$baseConfirm("确定删除吗", "", async () => {
          let year = this.other.settedPeriod.split("-")[0];
          const res = await deleteAuxItem({ id: row.id, year });
          if (res.result) {
            this.$message({
              type: "success",
              message: "期初余额删除成功",
            });
            this.loadBalanceData();
          }
        });
      }
    },
    handleCurrentChange(currentPage) {
      let page = this.pagination;
      page.currentPage = currentPage + "";
      this.pagination = page;

      this.loadBalanceData();
    },
    async handleSizeChange(pageSize) {
      let page = this.pagination;
      page.pageSize = pageSize;
      this.pagination = page;
      let request = {
        moduleKey: "ttk-gl-app-finance-periodbegin",
        resourceKey: "ttk-gl-app-finance-periodbegin-table",
        settingKey: "pageSize",
        settingValue: pageSize,
      };
      await setPageSetting([request]);
      this.loadBalanceData();
    },
    //列拖动
    async resizeChangeEvent({
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }) {
      setTimeout(async () => {
        debugger;
        let newWidth = $event.target.parentNode.clientWidth;
        // let newWidth = $event.target.clientWidth;
        let columnDetails = this.other.columnDto;
        let params = { code: this.other.code };
        let newcolumnDetails = [];
        columnDetails &&
          columnDetails.forEach((item) => {
            let children;
            if (item.fieldName == column.property) {
              item.width = newWidth;
            }
            children = item.children;
            delete item.children;
            newcolumnDetails.push(item);
            children &&
              children.forEach((obj) => {
                if (obj.fieldName == column.property) {
                  obj.width = newWidth;
                }
                newcolumnDetails.push(obj);
              });
          });
        params.columnDetails = newcolumnDetails;
        let res = await updateColumnWidth(params);
        if (res && res.result) {
          // let column = [];
          // res.value[0].columnDetails.forEach((item) => {
          //   if (!item.parentId) {
          //     column.push(item);
          //   }
          // });
          // column.forEach((item) => {
          //   let arr = res.value[0].columnDetails.filter(
          //     (el) => el.parentId == item.id
          //   );
          //   if (arr.length) {
          //     item.children = arr;
          //   }
          // });
          // console.log(column)
          this.$set(this.other, "columnDto", res.value[0].columnDetails);
        }
      }, 100);
    },
    async loadBalanceData(selectYear) {
      // console.log(this.$store.state.routes.org, "99966699***9666696969");
      let accountingStandards =
        this.other.accountingStandards ||
        this.$store.state.routes.org.accountingStandards;
      let {
        targetKey: accountTypeNew,
        isCalcQuantity,
        isCalcMulti,
        isNullData,
        isCalc,
      } = this.filter;
      // let year = this.other.year.id || this.$store.state.routes.org.enabledYear || selectYear
      let year =
        this.$store.state.routes.org.enabledYear ||
        (this.other.settedPeriod && this.other.settedPeriod.split("-")[0]) ||
        selectYear;
      let option = {
        accountTypeId: accountTypeNew,
        year: Number(year),
        isCalcQuantity: !!isCalcQuantity,
        isCalcMulti: !!isCalcMulti,
        noDataNoDisplay: isNullData ? true : false,
        isCalc: !!isCalc,
        page: {
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
        },
      };
      // if (isNullData) {
      //     option.noDataNoDisplay = true
      // }
      // option.page = {
      //     currentPage: this.pagination.currentPage,
      //     pageSize: this.pagination.pageSize
      // }
      this.loading = true;
      let response = await init(option);
      this.loading = false;
      if (response.result && response.value) {
        response = response.value;

        let list = this.formatBeginBalances(response.dataList);
        // let list = response.dataList
        // this.$refs.beginBalanceTable.reloadData(list)
        this.$refs.beginBalanceTable.loadData(list);
        this.list = list;

        let enabledPeriod = {
            enabledYear: response.enabledYear,
            enabledMonth: response.enabledMonth,
            ts: response.ts ? response.ts : "",
          },
          calcDict = response.calcDict,
          haveMonthlyClosing = response.haveMonthlyClosing,
          settedPeriod = `${response.enabledYear}-${response.enabledMonth}`;

        let columnDetails = [];
        if (response.columnDto.columnDetails) {
          response.columnDto.columnDetails.map((o) => {
            // if(!o.parentId) {
            // if (!o.parentId && o.customDecideVisible) {
            columnDetails.push(o);
            // }
          });
          columnDetails.forEach((item) => {
            let arr = response.columnDto.columnDetails.filter(
              (el) => el.parentId == item.id
            );
            if (arr.length) {
              item.children = arr;
            }
          });
        }

        this.balanceCheckList = response.balanceCheckList;
        this.pagination = response.page;
        let other = {
          columnDto: columnDetails,
          code: response.columnDto.code,
          notShowNextTime: response.notShowNextTime,
          enabledPeriod: `启用月份:${enabledPeriod.enabledYear}年${enabledPeriod.enabledMonth}月`,
          enabledYear: enabledPeriod.enabledYear,
          disabledDate: enabledPeriod.enabledMonth,
          calcDict,
          ts: enabledPeriod.ts,
          settedPeriod,
          accountingStandards,
          tryCacuBalance: response.PeriodBeginDto,
          isResetVisible: response.isResetVisible,
        };
        // let newOther = {...this.other, other}
        let newOther = Object.assign({}, this.other, other);
        this.other = newOther;
        // this.$set(this.other,"columnDto",columnDetails)
        setTimeout(() => {
          this.$refs.beginBalanceTable.refreshColumn();
        }, 100);
        //   this.setBalancePageState(response, year, enabledPeriod, accountTypeNew)
        this.handleBalanceShow();
      }
    },
    isTabDisplay(tabName) {
      let accountingStandards = this.$store.state.routes.org
          .accountingStandards,
        consts = this.consts,
        isDisplay = true;

      if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
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
      } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
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
        accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization
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
        accountingStandards == consts.ACCOUNTINGSTANDARDS_causeCompany
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
    //修改启用期间
    async changeEnabledPeriod(value) {
      const selectYear = value.split("-")[0];
      const selectMonth = value.split("-")[1];
      const ts = this.other.ts ? this.other.ts : "";
      const obj = {};
      obj.year = selectYear;
      obj.period = Number(selectMonth.split("月")[0]);
      obj.isReturnValue = true;
      obj.ts = ts;
      const res = await updatePeriod(obj);
      if (!res.error && res.value) {
        this.$message({
          type: "success",
          message: "启用期间调整成功",
        });

        this.$set(this.other, "ts", res.value.ts);
        this.$set(
          this.other,
          "settedPeriod",
          `${res.value.enabledYear}-${res.value.enabledMonth}`
        );

        //这里需要确定 有没有更新整个企业启用期间的需求，然后确定是否更新store里面的org
        this.$store.commit("routes/setOrg", {
          ...this.$store.state.routes.org,
          enabledMonth: Number(selectMonth.split("月")[0]),
          enabledYear: selectYear,
        });
        this.$emit("router-emit", Number(selectMonth.split("月")[0]));
        this.loadBalanceData(selectYear);
      } else if (res.error) {
        this.$message({
          type: "error",
          message: res.error.message,
        });
      }
    },
    //格式化数量金额
    formatBeginBalances(balanceList) {
      balanceList.map((item) => {
        let digits6 = this.digits6;
        digits6.forEach((key) => {
          item[key] = item[key]
            ? XEUtils.commafy(XEUtils.toNumber(item[key]), { digits: 6 })
            : "";
        });
        let digits2 = this.digits2;
        digits2.forEach((key) => {
          item[key] = item[key]
            ? XEUtils.commafy(XEUtils.toNumber(item[key]), { digits: 2 })
            : "";
        });

        if (item.isDetailData) {
          item.accountCodeCombine = "";
          item.operation = "";
          item.accountName = this.combineAuxItemContent(item, "accountName");
          item.accountCode = "";
        } else {
          item.accountCodeCombine = item.accountCode;
          item.operation = item.accountCode;
          item.accountName = item.accountName;
        }
        if (item.id == undefined) {
          item.id = "";
        }
      });

      return balanceList;
    },
    //科目辅助项名称拼接
    combineAuxItemContent(subItem, fieldType) {
      let combineStr = "";
      if (fieldType == "accountCode") {
        combineStr = subItem.accountCode;
        combineStr =
          subItem.customerCode != undefined
            ? combineStr + "_" + subItem.customerCode
            : combineStr;
        combineStr =
          subItem.departmentCode != undefined
            ? combineStr + "_" + subItem.departmentCode
            : combineStr;
        combineStr =
          subItem.personName != undefined
            ? combineStr + "_" + subItem.personName
            : combineStr;
        combineStr =
          subItem.inventoryCode != undefined
            ? combineStr + "_" + subItem.inventoryCode
            : combineStr;
        combineStr =
          subItem.supplierCode != undefined
            ? combineStr + "_" + subItem.supplierCode
            : combineStr;
        combineStr =
          subItem.projectCode != undefined
            ? combineStr + "_" + subItem.projectCode
            : combineStr;
        combineStr =
          subItem.bankAccountName != undefined
            ? combineStr + "_" + subItem.bankAccountName
            : combineStr;
        combineStr =
          subItem.levyAndRetreatId != undefined
            ? combineStr + "_" + subItem.levyAndRetreatId
            : combineStr;
        combineStr =
          subItem.inputTaxId != undefined
            ? combineStr + "_" + subItem.inputTaxId
            : combineStr;
      } else {
        combineStr =
          subItem.customerName != undefined
            ? combineStr + "_" + subItem.customerName
            : combineStr;
        combineStr =
          subItem.supplierName != undefined
            ? combineStr + "_" + subItem.supplierName
            : combineStr;
        combineStr =
          subItem.projectName != undefined
            ? combineStr + "_" + subItem.projectName
            : combineStr;
        combineStr =
          subItem.departmentName != undefined
            ? combineStr + "_" + subItem.departmentName
            : combineStr;
        combineStr =
          subItem.personName != undefined
            ? combineStr + "_" + subItem.personName
            : combineStr;
        combineStr =
          subItem.inventoryName != undefined
            ? combineStr + "_" + subItem.inventoryName
            : combineStr;

        let initArr = [];
        for (let i = 0; i < 10; i++) {
          initArr.push(`exCalc${i + 1}Name`);
        }

        initArr.forEach((item) => {
          combineStr =
            subItem[item] != undefined
              ? combineStr + "_" + subItem[item]
              : combineStr;
        });
        combineStr = combineStr.substring(1);
      }
      // console.log(combineStr, 'combineStr')
      return combineStr;
    },
    //试算平衡弹框
    async handleClickBalance() {
      // let accountType = this.filter.targetKey,
      //   subdataSource,
      //   year = this.other.settedPeriod.split('-')[0]
      // year = Number(year)
      // let option = {
      //   accountTypeId: accountType,
      //   year: year,
      //   isCalcQuantity: false,
      //   isCalcMulti: false,
      //   noDataNoDisplay: false,
      //   page:{
      //     currentPage: this.pagination.currentPage,
      //     pageSize:this.pagination.pageSize
      //   }
      // }
      // let pageParam = {
      //   moduleKey: 'ttk-gl-app-finance-periodbegin',
      //   resourceKey: 'ttk-gl-app-finance-periodbegin-table',
      // }
      // let pageResponse = await this.webapi.getPageSetting(pageParam)
      // let page = this.metaAction.gf('data.pagination').toJS()
      // if (pageResponse.pageSize) {
      //   page.pageSize = pageResponse.pageSize
      // }
      // let other = [{ path: 'data.pagination', value: page }]

      // let newPage = utils.sortSearchOption(page, null, ['total', 'totalCount', 'totalPage'])
      // option.page = newPage

      // let response = await init(option)
      // if(response.result&&response.value) {
      //   response = response.value
      //   if (response.balanceCheckList) {
      //     this.balanceCheckList = response.balanceCheckList
      //     subdataSource = response.balanceCheckList
      //     subdataSource.map(item => {
      //       item.amountZc = Number(item.amountZc ? item.amountZc : 0).toFixed(2)
      //       item.amountFz = Number(item.amountFz ? item.amountFz : 0).toFixed(2)
      //       item.amountSyzqy = Number(item.amountSyzqy ? item.amountSyzqy : 0).toFixed(2)
      //       let num = 0
      //       num = Number(item.amountZc - item.amountFz).toFixed(2) - item.amountSyzqy
      //       item.amountBalance = Number(num ? num : 0).toFixed(2)
      //       return item
      //     })

      //   }
      // }

      let subdataSource = this.balanceCheckList;
      subdataSource.map((item) => {
        item.amountZc = Number(item.amountZc ? item.amountZc : 0).toFixed(2);
        item.amountFz = Number(item.amountFz ? item.amountFz : 0).toFixed(2);
        item.amountSyzqy = Number(
          item.amountSyzqy ? item.amountSyzqy : 0
        ).toFixed(2);
        let num = 0;
        num =
          Number(item.amountZc - item.amountFz).toFixed(2) - item.amountSyzqy;
        item.amountBalance = Number(num ? num : 0).toFixed(2);
        return item;
      });

      const tryCacuBalance = this.other.tryCacuBalance;
      let accountingStandards = this.$store.state.routes.org
        .accountingStandards;
      let liabilitiesTitle = "";
      if (accountingStandards == this.consts.ACCOUNTINGSTANDARDS_causeCompany) {
        liabilitiesTitle = "净资产";
      } else {
        liabilitiesTitle = "所有者权益";
      }
      let beginAmountCr = tryCacuBalance.beginAmountCr
          ? tryCacuBalance.beginAmountCr
          : 0.0,
        beginAmountDr = tryCacuBalance.beginAmountDr
          ? tryCacuBalance.beginAmountDr
          : 0.0,
        yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr
          ? tryCacuBalance.yearBeginAmountCr
          : 0.0,
        yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr
          ? tryCacuBalance.yearBeginAmountDr
          : 0.0,
        amountDr = tryCacuBalance.amountDr ? tryCacuBalance.amountDr : 0,
        amountCr = tryCacuBalance.amountCr ? tryCacuBalance.amountCr : 0,
        period = this.other.settedPeriod.split("-"),
        dataSource;

      if (Number(period[1]) == 1) {
        dataSource = [
          {
            project: "期初余额",
            debit: Number(beginAmountDr).toFixed(2),
            credit: Number(beginAmountCr).toFixed(2),
            balance: Number(beginAmountDr - beginAmountCr).toFixed(2),
          },
        ];
      } else {
        dataSource = [
          {
            project: "期初余额",
            debit: Number(beginAmountDr).toFixed(2),
            credit: Number(beginAmountCr).toFixed(2),
            balance: Number(beginAmountDr - beginAmountCr).toFixed(2),
          },
          {
            project: "本年累计",
            debit: Number(amountDr).toFixed(2),
            credit: Number(amountCr).toFixed(2),
            balance: Number(amountDr - amountCr).toFixed(2),
          },
          {
            project: "年初余额",
            debit: Number(yearBeginAmountDr).toFixed(2),
            credit: Number(yearBeginAmountCr).toFixed(2),
            balance: Number(yearBeginAmountDr - yearBeginAmountCr).toFixed(2),
          },
        ];
      }
      this.balanceDialogData = {
        liabilitiesTitle,
        dataSource,
        subdataSource,
      };
      this.showBalanceDialog = true;
    },
    //试算平衡设置
    async balanceSetting(type) {
      if (type == "sure") {
        if (this.isPrompt) {
          let response = await setNotShowNextTime();
          this.$set(this.other, "notShowNextTime", true);
        }
        // this.balanceShow=false
        // this.$set(this.other, 'closeFlag', true)
      } else {
        // this.$set(this.other, 'closeFlag', true)
      }
      this.balanceShow = false;
      this.$set(this.other, "closeFlag", true);
    },
    //试算平衡计算
    handleBalanceShow() {
      const tryCacuBalance = this.other.tryCacuBalance;
      const notShowNextTime = this.other.notShowNextTime;
      let beginAmountCr = tryCacuBalance.beginAmountCr
          ? tryCacuBalance.beginAmountCr
          : 0,
        beginAmountDr = tryCacuBalance.beginAmountDr
          ? tryCacuBalance.beginAmountDr
          : 0,
        yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr
          ? tryCacuBalance.yearBeginAmountCr
          : 0,
        yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr
          ? tryCacuBalance.yearBeginAmountDr
          : 0,
        amountDr = tryCacuBalance.amountDr ? tryCacuBalance.amountDr : 0,
        amountCr = tryCacuBalance.amountCr ? tryCacuBalance.amountCr : 0,
        balanceData = [],
        beginAmountdiff = Number(beginAmountDr - beginAmountCr).toFixed(2),
        yearBeginAmountdiff = Number(
          yearBeginAmountDr - yearBeginAmountCr
        ).toFixed(2),
        amountdiff = Number(amountDr - amountCr).toFixed(2),
        period = this.other.settedPeriod && this.other.settedPeriod.split("-");

      if (notShowNextTime) {
        this.balanceShow = false;
        return;
      } else {
        if (
          beginAmountdiff == 0.0 &&
          yearBeginAmountdiff == 0.0 &&
          amountdiff == 0.0
        ) {
          this.balanceShow = false;
          return;
        } else if (this.other.closeFlag == true) {
          this.balanceShow = false;
          return;
        } else {
          this.balanceShow = true;
        }
      }

      if (period) {
        if (Number(period[1]) == 1) {
          balanceData = [
            {
              name: "期初余额差额",
              num: beginAmountdiff,
            },
          ];
        } else {
          balanceData = [
            {
              name: "期初余额差额",
              num: beginAmountdiff,
            },
            {
              name: "本年累计差额",
              num: amountdiff,
            },
            {
              name: "年初余额差额",
              num: yearBeginAmountdiff,
            },
          ];
        }
        this.balanceData = balanceData;
      }
    },
    //表格是否可填
    inputNumberDisabled(row, columnName) {
      if (!this.other.isResetVisible) {
        return true;
      } else {
        if (
          (row.directionName == "借" && columnName == "beginAmountCr") ||
          (row.directionName == "借" && columnName == "beginQuantityCr") ||
          (row.directionName == "借" && columnName == "beginOrigAmountCr") ||
          (row.directionName == "贷" && columnName == "beginAmountDr") ||
          (row.directionName == "贷" && columnName == "beginQuantityDr") ||
          (row.directionName == "贷" && columnName == "beginOrigAmountDr")
        ) {
          return true;
        }
      }
      return false;
    },
    //是否显示表格
    inputNumberEditable(row, columnName) {
      if (
        columnName == "beginAmountDr" ||
        columnName == "beginAmountCr" ||
        columnName == "amountDr" ||
        columnName == "amountCr" ||
        columnName == "beginQuantityDr" ||
        columnName == "beginOrigAmountDr" ||
        columnName == "beginQuantityCr" ||
        columnName == "beginOrigAmountCr" ||
        columnName == "quantityDr" ||
        columnName == "origAmountDr" ||
        columnName == "quantityCr" ||
        columnName == "origAmountCr"
      ) {
        if (
          (row.isEndNode && !(row.isCalc || row.isCalcMulti)) ||
          row.isDetailData
        ) {
          return true;
        }
      }

      return false;
    },
    //重置列表按钮显示
    isShowResetBtn(btnType) {
      // return true
      let isShow = false;

      if (btnType == "reset") {
        if (
          this.appExtendParams &&
          this.appExtendParams.key == "manualEentry"
        ) {
          isShow = true;
        }
      } else if (btnType == "reInit") {
        if (this.appExtendParams == undefined) {
          isShow = true;
        }
      }

      return isShow;
    },
    //重置列表
    async resetAccountPeriodBegin() {
      const response = await clearImportDate({});
      if (response.result) {
        this.$message({
          type: "success",
          message: "科目期初重置完成",
        });
        this.loadBalanceData();
      }
    },
    //导出
    async exportData() {
      let { targetKey, isCalcQuantity, isCalcMulti, isNullData } = this.filter;
      // let year = this.metaAction.context.get("currentOrg").enabledYear
      // year = Number(year)
      let year = this.other.settedPeriod.split("-")[0];
      let option = {
        accountTypeId: targetKey,
        year: year,
        isCalcQuantity: isCalcQuantity,
        isCalcMulti: isCalcMulti,
        noDataNoDisplay: isNullData ? true : false,
      };
      let response = await exportData(option);
      this.$message({
        type: "success",
        message: "导出成功",
      });
    },
    getAlign(type) {
      if (type === "accountCode" || type === "accountName") {
        return "left";
      } else if (type === "directionName" || type === "currencyName") {
        return "center";
      } else {
        return "right";
      }
    },
    //填表
    handleInputBlur(rowIndex, columnName, e) {
      console.log(e.target.value, "***9999********************");
      let list = [...this.list],
        oldValue = list[rowIndex][columnName],
        newValue = e.target.value,
        errorMessage = this.getErrorMessage(columnName);
      // list = list.update(rowIndex, item => item.set(columnName, newValue))
      if (newValue && newValue.indexOf && newValue.indexOf(",") > -1) {
        //对于修改格式化好的数字 避免isNaN为true
        newValue = newValue.replace(/,/g, "");
      }
      if (!this.flag) return;
      if (newValue > 9999999999.99) {
        this.$set(this.errorInput, `${columnName}${rowIndex}`, true);
        list[rowIndex][columnName] = undefined;
        this.list = list;
        this.$message({
          type: "warning",
          message: `${errorMessage}不能大于9,999,999,999.99，请调整`,
        });
        return;
      }
      if (newValue < -9999999999.99) {
        this.$set(this.errorInput, `${columnName}${rowIndex}`, true);
        list[rowIndex][columnName] = undefined;
        this.list = list;
        this.$message({
          type: "warning",
          message: `${errorMessage}不能小于9,999,999,999.99，请调整`,
        });
        return;
      }
      if (isNaN(newValue)) {
        this.$message({
          type: "warning",
          message: `请输入数字`,
        });
        return;
      }

      this.$set(this.errorInput, `${columnName}${rowIndex}`, false);
      list[rowIndex][columnName] = newValue
        ? this.digits2.includes(columnName)
          ? XEUtils.commafy(XEUtils.toNumber(newValue), { digits: 2 })
          : XEUtils.commafy(XEUtils.toNumber(newValue), { digits: 6 })
        : "";
      this.list = list;
      // this.onFieldChange(columnName + ',' + rowIndex, oldValue, rowIndex)(newValue)
      // return
      // console.log(oldValue, newValue, "*****---****");
      let accountType = this.filter.targetKey,
        selectedYear = this.other.settedPeriod.split("-")[0];

      let curYearTotalAmountField, beginAmountField;
      let curBeginBalance = list[rowIndex]; //当前期初余额行
      // 如果是本位币是人民币 填写期初余额时本位币金额和外币保持一致
      const isBaseCurrency = curBeginBalance.isBaseCurrency;
      if (isBaseCurrency) {
        switch (columnName) {
          case "beginOrigAmountDr":
            beginAmountField = "beginAmountDr";
            break;
          case "beginOrigAmountCr":
            beginAmountField = "beginAmountCr";
            break;
          case "beginAmountDr":
            beginAmountField = "beginOrigAmountDr";
            break;
          case "beginAmountCr":
            beginAmountField = "beginOrigAmountCr";
            break;
          case "origAmountDr":
            beginAmountField = "amountDr";
            break;
          case "amountDr":
            beginAmountField = "origAmountDr";
            break;
          case "amountCr":
            beginAmountField = "origAmountCr";
            break;
          case "origAmountCr":
            beginAmountField = "amountCr";
            break;
          default:
            beginAmountField = columnName;
        }
      }

      let isPositiveNum = false;

      //在期初余额，在录入【财务费用-利息收入】的【借方累计、贷方累计】录入时，提示用户请录入负值，包含数量、外币、金额
      if (
        (columnName.indexOf("quantityDr") > -1 ||
          columnName.indexOf("origAmountDr") > -1 ||
          columnName.indexOf("amountDr") > -1 ||
          columnName.indexOf("quantityCr") > -1 ||
          columnName.indexOf("origAmountCr") > -1 ||
          columnName.indexOf("amountCr") > -1) &&
        curBeginBalance.cashTypeId == 203 && //203：利息收入
        parseFloat(newValue) > 0
      ) {
        isPositiveNum = true;
        newValue = -parseFloat(newValue);
      }

      //损益类、收入类、费用类科目时，填写了借方（贷方）累计金额后，贷方（借方）累计金额自动取相同值
      //为了保持年初余额为零
      if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "amountDr"
      ) {
        curYearTotalAmountField = "amountCr";
      } else if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "amountCr"
      ) {
        curYearTotalAmountField = "amountDr";
      }

      if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "origAmountCr"
      ) {
        curYearTotalAmountField = "origAmountDr";
      } else if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "origAmountDr"
      ) {
        curYearTotalAmountField = "origAmountCr";
      }
      //本年借方和贷方的数量也要保持一致
      if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "quantityDr"
      ) {
        curYearTotalAmountField = "quantityCr";
      } else if (
        (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == this.consts.ACCOUNTTYPE_INCOME ||
          accountType == this.consts.ACCOUNTTYPE_EXPENSES) &&
        columnName == "quantityCr"
      ) {
        curYearTotalAmountField = "quantityDr";
      }
      let listBalance = [],
        curEditBeginBalance = this.getBalanceItem(
          curBeginBalance,
          columnName,
          newValue,
          curYearTotalAmountField,
          beginAmountField
        );
      (curEditBeginBalance.year = this.other.enabledYear), //不在受年份控制
        listBalance.push(curEditBeginBalance);

      // 保存期初余额
      this.createAndUpdateBatch(
        listBalance,
        columnName,
        isPositiveNum,
        curYearTotalAmountField,
        beginAmountField
      ); //初始
      this.flag = false;
    },
    getBalanceItem(
      balanceFromServer,
      curEditField,
      newValue,
      curYearTotalAmountField,
      beginAmountField
    ) {
      if (!balanceFromServer) {
        return {};
      }
      let auxList = [
        "exCalc1",
        "exCalc2",
        "exCalc3",
        "exCalc4",
        "exCalc5",
        "exCalc6",
        "exCalc7",
        "exCalc8",
        "exCalc9",
        "exCalc10",
      ];
      let retBalance = {
          id: balanceFromServer.id, //  期初余额id
          year: balanceFromServer.currentYear, //	年度
          origAmountDr: balanceFromServer.origAmountDr.replace(/,/g, ""), //	本年借方累计(外币)
          origAmountCr: balanceFromServer.origAmountCr.replace(/,/g, ""), //	本年贷方累计（外币）
          amountDr: balanceFromServer.amountDr.replace(/,/g, ""), //	本年借方累计（本币）
          amountCr: balanceFromServer.amountCr.replace(/,/g, ""), //	本年贷方累计（本币）
          quantityDr: balanceFromServer.quantityDr.replace(/,/g, ""), //	本年借方累计（数量）
          quantityCr: balanceFromServer.quantityCr.replace(/,/g, ""), //	本年贷方累计（数量）
          beginAmountDr: balanceFromServer.beginAmountDr.replace(/,/g, ""), //期初本币余额（借方）
          beginAmountCr: balanceFromServer.beginAmountCr.replace(/,/g, ""), //期初本币余额（贷方）
          beginOrigAmountDr: balanceFromServer.beginOrigAmountDr.replace(
            /,/g,
            ""
          ), //期初外币余额（借方）
          beginOrigAmountCr: balanceFromServer.beginOrigAmountCr.replace(
            /,/g,
            ""
          ), //期初外币余额（贷方）
          beginQuantityDr: balanceFromServer.beginQuantityDr.replace(/,/g, ""), //期初借方余额（数量）
          beginQuantityCr: balanceFromServer.beginQuantityCr.replace(/,/g, ""), //期初贷方余额（数量）
          isDetailData: balanceFromServer.isDetailData, //	是否辅助明细数据
          unitId: balanceFromServer.unitId, //	计量单位ID
          currencyId: balanceFromServer.currencyId, //	币种ID
          currencyCode: balanceFromServer.currencyCode, //	币种编码
          accountId: balanceFromServer.accountId, //	科目ID
          accountCode: balanceFromServer.accountCode, //	科目编码
          direction: balanceFromServer.direction, //	方向编码
          departmentId: balanceFromServer.departmentId, //	部门ID
          personId: balanceFromServer.personId, //	人员ID
          customerId: balanceFromServer.customerId, //	客户ID
          supplierId: balanceFromServer.supplierId, //	供应商ID
          inventoryId: balanceFromServer.inventoryId, //	存货ID
          projectId: balanceFromServer.projectId, //	项目ID
          bankAccountId: balanceFromServer.bankAccountId, //	账号ID
          levyAndRetreatId: balanceFromServer.levyAndRetreatId, //    即征即退ID
          inputTaxId: balanceFromServer.inputTaxId, //    即征即退ID
        },
        accountType = this.filter.targetKey;
      auxList.map((item) => {
        let o = item.slice(1);
        if (balanceFromServer[`isE${o}`]) {
          retBalance[item] = balanceFromServer[item];
        }
      });
      if (newValue != undefined) {
        retBalance[curEditField] = newValue;
      }
      if (curYearTotalAmountField && newValue != undefined) {
        retBalance[curYearTotalAmountField] = newValue;
      }
      if (beginAmountField && newValue != undefined) {
        if (accountType == this.consts.ACCOUNTTYPE_PROFITANDLOSS) {
          switch (beginAmountField) {
            case "origAmountDr":
              retBalance["origAmountDr"] = newValue;
              retBalance["amountDr"] = newValue;
              retBalance["origAmountCr"] = newValue;
              retBalance["amountCr"] = newValue;
              break;
            case "amountDr":
              retBalance["amountDr"] = newValue;
              retBalance["origAmountDr"] = newValue;
              retBalance["origAmountCr"] = newValue;
              retBalance["amountCr"] = newValue;
              break;
            case "origAmountCr":
              retBalance["amountDr"] = newValue;
              retBalance["origAmountDr"] = newValue;
              retBalance["origAmountCr"] = newValue;
              retBalance["amountCr"] = newValue;
              break;
            case "amountCr":
              retBalance["amountDr"] = newValue;
              retBalance["origAmountDr"] = newValue;
              retBalance["origAmountCr"] = newValue;
              retBalance["amountCr"] = newValue;
              break;
            default:
              retBalance[beginAmountField] = newValue;
          }
        } else {
          retBalance[beginAmountField] = newValue;
        }
      }
      return retBalance;
    },
    //新增修改合并处理
    async createAndUpdateBatch(
      listBalance,
      curEditField,
      isPositiveNum,
      curYearTotalAmountField,
      beginAmountField
    ) {
      listBalance.map((item) => {
        if (!item.beginAmountDr) item.beginAmountDr = null;
        if (!item.beginOrigAmountDr) item.beginOrigAmountDr = null;
        if (!item.beginQuantityDr) item.beginQuantityDr = null;
        if (!item.beginAmountCr) item.beginAmountCr = null;
        if (!item.beginOrigAmountCr) item.beginOrigAmountCr = null;
        if (!item.beginQuantityCr) item.beginQuantityCr = null;
        if (!item.amountCr) item.amountCr = null;
        if (!item.amountDr) item.amountDr = null;
        if (!item.origAmountCr) item.origAmountCr = null;
        if (!item.origAmountDr) item.origAmountDr = null;
        if (!item.quantityCr) item.quantityCr = null;
        if (!item.quantityDr) item.quantityDr = null;
        return item;
      });
      const data = await createAndUpdateBatch(listBalance);

      if (data) {
        if (isPositiveNum) {
          this.$message({
            type: "success",
            message: `期初余额更新成功！财务费用下的利息收入是借方科目，[本年借方累计][本年贷方累计]列应该录入负数`,
          });
        } else {
          this.$message({
            type: "success",
            message: `期初余额更新成功`,
          });
        }
        await this.loadBalanceData();
      }
    },
    // 新增辅助明细
    async addBatch(
      listBalance,
      rowIndex,
      isSelectCurrency,
      accountId,
      id,
      type
    ) {
      if (this.isHaveResult) return;
      let accountType = this.filter.targetKey;
      let selectedYear = this.other.settedPeriod.split("-")[0];
      listBalance.isReturnValue = true;
      this.isHaveResult = true;
      if (type == "edit") {
        listBalance[0].id = id;
      }
      listBalance.map((item) => {
        if (!item.beginAmountDr) item.beginAmountDr = null;
        if (!item.beginOrigAmountDr) item.beginOrigAmountDr = null;
        if (!item.beginQuantityDr) item.beginQuantityDr = null;
        if (!item.beginAmountCr) item.beginAmountCr = null;
        if (!item.beginOrigAmountCr) item.beginOrigAmountCr = null;
        if (!item.beginQuantityCr) item.beginQuantityCr = null;
        if (!item.amountCr) item.amountCr = null;
        if (!item.amountDr) item.amountDr = null;
        if (!item.origAmountCr) item.origAmountCr = null;
        if (!item.origAmountDr) item.origAmountDr = null;
        if (!item.quantityCr) item.quantityCr = null;
        if (!item.quantityDr) item.quantityDr = null;
        return item;
      });
      const data = await createAndUpdateBatch(listBalance);
      if (data.result == false) {
        this.isHaveResult = false;
        this.$message({
          type: "warning",
          message: data.error.message,
        });
        // return false
      } else {
        await this.loadBalanceData(accountType, selectedYear);
        this.isHaveResult = false;
      }

      this.$message({
        type: "success",
        message: `期初余额更新成功`,
      });
      // this.computeFun()
      // this.clearFocus()
      // return true
    },
    //填表错误提示处理
    getErrorMessage(columnName) {
      let errorMessage;

      if (columnName === "beginQuantity") {
        errorMessage = `期初余额数量`;
      } else if (columnName === "beginOrigAmount") {
        errorMessage = `期初余额外币`;
      } else if (columnName === "beginAmount") {
        errorMessage = `期初余额金额`;
      } else if (columnName === "quantityDr") {
        errorMessage = `本年借方累计数量`;
      } else if (columnName === "origAmountDr") {
        errorMessage = `本年借方累计外币`;
      } else if (columnName === "amountDr") {
        errorMessage = `本年借方累计金额`;
      } else if (columnName === "quantityCr") {
        errorMessage = `本年贷方累计数量`;
      } else if (columnName === "origAmountCr") {
        errorMessage = `行本年贷方累计外币`;
      } else if (columnName === "amountCr") {
        errorMessage = `本年贷方累计金额`;
      } else if (
        columnName == "beginAmountDr_f" ||
        columnName == "beginAmountDr"
      ) {
        errorMessage = `期初借方余额`;
      } else if (
        columnName == "beginAmountCr_f" ||
        columnName == "beginAmountCr"
      ) {
        errorMessage = `期初贷方余额`;
      } else if (columnName == "amountDr_f") {
        errorMessage = `本年借方累计`;
      } else if (columnName == "amountCr_f") {
        errorMessage = `本年贷方累计`;
      }

      return errorMessage;
    },
  },
};
</script>   
<style lang="scss">
.beginBalance {
  &-Head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 10px 10px;

    &-left {
      display: flex;

      .input-search {
        width: 180px;
      }
      .dateDiv {
        margin-left: 10px;
        .el-date-editor {
          width: 95px;
          margin: 0 10px 0 5px;
          .el-input__inner {
            padding: 0 10px 0 30px;
          }
        }
        .tipOrg {
          color: #f58d3e;
        }
      }
    }
    &-right {
      .el-button {
        margin-left: 10px;
      }
    }
  }
  &-Body {
    padding: 0 10px;
    position: relative;
    .checkboxRight {
      position: absolute;
      right: 10px;
      top: 12px;
      .el-checkbox {
        margin-right: 0px;
        margin-left: 15px;
        .el-checkbox__label {
          padding-left: 5px;
        }
      }
    }
    .vxe-table {
      .vxe-table--header-wrapper .vxe-header--row .vxe-header--column {
        text-align: center !important;
        height: 40px;
        .vxe-cell {
          justify-content: center;
        }
      }
      .vxe-table--body {
        .vxe-body--column {
          height: 40px;
          .vxe-cell {
            .text {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              display: block;
            }
          }
          .el-input-number--small {
            width: 100%;
            .el-input__inner {
              border-radius: 0;
              border: none;
              border-bottom: 1px solid #1890ff;
            }
          }
          .el-input__inner {
            border-radius: 0;
            border: none;
            border-bottom: 1px solid #1890ff;
            text-align: right;
            padding: 0;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          .errorInputClass {
            .el-input__inner {
              border-radius: 0;
              border: none;
              border-bottom: 1px solid red;
              text-align: right;
              padding: 0;
            }
          }
          .keyword-lighten {
            color: #000;
            background-color: #ffff00;
          }
        }
        .vxe-body--row:last-child {
          background: #fff6ea;
        }
      }
      .operate {
        display: flex;
        justify-content: center;
      }
      .operateIcon {
        .el-icon-edit-outline,
        .el-icon-delete {
          font-size: 15px;
          &:hover {
            color: #1890ff;
          }
        }
        .el-icon-edit-outline {
          margin-right: 15px;
        }
      }
    }
  }
  .addMultiItem-dialog {
    .el-dialog {
      width: 1100px;
    }
  }

  .banlance-dialog {
    .el-icon-question {
      margin-left: 8px;
    }
  }
}
</style>   
<style lang="scss" scoped>
.el-popover {
  .balancePop {
    &-head {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      justify-content: space-between;
      .el-icon-close {
        margin-left: 15px;
        cursor: pointer;
      }
    }
    &-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-checkbox {
        .el-checkbox__label {
          padding-left: 5px;
        }
      }
      .el-button {
        height: 30px;
      }
    }
  }
}
</style>