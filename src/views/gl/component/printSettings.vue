<template>
  <div>
    <el-button type="text" @click="handlePrint">打印设置</el-button>
    <el-dialog
      title="打印设置"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      custom-class="gllist-printsettings"
    >
      <el-form :model="form" class="setting-body">
        <el-form-item label="纸张尺寸" class="paper-size">
          <el-select v-model="getType" class="paper-size-set" @change="changePageName">
            <el-option
              v-for="item in paperSizeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
          <div class="paper-size-input" v-show="form.selectNameOptionFalg">
            <span>每页分录数：</span>
            <el-select v-model="form.selectNameOption">
              <el-option v-for="item in paperItemList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
        </el-form-item>
        <el-form-item v-if="form.type == '2'">
          <div class="display-flex">
            <div class="paper-size-input">
              <span>宽：</span>
              <el-input-number
                v-model="form.width"
                controls-position="right"
                :min="100"
                :max="297"
                :precision="2"
                class="inputNumberWid"
              ></el-input-number>
              <span>毫米</span>
            </div>
            <div class="paper-size-input">
              <span>高：</span>
              <el-input-number
                v-model="form.height"
                controls-position="right"
                :min="80"
                :max="297"
                :precision="2"
                class="inputNumberWid"
              ></el-input-number>
              <span>毫米</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="打印方向">
          <el-radio v-model="getLandscape" :label="1">横向</el-radio>
          <el-radio v-model="getLandscape" :label="2">纵向</el-radio>
        </el-form-item>
        <el-form-item label="边距调整" class="customize">
          <div class="paper-size-input">
            <span>左：</span>
            <el-input-number
              v-model="form.leftPadding"
              controls-position="right"
              :min="5"
              :max="30"
            ></el-input-number>
            <span>毫米</span>
          </div>
          <div class="paper-size-input">
            <span>右：</span>
            <el-input-number
              v-model="form.rightPadding"
              controls-position="right"
              :min="5"
              :max="30"
            ></el-input-number>
            <span>毫米</span>
          </div>
          <div class="paper-size-input">
            <span>上：</span>
            <el-input-number v-model="form.topPadding" controls-position="right" :min="0" :max="30"></el-input-number>
            <span>毫米</span>
          </div>
          <div class="paper-size-input">
            <span>下：</span>
            <el-input-number
              v-model="form.bottomPadding"
              controls-position="right"
              :min="0"
              :max="30"
            ></el-input-number>
            <span>毫米</span>
          </div>
        </el-form-item>
        <el-form-item label="字号调整" class="paper-size-input">
          <el-input-number
            v-model="form.contentFontSize"
            controls-position="right"
            :min="5"
            :max="12"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.printAuxAccCalc">打印辅助核算</el-checkbox>
          <el-checkbox v-model="form.printQuantity">打印数量核算</el-checkbox>
          <el-checkbox v-model="form.printMulti">打印外币核算</el-checkbox>
        </el-form-item>
        <el-form-item class="customize">
          <el-checkbox v-model="creatorButton">打印制单人</el-checkbox>
          <el-radio v-show="creatorButton" v-model="form.creatorType" :label="-2">原制单人</el-radio>
          <el-radio v-show="creatorButton" v-model="form.creatorType" :label="1">当前操作人</el-radio>
          <el-radio v-show="creatorButton" v-model="form.creatorType" :label="0">自定义</el-radio>
          <el-input
            v-show="creatorButton"
            :disabled="form.creatorType != '0'"
            placeholder="制单人"
            v-model="form.creator"
          ></el-input>
        </el-form-item>
        <el-form-item class="customize">
          <el-checkbox v-model="auditorButton">打印审核人</el-checkbox>
          <el-radio v-show="auditorButton" v-model="form.auditorType" :label="-2">原审核人</el-radio>
          <el-radio v-show="auditorButton" v-model="form.auditorType" :label="1">当前操作人</el-radio>
          <el-radio v-show="auditorButton" v-model="form.auditorType" :label="0">自定义</el-radio>
          <el-input
            v-show="auditorButton"
            :disabled="form.auditorType != '0'"
            placeholder="审核人"
            v-model="form.auditor"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.printTime">显示打印时间</el-checkbox>
          <el-radio
            v-show="form.printTime"
            v-model="timeOriginal"
            :label="0"
            @change="hanldeRadioPrintTime"
          >当前操作时间</el-radio>
          <el-radio v-show="form.printTime" v-model="timeOriginal" :label="1">自定义</el-radio>
          <el-date-picker
            v-show="form.printTime"
            v-model="form.customPrintTime"
            :disabled="timeOriginal == '0'"
            type="datetime"
            value-format="yyyy-MM-dd hh:mm:SS"
            placeholder="选择日期"
            :clearable="false"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="merge">科目合并至：</el-checkbox>
          <el-select :disabled="!merge" v-model="form.grade">
            <el-option label="1级科目" value="1"></el-option>
            <el-option label="2级科目" value="2"></el-option>
            <el-option label="3级科目" value="3"></el-option>
            <el-option label="4级科目" value="4"></el-option>
            <el-option label="5级科目" value="5"></el-option>
            <el-option label="末级科目" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClick">确 定</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPrintConfig } from "@/api/gl/gl_voucherlist";

