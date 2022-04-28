<template>
  <el-form ref="form">
    <el-form-item>
      <el-checkbox-group v-model="form.option">
        <el-checkbox label="printAuxAccCalc">辅助核算</el-checkbox>
        <el-checkbox label="isPrintQuantity">数量核算</el-checkbox>
        <el-checkbox label="isPrintMulti">外币核算</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm('form')">确定</el-button>
      <el-button @click="cancelForm('form')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "exportDocOption",
  props: {exportData: Object},
  data() {
    return {
      form: {
        option:[],
      },
    };
  },
  watch: {
    exportData: function (newVal, oldVal) {
      for(let key in newVal){
        if(newVal[key] == "1"){
          this.form.option.push(key)
        }
      }
    },
  },
  methods: {
    submitForm(formName) {
      this.$emit("export-setting", this.form);
    },
    cancelForm() {
      this.$emit("export-setting");
    },
  },
};
</script>