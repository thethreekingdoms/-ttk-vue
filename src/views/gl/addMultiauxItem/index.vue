<template>
  <div class="addMultiauxItem">
    <div class="addMultiauxItem-title">
      <span>{{ accountCode }} {{ accountName }}</span>
      <span style="padding-left: 8px">方向：{{ directionName }}</span>
    </div>
    <vxe-table
      border
      resizable
      ref="xTable"
      max-height="500"
      :data="tableData"
      align="center"
    >
      <!-- <vxe-table-column
        type="seq"
        width="50"
        fixed="center"
        title="序号"
      ></vxe-table-column> -->
      <vxe-table-column
        field="customer"
        title="客户"
        v-if="accountingSubject.isCalcCustomer"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.customerId">
            <el-option
              v-for="item in customers"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="supplier"
        title="供应商"
        v-if="accountingSubject.isCalcSupplier"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.supplierId">
            <el-option
              v-for="item in suppliers"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="project"
        title="项目"
        v-if="accountingSubject.isCalcProject"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.projectId">
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="department"
        title="部门"
        v-if="accountingSubject.isCalcDepartment"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.departmentId">
            <el-option
              v-for="item in departments"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="person"
        title="人员"
        v-if="accountingSubject.isCalcPerson"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.personId">
            <el-option
              v-for="item in persons"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="inventory"
        title="存货"
        v-if="accountingSubject.isCalcInventory"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.inventoryId">
            <el-option
              v-for="item in inventorys"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="currency"
        title="币种"
        v-if="accountingSubject.isCalcMulti"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.currencyId">
            <el-option
              v-for="item in currencys"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>

      <vxe-table-column
        field="isExCalc1"
        title="isExCalc1"
        v-if="accountingSubject.isExCalc1"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc1Id">
            <el-option
              v-for="item in isExCalc1"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc2"
        title="isExCalc2"
        v-if="accountingSubject.isExCalc2"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc2Id">
            <el-option
              v-for="item in isExCalc2"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc3"
        title="isExCalc3"
        v-if="accountingSubject.isExCalc3"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc3Id">
            <el-option
              v-for="item in isExCalc3"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc4"
        title="isExCalc4"
        v-if="accountingSubject.isExCalc4"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc4Id">
            <el-option
              v-for="item in isExCalc4"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc5"
        title="isExCalc5"
        v-if="accountingSubject.isExCalc5"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc5Id">
            <el-option
              v-for="item in isExCalc5"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc6"
        title="isExCalc6"
        v-if="accountingSubject.isExCalc6"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc6Id">
            <el-option
              v-for="item in isExCalc6"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc7"
        title="isExCalc7"
        v-if="accountingSubject.isExCalc7"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc7Id">
            <el-option
              v-for="item in isExCalc7"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc8"
        title="isExCalc8"
        v-if="accountingSubject.isExCalc8"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc8Id">
            <el-option
              v-for="item in isExCalc8"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc9"
        title="isExCalc9"
        v-if="accountingSubject.isExCalc9"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc9Id">
            <el-option
              v-for="item in isExCalc9"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="isExCalc10"
        title="isExCalc10"
        v-if="accountingSubject.isExCalc10"
        width="130"
      >
        <template v-slot="{ row }">
          <el-select v-model="row.isExCalc10Id">
            <el-option
              v-for="item in isExCalc10"
              :key="item.id"
              :label="item.code + ' ' + item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>
      </vxe-table-column>
      <vxe-table-column title="期初借方余额">
        <vxe-table-column field="beginQuantityDr" title="数量" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.beginQuantityDr"
              :disabled="inputNumberDisabled(row, 'beginQuantityDr')"
              @input="handleInput(row, $rowIndex, 'beginQuantityDr')"
              @change="handleBlur(row, $rowIndex, 'beginQuantityDr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="beginOrigAmountDr"
          title="外币金额"
          v-if="accountingSubject.isCalcMulti"
          width="100"
        >
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.beginOrigAmountDr"
              :disabled="inputNumberDisabled(row, 'beginOrigAmountDr')"
              @input="handleInput(row, $rowIndex, 'beginOrigAmountDr')"
              @change="handleBlur(row, $rowIndex, 'beginOrigAmountDr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="beginAmountDr"
          :title="accountingSubject.isCalcMulti ? '本位币金额' : '金额'"
          width="100"
        >
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.beginAmountDr"
              :disabled="inputNumberDisabled(row, 'beginAmountDr')"
              @input="handleInput(row, $rowIndex, 'beginAmountDr')"
              @change="handleBlur(row, $rowIndex, 'beginAmountDr')"
            ></el-input>
          </template>
        </vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="期初贷方余额">
        <vxe-table-column field="beginQuantityCr" title="数量" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.beginQuantityCr"
              :disabled="inputNumberDisabled(row, 'beginQuantityCr')"
              @input="handleInput(row, $rowIndex, 'beginQuantityCr')"
              @change="handleBlur(row, $rowIndex, 'beginQuantityCr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="beginOrigAmountCr"
          title="外币金额"
          v-if="accountingSubject.isCalcMulti"
          width="100"
        >
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.beginOrigAmountCr"
              :disabled="inputNumberDisabled(row, 'beginOrigAmountCr')"
              @input="handleInput(row, $rowIndex, 'beginOrigAmountCr')"
              @change="handleBlur(row, $rowIndex, 'beginOrigAmountCr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="beginAmountCr"
          width="100"
          :title="accountingSubject.isCalcMulti ? '本位币金额' : '金额'"
        >
          <template v-slot="{ row }">
            <el-input
              v-model="row.beginAmountCr"
              :disabled="inputNumberDisabled(row, 'beginAmountCr')"
              @input="handleInput(row, $rowIndex, 'beginAmountCr')"
              @change="handleBlur(row, $rowIndex, 'beginAmountCr')"
            ></el-input>
          </template>
        </vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="本年借方累计" v-if="!isJanuary">
        <vxe-table-column field="quantityDr" title="数量" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.quantityDr"
              :disabled="inputNumberDisabled(row, 'quantityDr')"
              @input="handleInput(row, $rowIndex, 'quantityDr')"
              @change="handleBlur(row, $rowIndex, 'quantityDr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="origAmountDr"
          title="外币金额"
          v-if="accountingSubject.isCalcMulti"
          width="100"
        >
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.origAmountDr"
              :disabled="inputNumberDisabled(row, 'origAmountDr')"
              @input="handleInput(row, $rowIndex, 'origAmountDr')"
              @change="handleBlur(row, $rowIndex, 'origAmountDr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column field="amountDr" title="金额" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.amountDr"
              :disabled="inputNumberDisabled(row, 'amountDr')"
              @input="handleInput(row, $rowIndex, 'amountDr')"
              @change="handleBlur(row, $rowIndex, 'amountDr')"
            ></el-input>
          </template>
        </vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="本年贷方累计" v-if="!isJanuary">
        <vxe-table-column field="quantityCr" title="数量" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.quantityCr"
              :disabled="inputNumberDisabled(row, 'quantityCr')"
              @input="handleInput(row, $rowIndex, 'quantityCr')"
              @change="handleBlur(row, $rowIndex, 'quantityCr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="origAmountCr"
          title="外币金额"
          v-if="accountingSubject.isCalcMulti"
          width="100"
        >
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.origAmountCr"
              :disabled="inputNumberDisabled(row, 'origAmountCr')"
              @input="handleInput(row, $rowIndex, 'origAmountCr')"
              @change="handleBlur(row, $rowIndex, 'origAmountCr')"
            ></el-input>
          </template>
        </vxe-table-column>
        <vxe-table-column field="amountCr" title="金额" width="100">
          <template v-slot="{ row, $rowIndex }">
            <el-input
              v-model="row.amountCr"
              :disabled="inputNumberDisabled(row, 'amountCr')"
              @input="handleInput(row, $rowIndex, 'amountCr')"
              @change="handleBlur(row, $rowIndex, 'amountCr')"
            ></el-input>
          </template>
        </vxe-table-column>
      </vxe-table-column>
      <vxe-table-column
        field="operCol"
        title="操作"
        fixed="right"
        width="50"
        v-if="type !== 'edit'"
      >
        <template v-slot="{ row, rowIndex }">
          <i class="el-icon-delete" @click="del(row, rowIndex)"></i>
        </template>
      </vxe-table-column>
    </vxe-table>
    <div class="footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancelForm">取消</el-button>
    </div>
  </div>
