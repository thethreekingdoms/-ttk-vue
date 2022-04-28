<template>
  <el-container id="voucherRecycle">
    <el-container class="contentWrap">
      <el-aside width="80px">
        <timeline :disValue="displayDate" :timeValue="timePeriod" @timelineClick="timelineChange"></timeline>
      </el-aside>
      <el-container>
        <el-header>
          <el-row :gutter="10">
            <el-col style="width:initial">
              <div class="displayDate">
                <el-date-picker
                  style="width:200px;"
                  v-model="displayDate"
                  type="monthrange"
                  value-format="yyyy-MM"
                  start-placeholder="开始月份"
                  end-placeholder="结束月份"
                  @change="dateChange"
                  :clearable="false"
                ></el-date-picker>
              </div>
            </el-col>
            <el-col style="text-align:center;width: 70px">
              <el-link type="primary" :underline="false" @click="showMoreSearch = true">高级查询</el-link>
              <h-search
                v-if="searchConditions"
                v-model="showMoreSearch"
                :content_="searchContent"
                @search="handleSearch"
                :accountList="accountList"
                :voucherStateList="voucherStateList"
                :currencyList="currencyList"
                :ruleForm="ruleForm"
                :rules="rules"
              ></h-search>
            </el-col>
            <el-col style="width:220px">
              <el-input
                placeholder="科目/摘要/凭证号/金额"
                suffix-icon="el-icon-search"
                v-model="searchValue.simpleCondition"
                @change="searchChange"
              ></el-input>
            </el-col>
            <el-col :span="1">
              <el-button icon="el-icon-refresh-right" @click="requestData"></el-button>
            </el-col>
            <el-col :span="11" style="text-align:right;float:right;">
              <el-button type="primary" @click="docRestore">凭证还原</el-button>
              <el-button @click="deletBatch">彻底删除</el-button>
              <el-button @click="docClear">清空回收站</el-button>
            </el-col>
          </el-row>
        </el-header>
        <div class="columnContainer">
          <div class="columnset">
            <i class="el-icon-s-operation" @click="showGridSettings = true" title="栏目设置"></i>
          </div>
        </div>
        <el-main>
          <!-- -->
          <grid-settings
            v-if="searchConditions"
            v-model="showGridSettings"
            @setting="handleSetting"
            columns="2"
            ctitle="表头,明细"
            diff="isHeader"
            :list="columnDto.columnDetails"
          ></grid-settings>

          <vxe-table
            border
            highlight-hover-row
            ref="proofListxTable"
            :align="allAlign"
            :data="newTableData"
            height="auto"
            :scroll-y="{gt: -1}"
            :span-method="mergeRowMethod"
            :checkbox-config="{checkField: 'checked', checkRowKeys: selectRowIds}"
            :row-class-name="rowClassName"
            :sort-config="{remote: true}"
            row-id="docId"
            @checkbox-all="selectAllEvent"
            @checkbox-change="selectChangeEvent"
            @sort-change="sortChangeEvent"
            @resizable-change="resizeChangeEvent"
            resizable
            :loading="loading"
          >
            <vxe-table-column field="docId" type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column
              v-for="item in columnDto.columnDetails"
              :key="item.fieldName"
              :field="item.fieldName"
              :width="item.width"
              :title="item.caption"
              :visible="item.isVisible"
              :align="getAlign(item.fieldName,item.isHeader)"
              :sortable="item.fieldName=='voucherDate'||item.fieldName=='docTypeAndCode'"
              show-overflow
            >
            <template v-slot="{ row }">
                <div
                  v-if="item.fieldName==='amountCr'||item.fieldName==='amountDr'||item.fieldName==='amountSum'"
                >{{ row[item.fieldName]&&parseFloat(row[item.fieldName]).toFixed(2) }}</div>
                <div v-else class="cell" :title="row[item.fieldName]">{{ row[item.fieldName] }}</div>
              </template>
            </vxe-table-column>
          </vxe-table>
        </el-main>
        <el-footer>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="searchValue.page.currentPage"
            :page-sizes="[10, 20, 50, 500]"
            :page-size="searchValue.page.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="searchValue.page.totalCount"
          ></el-pagination>
        </el-footer>
      </el-container>
    </el-container>
    <!-- <el-footer>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="searchValue.page.currentPage"
        :page-sizes="[10, 20, 50, 500]"
        :page-size="searchValue.page.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchValue.page.totalCount"
      ></el-pagination>
    </el-footer> -->
  </el-container>
