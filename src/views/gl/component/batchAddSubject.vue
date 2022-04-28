<template>
  <div class="batchAddSubject">
    <div class="content">
      <el-input type="textarea" placeholder="可粘贴科目名称，多个科目请换行" v-model="name" show-word-limit></el-input>
    </div>
    <div class="footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancelForm">取消</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "batchAddSubject",
  props: ["batchsubjectAddProps"],
  data() {
    return {
      name: "",
      rowData: this.batchsubjectAddProps.row
    };
  },
  methods: {
    submitForm() {
      let nameList = this.name.split("\n");
      let list = [];
      nameList.filter((name) => {
        if (name != "" && name.trim()) {
          list.push(name.trim());
          return true;
        }
      });
      if (list.length == 0) {
        this.$baseMessage("请至少录入1个科目名称", "warning");
        return false;
      }
      console.log(this.rowData)
      this.$emit("batchSubject-add", {nameList, row: this.rowData})
    },
    cancelForm() {
        this.$emit("batchSubject-add")
    },
  },
};
</script>
<style lang="scss">
.batchAddSubject {
  .content {
    textarea {
      height: 120px;
    }
  }
  .footer {
    margin-top: 15px;
    text-align: right;
  }
}
</style>