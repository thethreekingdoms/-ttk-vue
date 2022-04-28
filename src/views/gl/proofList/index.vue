<template>
  <el-container id="voucherList">
    <el-container>
      <el-aside width="80px">
        <timeline :disValue="displayDate" :timeValue="timePeriod" @timelineClick="timelineChange"></timeline>
      </el-aside>
      <el-container>
        <el-header
          style="display:flex;justify-content: space-between;align-items:center"
          class="header"
        >
          <!-- <el-row :gutter="10" style="display:flex;justify-content: space-between;"> -->
          <div style="display:flex;">
            <div style="width:initial">
              <div class="displayDate">
                <el-date-picker
                  style="width:170px;"
                  v-model="displayDate"
                  type="monthrange"
                  value-format="yyyy-MM"
                  start-placeholder="开始月份"
                  end-placeholder="结束月份"
                  @change="dateChange"
                  :clearable="false"
                ></el-date-picker>
              </div>
            </div>
            <div
              style="text-align:center;width: 60px;padding-left:0;padding-right:0;line-height:32px"
            >
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
            </div>
            <div>
              <el-input
                placeholder="科目/摘要/凭证号/金额"
                suffix-icon="el-icon-search"
                v-model="searchValue.simpleCondition"
                @change="searchChange"
              ></el-input>
            </div>
            <div style="width:40px;margin-left:8px">
              <el-button icon="el-icon-refresh-right" @click="requestData"></el-button>
            </div>
          </div>
          <div style="text-align:right;display:flex;" class="header-right">
            <div>
              <el-popover
                placement="bottom"
                width="200"
                trigger="hover"
                v-if="!checkDocCode"
                content="凭证出现断号，点击后可以直接【断号整理】，或者按照记账日期优先排序后整理断号【序时整理】"
              >
                <i
                  slot="reference"
                  class="el-icon-warning-outline"
                  style="color:#F64C33;font-size:20px;position:relative;top:2px;margin-right:2px;"
                ></i>
              </el-popover>
              <a
                v-if="!checkDocCode"
                @click="sortDocCode"
                style="color:#F64C33;margin-right:8px;"
              >整理断号</a>
              <el-button type="primary" @click="addDoc">新增凭证</el-button>
              <el-button @click="audit">审核</el-button>
              <el-dropdown style="margin-left:8px;">
                <el-button>
                  更多
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="sortDocCode">整理凭证号</el-dropdown-item>
                  <el-dropdown-item @click.native="deleteDoc">删除</el-dropdown-item>
                  <el-dropdown-item @click.native="unAuditDoc">反审核</el-dropdown-item>
                  <el-dropdown-item @click.native="insertDoc">插入凭证</el-dropdown-item>
                  <el-dropdown-item @click.native="redDashed">红冲凭证</el-dropdown-item>
                  <!-- <el-dropdown-item>批量复制凭证</el-dropdown-item> -->
                  <el-dropdown-item @click.native="customSortDoc">自定义排序</el-dropdown-item>
                  <el-dropdown-item @click.native="modifyCreator">批量修改制单人</el-dropdown-item>
                  <el-dropdown-item @click.native="voucherRuleSetting">凭证号规则设置</el-dropdown-item>
                  <el-dropdown-item @click.native="docRecycle">凭证回收站</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown style="margin-left:8px;" split-button @click="printDoc">
                <!-- <el-button type="primary"> -->
                <i class="el-icon-printer el-icon--left"></i>
                <!-- <i class="el-icon-arrow-down el-icon--right"></i> -->
                <!-- </el-button> -->
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <print-settings @printSettings="printset"></print-settings>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button style="margin-left:8px;" @click="importFile">导入</el-button>
              <el-dropdown style="margin-left:8px;">
                <el-button type="primary">
                  导出
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="exportDocList">凭证列表格式</el-dropdown-item>
                  <el-dropdown-item @click.native="exportTemplate">导出模板格式</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>

          <!-- </el-row> -->
        </el-header>
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
            height="auto"
            :span-method="mergeRowMethod"
            :checkbox-config="{checkField: 'checked', checkRowKeys: selectRowIds}"
            :sort-config="{remote: true}"
            :row-class-name="rowClassName"
            row-id="docId"
            @checkbox-all="selectAllEvent"
            @checkbox-change="selectChangeEvent"
            @sort-change="sortChangeEvent"
            @resizable-change="resizeChangeEvent"
            resizable
            :loading="loading"
          >
            <vxe-table-column field="docId" type="checkbox" width="50"></vxe-table-column>
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
              show-header-overflow
              :formatter="formatterCell"
            >
              <template v-slot="{ row }">
                <a
                  @click="() => linkToDoc(row)"
                  v-if="item.fieldName==='docTypeAndCode'"
                >{{ row[item.fieldName] }}</a>
                <div
                  v-else-if="item.fieldName==='amountCr'||item.fieldName==='amountDr'||item.fieldName==='amountSum'"
                >{{ row[item.fieldName]&&parseFloat(row[item.fieldName]).toFixed(2) }}</div>
                <div v-else class="cell" :title="row[item.fieldName]">{{ row[item.fieldName] }}</div>
              </template>
            </vxe-table-column>
            <vxe-table-column field="docId1">
              <template v-slot>
                <div></div>
              </template>
            </vxe-table-column>
            <vxe-table-column field="docId" width="100" title="操作" fixed="right">
              <template slot="header">
                <i class="el-icon-s-operation" @click="showGridSettings = true"></i>
              </template>
              <template v-slot="{ row }">
                <div class="operate">
                  <el-button
                    title="查看"
                    @click="() => viewDoc(row)"
                    icon="el-icon-view"
                    v-if="isAudited(row)"
                  ></el-button>
                  <el-button
                    title="编辑"
                    @click="() => editDoc(row)"
                    icon="el-icon-edit-outline"
                    v-if="!isAudited(row)"
                  ></el-button>
                  <el-button
                    title="删除"
                    icon="el-icon-delete"
                    v-if="!isAudited(row)"
                    @click="() => delSingleDoc(row)"
                  ></el-button>
                  <!-- <el-button title="复制" icon="el-icon-document-copy"></el-button> -->
                  <el-popover
                    v-if="!isAudited(row)"
                    placement="bottom"
                    trigger="click"
                    popper-class="noteInput-popover"
                  >
                    <NoteInput
                      :noteContent="row.note"
                      @handle-note="(value) => onBlurNoteInput(value, row)"
                    />
                    <el-button
                      slot="reference"
                      class="comment"
                      title="批注"
                      icon="el-icon-chat-line-round"
                    ></el-button>
                  </el-popover>
                </div>
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
      <el-dialog
        title="凭证号规则设置"
        :visible.sync="showDocCodeSet"
        class="voucherSetting-dialog"
        v-if="showDocCodeSet"
      >
        <voucher-setting @voucher-setting="voucherSetting" :codeData="codeData"></voucher-setting>
      </el-dialog>
      <el-dialog
        title="批量修改制单人"
        :visible.sync="showModifyCreator"
        class="modifyCreator-dialog"
        v-if="showModifyCreator"
      >
        <modify-creator @creator-setting="creatorSetting" :creatorData="creatorData"></modify-creator>
      </el-dialog>
      <el-dialog
        title="整理凭证号"
        :visible.sync="showSortDocCode"
        class="sortDocCode-dialog"
        v-if="showSortDocCode"
      >
        <sort-doc-code @sort-setting="sortSetting" :sortData="sortData"></sort-doc-code>
      </el-dialog>
      <el-dialog
        title="凭证导入"
        :visible.sync="showImportDoc"
        class="importDoc-dialog"
        v-if="showImportDoc"
      >
        <import-doc @import-setting="importSetting" :importData="importData"></import-doc>
      </el-dialog>
      <el-dialog title="导出" :visible.sync="showExportDoc" class="exportDoc-dialog">
        <export-doc-option @export-setting="exportSetting" :exportData="exportData"></export-doc-option>
      </el-dialog>
      <el-dialog
        title="自定义排序"
        :visible.sync="showCustomSort"
        class="customSort-dialog"
        v-if="showCustomSort"
      >
        <custom-sort @custom-sort="customSortSetting" :customSortData="customSortData"></custom-sort>
      </el-dialog>
      <el-dialog
        title="红冲凭证"
        :visible.sync="showRedDashed"
        v-if="showRedDashed"
        class="redDashed-dialog"
      >
        <span>请选择红冲凭证的会计期间</span>
        <el-date-picker
          v-model="redDashedDate"
          type="month"
          placeholder="选择月"
          value-format="yyyy-MM"
          :clearable="false"
          style="width:130px;margin-left:10px"
        ></el-date-picker>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleRedDashed">确 定</el-button>
          <el-button @click="showRedDashed = false">取 消</el-button>
        </span>
      </el-dialog>
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
    </el-footer>-->
  </el-container>
