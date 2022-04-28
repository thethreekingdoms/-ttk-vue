<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="500px" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="编码" prop="编码">
        <el-input v-model="form.code" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { update, getAutoCode, create } from "@/api/ba/projectList";

export default {
  name: "ProjectListEdit",
  data() {
    return {
      form: {
        id: "",
        code: '',
        name: ''
      },
      rules: {
        code: [
          { required: true, trigger: "blur", message: "编码不能为空" },
        ],
        name: [
          { required: true, trigger: "blur", message: "名称不能为空" },
        ],
      },
      title: "",
      dialogFormVisible: false,
    };
  },
  created() { },
  methods: {
    async showEdit(row) {
      if (!row) {
        this.title = "添加";
        const response = await getAutoCode()
        this.form.code = response && response.value
      } else {
        this.title = "编辑";
        this.form = Object.assign({}, row);
      }
      this.dialogFormVisible = true;
    },
    close() {
      this.$refs["form"].resetFields();
      this.form = this.$options.data().form;
      this.dialogFormVisible = false;
    },
    save() {
      this.$refs["form"].validate(async (valid) => {
        if (valid) {
          const isEdit = this.form.id
          const fetchFun = isEdit ? update : create
          const { result } = await fetchFun(this.form);
          if (result) {
            this.$baseMessage('保存成功', "success");
            this.$emit("fetchData");
            this.close();
          }
        } else {
          return false;
        }
      });
    },
  },
};
</script>
