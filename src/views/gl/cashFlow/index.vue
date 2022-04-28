<template>
  <div class="cashFlow">
    <div style="padding-bottom: 10px">
      <el-row>
        <el-col :span="12" style="text-align: left; padding-left: 8px">
          启用期间
          <span>
            <el-date-picker
              v-model="defaultValue"
              type="month"
              placeholder="选择期间"
              value-format="yyyy-MM"
              @change="(e) => changeEnabledPeriod(e)"
            ></el-date-picker>
          </span>
          <span style="padding-left: 8px">
            <el-tooltip
              class="item"
              effect="dark"
              content="存在已结账的期间，不能修改启用期间。"
              placement="right"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
        </el-col>
        <el-col :span="12" style="text-align: right; padding-right: 8px">
          <el-button @click="resetCashFlowPeriodBegin">重置</el-button>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-row>
        <el-col :span="24">
          <div>
            <vxe-table
              border
              show-overflow
              ref="xTable"
              height="600"
              :data="tableData"
              :edit-config="{ trigger: 'click', mode: 'cell' }"
            >
              <vxe-table-column field="name" title="项目"></vxe-table-column>
              <vxe-table-column field="rowNo" title="行次"></vxe-table-column>
              <vxe-table-column field="amount" title="金额">
                <template v-slot="{ row, $rowIndex }">
                  <div v-if="row.canEdit">
                    <el-input
                      v-model="row.amount"
                      @change="handleBlur(row, $rowIndex)"
                    ></el-input>
                  </div>
                  <div v-else-if="row.canEdit == false">
                    <span>{{ row.amount }}</span>
                  </div>
                </template>
              </vxe-table-column>
            </vxe-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import {
  periodBeginInit,
  savePeriodBegin,
  resetCashFlowPeriodBegin,
  updatePeriod,
} from "@/api/gl/gl_cashflowstatement";
import VXETable from "vxe-table";
import XEUtils from "xe-utils/methods/xe-utils";
import * as consts from "@/utils/consts.js";
// VXETable.renderer.add('CashFlowAmount', {
//   renderDefault(h, renderOpts, params) {
//     const { row, column, $rowIndex } = params
//     let { events } = renderOpts
//     // 注意：所有渲染的返回格式全部都是个数组
//     if (row.canEdit) {
//       return [
//         <el-input onInput={(e) => events.change(row, column, $rowIndex, e)} onBlur={(e) => events.blur(e)} clearable v-modal={this.tableData[$rowIndex][column.property]} ></el-input>
//       ]
//       // if (row.amount) {

//       // }
//       // return [
//       //   <el-input onInput={(e) => events.change(params, e)} onBlur={(e) => events.blur(e)} clearable v-modal={this.tableData[$rowIndex].amount}></el-input>
//       // ]

//     }
//     if (row.amount) {
//       return [
//         <span>{XEUtils.toNumber(row.amount).toFixed(2)}</span>
//       ]
//     }
//   }
// })

