<template>
  <div class="customSortable-container">
    <div class="header">
      <el-button @click="movefast">快速调整凭证号</el-button>
      <el-button type="primary" @click="moveup" >上移</el-button>
      <el-button type="primary" @click="movedown" >下移</el-button>
      <el-button @click="moveok">确定</el-button>
    </div>
    <div class="content">
      <vxe-table
        border
        highlight-hover-row
        highlight-current-row
        ref="xTable"
        :data="list"
        height="573"
        :scroll-y="{gt: -1}"
        row-id="docId"
        :span-method="mergeRowMethod"
      >
        <vxe-table-column field="voucherDate" width="90" title="日期"></vxe-table-column>
        <vxe-table-column field="docTypeAndCode" width="90" title="凭证字号"></vxe-table-column>
        <vxe-table-column field="summaryArr" width="205" title="摘要">
          <template v-slot="{ row }">
            <div>
              <div
                class="text"
                :title="item"
                v-for="(item,i) in row.summaryArr"
                :key="i+'summary'"
              >{{item?item:null}}</div>
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column field="accountCodeNameArr" width="265" title="会计科目">
          <template v-slot="{ row }">
            <div>
              <div
                class="text"
                :title="item"
                v-for="(item, i) in row.accountCodeNameArr"
                :key="i+'account'"
              >{{item?item:null}}</div>
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column field="amountDrArr" width="108" title="借方金额">
          <template v-slot="{ row }">
            <div>
              <div class="text" v-for="(item,i) in row.amountDrArr" :key="i+'amountDr'">{{item}}</div>
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column field="amountCrArr" width="108" title="贷方金额">
          <template v-slot="{ row }">
            <div>
              <div class="text" v-for="(item,i) in row.amountCrArr" :key="'amountCr'+i">{{item}}</div>
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column field="attachedNum" width="85" title="附单据数"></vxe-table-column>
        <vxe-table-column field="creator" width="96" title="制单人"></vxe-table-column>
      </vxe-table>
    </div>
    <el-dialog
      :append-to-body="true"
      title="快速调整凭证号"
      :visible.sync="showMoveFast"
      class="movefast-dialog"
    >
      <div class="container">
        <div>{{msgTip}}</div>
        <div class="text">
          <el-input v-model="docCode" @change="handleChange" maxlength="5" regex="^[0-9]+$"></el-input>
          <div v-if="!docCode" class="tip">不可为空</div>
        </div>

        <div>,确认是否调整</div>
      </div>
      <div style="color: rgba(255, 84, 62);margin-top:25px">注意：调整后将对凭证号重新排序，且不可撤销操作，请谨慎操作</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleMoveFast">是</el-button>
        <el-button @click="showMoveFast = false">否</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  docManageInit,
  docManageQuery,
  reorganizeDocCode,
  reSetDocCodeWithCustomer,
} from "@/api/gl/gl_voucherlist";
import XEUtils from "xe-utils";
import Sortable from "@/plugins/sortable.js";
export default {
  name: "customSort",
  props: {
    customSortData: Object,
  },
  data() {
    return {
      list: [],
      params: {},
      // moveupDisableld: false,
      // movedownDisableld: false,
      showMoveFast: false,
      msgTip: "",
      docCode: "",
    };
  },
  created() {
    this.$nextTick(() => {
      let xTable = this.$refs.xTable;
      this.sortable = Sortable.create(
        xTable.$el.querySelector(".body--wrapper>.vxe-table--body tbody"),
        {
          animation: 50,
          fallbackOnBody: true,
          onEnd: ({ newIndex, oldIndex }) => {
            let value = this.list;
            const targetRow = value.splice(oldIndex, 1)[0];
            value.splice(newIndex, 0, targetRow);
            this.list = value;
            this.$refs.xTable.syncData();
          },
        }
      );
    });
  },
  beforeDestroy() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  },
  computed: {},
  watch: {
    customSortData: {
      handler: function (newVal, oldVal) {
        this.params = newVal.params;
        this.getInitData();
      },
      deep: true,
    },
    // customSortData: function (newVal, oldVal) {
    //   console.log(newVal)
    //   this.params = newVal;
    //   this.getInitData();
    // },
  },
  methods: {
    moveupDisableld() {
      if (this.$refs.xTable) {
        let list = this.list,
          currentRow = this.$refs.xTable.getCurrentRecord(),
          newArr = [];
        if (currentRow) {
          let index = list.findIndex(
            (item) => item && item.docId == currentRow.docId
          );
          if (index == 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    movedownDisableld() {
      if (this.$refs.xTable) {
        let list = this.list,
          currentRow = this.$refs.xTable.getCurrentRecord(),
          newArr = [];
        if (currentRow) {
          let index = list.findIndex(
            (item) => item && item.docId == currentRow.docId
          );
          if (index == list.length - 1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    async getInitData() {
      let response = await docManageQuery(this.params);
      if (response && !response.error) {
        let initList = response.value.dtoList;
        let list = [];
        for (let i = 0; i < initList.length; i++) {
          if (
            (initList[i + 1] &&
              initList[i].docTypeAndCode != initList[i + 1].docTypeAndCode) ||
            !initList[i + 1]
          ) {
            list.push(initList[i]);
          }
        }
        list.forEach((item, index) => {
          item.summaryArr = [];
          item.accountCodeNameArr = [];
          item.amountDrArr = [];
          item.amountCrArr = [];
        });
        for (let i = 0; i < initList.length; i++) {
          for (let j = 0; j < list.length; j++) {
            if (initList[i].docTypeAndCode == list[j].docTypeAndCode) {
              list[j].summaryArr.push(initList[i].summary);
              list[j].accountCodeNameArr.push(initList[i].accountCodeName);
              list[j].amountDrArr.push(
                initList[i].amountDr ? initList[i].amountDr : undefined
              );
              list[j].amountCrArr.push(
                initList[i].amountCr ? initList[i].amountCr : undefined
              );
            }
          }
        }
        this.list = list;
      }
    },
    // 通用合并行列
    mergeRowMethod({ row, $rowIndex, column, data, columnIndex }) {
      let fields = ["voucherDate", "docTypeAndCode", "creator", "attachedNum"];
      const cellValue = XEUtils.get(row, column.property);
      let countRowspan, countColspan;
      if (fields.includes(column.property)) {
        const prevRow = data[$rowIndex - 1];
        let nextRow = data[$rowIndex + 1];
        if (
          prevRow &&
          XEUtils.get(prevRow, column.property) === cellValue &&
          XEUtils.get(prevRow, "docId") === row.docId
        ) {
          // if(){}
          return { rowspan: 0, colspan: 0 };
        } else {
          countRowspan = 1;
          while (
            nextRow &&
            XEUtils.get(nextRow, column.property) === cellValue &&
            XEUtils.get(nextRow, "docId") == row.docId
          ) {
            nextRow = data[++countRowspan + $rowIndex];
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 };
          }
        }
      }
    },
    async moveok() {
      let list = this.list,
        docIds = [];
      list.map((item) => docIds.push(item.docId));
      let response = await reorganizeDocCode({
        year: this.params.endYear,
        period: this.params.endPeriod,
        reorganizeType: 2,
        docIds,
      });
      if (response && !response.error) {
        this.$baseMessage("自定义排序成功", "success");
        this.$emit("custom-sort");
      }
    },
    moveup() {
      let list = this.list,
        currentRow = this.$refs.xTable.getCurrentRecord(),
        newArr = [];
      let index = list.findIndex((item) => item.docId == currentRow.docId);
      if (index == 0) {
        this.$baseMessage("当前已是第一行", "warning");
        return;
      }
      newArr = this.swapArray(list, index, index - 1);
      this.list = newArr;
    },
    movedown() {
      let list = this.list,
        currentRow = this.$refs.xTable.getCurrentRecord(),
        newArr = [];
      let index = list.findIndex((item) => item.docId == currentRow.docId);
      if (index == list.length - 1) {
        // this.movedownDisableld = true;
        this.$baseMessage("当前已是最后一行", "warning");
        return;
      }

      newArr = this.swapArray(list, index, index + 1);
      this.list = newArr;
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    movefast() {
      let currentRow = this.$refs.xTable.getCurrentRecord();
      if (!currentRow) {
        this.$baseMessage("请选择要调整的数据", "warning");
        return;
      }
      this.showMoveFast = true;
      let tips = currentRow.docTypeAndCode.replace("-", "");
      let msgTip = `[${tips}],调整至记`;
      this.msgTip = msgTip;
    },
    handleChange(value) {
      let type = /^[0-9]+$/.test(value);
      const other = type ? value.toString().padStart(5, "0") : "";
      this.docCode = other;
    },
    async handleMoveFast() {
      let currentRow = this.$refs.xTable.getCurrentRecord();
      let params = {
        docId: currentRow.docId,
        docCode: this.docCode,
      };
      let response = await reSetDocCodeWithCustomer(params);
      if (response && !response.error) {
        this.$baseMessage("快速调整凭证号成功", "success");
        this.showMoveFast = false;
        this.getInitData();
      } else {
        this.$baseMessage(response.error.message, "error");
      }
    },
  },
};
</script>
<style lang="scss">
.movefast-dialog {
  .el-dialog {
    width: 500px !important;
    .container {
      display: flex;
      flex-direction: row;
      align-items: center;
      .text {
        position: relative;
      }
      .el-input {
        width: 100px;
        // position: relative;
      }
      .tip {
        position: absolute;
        color: red;
      }
    }
  }
}
.customSortable-container {
  .header {
    text-align: right;
    margin-bottom: 10px;
  }

  .content {
    .vxe-table {
      .vxe-body--column {
        padding: 0px;
        .vxe-cell {
          padding-left: 0px !important;
          padding-right: 0px !important;
          .text {
            // margin-bottom: 10px;
            padding: 12px;
            border-bottom: 1px solid #e8eaec;
            height: 40px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .text:last-child {
            border-bottom: none;
            // margin-bottom: 0px;
          }
        }
      }
    }
  }
}
</style>