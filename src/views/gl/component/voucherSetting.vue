<template>
  <el-form ref="settingForm" :model="form" label-width="110px" class="voucherSetting-container">
    <el-form-item label="新增凭证">
      <el-radio-group v-model="form.generateDocCodeModel">
        <el-radio label="1">断号自动插入</el-radio>
        <el-tooltip
          popper-class="voucherSetting-tip"
          content="系统内有凭证删除产生凭证号断号时，新增凭证（不区分系统自动生成或手工新增）优先补齐断号"
          placement="right"
          effect="light"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
        <el-radio label="0">顺序依次新增</el-radio>
        <el-tooltip
          popper-class="voucherSetting-tip"
          content="新增凭证号规则为现有最大凭证号+1，不会自动补齐断号"
          placement="right"
          effect="light"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="凭证管理排序">
      <el-radio-group v-model="form.docManagerSortModel">
        <el-radio label="1">月份+凭证号排序</el-radio>
        <el-tooltip
          popper-class="voucherSetting-tip"
          content="凭证号将在本月份内按照凭证号排序，不考虑具体日期，调整后记录排序规则，仅影响展示排序，不影响凭证本身的字号"
          placement="right"
          effect="light"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
        <el-radio label="0">日期+凭证号排序</el-radio>
        <el-tooltip
          popper-class="voucherSetting-tip"
          content="凭证号将在本月份按照日期的先后顺序优先排序，再按照凭证号排序，考虑具体日期，调整后记录排序规则，仅影响展示排序，不影响凭证本身的字号"
          placement="right"
          effect="light"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <el-form-item class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm('settingForm')">确定</el-button>
      <el-button @click="cancelForm('settingForm')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "voucherSetting",
  props: {
    codeData: Object,
  },
  watch: {
    codeData: function (newVal, oldVal) {
      console.log(newVal, oldVal);
      this.form = newVal;
    },
  },
  data() {
    return {
      form: {
        generateDocCodeModel: "",
        docManagerSortModel: "",
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("voucher-setting", this.form);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    cancelForm() {
      this.$emit("voucher-setting");
    },
  },
};
</script>
<style lang="scss">
.voucherSetting-container {
  padding-right: 0px !important;

  .el-radio {
    margin-right: 6px;
  }
  .el-icon-help {
    font-size: 20px;
    margin-right: 10px;
  }
}
.voucherSetting-tip {
  width: 200px;
}
</style>