const maxLineNum = [5, 6, 7, 8, 9, 10];
const maxLineNumA4 = [18, 19, 20, 21, 22, 23, 24];
const selectName = [
  { name: "A4（297*210）一版", id: "3" },
  { name: "A4（297*210）二版", id: "0" },
  { name: "A4（297*210）三版", id: "1" },
  { name: "A4（210*120）", id: "7" },
  { name: "A5（210*148）", id: "4" },
  { name: "套打增票凭证纸KPJ103", id: "11" },
  { name: "套打金蝶凭证纸KPJ105", id: "12" },
  { name: "针打金额记账凭证KPL103", id: "13" },
  { name: "自定义大小", id: "2" },
];
const maxLineNumA5 = [5, 6, 7, 8, 9, 10];
const maxLineNumCus = [
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
];
export default {
  props: {},
  data() {
    return {
      dialogFormVisible: false,
      form: {
        creatorType: -1,
        auditorType: -1,
      },
      paperSizeList: selectName,
      paperItemList: maxLineNum,
      // creatorButton: true,
      // auditorButton: true,
      timeOriginal: 0,
      merge: false,
    };
  },
  computed: {
    getType: {
      get() {
        return String(this.form.type);
      },
      set(v) {
        this.form.type = v;
      },
    },
    getLandscape: {
      get() {
        return this.form.landscape ? 1 : 2;
      },
      set(v) {
        this.form.landscape = v === 1 ? true : false;
      },
    },
    creatorButton: {
      get() {
        return this.form.auditorType === -1 ? false : true;
      },
    },
    auditorButton: {
      get() {
        return this.form.creatorType === -1 ? false : true;
      },
    },
  },
  methods: {
    changePageName(e) {
      console.log(e);
      // this.form.selectNameOptionFalg = true;
      // this.form.selectNameOption = "6";
      switch (e) {
        case "3":
          this.paperItemList = maxLineNumA4;
          this.form.selectNameOptionFalg = true;
          this.form.selectNameOption = String(this.form.maxLineNumA4);
          break;
        case "0":
          this.paperItemList = maxLineNum;
          this.form.selectNameOptionFalg = true;
          this.form.selectNameOption = String(this.form.maxLineNum);
          break;
        case "4":
          this.paperItemList = maxLineNumA5;
          this.form.selectNameOptionFalg = true;
          this.form.selectNameOption = String(this.form.maxLineNumA5);
          break;
        case "2":
          this.paperItemList = maxLineNumCus;
          this.form.selectNameOptionFalg = true;
          this.form.selectNameOption = String(this.form.maxLineNumCus);
          break;
        default:
          this.form.selectNameOptionFalg = false;
          // if(type === "init") this.form.selectNameOption = String(this.form.maxLineNumA4);
          break;
      }
    },
    initPageName(e) {
      console.log(e);
      // this.form.selectNameOptionFalg = true;
      // this.form.selectNameOption = "6";
      switch (e) {
        case "3":
          this.paperItemList = maxLineNumA4;
          this.$set(
            this.form,
            "selectNameOption",
            String(this.form.maxLineNumA4)
          );
          // this.form.selectNameOption = String(this.form.maxLineNumA4);
          this.form.selectNameOptionFalg = true;
          break;
        case "0":
          this.paperItemList = maxLineNum;
          this.form.selectNameOptionFalg = true;
          this.$set(
            this.form,
            "selectNameOption",
            String(this.form.maxLineNum)
          );
          // this.form.selectNameOption = String(this.form.maxLineNum);
          break;
        case "4":
          this.paperItemList = maxLineNumA5;
          this.form.selectNameOptionFalg = true;
          this.$set(
            this.form,
            "selectNameOption",
            String(this.form.maxLineNumA5)
          );
          // this.form.selectNameOption = String(this.form.maxLineNumA5);
          break;
        case "2":
          this.paperItemList = maxLineNumCus;
          this.form.selectNameOptionFalg = true;
          this.$set(
            this.form,
            "selectNameOption",
            String(this.form.maxLineNumCus)
          );
          // this.form.selectNameOption = String(this.form.maxLineNumCus);
          break;
        default:
          this.form.selectNameOptionFalg = false;
          // if(type === "init") this.form.selectNameOption = String(this.form.maxLineNumA4);
          break;
      }
    },
    handleClick() {
      if (this.getType == "11") {
        this.form.maxLineNum = 6;
      }
      if (this.getType == "12") {
        this.form.maxLineNum = 5;
      }
      switch (this.getType) {
        case "3":
          this.$set(this.form, "maxLineNumA4", this.form.selectNameOption);
          // this.form.maxLineNumA4 = this.form.selectNameOption
          break;
        case "0":
          this.$set(this.form, "maxLineNum", this.form.selectNameOption);
          // this.form.maxLineNum = this.form.selectNameOption
          break;
        case "4":
          this.$set(this.form, "maxLineNumA5", this.form.selectNameOption);
          // this.form.maxLineNumA5 = this.form.selectNameOption
          break;
        case "2":
          this.$set(this.form, "maxLineNumCus", this.form.selectNameOption);
          // this.form.maxLineNumCus = this.form.selectNameOption
          break;
      }
      this.dialogFormVisible = false;
      this.$emit("printSettings", this.form);
    },
    async init() {
      const response = await getPrintConfig({});
      if (response && response.result) {
        this.form = { ...response.value };
        this.initPageName(`${this.form.type}`);
        // this.$set(this.form, "selectNameOption", "6");
        // this.$set(this.form, "selectNameOptionFalg", this.changePageName());
        // this.$set(this.form, "customPrintTime", "");
        // this.$set(this.form, "grade", "0");
      }
    },
    hanldeRadioPrintTime() {
      this.$set(this.form, "customPrintTime", "");
    },
    handlePrint() {
      this.dialogFormVisible = true;
      this.init();
    },
  },
  created() {
    // this.init();
  },
};
</script>

<style lang="scss">
.gllist-printsettings {
  width: 700px;

  .el-dialog__body {
    padding: 20px 0 0 30px;
  }

  .el-form-item {
    margin-bottom: 10px;
  }

  .el-form-item__content {
    font-size: 13px;
  }

  .float-right {
    float: right;
  }

  .display-flex {
    display: flex;
  }

  .el-radio {
    line-height: 33px;

    > span {
      font-size: 13px;
    }
  }

  .el-checkbox {
    font-weight: 400;
  }

  .paper-size-input {
    padding-right: 10px;

    .el-input-number {
      width: 75px;
      margin-right: 5px;

      input {
        padding: 0 10px;
        text-align: left;
      }
    }
    .inputNumberWid {
      width: 90px;
    }

    .el-select {
      width: 120px;
    }
  }

  .paper-size {
    .el-form-item__content {
      display: flex;
    }

    &-set {
      flex: 1;
      padding-right: 20px;
    }
  }

  .customize {
    .el-form-item__content {
      display: flex;

      .display-flex {
        flex: 1;
        justify-content: space-between;
      }

      .paper-size-input {
        display: flex;
      }
    }
  }
}
</style>