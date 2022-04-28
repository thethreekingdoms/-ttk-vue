<template>
  <div class="subjectCodeSet">
    <div class="title">
      <span>科目编码级次：5级</span>
    </div>
    <div class="content">
      <el-form ref="templateForm" :model="form" label-width="90px" class="subjectCodeSet-form">
        <el-form-item label="编码长度：">
          <el-input v-model="form.grade1"></el-input>
          <span class="text">一</span>
          <el-input v-model="form.grade2"></el-input>
          <span class="text">一</span>
          <el-input v-model="form.grade3"></el-input>
          <span class="text">一</span>
          <el-input v-model="form.grade4"></el-input>
          <span class="text">一</span>
          <el-input v-model="form.grade5"></el-input>
        </el-form-item>
        <el-form-item>
          <span class="tips">编码长度变更将会改变原有科目编码，请谨慎修改</span>
        </el-form-item>
        <el-form-item label="编码示例">
          <span class="sample">{{getsample()}}</span>
        </el-form-item>
      </el-form>
    </div>
    <div class="footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancelForm">取消</el-button>
    </div>
  </div>
</template>
<script>
import {
  getAccountGrade,
  setAccountGrade,
} from "@/api/gl/gl_accountingSubject";
export default {
  name: "subjectCodeSet",
  data() {
    return {
      form: {
        grade1: 4,
        grade2: 2,
        grade3: 2,
        grade4: 2,
        grade5: 2,
      },
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      let response = await getAccountGrade();
      if (response && response.result) {
        this.form = response.value;
      }
    },
    getsample() {
      let form = this.form;
      return `1001 ${"0".repeat(form.grade2 - 1)}1 ${"0".repeat(
        form.grade3 - 1
      )}1 ${"0".repeat(form.grade4 - 1)}1 ${"0".repeat(form.grade5 - 1)}1`;
    },
    submitForm() {
      this.$emit("subjectCode-set", this.form);
    },
    cancelForm() {
      this.$emit("subjectCode-set");
    },
  },
};
</script>
<style lang="scss">
.subjectCodeSet {
  .title {
    color: #ff6000;
    margin-bottom: 10px;
  }
  .content {
    .subjectCodeSet-form {
      .el-input {
        width: 50px;
        input {
          text-align: center;
        }
      }
      .text {
        margin: 0px 8px;
        color: #d9d9d9;
      }
      .tips {
        color: #ff6000;
      }
    }
  }
  .footer {
    margin-top: 15px;
    text-align: right;
  }
}
</style>