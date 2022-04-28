<template>
  <el-form :model="form" ref="sortform" :rules="rules">
    <el-form-item label="范围" prop="date">
      <el-date-picker
        :clearable="false"
        value-format="yyyy-MM"
        v-model="form.date"
        type="month"
        placeholder="选择范围"
      ></el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-radio-group v-model="form.reorganizeType">
        <el-radio label="0">断号整理</el-radio>
        <el-radio label="1">序时整理</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm('sortform')">确定</el-button>
      <el-button @click="cancelForm('sortform')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "sortDocCode",
  props: { sortData: Object },
  // watch: {
  //   sortData: function (newVal, oldVal) {
  //     console.log(newVal, oldVal);
  //     this.form = newVal;
  //   },
  // },
  data() {
    console.log(this.sortData);
    return {
      form: {
        date: this.sortData ? this.sortData.date : "",
        reorganizeType: "0",
      },
      rules: {
        date: [{ required: true, trigger: "blur", message: "范围不能为空" }],
      },
    };
  },

  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("sort-setting", this.form);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    cancelForm() {
      this.$emit("sort-setting");
    },
  },
};
</script>