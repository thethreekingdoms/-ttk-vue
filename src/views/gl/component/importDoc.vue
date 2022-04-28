<template>
  <div class="importDoc">
    <div style="margin-bottom:8px">
      <span>1.下载</span>
      <a @click="importTemplate">导入模板</a>
      <span>并将数据按照模板格式进行整理</span>
    </div>
    <div style="margin-bottom:8px">2. 下载模板维护内容后，选择文件进行导入</div>
    <el-upload
      class="upload-demo"
      :action="action"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :file-list="fileList"
      accept=".xls, .xlsx"
      :show-file-list="false"
    >
      <el-button size="small" type="primary">{{file?"重选文件":"选择文件"}}</el-button>
    </el-upload>
    <a :title="file?file.originalName:''">{{file?file.originalName:""}}</a>
    <div class="footer" style="text-align: right">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancelForm">取消</el-button>
    </div>
  </div>
</template>
<script>
import { exportTemplate } from "@/api/gl/gl_voucherlist";
export default {
  name: "importDoc",
  props: {},
  data() {
    return {
      fileList: [],
      action: "",
      file: undefined,
    };
  },
  created() {
    this.action = "/v1/edf/file/upload?token=" + this.$baseAccessToken();
  },
  destroyed() {
    this.fileList = [];
    this.file = undefined;
  },
  methods: {
    //导入模板
    async importTemplate() {
      let res = await exportTemplate();
      if (res && !res.error) {
        // window.location.href = res.value;
        this.$baseMessage("下载模版成功", "success");
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    handleChange(file, fileList) {
      console.log(file, fileList);
      if (file.status == "success") {
        this.file = file.response.value;
      }
    },
    submitForm() {
      this.$emit("import-setting", this.file);
    },
    cancelForm() {
      this.$emit("import-setting");
    },
  },
};
</script>
<style lang="scss">
.importDoc {
  .footer {
    margin-top: 15px;
    text-align: right;
  }
}
</style>