export default {
  name: "cashFlow",
  data() {
    return {
      defaultValue: "",
      loading: false,
      tableData: [],
      renderComponent: true,
      ts: ""
    };
  },
  methods: {
    async loadList() {
      let res = await periodBeginInit({});
      if (res && res.result) {
        this.loading = false;

        this.loadTable(res);
      } else {
        this.loading = false;
      }
    },

    loadTable(res) {
      let { value } = res;
      value.datas.map((item) => {
        if (item.amount) {
          item.amount = parseFloat(item.amount).toFixed(2);
        }

        return item;
      });
      this.tableData = value.datas;
    },
    handleInput(row) {
      // row.amount = XEUtils.toNumber(row.amount).toFixed(2);
      // XEUtils.toNumber(amount).toFixed(2);
    },
    handleBlur(row, rowIndex) {
      let newValue = row.amount,
        columnName = "amount";
      if (newValue > 9999999999.99) {
        row.amount = "";
        this.$baseMessage("金额不能大于9999999999.99，请调整", "error");
        return;
      }
      if (newValue < -9999999999.99) {
        row.amount = "";
        this.$baseMessage("金额不能小于-9999999999.99，请调整", "error");
        return;
      }
      let newRow = { ...row };
      newRow.amount = parseFloat(newValue).toFixed(2);
      this.$set(this.tableData, rowIndex, newRow);
      //2007准则

      let orgInfo = this.$store.state.routes.org;

      if (
        orgInfo.accountingStandards ==
        consts.otherConsts.ACCOUNTINGSTANDARDS_2007
      ) {
        let listFour =
          parseFloat(
            parseFloat(this.tableData[1][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[2][columnName] || 0).toFixed(2)
          ) +
          parseFloat(parseFloat(this.tableData[3][columnName] || 0).toFixed(2));
        this.tableData[4][columnName] =
          listFour != "" ? listFour.toFixed(2) : "";

        let listNine =
          parseFloat(
            parseFloat(this.tableData[5][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[6][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[7][columnName] || 0).toFixed(2)
          ) +
          parseFloat(parseFloat(this.tableData[8][columnName] || 0).toFixed(2));
        this.tableData[10][columnName] =
          listNine != "" ? listNine.toFixed(2) : "";

        let listSixteen =
          parseFloat(
            parseFloat(this.tableData[12][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[13][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[14][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[15][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[16][columnName] || 0).toFixed(2)
          );

        this.tableData[17][columnName] =
          listSixteen != "" ? listSixteen.toFixed(2) : "";

        let listTwentyOne =
          parseFloat(
            parseFloat(this.tableData[18][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[19][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[20][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[21][columnName] || 0).toFixed(2)
          );

        this.tableData[22][columnName] =
          listTwentyOne != "" ? listTwentyOne.toFixed(2) : "";

        let listTwentyTwo = listSixteen - listTwentyOne;

        this.tableData[23][columnName] =
          listTwentyTwo != "" ? listTwentyTwo.toFixed(2) : "";

        let listTwentySix =
          parseFloat(
            parseFloat(this.tableData[25][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[26][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[27][columnName] || 0).toFixed(2)
          );
        this.tableData[28][columnName] =
          listTwentySix != "" ? listTwentySix.toFixed(2) : "";

        let listThirty =
          parseFloat(
            parseFloat(this.tableData[29][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[30][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[31][columnName] || 0).toFixed(2)
          );

        this.tableData[32][columnName] =
          listThirty != "" ? listThirty.toFixed(2) : "";

        let listThirtyOne = listTwentySix - listThirty;
        this.tableData[33][columnName] =
          listThirtyOne != "" ? listThirtyOne.toFixed(2) : "";
      }
      //2013准则
      else if (
        orgInfo.accountingStandards ==
        consts.otherConsts.ACCOUNTINGSTANDARDS_2013
      ) {
        let listSeven =
          parseFloat(
            parseFloat(this.tableData[1][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[2][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[3][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[4][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[5][columnName] || 0).toFixed(2)
          ) -
          parseFloat(parseFloat(this.tableData[6][columnName] || 0).toFixed(2));

        this.tableData[7][columnName] =
          listSeven != "" ? listSeven.toFixed(2) : "";

        let listThirteen =
          parseFloat(
            parseFloat(this.tableData[9][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[10][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[11][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[12][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[13][columnName] || 0).toFixed(2)
          );

        this.tableData[14][columnName] =
          listThirteen != "" ? listThirteen.toFixed(2) : "";

        let listNinteen =
          parseFloat(
            parseFloat(this.tableData[16][columnName] || 0).toFixed(2)
          ) +
          parseFloat(
            parseFloat(this.tableData[17][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[18][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[19][columnName] || 0).toFixed(2)
          ) -
          parseFloat(
            parseFloat(this.tableData[20][columnName] || 0).toFixed(2)
          );
        this.tableData[21][columnName] =
          listNinteen != "" ? listNinteen.toFixed(2) : "";
      } else {
        let listOneIndex = this.tableData.findIndex((o) => o.rowNo == 1),
          listTwoIndex = this.tableData.findIndex((o) => o.rowNo == 2),
          listThreeIndex = this.tableData.findIndex((o) => o.rowNo == 3),
          listFourIndex = this.tableData.findIndex((o) => o.rowNo == 4),
          listFiveIndex = this.tableData.findIndex((o) => o.rowNo == 5),
          listEightIndex = this.tableData.findIndex((o) => o.rowNo == 8),
          listThirteenIndex = this.tableData.findIndex((o) => o.rowNo == 13),
          listForteenIndex = this.tableData.findIndex((o) => o.rowNo == 14),
          listFiveteenIndex = this.tableData.findIndex((o) => o.rowNo == 15),
          listSixteenIndex = this.tableData.findIndex((o) => o.rowNo == 16),
          listNineteenIndex = this.tableData.findIndex((o) => o.rowNo == 19),
          listTwentythreeIndex = this.tableData.findIndex((o) => o.rowNo == 23),
          listTwentyfourIndex = this.tableData.findIndex((o) => o.rowNo == 24),
          listTwentyfiveIndex = this.tableData.findIndex((o) => o.rowNo == 25),
          listTwentysixIndex = this.tableData.findIndex((o) => o.rowNo == 26),
          listTwentysevenIndex = this.tableData.findIndex((o) => o.rowNo == 27),
          listThirtyIndex = this.tableData.findIndex((o) => o.rowNo == 30),
          listThirtyfourIndex = this.tableData.findIndex((o) => o.rowNo == 34),
          listThirtyfiveIndex = this.tableData.findIndex((o) => o.rowNo == 35),
          listThirtysixIndex = this.tableData.findIndex((o) => o.rowNo == 36),
          listThirtynineIndex = this.tableData.findIndex((o) => o.rowNo == 39),
          listFortythreeIndex = this.tableData.findIndex((o) => o.rowNo == 43),
          listFortyfourIndex = this.tableData.findIndex((o) => o.rowNo == 44),
          listFortyfiveIndex = this.tableData.findIndex((o) => o.rowNo == 45),
          listFortyeightIndex = this.tableData.findIndex((o) => o.rowNo == 48),
          listFiftyIndex = this.tableData.findIndex((o) => o.rowNo == 50),
          listFiftyoneIndex = this.tableData.findIndex((o) => o.rowNo == 51),
          listFiftytwoIndex = this.tableData.findIndex((o) => o.rowNo == 52),
          listFiftyfiveIndex = this.tableData.findIndex((o) => o.rowNo == 55),
          listFiftyeightIndex = this.tableData.findIndex((o) => o.rowNo == 58),
          listFiftynineIndex = this.tableData.findIndex((o) => o.rowNo == 59),
          listSixtyIndex = this.tableData.findIndex((o) => o.rowNo == 60),
          listSixtyoneIndex = this.tableData.findIndex((o) => o.rowNo == 61),
          listThirteen =
            parseFloat(
              parseFloat(this.tableData[listOneIndex][columnName] || 0).toFixed(
                2
              )
            ) +
            parseFloat(
              parseFloat(this.tableData[listTwoIndex][columnName] || 0).toFixed(
                2
              )
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listThreeIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFourIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFiveIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listEightIndex][columnName] || 0
              ).toFixed(2)
            ),
          listTwentythree =
            parseFloat(
              parseFloat(
                this.tableData[listForteenIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFiveteenIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listSixteenIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listNineteenIndex][columnName] || 0
              ).toFixed(2)
            ),
          listTwentyfour = listThirteen - listTwentythree,
          listThirtyfour =
            parseFloat(
              parseFloat(
                this.tableData[listTwentyfiveIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listTwentysixIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listTwentysevenIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listThirtyIndex][columnName] || 0
              ).toFixed(2)
            ),
          listFortythree =
            parseFloat(
              parseFloat(
                this.tableData[listThirtyfiveIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listThirtysixIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listThirtynineIndex][columnName] || 0
              ).toFixed(2)
            ),
          listFortyfour = listThirtyfour - listFortythree,
          listFifty =
            parseFloat(
              parseFloat(
                this.tableData[listFortyfiveIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFortyeightIndex][columnName] || 0
              ).toFixed(2)
            ),
          listFiftyeight =
            parseFloat(
              parseFloat(
                this.tableData[listFiftyoneIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFiftytwoIndex][columnName] || 0
              ).toFixed(2)
            ) +
            parseFloat(
              parseFloat(
                this.tableData[listFiftyfiveIndex][columnName] || 0
              ).toFixed(2)
            ),
          listFiftynine =
            parseFloat(
              parseFloat(
                this.tableData[listFiftyIndex][columnName] || 0
              ).toFixed(2)
            ) - listFiftyeight,
          listSixtyone =
            listFifty +
            listFortyfour +
            listFiftynine +
            parseFloat(
              parseFloat(
                this.tableData[listSixtyIndex][columnName] || 0
              ).toFixed(2)
            );
        list = list.update(listThirteenIndex, (item) =>
          item.set(
            columnName,
            listThirteen != "" ? listThirteen.toFixed(2) : ""
          )
        );
        list = list.update(listTwentythreeIndex, (item) =>
          item.set(
            columnName,
            listTwentythree != "" ? listTwentythree.toFixed(2) : ""
          )
        );
        list = list.update(listTwentyfourIndex, (item) =>
          item.set(
            columnName,
            listTwentyfour != "" ? listTwentyfour.toFixed(2) : ""
          )
        );
        list = list.update(listThirtyfourIndex, (item) =>
          item.set(
            columnName,
            listThirtyfour != "" ? listThirtyfour.toFixed(2) : ""
          )
        );
        list = list.update(listFortythreeIndex, (item) =>
          item.set(
            columnName,
            listFortythree != "" ? listFortythree.toFixed(2) : ""
          )
        );
        list = list.update(listFortyfourIndex, (item) =>
          item.set(
            columnName,
            listFortyfour != "" ? listFortyfour.toFixed(2) : ""
          )
        );
        list = list.update(listFiftyIndex, (item) =>
          item.set(columnName, listFifty != "" ? listFifty.toFixed(2) : "")
        );
        list = list.update(listFiftyeightIndex, (item) =>
          item.set(
            columnName,
            listFiftyeight != "" ? listFiftyeight.toFixed(2) : ""
          )
        );
        list = list.update(listFiftynineIndex, (item) =>
          item.set(
            columnName,
            listFiftynine != "" ? listFiftynine.toFixed(2) : ""
          )
        );
        list = list.update(listSixtyoneIndex, (item) =>
          item.set(
            columnName,
            listSixtyone != "" ? listFiftynine.toFixed(2) : ""
          )
        );
      }
      this.save(this.tableData);
    },
    async save(list) {
      let data = this.checkSave(list),
        checkStyle = {
          textAlign: "right",
          fontSize: "13px",
          display: "inline-block",
          verticalAlign: "top",
        };

      if (data.msg.length > 0) {
        this.$baseMessage(
          <div style={checkStyle}>
            {data.msg.map((o) => (
              <p style={{ marginBottom: "0" }}>{o}</p>
            ))}
          </div>,
          "warning"
        );

        // this.metaAction.sf('data.cashflowlist', list)
        // this.injections.reduce('update', { path: 'data.cashflowlist', value: list })

        return;
      }

      if (list.length) {
        let response = await savePeriodBegin(data.listArr);
        this.$baseMessage("现金流量期初更新成功", "success");
        this.loadList();
      }
    },

    checkSave(list) {
      let msg = [],
        allItemEmpty = true,
        listArr = [];

      list.forEach((item, i) => {
        if (
          !item ||
          (!item.voucherDate && !item.cashFlowItemId && !item.amount)
        ) {
          return;
        }

        if (item.cashFlowItemId && item.amount) {
          listArr.push({
            // voucherDate: date,
            cashFlowItemId: item.cashFlowItemId,
            amount: item.amount,
          });
        }

        allItemEmpty = false;

        let emptyItemNames = [];

        if (!item.voucherDate) {
          emptyItemNames.push("日期");
        }

        if (!item.cashFlowItem) {
          emptyItemNames.push("项目");
        }

        if (!item.amount) {
          emptyItemNames.push("金额");
        }

        if (emptyItemNames.length > 0) {
          let rowError;
          if (emptyItemNames.length > 2) {
            rowError = "日期、项目和金额";
          } else if (emptyItemNames.length == 2) {
            rowError = emptyItemNames[0] + "和" + emptyItemNames[1];
          } else {
            rowError = emptyItemNames[0];
          }

          return;
        }
      });

      return { msg, listArr };
    },

    forceRerender() {
      // 从 DOM 中删除 my-component 组件
      this.renderComponent = false;

      this.$nextTick(() => {
        // 在 DOM 中添加 my-component 组件
        this.renderComponent = true;
      });
    },

    async resetCashFlowPeriodBegin() {
      const response = await resetCashFlowPeriodBegin({});
      if (response) {
        this.$baseMessage("现金流量期初重置完成", "success");
        this.loadList();
      }
    },
    async getInitPeriod() {
      let currentOrg = this.$store.state.routes.org;
      let enabledYearMonth =
        currentOrg.enabledYear +
        "-" +
        currentOrg.enabledMonth.toString().padStart(2, "0");
      this.defaultValue = enabledYearMonth;
    },
    async changeEnabledPeriod(value) {
      const selectYear = value.split("-")[0];
      const selectMonth = value.split("-")[1];
      const ts = this.ts ? this.ts : "";
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
        // this.loadList();
      }
      this.$store.commit("routes/setOrg", {
        ...this.$store.state.routes.org,
        enabledMonth: Number(selectMonth.split("月")[0]),
        enabledYear: selectYear,
      });
      this.$emit("router-emit", Number(selectMonth.split("月")[0]));
      this.loadList();
    },
  },
  created() {
    this.loading = true;
    this.loadList();
    this.getInitPeriod();
  },
};
</script>