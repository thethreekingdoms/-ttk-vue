<template>
  <el-form ref="settingForm" :model="form" label-width="80px">
    <el-form-item label-width="0">
      <el-radio-group v-model="form.flag">
        <el-radio :label="true">按选中凭证修改</el-radio>
        <el-radio :label="false">按照日期批量修改</el-radio>
      </el-radio-group>
    </el-form-item>

    <div
      v-if="!form.flag"
      style="margin-bottom: 10px;color: rgb(255, 84, 62)"
    >注意：会对选中凭证日期内的全部凭证进行修改，保存后不可逆，请谨慎操作</div>
    <el-form-item label="凭证日期" v-if="!form.flag">
      <el-col :span="10">
        <el-date-picker
          style="width:270px;"
          v-model="form.date"
          type="daterange"
          value-format="yyyy-MM-dd"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          :clearable="false"
        ></el-date-picker>
      </el-col>
    </el-form-item>
    <el-form-item label-width="0">
      <el-col :span="5">
        <el-checkbox v-model="form.modifyCreator">修改制单人</el-checkbox>
      </el-col>
      <el-col :span="10" v-if="form.modifyCreator">
        <el-radio-group v-model="form.creatorType">
          <el-radio label="operator">现系统操作人</el-radio>
          <el-radio label="customer">自定义</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="5" v-if="form.modifyCreator">
        <el-input
          placeholder="制单人"
          v-model="form.creatorName"
          :disabled="form.creatorType==='operator'"
        ></el-input>
      </el-col>
    </el-form-item>
    <el-form-item label-width="0">
      <el-col :span="5">
        <el-checkbox v-model="form.modifyEditor">修改审核人</el-checkbox>
      </el-col>
      <el-col :span="10" v-if="form.modifyEditor">
        <el-radio-group v-model="form.editorType">
          <el-radio label="operator">现系统操作人</el-radio>
          <el-radio label="customer">自定义</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="5" v-if="form.modifyEditor">
        <el-input
          placeholder="审核人"
          v-model="form.editorName"
          :disabled="(form.editorType)=='operator'"
        ></el-input>
      </el-col>
    </el-form-item>
    <el-form-item class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm('settingForm')">确定</el-button>
      <el-button @click="cancelForm('settingForm')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "modifyCreator",
  props: {
    creatorData: Object,
  },
  data() {
    return {
      form: {},
    };
  },
  watch: {
    creatorData: function (newVal, oldVal) {
      console.log(newVal, oldVal);
      this.form = {
        toDate: newVal.toDate ? newVal.toDate : "",
        fromDate: newVal.fromDate ? newVal.fromDate : "",
        modifyCreator: newVal.modifyCreator ? newVal.modifyCreator : false,
        modifyEditor: newVal.modifyEditor ? newVal.modifyEditor : false,
        modifySupervisor: newVal.modifySupervisor
          ? newVal.modifySupervisor
          : false,
        creatorType: "operator",
        supervisorType: "operator",
        creatorName: newVal.creatorName ? newVal.creatorName : "",
        editorType: "operator",
        date: newVal.date ? newVal.date : "",
        supervisorName: newVal.supervisorName ? newVal.supervisorName : "",
        editorName: newVal.editorName ? newVal.editorName : "",
        enableddate: newVal.enableddate ? newVal.enableddate : "",
        creatorFlag: false,
        editorFlag: false,
        flag: newVal.flag ? newVal.flag : false,
      };
    },
  },
  created() {},
  methods: {
    getDisabled(type) {
      console.log(type, this.form[type] == "operator");
      return this.form[type] == "operator" ? true : false;
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("creator-setting", this.form);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    cancelForm() {
      this.$emit("creator-setting");
    },
    disabledDate(time, type) {
      // const enableddate = this.state.enableddate;
      // if (type == "pre") {
      //   let currentMonth = this.transformDateToNum(time);
      //   let enableddateMonth = this.transformDateToNum(enableddate);
      //   return currentMonth < enableddateMonth;
      // } else {
      //   let currentMonth = this.transformDateToNum(time);
      //   let pointTimeMonth = this.transformDateToNum(this.state.fromDate);
      //   let enableddateMonth = this.transformDateToNum(enableddate);
      //   return currentMonth < pointTimeMonth || currentMonth < enableddateMonth;
      // }
    },
  },
};
</script>
<style lang="scss">
.modifyCreator-container {
  .content {
    margin-top: 10px;
  }
}
</style>