</template>
<script>
import {
  docManageInit,
  getDocConfig,
  saveDocConfig,
  modifyCreatorInit,
  modifyCreator,
  updateCreatorAndEditorByBatch,
  docManageDel,
  docManageAudit,
  updateNote,
  docManageQuery,
  delSingleDoc,
  findByParam,
  updateColumn,
  resetColumn,
  reorganizeDocCode,
  importDocFromExcelAsync,
  getImportDocFromExcelStatus,
  docManageExport,
  getExportConfig,
  getRedRushDocPeriod,
  redRushDoc,
  updateColumnWidth,
  docManageUnAudit,
  savePrintConfig,
  getExistsDataScope,
  docManagePrint,
  checkDocCode,
} from "@/api/gl/gl_voucherlist";
import ModifyCreator from "../component/modifyCreator.vue";
import VoucherSetting from "../component/voucherSetting.vue";
import GridSettings from "@/components/GridSettings";
import Timeline from "@/components/Timeline";
import NoteInput from "@/components/NoteInput";
import SortDocCode from "../component/sortDocCode.vue";
import ImportDoc from "../component/importDoc.vue";
import PrintSettings from "../component/printSettings.vue";
import ExportDocOption from "../component/exportDocOption.vue";
import CustomSort from "../component/customSort.vue";
import XEUtils from "xe-utils";
import * as consts from "@/utils/consts.js";
import * as env from "@/utils/environment.js";
import { createLogger } from "vuex";

