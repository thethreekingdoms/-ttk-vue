<template>
  <el-form
    ref="templateForm"
    :model="form"
    label-width="80px"
    class="addTemplate-container"
    :rules="rules"
  >
    <el-form-item label="编码:" prop="code">
      <el-input v-model="form.code"></el-input>
    </el-form-item>
    <el-form-item label="名称:" prop="name">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item>
      <el-checkbox label="保存金额" v-model="form.isSaveAmount"></el-checkbox>
    </el-form-item>
    <el-form-item class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm('templateForm')">确定</el-button>
      <el-button @click="cancelForm('templateForm')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { getNewCode } from "@/api/gl/gl_vouchercard";
export default {
  name: "addTemplate",
  props: {
    docData: Object,
  },
  data() {
    return {
      form: {
        code: "",
        name: "",
        isSaveAmount: false,
      },
      rules: {
        name: [{ required: true, message: "请输入编码", trigger: "blur" }],
        code: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      let docData = this.docData;
      if (docData) {
        let docData = this.docData,
          details = docData.entrys;

        let response = await getNewCode();
        let form = { code: response.value };

        for (var i = 0; i < details.length; i++) {
          if (details[i].summary != "") {
            if (details[i].summary.length > 30) {
              let name = details[i].summary.slice(0, 30);
              form.name = name;
            } else {
              form.name = details[i].summary;
            }
            break;
          }
        }
        form.isDisplayCheckBox = true;
        this.form = form;
      } else if (docData.template) {
        let form = {};
        form.modify = docData.modify;
        form.id = docData.template.docTemplateId;
        form.code = docData.template.docTemplateCode;
        form.name = docData.template.docTemplateName;

        //"保存金额"字段,隐藏
        form.isDisplayCheckBox = false;
        this.form = form;
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("save-template", this.form);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    cancelForm() {
      this.$emit("cancel-template");
    },
  },
};
</script>