</template>

<script>
import {
  isExCalc,
  customer,
  department,
  person,
  inventory,
  supplier,
  project,
  currency,
} from "@/api/gl/gl_addmultiauxitem";
import XEUtils from "xe-utils";
import * as consts from "@/utils/consts.js";
const blankAuxItem = {
  department: undefined,
  person: undefined,
  customer: undefined,
  supplier: undefined,
  inventory: undefined,
  project: undefined,
  currency: undefined,
  beginQuantity: undefined, //期初余额数量
  beginOrigAmount: undefined, //期初余额外币
  beginAmount: undefined, // 期初余额金额
  quantityDr: undefined, // 本年借方数量
  origAmountDr: undefined, // 本年借方外币
  amountDr: undefined, // 本年借方金额
  quantityCr: undefined, //本年贷方数量
  origAmountCr: undefined, //本年贷方外币
  amountCr: undefined,
  isExCalc1: undefined,
  isExCalc2: undefined,
  isExCalc3: undefined,
  isExCalc4: undefined,
  isExCalc5: undefined,
  isExCalc6: undefined,
  isExCalc7: undefined,
  isExCalc8: undefined,
  isExCalc9: undefined,
  isExCalc10: undefined,
};
export default {
  name: "addMultiauxItem",
  props: {
    initData: Object,
  },
  data() {
    return {
      tableData: [
        { ...blankAuxItem },
        { ...blankAuxItem },
        { ...blankAuxItem },
        { ...blankAuxItem },
        { ...blankAuxItem },
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
      assistList: [],
      accountCode: "",
      accountName: "",
      directionName: "",
      enabledMonth: undefined,
      accountType: undefined,

      filter: {
        targetKey: "5000010001",
        isCalcQuantity: false,
        isCalcMulti: false,
      },
      rowIndex: 0,
      type: this.initData.type,
      customers: [],
      departments: [],
      persons: [],
      suppliers: [],
      inventorys: [],
      projects: [],
      currencys: [],
      isExCalc1: undefined,
      isExCalc2: undefined,
      isExCalc3: undefined,
      isExCalc4: undefined,
      isExCalc5: undefined,
      isExCalc6: undefined,
      isExCalc7: undefined,
      isExCalc8: undefined,
      isExCalc9: undefined,
      isExCalc10: undefined,
    };
  },
  created() {
    this.init();
  },
  computed: {
    isJanuary: function () {
      return this.$store.state.routes.org.enabledMonth == 1;
    },
  },
  methods: {
    init() {
      let initData = this.initData.row;
      this.rowIndex = this.initData.rowIndex;
      this.type = this.initData.type;
      const calcDict = initData.calcDict;

      this.accountCode = initData.accountCode;
      this.accountName = initData.accountName;
      this.directionName = initData.directionName;

      this.accountingSubject = initData || {};

      let assistList = [];
      for (const item in calcDict) {
        if (item.includes("isExCalc")) {
          assistList.push(item);
        }
      }
      this.loadArchive(this.accountingSubject, assistList); //初始的时候加载每个下拉选的数据
      if (this.type == "edit") {
        this.tableData = [{ ...blankAuxItem }];
        let auxList = [
          "customer",
          "department",
          "person",
          "inventory",
          "project",
          "supplier",
          "currency",
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
        let curItem = { ...initData };
        auxList.map((item) => {
          if (curItem[`${item}Id`]) {
            curItem[item] = {
              code: curItem[`${item}Code`],
              id: curItem[`${item}Id`],
              name: curItem[`${item}Name`],
            };
          }
          // if (curItem[`${item}Dto`]) {
          //   let str = `${item}`.substr(1);
          //   curItem[`isE${str}`] = {
          //     code: curItem[`${item}Dto`]["code"],
          //     id: curItem[`${item}Dto`]["id"],
          //     name: curItem[`${item}Dto`]["name"],
          //   };
          // }
        });
        console.log(curItem);
        this.tableData = [{ ...curItem }];
        // initData.curItem = curItem;
      } else {
        // initData.curItem = undefined;
      }
    },
    async del(row, rowIndex) {
      //删除行
      let dataList = this.tableData;

      const attributeArr = Object.keys(dataList);
      let newObj = {};
      attributeArr.forEach((item) => {
        newObj[item] = undefined;
      });
      dataList.splice(rowIndex, 1);
      dataList.push(newObj);
    },
    inputNumberDisabled(row, columnName) {
      let beginDisabled = false;
      let isResetVisible = this.initData.isResetVisible;
      let subject = this.initData.row;
      if (
        (subject.directionName == "借" && columnName == "beginAmountCr") ||
        (subject.directionName == "贷" && columnName == "beginAmountDr") ||
        (subject.directionName == "借" && columnName == "beginQuantityCr") ||
        (subject.directionName == "借" && columnName == "beginOrigAmountCr") ||
        (subject.directionName == "借" && columnName == "beginAmountCr") ||
        (subject.directionName == "贷" && columnName == "beginQuantityDr") ||
        (subject.directionName == "贷" && columnName == "beginOrigAmountDr") ||
        (subject.directionName == "贷" && columnName == "beginAmountDr")
      ) {
        beginDisabled = true;
      }
      return !isResetVisible ? true : beginDisabled ? true : false;
    },
    getDisplayErrorMsg(errorMsg) {
      return (
        <div style={{ display: "inline-table" }}>
          {errorMsg.map((item) => (
            <div>
              {item}
              <br />
            </div>
          ))}
        </div>
      );
    },
    handleBlur(row, index, columnName) {
      //文本框的Blur处理
      let listInput = [...this.tableData],
        errorMessage = this.getErrorMessage(columnName);
      this.customAttribute = Math.random();
      let value = row[columnName];
      let values;
      if (value) {
        if (value.toString().indexOf(",") > -1) {
          values = value.replace(/,/g, "");
        } else {
          values = parseFloat(value).toFixed(6);
        }
      }

      if (values && isNaN(values)) {
        this.$baseMessage(`请输入数字`, "warning");
        return;
      }
      if (values > 9999999999.99) {
        this.$baseMessage(
          `${errorMessage}不能大于9,999,999,999.99，请调整`,
          "warning"
        );
        return;
      }
      if (values < -9999999999.99) {
        this.$baseMessage(
          `${errorMessage}不能小于9,999,999,999.99，请调整`,
          "warning"
        );
        return;
      }

      const ACCOUNTTYPE_ASSETS = 5000010001; //资产
      const ACCOUNTTYPE_LIABILITIES = 5000010002; //负债
      const ACCOUNTTYPE_COMMON = 5000010003; //共同
      const ACCOUNTTYPE_RIGHTSANDINTERSETS = 5000010004; //权益
      const ACCOUNTTYPE_COST = 5000010005; //成本
      const ACCOUNTTYPE_PROFITANDLOSS = 5000010006; //损益
      const ACCOUNTTYPE_income = 5000010008; //收入
      const ACCOUNTTYPE_expenses = 5000010009; //费用

      const accountType = this.accountingSubject.accountTypeId;
      if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "amountDr"
      ) {
        listInput[index]["amountCr"] = values;
      } else if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "amountCr"
      ) {
        listInput[index]["amountDr"] = values;
      }

      if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "origAmountCr"
      ) {
        listInput[index]["origAmountDr"] = values;
      } else if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "origAmountDr"
      ) {
        listInput[index]["origAmountCr"] = values;
      }
      //本年借方和贷方的数量也要保持一致
      if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "quantityDr"
      ) {
        listInput[index]["quantityCr"] = values;
      } else if (
        (accountType == ACCOUNTTYPE_PROFITANDLOSS ||
          accountType == ACCOUNTTYPE_income ||
          accountType == ACCOUNTTYPE_expenses) &&
        columnName == "quantityCr"
      ) {
        listInput[index]["quantityDr"] = values;
      }
      if (this.currencys) {
        const currencyList = this.currencys;
        const currency = listInput[index]["currency"]
          ? listInput[index]["currency"]
          : "";

        currencyList.forEach((item) => {
          if (item.id == currency.id && item.isBaseCurrency) {
            switch (columnName) {
              case "beginOrigAmountDr":
                listInput[index]["beginAmountDr"] = values;
                break;
              case "beginOrigAmountCr":
                listInput[index]["beginAmountCr"] = values;
                break;
              case "beginAmount":
                listInput[index]["beginOrigAmount"] = values;
                break;
              case "beginAmountDr":
                listInput[index]["beginOrigAmountDr"] = values;
                break;
              case "beginAmountCr":
                listInput[index]["beginAmountCr"] = values;
                break;
              case "origAmountDr":
                if (
                  accountType == ACCOUNTTYPE_PROFITANDLOSS ||
                  accountType == ACCOUNTTYPE_income ||
                  accountType == ACCOUNTTYPE_expenses
                ) {
                  listInput[index]["amountDr"] = values;
                  listInput[index]["origAmountDr"] = values;
                  listInput[index]["origAmountCr"] = values;
                  listInput[index]["amountCr"] = values;
                } else {
                  listInput[index]["amountDr"] = values;
                }
                break;
              case "amountDr":
                if (
                  accountType == ACCOUNTTYPE_PROFITANDLOSS ||
                  accountType == ACCOUNTTYPE_income ||
                  accountType == ACCOUNTTYPE_expenses
                ) {
                  listInput[index]["amountDr"] = values;
                  listInput[index]["origAmountDr"] = values;
                  listInput[index]["origAmountCr"] = values;
                  listInput[index]["amountCr"] = values;
                } else {
                  listInput[index]["origAmountDr"] = values;
                }
                break;
              case "amountCr":
                if (
                  accountType == ACCOUNTTYPE_PROFITANDLOSS ||
                  accountType == ACCOUNTTYPE_income ||
                  accountType == ACCOUNTTYPE_expenses
                ) {
                  listInput[index]["amountDr"] = values;
                  listInput[index]["origAmountDr"] = values;
                  listInput[index]["origAmountCr"] = values;
                  listInput[index]["amountCr"] = values;
                } else {
                  listInput[index]["origAmountCr"] = values;
                }
                break;
              case "origAmountCr":
                if (
                  accountType == ACCOUNTTYPE_PROFITANDLOSS ||
                  accountType == ACCOUNTTYPE_income ||
                  accountType == ACCOUNTTYPE_expenses
                ) {
                  listInput[index]["amountDr"] = values;
                  listInput[index]["origAmountDr"] = values;
                  listInput[index]["origAmountCr"] = values;
                  listInput[index]["amountCr"] = values;
                } else {
                  listInput[index]["origAmountCr"] = values;
                }
                break;
              case "quantityCr":
                listInput[index]["quantityCr"] = values;
                break;
              case "quantityDr":
                listInput[index]["quantityDr"] = values;
                break;
              default:
                return "";
            }
          }
        });
      }
      listInput[index][columnName] = values
        ? this.digits2.includes(columnName)
          ? XEUtils.commafy(XEUtils.toNumber(values), { digits: 2 })
          : XEUtils.commafy(XEUtils.toNumber(values), { digits: 6 })
        : "";
      this.tableData = listInput;
      // listInput = listInput.update(index, item => item.set(columnName, values))
      // this.metaAction.sf('data.list', listInput)
    },
    async submitForm() {
      //保存
      let initData = this.accountingSubject,
        dataList = [...this.tableData],
        accountType = this.accountType,
        enabledMonth = this.enabledMonth;

      const { row, rowIndex } = this.initData;
      for (let i = 0; i < dataList.length; i++) {
        let item = dataList[i];
        let auxList = [
          "customer",
          "department",
          "person",
          "inventory",
          "project",
          "supplier",
          "currency",
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
        for (let j = 0; j < auxList.length; j++) {
          if (item[`${auxList[j]}Id`]) {
            let o = this[`${auxList[j]}s`].find(
              (o) => o.id == item[`${auxList[j]}Id`]
            );
            item[`${auxList[j]}`] = { id: o.id, name: o.name, code: o.code };
          }
        }
        // if(item.customerId){
        //   let customer = this.customers.find(o=>o.id==item.customerId)
        //   item.customer = {id: customer.id, name: customer.name, code: customer.code}
        // }

        if (
          !item ||
          (!item["department"] &&
            !item["person"] &&
            !item["customer"] &&
            !item["supplier"] &&
            !item["inventory"] &&
            !item["project"] &&
            !item["currency"] &&
            !item["beginQuantityDr"] &&
            !item["beginQuantityCr"] &&
            !item["beginOrigAmountDr"] &&
            !item["beginOrigAmountCr"] &&
            !item["beginAmountDr"] &&
            !item["beginAmountCr"] &&
            !item["quantityDr"] &&
            !item["origAmountDr"] &&
            !item["amountDr"] &&
            !item["quantityCr"] &&
            !item["origAmountCr"] &&
            !item["amountCr"] &&
            !item["isExCalc1"] &&
            !item["isExCalc2"] &&
            !item["isExCalc3"] &&
            !item["isExCalc4"] &&
            !item["isExCalc5"] &&
            !item["isExCalc6"] &&
            !item["isExCalc7"] &&
            !item["isExCalc8"] &&
            !item["isExCalc9"] &&
            !item["isExCalc10"])
        ) {
          dataList.splice(i, 1);
          i--;
        }
      }
      console.log(dataList);
      let errorMsgList = this.checkAccFileMultiBeforeSave(dataList, initData),
        errorMsg = errorMsgList.errorMsg,
        isPeriodBeginAmount = errorMsgList.isPeriodBeginAmount;
      if (errorMsg && errorMsg.length > 0) {
        // this.$baseMessage(this.getDisplayErrorMSg(errorMsg), "warning");
        //<div style={{ display: 'inline-table' }}>{errorMsg.map(item => <div>{item}<br /></div>)}</div>
        this.$baseMessage(this.getMessage(errorMsg), "warning");
        return false;
      }

      const addList = dataList;
      const newAddList = [];
      addList.map((item) => {
        let obj = {};
        for (let value in item) {
          if (item[value]) {
            obj[value] = item[value];
          }
        }
        newAddList.push(obj);
      });

      if (
        accountType == consts.otherConsts.ACCOUNTTYPE_PROFITANDLOSS &&
        enabledMonth > 1 &&
        isPeriodBeginAmount == true
      ) {
        // const ret = this.metaAction.modal('confirm', {
        //   title: '',
        //   content: '损益类科目的期初数据录入有误，存在期初余额不为0的数据，是否继续保存？',
        //   onOk: async () => {
        //
        //     const list = this.saveCheck(dataList, rowIndex)
        //     const res = await this.component.props.callbackAction({ result: true, value: list }, accountingSubject, rowIndex)
        //     if (!res) return false
        //   },
        //   onCancel() { }
        // })
      } else {
        this.$emit(
          "addMultiauxItem-setting",
          dataList,
          row,
          rowIndex,
          this.initData.type
        );
        // const res = await this.component.props.callbackAction({ result: true, value: dataList }, accountingSubject, rowIndex, this.component.props.initData.type)
        // if (!res) return false
      }
    },
    getMessage(message) {
      return (
        <div>
          {message.map((o, i) => {
            return <div>{o}</div>;
          })}
        </div>
      );
    },
    handleInput(e, rowIndex, columnName) {
      //e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108
      if (true) {
        const inputs = document.getElementsByClassName("");
        const index = rowIndex || 0;
        let newValue = e[columnName],
          list = this.tableData,
          errorMessage = this.getErrorMessage(columnName);
        if (newValue && newValue > 9999999999.99) {
          this.$baseMessage(
            `${errorMessage}不能大于9,999,999,999.99，请调整`,
            "warning"
          );
          return;
        }
        if (newValue && newValue < -9999999999.99) {
          this.$baseMessage(
            `${errorMessage}不能小于9,999,999,999.99，请调整`,
            "warning"
          );
          return;
        }
        if (newValue && newValue.indexOf(",") > -1) {
          newValue = newValue.replace(/,/g, "");
        }
        if (isNaN(newValue)) {
          this.$baseMessage(`请输入数字`, "warning");
          return;
        }
        if (inputs && inputs.length > 0) {
          inputs[index + 1].focus();
        }
      }
    },
    handlerFoucus(row, columnName) {
      //进入焦点重新获取档案数据
    },
    getErrorMessage(curEditField) {
      let errorMessage;
      if (curEditField === "beginQuantity") {
        errorMessage = `期初余额数量`;
      } else if (curEditField === "beginQuantityCr") {
        errorMessage = `期初贷方余额数量`;
      } else if (curEditField === "beginQuantityDr") {
        errorMessage = `期初借方余额数量`;
      } else if (curEditField === "beginOrigAmount") {
        errorMessage = `期初余额外币`;
      } else if (curEditField === "beginOrigAmountCr") {
        errorMessage = `期初贷方余额外币`;
      } else if (curEditField === "beginOrigAmountDr") {
        errorMessage = `期初借方余额外币`;
      } else if (curEditField === "beginAmount") {
        errorMessage = `期初余额`;
      } else if (curEditField === "beginAmountDr") {
        errorMessage = `期初借方余额`;
      } else if (curEditField === "beginAmountCr") {
        errorMessage = `期初贷方余额`;
      } else if (curEditField === "quantityDr") {
        errorMessage = `本年借方累计数量`;
      } else if (curEditField === "origAmountDr") {
        errorMessage = `本年借方累计外币`;
      } else if (curEditField === "amountDr") {
        errorMessage = `本年借方累计金额`;
      } else if (curEditField === "quantityCr") {
        errorMessage = `本年贷方累计数量`;
      } else if (curEditField === "origAmountCr") {
        errorMessage = `行本年贷方累计外币`;
      } else if (curEditField === "amountCr") {
        errorMessage = `本年贷方累计金额`;
      }

      return errorMessage;
    },
    async loadArchive(accountingSubject = {}, assistList) {
      if (accountingSubject.isCalcCustomer) {
        const response = await customer({
          entity: { isEnable: true, includingHierarchyName: true },
        });
        if (response.result) {
          this.customers = response.value.list;
        }
      }
      if (accountingSubject.isCalcDepartment) {
        const response = await department({
          entity: { isEnable: true, includingHierarchyName: true },
        });
        if (response.result) {
          this.departments = response.value.list;
        }
      }
      if (accountingSubject.isCalcPerson) {
        const response = await person({
          entity: { isEnable: true, includingHierarchyName: true },
        });
        if (response.result) {
          this.persons = response.value.list;
        }
      }
      if (accountingSubject.isCalcSupplier) {
        const response = await supplier({
          entity: { isEnable: true, includingHierarchyName: true },
        });
        if (response.result) {
          this.suppliers = response.value.list;
        }
      }
      if (accountingSubject.isCalcInventory) {
        const response = await inventory({
          entity: { isEnable: true, includingHierarchyName: true },
        });
        if (response.result) {
          this.inventorys = response.value.list;
        }
      }
      if (accountingSubject.isCalcProject) {
        const response = await project();
        if (response.result) {
          this.projects = response.value.list;
        }
      }
      if (accountingSubject.isCalcMulti) {
        const response = await currency();
        if (response.result) {
          this.currencys = response.value.list;
        }
      }
      if (assistList.length) {
        for (let i = 0; i < assistList.length; i++) {
          if (accountingSubject[assistList[i]]) {
            const response = await isExCalc({
              entity: { calcName: assistList[i] },
            });
            if (response.result) {
              this.isExCalc1 = response.value.list;
            }
          }
        }
      }
    },
    saveCheck(dataList) {
      if (this.currencys) {
        const currencyList = this.currencys;
        const listData = dataList;
        let rowIndex;
        currencyList.forEach((item) => {
          if (item.isBaseCurrency) {
            listData.forEach((key, keyIndex) => {
              if (key.currency && item.id == key.currency.id) {
                rowIndex = keyIndex;
              }
            });
          }
          if (rowIndex == 0 || rowIndex) {
            const currency = dataList[rowIndex]["currency"]
              ? dataList[rowIndex]["currency"]
              : "";
            if (item.id == currency.id && item.isBaseCurrency) {
              const attributeArray = [
                [
                  { key: "beginAmountCr", value: "" },
                  { key: "beginOrigAmountCr", value: "" },
                ],
                [
                  { key: "beginAmountDr", value: "" },
                  { key: "beginOrigAmountDr", value: "" },
                ],
                [
                  { key: "beginAmount", value: "" },
                  { key: "beginOrigAmount", value: "" },
                ],
                [
                  { key: "amountDr", value: "" },
                  { key: "origAmountDr", value: "" },
                ],
                [
                  { key: "amountCr", value: "" },
                  { key: "origAmountCr", value: "" },
                ],
              ];
              let allTrue = false;
              attributeArray.forEach((itemArr) => {
                itemArr.forEach((obj) => {
                  if (dataList[rowIndex][obj.key]) {
                    obj.value = dataList[rowIndex][obj.key];
                  }
                });

                if (itemArr[0].value && !itemArr[1].value) {
                  dataList[rowIndex][itemArr[1].key] = itemArr[0].value;
                  // dataList = dataList.update(rowIndex, (item) =>
                  //   item.set(itemArr[1].key, itemArr[0].value)
                  // );
                } else if (!itemArr[0].value && itemArr[1].value) {
                  dataList[rowIndex][itemArr[0].key] = itemArr[1].value;
                  // dataList = dataList.update(rowIndex, (item) =>
                  //   item.set(itemArr[0].key, itemArr[1].value)
                  // );
                } else if (itemArr[0].value && itemArr[1].value) {
                  dataList[rowIndex][itemArr[1].key] = itemArr[0].value;
                  // dataList = dataList.update(rowIndex, (item) =>
                  //   item.set(itemArr[1].key, itemArr[0].value)
                  // );
                }
              });
            }
          }
        });
      }
      return dataList;
    },
    checkAccFileMultiBeforeSave(dataList, initData) {
      //保存前的数据校验
      let errorMsg = [],
        accFileList = [],
        allItemEmpty = true,
        isPeriodBeginAmount = false,
        isSelect = false;

      for (let i = 0; i < dataList.length; i++) {
        let item = dataList[i],
          accFileItem = {};

        const calcDictList = initData.calcDict;
        const assistList = [];
        if (calcDictList) {
          for (let key in calcDictList) {
            if (key.includes("isExCalc")) {
              assistList.push({ name: key, value: calcDictList[key] });
            }
          }
        }

        if (assistList.length != 0) {
          for (let i = 0; i < assistList.length; i++) {
            if (initData[assistList[i].name] && item[assistList[i].name]) {
              if (item[assistList[i].name].name) {
                isSelect = true;
              }
            }
          }
        }
        //跳过空行和只有摘要的行
        if (
          !item ||
          (!item["department"] &&
            !item["person"] &&
            !item["customer"] &&
            !item["supplier"] &&
            !item["inventory"] &&
            !item["project"] &&
            !item["currency"] &&
            !item["beginQuantityDr"] &&
            !item["beginQuantityCr"] &&
            !item["beginOrigAmountDr"] &&
            !item["beginOrigAmountCr"] &&
            !item["beginAmountDr"] &&
            !item["beginAmountCr"] &&
            !item["quantityDr"] &&
            !item["origAmountDr"] &&
            !item["amountDr"] &&
            !item["quantityCr"] &&
            !item["origAmountCr"] &&
            !item["amountCr"] &&
            !isSelect)
        ) {
          continue;
        }
        allItemEmpty = false;
        isSelect = false;

        // 辅助核算项是否为空
        let errorAccFile = "";

        if (initData["isCalcDepartment"] && !item["department"]) {
          errorAccFile += "，部门 ";
        }
        if (initData["isCalcPerson"] && !item["person"]) {
          errorAccFile += "，人员 ";
        }
        if (initData["isCalcCustomer"] && !item["customer"]) {
          errorAccFile += "，客户";
        }
        if (initData["isCalcSupplier"] && !item["supplier"]) {
          errorAccFile += "，供应商";
        }
        if (initData["isCalcInventory"] && !item["inventory"]) {
          errorAccFile += "，存货";
        }
        if (initData["isCalcProject"] && !item["project"]) {
          errorAccFile += "，项目";
        }
        if (initData["isCalcMulti"] && !item["currency"]) {
          errorAccFile += "，币种 ";
        }
        if (assistList.length != 0) {
          for (let i = 0; i < assistList.length; i++) {
            if (initData[assistList[i].name] && !item[assistList[i].name]) {
              errorAccFile += `，${assistList[i].value} `;
            }
          }
        }

        if (!!errorAccFile) {
          errorMsg.push("第" + (i + 1) + "行" + errorAccFile + "不能为空");
        }

        if (
          (!!item["beginAmountDr"] &&
            item["beginAmountDr"] != 0 &&
            item["beginAmountDr"] != "0") ||
          (!!item["beginAmountCr"] &&
            item["beginAmountCr"] != 0 &&
            item["beginAmountCr"] != "0")
        ) {
          isPeriodBeginAmount = true;
        }
      }
      //5) 不能全为空行
      if (!!allItemEmpty) {
        errorMsg.push("请填写辅助明细!");
      }
      return { errorMsg: errorMsg, isPeriodBeginAmount: isPeriodBeginAmount };
    },
    async onOk() {},
    cancelForm() {
      this.$emit("addMultiauxItem-setting");
    },
    quantityFormat(quantity, decimals = 0, isFocus) {
      if (quantity) {
        XEUtils.toNumber(quantity).toFixed(decimals);
      }
    },
  },
};
</script>

<style lang="scss">
.addMultiauxItem {
  .vxe-select--panel {
    z-index: 99999999;
  }
  &-title {
    font-weight: bold;
  }
  .footer {
    margin-top: 15px;
    text-align: right;
  }
}
</style>