export default {
  name: "voucherList",
  components: {
    GridSettings,
    ModifyCreator,
    VoucherSetting,
    NoteInput,
    Timeline,
    SortDocCode,
    ImportDoc,
    PrintSettings,
    ExportDocOption,
    CustomSort,
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
      loading: false,
      timePeriod: {},
      checkDocCode: true,
      columnDto: {
        columnDetails: [],
        ts: "",
        code: "",
      },
      searchValue: {
        accountIds: [], //--科目ID
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
        // noPage: false,
        page: { pageSize: 50, currentPage: 1 },
        voucherState: undefined, //--单据状态
        sourceVoucherTypeId: undefined, //--单据类型 -- 单据来源
        simpleCondition: undefined, //简单查询
      },
      displayDate: ["", ""],

      ruleForm: {
        code: "",
      },
      rules: {
        code: [{ validator: this.validateCode, trigger: "blur" }],
      },
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
              disabledDate: (v) => this.disabledDate(v),
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
          name: "accountIds",
          label: "科目",
          children: {
            component: "el-select",
            _value: "accountIds",
            list: "accountList",
            attrs: {
              multiple: true,
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
          name: "voucherState",
          label: "状态",
          children: {
            component: "el-select",
            _value: "voucherState",
            list: "voucherStateList",
            attrs: {
              _name: "name",
              _key: "id",
            },
          },
        },
        {
          name: "amount",
          label: "金额",
          children: {
            component: "h-inputnumber-range",
            _value: "amount",
            attrs: {
              rangeSeparator: "-",
            },
          },
        },
        {
          name: "currencyId",
          label: "币别",
          children: {
            component: "el-select",
            _value: "currencyId",
            list: "currencyList",
            attrs: {
              _name: "name",
              _key: "id",
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
      ];
    },
  },
  methods: {
    //凭证号校验
    validateCode(rule, value, callback) {
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
    //月份不可选控制
    disabledDate(current) {
      let { enabledMonth, enabledYear } = this.$store.state.routes.org;
      let enabledDate = XEUtils.toStringDate(`${enabledYear}-${enabledMonth}`);
      return current.getTime() < enabledDate.getTime();
    },
    formatterCell({ cellValue, row, column }) {
      if (
        column.property == "amountCr" ||
        column.property == "amountDr" ||
        column.property == "amountSum"
      ) {
        return cellValue && parseFloat(cellValue).toFixed(2);
      } else {
        return cellValue;
      }
    },
    linkToDoc(row) {
      let win = top.window.frames[0];
      if (!!win) {
        if (!!window.postMessage) {
          let url =
            env.accessUrl() +
            "/#/voucher/glVoucherCard?showPortal=false&token=" +
            this.$baseAccessToken() +
            "&linkCode=9000";
          window.parent.postMessage(
            {
              method: "taxOpenSecondTab",
              data: {
                title: "填制凭证",
                url: url,
                id: row.docId,
                settleAccounts: row.settleAccounts,
              },
            },
            "*"
          );
        }
      } else {
        this.$router.push({
          name: "glVoucherCard",
          params: {
            id: row.docId,
            settleAccounts: row.settleAccounts,
          },
        });
      }
    },
    async printDoc() {
      if (this.list.length == 0) {
        this.$baseMessage("当前没有可打印数据", "warning");
        return;
      }
      let tempWindow = window.open();
      if (tempWindow == null) {
        tempWindow = window;
      }
      let params = await this.requestData("get");
      let newParams = { ...params };
      if (newParams) {
        newParams.token = this.$baseAccessToken();
        newParams.tempWindow = tempWindow;
        newParams.docIdsStr = this.getPrintDocId();
        newParams.page = null;
        // if (params.page) {
        //   params.page = encodeURIComponent(JSON.stringify(params.page));
        // }
      }
      await docManagePrint(newParams);
    },

    async getDocManageList() {
      // let res = await docManageInit({});
      // let timeResponse = await getExistsDataScope({});

      let [res, timeResponse] = await Promise.all([
        docManageInit({}),
        getExistsDataScope({}),
      ]);

      if (timeResponse && timeResponse.result && timeResponse.value) {
        this.timePeriod = timeResponse.value;
      }
      if (res && res.result) {
        this.loading = false;
        let checkDocCodeRes = await checkDocCode({
          startYear: res.value.displayDate.split("-")[0],
          startPeriod: res.value.displayDate.split("-")[1],
          endYear: res.value.displayDate.split("-")[0],
          endPeriod: res.value.displayDate.split("-")[1],
        });
        if (checkDocCodeRes && !checkDocCodeRes.error)
          this.checkDocCode = checkDocCodeRes.value;
        this.loadTable(res);
      } else {
        this.loading = false;
      }
    },
    loadTable(res) {
      let arr = [];
      // 数据格式化 满足合并行
      let list = res.value.docList || res.value.dtoList;
      this.list = list;
      list.forEach((item, index) => {
        let amountDrTotal = 0;
        let amountCrTotal = 0;
        let docListIndex = index;
        item.entrys.forEach((el, i) => {
          if (el.amountDr && el.amountDr !== "") {
            amountDrTotal += parseFloat(el.amountDr);
          }
          if (el.amountCr && el.amountCr !== "") {
            amountCrTotal += parseFloat(el.amountCr);
          }
          item.sourceVoucherCode = item.sourceVoucherCode
            ? item.sourceVoucherCode
            : "";
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
          // if (item.entrys.length == i + 1) {

          // }
        });
        arr.push({
          voucherDate: "合计",
          docTypeAndCode: " ",
          amountDr: amountDrTotal,
          amountCr: amountCrTotal,
          operate: docListIndex + 1,
          docId: item.docId,
          summary: " ",
          accountCodeName: " ",
          ts: item.ts,
          sourceVoucherCode: " ",
          auditor: " ",
          creator: " ",
          note: " ",
          voucherState: item.voucherState,
        });
      });
      this.$refs.proofListxTable.reloadData(arr)
      // this.newTableData = arr;
      // this.$set(this.searchValue, "page", encodeURIComponent(JSON.stringify(res.value.page)));
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
      let response = await docManageQuery(this.searchValue);
      let checkDocCodeRes = await checkDocCode({
        startYear: this.displayDate[0].split("-")[0],
        startPeriod: this.displayDate[0].split("-")[1],
        endYear: this.displayDate[1].split("-")[0],
        endPeriod: this.displayDate[1].split("-")[1],
      });
      if (checkDocCodeRes && !checkDocCodeRes.error)
        this.checkDocCode = checkDocCodeRes.value;
      if (response && !response.error) {
        this.loadTable(response);
      }
      this.loading = false;
    },
    /**
     * 批量修改制单人
     */
    async modifyCreator() {
      this.showModifyCreator = true;
      let response = await modifyCreatorInit({});
      let creatorData = response.value;
      creatorData.flag = this.selectRows.length > 0 ? true : false;
      creatorData.date = [
        XEUtils.toDateString(
          XEUtils.getWhatMonth(this.displayDate[0], 0, "first"),
          "yyyy-MM-dd"
        ),
        XEUtils.toDateString(
          XEUtils.getWhatMonth(this.displayDate[1], 0, "last"),
          "yyyy-MM-dd"
        ),
      ];
      // creatorData.date = [
      //   XEUtils.toDateString(
      //     XEUtils.toStringDate(this.displayDate[0]),
      //     "yyyy-MM-dd"
      //   ),
      //   XEUtils.toDateString(
      //     XEUtils.toStringDate(this.displayDate[1]),
      //     "yyyy-MM-dd"
      //   ),
      // ];
      this.creatorData = creatorData;
    },
    async creatorSetting(form) {
      this.showModifyCreator = false;
      if (form) {
        let params = form;
        let response;
        params.ids = this.selectRowIds;
        params.fromDate = form.date[0];
        params.toDate = form.date[1];
        if (form.flag) {
          response = await modifyCreator(params);
        } else {
          response = await updateCreatorAndEditorByBatch(params);
        }
        if (response && !response.error) {
          this.$baseMessage("批量修改制单人成功", "success");
          this.requestData();
        } else {
          this.$baseMessage(response.error.message, "error");
        }
      }
    },
    /**
     * 凭证号规则设置
     */
    async voucherRuleSetting() {
      this.showDocCodeSet = true;
      let response = await getDocConfig({});
      this.codeData = response.value;
    },
    async voucherSetting(form) {
      this.showDocCodeSet = false;
      if (form) {
        let response = await saveDocConfig(form);
        if (response && !response.error) {
          this.$baseMessage("凭证号规则设置成功", "success");
        } else {
          this.$baseMessage(response.error.message, "error");
        }
      }
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
    selectAllEvent({ checked, records, row, $rowIndex }) {
      let selectRows = [];
      let selectRowIds = [];
      let arr = new Map();
      records.map((item) => {
        item.checked = checked;
        if (!arr.has(item["docId"])) {
          arr.set(item["docId"], item);
        }
        return item;
      });
      for (let [index, ele] of arr.entries()) {
        if (ele.checked == true) {
          selectRows.push(ele);
          selectRowIds.push(ele.docId);
        }
      }
      this.selectRows = selectRows;
      this.selectRowIds = selectRowIds;
    },
    selectChangeEvent({ checked, records, row, $rowIndex }) {
      let selectRows = [];
      let selectRowIds = [];
      let arr = new Map();

      records.map((item) => {
        if (item.docId == row.docId) {
          item.checked = checked;
        }
        if (!arr.has(item["docId"])) {
          arr.set(item["docId"], item);
        }
        return item;
      });
      for (let [index, ele] of arr.entries()) {
        // console.log(ele)
        if (ele.checked == true) {
          selectRows.push(ele);
          selectRowIds.push(ele.docId);
        }
      }
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
      this.requestData();
    },
    dateChange(value) {
      this.displayDate = value;
      this.$set(this.searchValue, "startYear", value[0].split("-")[0]);
      this.$set(this.searchValue, "startPeriod", value[0].split("-")[1]);
      this.$set(this.searchValue, "endYear", value[1].split("-")[0]);
      this.$set(this.searchValue, "endPeriod", value[1].split("-")[1]);
      this.requestData();
    },

    handleSearch(result, hsearch) {
      console.log(hsearch, result);
      hsearch &&
        hsearch.validate((valid) => {
          if (valid) {
            // alert("submit!");
          } else {
            return false;
          }
        });
      this.showMoreSearch = false;
      if (!result) return;
      let searchValue = { ...this.searchValue };
      searchValue.simpleCondition = null;
      if (result.date) this.displayDate = result.date;
      searchValue.startYear = this.displayDate[0].split("-")[0];
      searchValue.startPeriod = this.displayDate[0].split("-")[1];
      searchValue.endYear = this.displayDate[1].split("-")[0];
      searchValue.endPeriod = this.displayDate[1].split("-")[1];
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
      if (result.amount) {
        searchValue.startAmount = result.amount[0];
        searchValue.endAmount = result.amount[1];
      } else {
        searchValue.startAmount = null;
        searchValue.endAmount = null;
      }
      searchValue.accountIds = result.accountIds;
      searchValue.voucherState = result.voucherState;
      searchValue.summary = result.summary;
      searchValue.creator = result.creator;
      searchValue.currencyId = result.currencyId;
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
          await this.getDocManageList({});
        }
        setTimeout(() => {
          this.$refs.proofListxTable.refreshColumn();
        }, 100);
      } else {
        // 更新
        const columnSolution = await findByParam({
          code: "docList",
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
          }
          setTimeout(() => {
            this.$refs.proofListxTable.refreshColumn();
          }, 100);
        }
      }
    },
    // 打印设置
    async printset(data) {
      const response = await savePrintConfig(data);
      if (response && response.result) {
        this.$baseMessage("打印设置成功", "success");
      }
    },
    // 时间轴
    timelineChange(item) {
      this.displayDate = [item.activeText, item.activeText];
      this.requestData();
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
    //凭证批量删除（更多下拉选项）
    async deleteDoc() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要删除的数据", "warning");
        return;
      }
      let nameId = "";
      this.selectRows.forEach((item) => {
        if (item.settleAccounts) {
          nameId = nameId + "," + item.docTypeAndCode;
        }
      });
      if (nameId) {
        nameId = nameId.substring(1, nameId.length);
        this.$confirm(
          `您选择要删除的数据'${nameId}'为已经月结的数据，不能删除`,
          "温馨提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            return false;
          })
          .catch(() => {
            return false;
          });
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
        .then(() => {
          this.$confirm("请再次确认删除所选凭证？", "温馨提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "delDocConfirm",
          }).then(async () => {
            let mapData = new Map();
            // 去下重复 (以防万一)
            this.selectRows.forEach((item) => {
              if (!mapData.has(item)) {
                mapData.set(item.docId, { docId: item.docId, ts: item.ts });
              }
            });
            let data = [];
            for (let value of mapData.values()) {
              data.push(value);
            }
            const res = await docManageDel(data);
            if (res.value && res.value.allSuccess) {
              this.$baseMessage("删除成功!", "success");
            } else {
              this.$baseMessage(`${res.value.msg}`, "error");
            }
            this.requestData();
          });
        })
        .catch(() => {
          return false;
        });
    },
    //删除单个凭证
    async delSingleDoc(row) {
      this.$confirm("确认是否删除？", "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "delDocConfirm",
      })
        .then(async () => {
          const res = await delSingleDoc({ docId: row.docId, ts: row.ts });
          if (res && !res.error) {
            this.$baseMessage("删除成功", "success");
            this.requestData();
          }

          // const timePeriod = await this.webapi.docManage.getExistsDataScope();
          // if (timePeriod) {
          //   this.metaAction.sf("data.other.timePeriod", fromJS(timePeriod));
          // }
        })
        .catch(() => {
          return false;
        });
    },
    //审核凭证
    async audit() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要审核的数据!", "warning");
        return;
      }
      let flag = false;
      let data = this.selectRows.map((item) => {
        if (item.voucherState != consts.otherConsts.VOUCHERSTATUS_Approved) {
          flag = true;
        }
        return {
          docId: item.docId,
          ts: item.ts,
        };
      });
      if (!flag) {
        this.$baseMessage("当前没有可审核数据!", "warning");
      }
      const res = await docManageAudit(this.delRepeat(data, "docId"));
      if (res && !res.error) {
        this.$baseMessage(res.value, "success");
        this.requestData();
      }
    },
    //凭证去重
    delRepeat(data, code) {
      const arr = new Map();
      data.map((item) => {
        if (!arr.has(item[code])) {
          arr.set(item[code], item);
        }
      });
      const sum = [];
      let currentUser = this.$store.state.routes.user,
        auditor = currentUser.nickname;
      for (let value of arr.values()) {
        console.log(value);
        value.auditor = auditor;
        sum.push(value);
      }

      return sum;
    },
    //是否已审核
    isAudited(row) {
      return row.voucherState == consts.otherConsts.VOUCHERSTATUS_Approved;
    },
    //整理凭证号
    sortDocCode() {
      this.showSortDocCode = true;
      let date_end = this.displayDate[1];
      let sortData = {
        date: date_end,
        reorganizeType: "0",
      };
      this.sortData = sortData;
    },
    async sortSetting(form) {
      this.showSortDocCode = false;
      if (form) {
        let params = {
          year: form.date.split("-")[0],
          period: form.date.split("-")[1],
          reorganizeType: form.reorganizeType,
        };
        const res = await reorganizeDocCode(params);
        if (res && !res.error) {
          this.$baseMessage("整理凭证号成功", "success");
          this.requestData();
        }
      }
    },
    printSettings() {
      console.log("printSettings click");
    },
    //导入
    importFile() {
      this.showImportDoc = true;
    },
    async importSetting(file) {
      if (file) {
        let date = this.displayDate[0];
        let fileInfo = {
          fileId: file.id,
          year: date.split("-")[0],
          period: date.split("-")[1],
        };
        let importAsync = await importDocFromExcelAsync(fileInfo),
          asyncStatus,
          ret;
        if (importAsync && !importAsync.error) {
          let timer = setInterval(async () => {
            asyncStatus = await getImportDocFromExcelStatus({
              sequenceNo: importAsync.value,
              isReturnValue: true,
            });
            if (
              asyncStatus &&
              asyncStatus.value &&
              asyncStatus.value.importState == "STATUS_RESPONSE"
            ) {
              //执行成功
              clearInterval(timer);
              // this.metaAction.sf("data.loading", false)
              if (asyncStatus.value.importResponseDto) {
                this.$alert(
                  this.getContent(asyncStatus.value.importResponseDto),
                  "温馨提示",
                  {
                    confirmButtonText: "确定",
                    // cancelButtonText: null,
                    type: "warning",
                    // customClass: "delDocConfirm",
                  }
                )
                  .then(() => {
                    this.showImportDoc = false;
                    this.requestData();
                  })
                  .catch(() => { });
              }
            } else if (
              (asyncStatus &&
                asyncStatus.value &&
                asyncStatus.value.importState == "STATUS_EXCEPTION") ||
              asyncStatus.error ||
              (asyncStatus &&
                asyncStatus.value &&
                asyncStatus.value.importState == "STATUS_NO_REQUEST")
            ) {
              clearInterval(timer);
              this.$baseMessage(asyncStatus.error.message, "error");
              return;
            }
          }, 2000);
        }
      } else {
        this.showImportDoc = false;
      }
    },
    getContent(res) {
      return (
        <div>
          <span
            style={{ marginRight: "15px" }}
          >{`导入成功${res.successCount}张凭证`}</span>
          <span>{`导入失败${res.failCount}张凭证`}</span>
          {res.fileDto && res.fileDto.accessUrl ? (
            <div>
              请
              <a onClick={() => this.redirect(res.fileDto.accessUrl)}>
                下载错误模板
              </a>
              查看提示信息
            </div>
          ) : null}
        </div>
      );
    },
    redirect(url) {
      window.location.href = url;
    },
    async exportDocList() {
      this.showExportDoc = true;
      let response = await getExportConfig({});
      this.exportData = response.value;
    },
    async exportSetting(form) {
      this.showExportDoc = false;
      if (form) {
        let option = form.option;
        let params = await this.requestData("get");
        let newParams = { ...params };
        newParams.isImportSchema = false;
        newParams.docIdsStr = this.getPrintDocId();
        option.forEach((item) => {
          newParams[item] = item ? true : false;
        });
        newParams.page = null;
        let response = await docManageExport(newParams);
      }
    },
    async exportTemplate() {
      let params = await this.requestData("get");
      let newParams = { ...params };
      newParams.printAuxAccCalc = true;
      newParams.isPrintQuantity = true;
      newParams.isPrintMulti = true;
      newParams.docIdsStr = this.getPrintDocId();
      newParams.isImportSchema = true;
      newParams.page = null;
      await docManageExport(newParams);
    },
    getPrintDocId() {
      return this.selectRowIds.length > 0 ? this.selectRowIds.join(",") : null;
    },
    getAlign(columnKey, isHeader) {
      let align = "center";
      if (isHeader == true) {
        if (columnKey == "amountSum") {
          align = "right";
        } else if (
          columnKey == "docTypeAndCode" ||
          columnKey == "voucherDate"
        ) {
          align = "left";
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
    // 红冲凭证
    async redDashed() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要红冲的凭证", "warning");
        return;
      }
      let date = this.displayDate[1];
      let param = {
        year: date.split("-")[0],
        period: date.split("-")[1],
      };
      const response = await getRedRushDocPeriod(param);
      if (!response || !response.result) return;

      this.showRedDashed = true;
      this.redDashedDate = `${response.value.year}-${response.value.period}`;
    },
    async handleRedDashed() {
      this.showRedDashed = false;
      const date = this.redDashedDate,
        docIds = this.selectRowIds,
        currentUser = this.$store.state.routes.user,
        nickname = currentUser.nickname,
        params = {
          year: date.split("-")[0],
          period: date.split("-")[1],
          docIds: docIds,
          creator: nickname,
        };

      const response = await redRushDoc(params);
      if (response && response.result) {
        if (response.value.errorList.length == 0) {
          this.$baseMessage("红冲成功", "success");
          this.requestData();
        } else if (response.value.errorList.length > 0) {
          this.$baseMessage(
            this.getErrorMessage(response.value.errorList),
            "warning"
          );
        }
      }
    },
    getErrorMessage(message) {
      return (
        <div>
          {message.map((item) => {
            return <div>{item}</div>;
          })}
        </div>
      );
    },
    //列宽拖动
    async resizeChangeEvent({
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }) {
      setTimeout(async () => {
        let newWidth = $event.target.parentNode.clientWidth;
        let columnDetails = this.columnDto.columnDetails;
        let params = { code: this.columnDto.code };
        columnDetails &&
          columnDetails.forEach((item) => {
            if (item.fieldName == column.property) {
              item.width = newWidth;
            }
          });
        params.columnDetails = columnDetails;
        let res = await updateColumnWidth(params);
        if (res && res.result) {
          this.$set(
            this.columnDto,
            "columnDetails",
            res.value[0].columnDetails
          );
        }
      }, 100);
    },
    //批量反审核
    async unAuditDoc() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要反审核的数据", "warning");
        return;
      }
      let flag = false;
      let data = this.selectRows.map((item) => {
        if (item.voucherState == consts.otherConsts.VOUCHERSTATUS_Approved) {
          flag = true;
        }
        return {
          docId: item.docId,
          ts: item.ts,
        };
      });
      if (!flag) {
        this.$baseMessage("当前没有反审核的数据!", "warning");
        return;
      }
      const res = await docManageUnAudit(this.delRepeat(data, "docId"));
      if (res && !res.error) {
        this.$baseMessage(res.value, "success");
        this.requestData();
      }
    },
    //插入凭证
    insertDoc() {
      if (this.selectRows.length == 0) {
        this.$baseMessage("请选择您要插入凭证的位置!", "warning");
        return;
      } else {
        let item = this.list.find((item) =>
          this.selectRowIds.includes(item.docId)
        );
        this.$confirm(
          `您确定要在凭证[${item.docTypeAndCode}]处插入凭证吗？`,
          "插入凭证",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            customClass: "insertDoc-confirm",
          }
        )
          .then(() => {
            this.insertDocConfirm(item);
          })
          .catch(() => { });
      }
    },
    insertDocConfirm(item) {
      this.$router.push({
        name: "glVoucherCard",
        params: { docCode: item.docCode, voucherDate: item.voucherDate },
      });
    },
    viewDoc(row) {
      this.$router.push({
        name: "glVoucherCard",
        params: {
          id: row.docId,
          settleAccounts: row.settleAccounts,
        },
      });
    },
    editDoc(row) {
      this.$router.push({
        name: "glVoucherCard",
        params: {
          id: row.docId,
          settleAccounts: row.settleAccounts,
        },
      });
    },
    searchChange(value) {
      this.requestData();
    },
    //新增凭证
    addDoc() {
      let win = top.window.frames[0];
      if (!!win) {
        if (!!window.postMessage) {
          let url =
            env.accessUrl() +
            "/#/voucher/glVoucherCard?showPortal=false&token=" +
            this.$baseAccessToken();
          window.parent.postMessage(
            {
              method: "taxOpenSecondTab",
              data: {
                title: "填制凭证",
                url: url,
                linkFrom: "addDoc",
                newCertificate: true,
              },
            },
            "*"
          );
        }
      } else {
        this.$router.push({
          name: "glVoucherCard",
          params: {
            newCertificate: true
          },
        });
      }
    },
    //自定义排序
    async customSortDoc() {
      let params = await this.requestData("get"),
        newParams = { ...params },
        startDate = `${params.startYear}-${params.startPeriod}`,
        endDate = `${params.endYear}-${params.endPeriod}`;
      newParams.noPage = true;
      if (startDate !== endDate) {
        this.$baseMessage("自定义排序仅支持单一月份的凭证处理", "warning");
        return;
      }
      this.showCustomSort = true;
      this.$nextTick(() => {
        this.customSortData = { params: newParams, num: Math.random() };
      });
    },
    customSortSetting() {
      this.showCustomSort = false;
      // this.$set(this.searchValue, "noPage", false);
      this.requestData();
    },
    //凭证回收站
    docRecycle() {
      let win = top.window.frames[0];
      if (!!win) {
        if (!!window.postMessage) {
          let url =
            env.accessUrl() +
            "/#/voucher/proofRecycle?showPortal=false&token=" +
            this.$baseAccessToken();
          window.parent.postMessage(
            {
              method: "taxOpenSecondTab",
              data: {
                title: "凭证回收站",
                url: url,
                linkCode: 9000,
                linkFrom: "docRecycle",
              },
            },
            "*"
          );
        }
      } else {
        this.$router.push({
          name: "proofRecycle",
        });
      }
    },
  },

  created() {
    this.loading = true;
    this.getDocManageList();
  },
};
</script>
<style lang="scss">
// $headerHeight: 110px;
.vxe-loading {
  background-color: rgba(0, 0, 0, 0);
}
.vxe-table {
  height: 100%;
  .vxe-table--main-wrapper {
    height: 100%;
  }
  .vxe-table--body-wrapper {
    height: calc(100% - 48px) !important;
  }
  .vxe-table--fixed-right-wrapper {
    height: 100% !important;
  }
  .vxe-cell {
    padding-left: 6px;
    padding-right: 6px;
  }
}
#voucherList {
  // height: 100vh;
  height: 100%;
  padding: 0px 10px;
  .el-container {
    height: 100%;
    .q-timeline {
      height: calc(100% - 50px);
    }
  }
  .header {
    .header-right {
      .el-button {
        // margin-left: 8px;
      }
    }
  }
  .vxe-table {
    .row-green {
      background: #fff6ea;
      font-weight: bold;
    }
    .el-icon-s-operation {
      font-size: 18px;
      font-weight: bold;
    }
    .vxe-body--column {
      height: 38px;
      .vxe-cell {
        line-height: 16px;
        padding-left: 8px;
        padding-right: 8px;
        .cell {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .vxe-table--header-wrapper {
      .vxe-header--row {
        .vxe-header--column {
          .vxe-cell {
            justify-content: center;
          }
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
    padding: 0px;
    position: relative;
    // line-height: 60px;
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
    .grid-settings {
      right: 15px;
      .moreColumns {
        overflow-y: auto;
        margin-bottom: 10px;
      }
    }
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
  .redDashed-dialog {
    .el-dialog {
      width: 380px;
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
  .el-message-box__btns {
    .el-button:first-child {
      float: right;
      margin-left: 8px;
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
      &:hover {
        background: #66b1ff;
        border-color: #66b1ff;
        color: #fff;
      }
    }
    .el-button:last-child {
      background: #fff;
      color: #606266;
      border-color: #dcdfe6;
      &:hover {
        color: #409eff;
        border-color: #c6e2ff;
        background-color: #ecf5ff;
      }
    }
  }
  .delconfirmNum {
    color: red;
    font-size: 24px;
    margin: 0px 3px;
  }
}
.insertDoc-confirm {
  .el-message-box__btns {
    button:first-child {
      float: right;
      margin-left: 8px;
    }
  }
}
</style>