</template>
<script>
import {
  docRecycleInit,
  docRecycleQuery,
  findByParam,
  updateColumn,
  resetColumn,
  updateColumnWidth,
  docRecycleBatchDel,
  recoveryDoc,
  clear,
  getExistsDataScope,
} from "@/api/gl/gl_voucherlist";
import Timeline from "@/components/Timeline";
import GridSettings from "@/components/GridSettings";
import XEUtils from "xe-utils";
import * as consts from "@/utils/consts.js";
import { createLogger } from "vuex";
export default {
  name: "proofRecycle",
  components: {
    GridSettings,
    Timeline,
  },
  data() {
    return {
      pickerOptions: {},
      input2: "",
      tableData: [],
      allAlign: "center",
      newTableData: [],
      showMoreSearch: false,
      showGridSettings: false,
      showDocCodeSet: false,
      showModifyCreator: false,
      showSortDocCode: false,
      showImportDoc: false,
      showExportDoc: false,
      showCustomSort: false,
      currencyList: null, //高级查询币种集合
      accountList: null, //高级查询科目集合
      voucherStateList: null,
      redDashedDate: undefined,
      showRedDashed: false,
      selectRows: [],
      selectRowIds: [],
      note: "",
      list: [],
      timePeriod: {},
      loading: false,
      ruleForm: {
        code: "",
      },
      rules: {
        code: [{ validator: this.validateCode, trigger: "blur" }],
      },
      columnDto: {
        columnDetails: [
          {
            orgId: 4043128470475776,
            id: 50000100001,
            columnId: 4043950162154496,
            fieldName: "voucherDate",
            caption: "日期",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 1,
            isFixed: false,
            isVisible: true,
            isMustSelect: true,
            isSystem: false,
            isHeader: true,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100002,
            columnId: 4043950162154496,
            fieldName: "docTypeAndCode",
            caption: "凭证字号",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 2,
            isFixed: false,
            isVisible: true,
            isMustSelect: true,
            isSystem: false,
            isHeader: true,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100003,
            columnId: 4043950162154496,
            fieldName: "amountSum",
            caption: "总金额",
            idFieldType: 1000040002,
            width: 100,
            idAlignType: 1000050003,
            colIndex: 3,
            isFixed: false,
            isVisible: false,
            isMustSelect: false,
            isSystem: false,
            isHeader: true,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100004,
            columnId: 4043950162154496,
            fieldName: "summary",
            caption: "摘要",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 4,
            isFixed: false,
            isVisible: true,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100005,
            columnId: 4043950162154496,
            fieldName: "accountCodeName",
            caption: "会计科目",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 5,
            isFixed: false,
            isVisible: true,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100006,
            columnId: 4043950162154496,
            fieldName: "currencyAndExchangeRate",
            caption: "币种/汇率",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 6,
            isFixed: false,
            isVisible: true,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100007,
            columnId: 4043950162154496,
            fieldName: "unitName",
            caption: "计量单位",
            idFieldType: 1000040001,
            width: 100,
            idAlignType: 1000050001,
            colIndex: 7,
            isFixed: false,
            isVisible: false,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100008,
            columnId: 4043950162154496,
            fieldName: "quantity",
            caption: "数量",
            idFieldType: 1000040002,
            width: 100,
            idAlignType: 1000050003,
            colIndex: 8,
            isFixed: false,
            isVisible: false,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100009,
            columnId: 4043950162154496,
            fieldName: "price",
            caption: "单价",
            idFieldType: 1000040002,
            width: 100,
            idAlignType: 1000050003,
            colIndex: 9,
            isFixed: false,
            isVisible: false,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
          {
            orgId: 4043128470475776,
            id: 50000100010,
            columnId: 4043950162154496,
            fieldName: "origAmount",
            caption: "外币金额",
            idFieldType: 1000040002,
            width: 100,
            idAlignType: 1000050003,
            colIndex: 10,
            isFixed: false,
            isVisible: false,
            isMustSelect: false,
            isSystem: false,
            isHeader: false,
            isTotalColumn: false,
            ts: "2018-02-12 15:26:28",
          },
        ],
        ts: "",
        code: "",
      },
      searchValue: {
        accountIds: undefined, //--科目ID
        endCode: undefined, //--终止凭证号
        startCode: undefined, //--起始凭证号
        date: undefined,
        startPeriod: undefined,
        startYear: undefined,
        endYear: undefined,
        endPeriod: undefined,
        docIds: undefined, //--凭证ID列表
        summary: undefined, //--摘要
        userOrderField: null, //排序字段
        order: null, //升降序排序
        startDate: undefined,
        endDate: undefined,
        page: { pageSize: 50, currentPage: 1 },
        voucherState: undefined, //--单据状态
        sourceVoucherTypeId: undefined, //--单据类型 -- 单据来源
        simpleCondition: undefined, //简单查询
      },
      displayDate: ["2020-05", "2020-05"],

      codeData: {},
      creatorData: {},
      sortData: {},
      importData: {},
      exportData: {},
      customSortData: {},
      columnDto: {},
    };
  },
  computed: {
    searchConditions() {
      return this.accountList && this.accountList.length;
    },
    searchContent() {
      return [
        {
          name: "date",
          label: "会计期间",
          children: {
            component: "el-date-picker",
            _value: this.displayDate,
            attrs: {
              name: "date",
              type: "monthrange",
              rangeSeparator: "-",
              valueFormat: "yyyy-MM",
              startPlaceholder: "开始月份",
              endPlaceholder: "结束月份",
            },
          },
        },
        {
          name: "code",
          label: "凭证号",
          children: {
            component: "h-input-range",
            _value: "code",
            attrs: {
              rangeSeparator: "-",
            },
          },
        },
        {
          name: "accountId",
          label: "科目",
          children: {
            component: "el-select",
            _value: "accountId",
            list: "accountList",
            attrs: {
              // multiple: true,
              _name: "codeAndName",
              _key: "id",
            },
          },
        },
        {
          name: "summary",
          label: "摘要",
          children: {
            component: "el-input",
            _value: "summary",
          },
        },
        {
          name: "amount",
          label: "金额",
          children: {
            component: "h-input-range",
            _value: "amount",
            attrs: {
              rangeSeparator: "-",
            },
          },
        },
        {
          name: "creator",
          label: "制单人",
          children: {
            component: "el-input",
            _value: "creator",
          },
        },
        {
          name: "creator",
          label: "删除操作人",
          children: {
            component: "el-input",
            _value: "deleter",
          },
        },
        {
          name: "deldate",
          label: "删除日期",
          children: {
            component: "el-date-picker",
            _value: "deldate",
            attrs: {
              name: "deldate",
              type: "daterange",
              rangeSeparator: "-",
              valueFormat: "yyyy-MM-dd",
              startPlaceholder: "开始月份",
              endPlaceholder: "结束月份",
            },
          },
        },
      ];
    },
  },
  methods: {
    //凭证号校验
    validateCode(rule, value, callback) {
      console.log(rule, value);
      if (value) {
        let startCode = value[0];
        let endCode = value[1];
        if (startCode) {
          startCode = parseInt(startCode);
          if (isNaN(startCode) || startCode > 99999 || startCode < 0) {
            return callback(new Error("请输入正确的凭证号"));
          }
        }
        if (endCode) {
          endCode = parseInt(endCode);
          if (isNaN(endCode) || endCode > 99999 || endCode < 0) {
            return callback(new Error("请输入正确的凭证号"));
          }
        }
        return callback();
      } else {
        return;
      }
    },
    async getDocManageList() {
      let [res, timeResponse] = await Promise.all([
        docRecycleInit({}),
        getExistsDataScope({}),
      ]);
      if (timeResponse && timeResponse.result && timeResponse.value) {
        let minDate, maxDate
        if(res.result && res.value) {
          let {maxDataPeriod, minDataPeriod} = res.value
          // if(maxDataPeriod && minDataPeriod) {

          //   minDate = minDataPeriod < timeResponse.value.minDataPeriod ?
          //    minDataPeriod : 
          //    timeResponse.value.minDataPeriod

          //   maxDate = maxDataPeriod > timeResponse.value.maxDataPeriod ? 
          //     maxDataPeriod : 
          //     timeResponse.value.maxDataPeriod
          // }
          minDate = minDataPeriod
          maxDate = maxDataPeriod
        }
        this.timePeriod = minDate && maxDate ? 
        { minDataPeriod: minDate, maxDataPeriod: maxDate } :
        timeResponse.value

        // this.timePeriod = timeResponse.value
      }
      // let res = await docRecycleInit();
      if (res.result) {
        this.loading = false;
        this.loadTable(res);
      }
    },
    loadTable(res) {
      let arr = [];
      // 数据格式化 满足合并行
      this.list = res.value.docList;
      this.tableData = res.value.docList.forEach((item, index) => {
        let amountDrTotal = 0;
        let amountCrTotal = 0;
        let docListIndex = index;
        item.entrys.forEach((el, index) => {
          if (el.amountDr && el.amountDr !== "") {
            amountDrTotal += parseFloat(el.amountDr);
          }
          if (el.amountCr && el.amountCr !== "") {
            amountCrTotal += parseFloat(el.amountCr);
          }
          item.auditor = item.auditor ? item.auditor : undefined;
          let obj = { ...item, ...el };
          if (res.value.maxClosedPeriod && res.value.maxClosedYear) {
            if (
              res.value.maxClosedYear > item.year ||
              (res.value.maxClosedYear == item.year &&
                item.period <= res.value.maxClosedPeriod)
            ) {
              item.settleAccounts = true;
            }
          }
          obj.settleAccounts = item.settleAccounts;
          arr.push(obj);
          // if (item.entrys.length == index + 1) {
          // let totalObj = {
          //   ...item,
          //   ...el,
          // };

          // }
        });
        arr.push(
          // { ...totalObj },
          {
            voucherDate: "合计",
            docTypeAndCode: "",
            amountDr: amountDrTotal,
            amountCr: amountCrTotal,
            operate: docListIndex + 1,
            docId: item.docId,
            summary: "",
            accountCodeName: "",
            ts: item.ts,
            sourceVoucherCode: "",
            auditor: "",
            creator: "",
            voucherState: item.voucherState,
            voucherStateName: "",
          }
        );
      });
      this.newTableData = arr;
      this.$set(this.searchValue, "page", res.value.page);
      if (res.value.currencyList)
        this.currencyList = this.changeToOption(
          res.value.currencyList,
          "name",
          "id"
        );
      if (res.value.accountList) this.accountList = res.value.accountList;
      if (res.value.voucherStateList)
        this.voucherStateList = res.value.voucherStateList;
      if (res.value.columnDto) {
        this.$set(
          this.columnDto,
          "columnDetails",
          res.value.columnDto.columnDetails
        );
        this.$set(this.columnDto, "ts", res.value.columnDto.ts);
        this.$set(this.columnDto, "code", res.value.columnDto.code);
      }
      if (res.value.displayDate)
        this.displayDate = [res.value.displayDate, res.value.displayDate];
    },
    // 通用合并行列
    mergeRowMethod({ row, $rowIndex, column, data, columnIndex }) {
      let columns = this.columnDto.columnDetails;
      let fields = ["docId"];
      columns.forEach((item) => {
        if (item.isHeader && item.isVisible) fields.push(item.fieldName);
      });
      let cellValue = XEUtils.get(row, column.property);
      let countRowspan, countColspan;
      if (fields.includes(column.property)) {
        const prevRow = data[$rowIndex - 1];
        let nextRow = data[$rowIndex + 1];
        if (
          prevRow &&
          XEUtils.get(prevRow, column.property) === cellValue &&
          XEUtils.get(prevRow, "docId") === row.docId
        ) {
          return { rowspan: 0, colspan: 0 };
        } else {
          countRowspan = 1;
          while (
            nextRow &&
            XEUtils.get(nextRow, column.property) === cellValue &&
            XEUtils.get(nextRow, "docId") === row.docId
          ) {
            nextRow = data[++countRowspan + $rowIndex];
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 };
          }
        }
      }
    },
    sortChangeEvent({ column, property, order }) {
      if (property === "docTypeAndCode") {
        this.$set(this.searchValue, "userOrderField", "docCode");
      } else {
        this.$set(this.searchValue, "userOrderField", property);
      }
      this.$set(this.searchValue, "order", order);
      this.requestData();
    },
    handleSizeChange(val) {
      let page = this.searchValue.page;
      page.pageSize = val;
      this.$set(this.searchValue, "page", page);
      this.requestData();
    },
    handleCurrentChange(val) {
      let page = this.searchValue.page;
      page.currentPage = val;
      this.$set(this.searchValue, "page", page);
      this.requestData();
    },
    timelineChange(item) {
      this.displayDate = [item.activeText, item.activeText];
      this.requestData();
    },
    processDtoList(columnDetails, dtoList) {
      let docDetailsCol = columnDetails.filter(
          (item) => item.isHeader == false && item.isVisible == true
        ),
        retDtoList = [];

      // 凭证管理中要显示明细列
      if (docDetailsCol && docDetailsCol.length > 0) {
        retDtoList = dtoList;
        // 凭证管理中不显示明细列时，做数据排重用以控制行的高度为标准行高
      } else {
        let docCode = "";
        for (var i = 0; i < dtoList.length; i++) {
          if (docCode != dtoList[i].docCode) {
            retDtoList.push(dtoList[i]);
            docCode = dtoList[i].docCode;
          }
        }
      }

      return retDtoList;
    },
    async requestData(type) {
      if (this.displayDate) {
        this.$set(
          this.searchValue,
          "startYear",
          this.displayDate[0].split("-")[0]
        );
        this.$set(
          this.searchValue,
          "startPeriod",
          this.displayDate[0].split("-")[1]
        );
        this.$set(
          this.searchValue,
          "endYear",
          this.displayDate[1].split("-")[0]
        );
        this.$set(
          this.searchValue,
          "endPeriod",
          this.displayDate[1].split("-")[1]
        );
      }
      if (type === "get") {
        return this.searchValue;
      }
      this.loading = true;
      let response = await docRecycleQuery(this.searchValue);
      if (response && !response.error) {
        this.loadTable(response);
      }
      this.loading = false;
    },
    /**
     *
     * @param {Array} data 原数组
     * @param {string} label  转变为label的字段
     * @param {string} key 转变为value的字段
     */
    changeToOption(data, label = "label", key = "value") {
      return data.map((item) => {
        return {
          ...item,
          label: item[label],
          value: item[key].toString(),
        };
      });
    },
    rowClassName({ row, rowIndex }) {
      if (row.voucherDate.includes("合计")) {
        return "row-green";
      }
    },
    selectAllEvent({ checked, records }) {
      let selectRows = [];
      let selectRowIds = [];
      console.log(checked ? "所有勾选事件" : "所有取消事件", records);
      records.forEach((item) => {
        selectRows.push(item);
        selectRowIds.push(item.docId);
      });
      this.selectRows = selectRows;
      this.selectRowIds = selectRowIds;
    },
    selectChangeEvent({ checked, records }) {
      let selectRows = [];
      let selectRowIds = [];
      // let selectRecords = this.$refs.proofListxTable.getCheckboxRecords();
      console.log(checked ? "勾选事件" : "取消事件", records);
      records.forEach((item) => {
        selectRows.push(item);
        selectRowIds.push(item.docId);
      });
      this.selectRows = selectRows;
      this.selectRowIds = selectRowIds;
    },
    //获取选中行
    getSelectEvent() {
      let selectRecords = this.$refs.proofListxTable.getCheckboxRecords();
    },
    async onBlurNoteInput(value, row) {
      this.note = value;
      let response = await updateNote({
        note: value,
        ts: row.ts,
        docId: row.docId,
      });
    },
    dateChange(value) {
      this.$set(this.searchValue, "startYear", value[0].split("-")[0]);
      this.$set(this.searchValue, "startPeriod", value[0].split("-")[1]);
      this.$set(this.searchValue, "endYear", value[1].split("-")[0]);
      this.$set(this.searchValue, "endPeriod", value[1].split("-")[1]);
      this.requestData();
    },
    handleSearch(result, hsearch) {
      hsearch &&
        hsearch.validate((valid) => {
          if (valid) {
          } else {
            return false;
          }
        });
      this.showMoreSearch = false;
      if (!result) return;
      let searchValue = this.searchValue;
      console.log(result);
      if (result.date) this.displayDate = result.date;
      searchValue.startYear = this.displayDate[0].split("-")[0];
      searchValue.startPeriod = this.displayDate[0].split("-")[1];
      searchValue.endYear = this.displayDate[1].split("-")[0];
      searchValue.endPeriod = this.displayDate[1].split("-")[1];
      if (result.deldate) searchValue.startDate = result.deldate[0];
      if (result.deldate) searchValue.endDate = result.deldate[1];
      let startCodeNum = parseInt((result.code && result.code[0]) || 0);
      let endCodeNum = parseInt((result.code && result.code[1]) || 0);
      if (!endCodeNum) {
        searchValue.endCode = 99999;
        endCodeNum = 99999;
      }
      if (endCodeNum > startCodeNum) {
        searchValue.startCode = this.padStart(startCodeNum);
        searchValue.endCode = this.padStart(endCodeNum);
      } else {
        searchValue.startCode = this.padStart(endCodeNum);
        searchValue.endCode = this.padStart(startCodeNum);
      }
      // if (result.code) searchValue.startCode = this.code[0].padStart(5, "0");
      // if (result.code) searchValue.endCode = this.code[1].padStart(5, "0");
      if (result.amount) {
        searchValue.startAmount = result.amount[0];
        searchValue.endAmount = result.amount[1];
      } else {
        searchValue.startAmount = null;
        searchValue.endAmount = null;
      }
      searchValue.accountId = result.accountId;
      searchValue.voucherState = result.voucherState;
      searchValue.summary = result.summary;
      searchValue.creator = result.creator;
      searchValue.currencyId = result.currencyId;
      searchValue.deleter = result.deleter;
      this.searchValue = searchValue;
      this.requestData();
    },
    padStart(num) {
      return num.toString().padStart(5, "0");
    },
    async handleSetting(result) {
      this.showGridSettings = false;
      if (!result) return;
      if (result === "reset") {
        // 重置
        let response = await resetColumn({ code: this.columnDto.code });
        if (response && !response.error) {
          await this.getDocManageList();
          this.$refs.proofListxTable.refreshColumn();
        }
      } else {
        // 更新
        console.log(result);
        const columnSolution = await findByParam({
          code: "docListBack",
        });
        if (columnSolution && !columnSolution.error) {
          let columnSolutionId = columnSolution.value.id;
          const ts = this.columnDto.ts;
          const columnDetail = await updateColumn({
            id: columnSolutionId,
            columnDetails: this.combineColumnProp(result),
            ts: ts,
          });
          if (columnDetail && !columnDetail.error) {
            this.$set(
              this.columnDto,
              "columnDetails",
              columnDetail.value.columnDetails
            );
            this.$refs.proofListxTable.refreshColumn();
          }
        }
      }
    },
    combineColumnProp(data) {
      if (!data) return [];
      let newDataArray = [];
      data.forEach((ele, index) => {
        newDataArray.push({
          isVisible: ele.isVisible,
          id: ele.id,
          ts: ele.ts,
        });
      });
      return newDataArray;
    },
    printSettings() {
      console.log("printSettings click");
    },
    getAlign(columnKey, isHeader) {
      let align = "center";
      if (isHeader == true) {
        if (columnKey == "amountSum") {
          align = "right";
        }
      } else {
        if (columnKey == "summary" || columnKey == "accountCodeName") {
          align = "left";
        } else if (
          columnKey == "price" ||
          columnKey == "origAmount" ||
          columnKey == "amountDr" ||
          columnKey == "amountCr"
        ) {
          align = "right";
        }
      }
      return align;
    },
    //列宽拖动
    async resizeChangeEvent({
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }) {
      console.log($rowIndex, column, columnIndex, $columnIndex, $event);
    },
    searchChange(value) {
      console.log(value);
      this.requestData();
    },
    //凭证还原
    async docRestore() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要还原的数据", "warning");
        return;
      }
      const res = await recoveryDoc({
        docIds: this.selectRowIds,
        isReturnValue: true,
      });
      if (res && !res.error) {
        if (res.value.allSuccess) {
          this.$baseMessage("还原成功!", "success");
        } else {
          this.$baseMessage(
            <div>
              {`本次还原成功${res.value.successList.length}条,失败${res.value.errorList.length}条`}
            </div>,
            "warning"
          );
        }
      } else {
        this.$baseMessage(res.error.message, "error");
        return;
      }
      this.requestData();
    },
    //彻底删除
    deletBatch() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要还原的数据", "warning");
        return;
      }
      this.$confirm(
        <div>
          本次删除凭证
          <span class="delconfirmNum">{this.selectRows.length}张</span>
          ，确认是否删除？
        </div>,
        "温馨提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          customClass: "delDocConfirm",
        }
      )
        .then(async () => {
          const response = await docRecycleBatchDel({
            docIds: this.selectRowIds,
            isReturnValue: true,
          });
          if (response && !response.error) {
            this.$baseMessage("删除成功!", "success");
            this.requestData();
          } else {
            this.$baseMessage(response.error.message, "error");
          }
        })
        .catch(() => {});
    },
    //清空回收站
    docClear() {
      this.$confirm(<div>确认是否清空回收站？</div>, "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "delDocConfirm",
      })
        .then(async () => {
          let response = await clear({ isReturnValue: true });
          if (response && !response.error) {
            this.$baseMessage("清空成功!", "success");
            this.requestData();
          }
        })
        .catch(() => {});
    },
  },

  created() {
    this.loading = true;
    this.getDocManageList();
  },
};
</script>
<style lang="scss">
#voucherRecycle {
  padding-top: 0;
  padding: 0px 10px;
  // height: 100vh;
  height: 100%;
  .contentWrap {
    height: 100%;
  }
  .el-aside {
    margin-bottom: 45px;
  }
  .q-timeline{
    height: 100%;
  }
  .grid-settings{
    height: auto;
  }
  .columnContainer {
    position: relative;
    .columnset {
      text-align: right;
      padding: 0 10px;
      position: absolute;
      background: #fff;
      right: 0px;
      top: 18px;
      margin-top: -13px;
      border-radius: 13px 0 0 13px;
      cursor: pointer;
      width: 34px;
      height: 26px;
      font-weight: 600;
      font-size: 22px;
      z-index: 19;
      line-height: 26px;
      box-shadow: 0 2px 4px 0 rgba(171, 178, 184, 0.45);
    }
  }

  .vxe-table {
    .row-green {
      background: #fff6ea;
      font-weight: bold;
    }
    .vxe-body--column {
      height: 38px;
      .vxe-cell {
        line-height: 16px;
        padding-left: 8px;
        padding-right: 8px;
        .cell{
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .el-icon-s-operation {
          font-size: 18px;
          font-weight: bold;
        }
      }
    }

    .vxe-table--header-wrapper {
      .vxe-header--row {
        .vxe-header--column {
          text-align: center !important;
        }
      }
    }
    .operate {
      button {
        border: none;
        font-size: 18px;
        padding: 0;
      }
      .comment {
        margin-left: 10px;
      }
    }
  }
  .el-header {
    // background-color: #b3c0d1;
    // color: #333;
    position: relative;
    line-height: 60px;
    .displayDate {
      .el-date-editor {
        .el-range__close-icon {
          width: 0px;
        }
      }
    }
  }
  .el-aside {
    color: #333;
  }
  .el-main {
    padding: 0;
    position: relative;
  }
  .voucherSetting-dialog {
    .el-dialog {
      width: 500px;
    }
  }
  .customSort-dialog {
    .el-dialog {
      width: 1100px;
    }
  }
  .importDoc-dialog {
    .el-dialog {
      width: 500px;
    }
  }
  .sortDocCode-dialog {
    .el-dialog {
      width: 400px;
    }
  }
  .exportDoc-dialog {
    .el-dialog {
      width: 400px;
    }
  }
  .modifyCreator-dialog {
    .el-dialog {
      width: 600px;
    }
  }
}
.delDocConfirm {
  .delconfirmNum {
    color: red;
    font-size: 24px;
    margin: 0px 3px;
  }
}
.el-footer {
  .el-pagination{
    .el-input__inner{
      line-height: 28px;
    }
  }
}
</style>

<style lang="scss" scoped>
// .ttk-edf-app-iframe-iframe{
  #voucherRecycle{
    height: 100vh;
  }
// }
</style>