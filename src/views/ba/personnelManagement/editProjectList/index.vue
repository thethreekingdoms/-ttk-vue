<template>
  <div class="projectList-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-button icon="el-icon-plus" type="primary" @click="handleEdit">添加</el-button>
        <el-button icon="el-icon-delete" type="danger" @click="handleDelete">批量删除</el-button>
      </vab-query-form-left-panel>
      <vab-query-form-right-panel :span="12">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model.trim="queryForm.permission" placeholder="请输入查询条件" clearable />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>

    <e-table
      v-loading="listLoading"
      :data="list"
      :columns="columns"
      :element-loading-text="elementLoadingText"
      @selection-change="setSelectRows"
      @cell-value-change="cellValueChange"
    >
      <el-table-column
        align="right"
        width="250"
        class-name="voucher-money">
        <template slot="header" slot-scope="scope">
          <money-header title_="借方金额"></money-header>
        </template>
        <template slot-scope="scope">
          <money-body value_="123">ewqeqw</money-body>
        </template>
      </el-table-column>
      <el-table-column
        align="right"
        width="250"
        class-name="voucher-money">
        <template slot="header" slot-scope="scope">
          <money-header title_="贷方金额"></money-header>
        </template>
        <template slot-scope="scope">
          <money-body value_="-123">ewqeqw</money-body>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template v-slot="scope">
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </e-table>
    <el-pagination
      background
      :current-page="queryForm.pageNo"
      :page-size="queryForm.pageSize"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
    <edit ref="edit" @fetchData="fetchData"></edit>
  </div>
</template>

<script>
import { getList, doDelete, update } from "@/api/ba/projectList";
import InputCellVue from './components/InputCell.vue';
import Edit from "./components/ProjectListEdit";

export default {
  name: "EditProjectList",
  components: { Edit },
  data() {
    return {
      list: null,
      listLoading: true,
      layout: "total, sizes, prev, pager, next, jumper",
      total: 0,
      selectRows: "",
      elementLoadingText: "正在加载...",
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        permission: "",
      },
      columns: [
        {
          prop: "code",
          label: "编码 [可编辑单元格]",
          edit: true,
          editComponent: InputCellVue
        },
        {
          prop: "name",
          label: "名称 [下拉选择编辑]",
          sortable: true,
          filter: true,
          filterType: "single",
          edit: true,
          editType: "selection", //下拉选择编辑组件
          editAttrs: {
            size: "mini",
            // clearable:true,
            options: [
              { value: "张三", label: "张三" },
              { value: "李四", label: "李四" },
              { value: "赵五", label: "赵五" }
            ]
          },
          editListeners: {
            //change 事件被覆盖为 cell-value-change 事件
            focus: event => {
              console.log("[editListeners] [focus event]", event);
            }
          }
        }
      ],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    setSelectRows(val) {
      this.selectRows = val;
    },
    cellValueChange(v, row, column, columnObj) {
      // console.log("change", v, row);
      this.handleEdit(row)
    },
    handleEdit(row) {
      if (row.id) {
        this.save(row)
      } else {
        this.$refs["edit"].showEdit();
      }
    },
    handleDelete(row) {
      if (!row && !this.selectRows.length) {
        this.$baseMessage("未选中任何行", "error");
        return false;
      }
      this.$baseConfirm("你确定要删除当前项吗", null, async () => {
        let params
        if (row.id) {
          params = [{ ...row }]
        } else {
          params = this.selectRows
        }
        const { result } = await doDelete(params);
        if (result) {
          this.$baseMessage('删除成功', "success");
          this.fetchData();
        }
      });
    },
    handleSizeChange(val) {
      this.queryForm.pageSize = val;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.queryForm.pageNo = val;
      this.fetchData();
    },
    queryData() {
      this.queryForm.pageNo = 1;
      this.fetchData();
    },
    async save(row) {
      if(!row.code) {
        return this.$baseMessage('编码不能为空', "error");
      }
      if(!row.name) {
        return this.$baseMessage('名称不能为空', "error");
      }
      const { result } = await update(row);
      if (result) {
        this.$baseMessage('保存成功', "success");
        this.fetchData()
      }
    },
    async fetchData() {
      this.listLoading = true;
      // const { value, result } = await getList(this.queryForm);
      const queryObj = { "page": { "pageSize": 50 }, "entity": { "fuzzyCondition": "" } }
      queryObj.entity.fuzzyCondition = this.queryForm.permission
      const { value = {}, result } = await getList(queryObj);
      const { list, page = {} } = value
      this.list = list;
      this.total = page.totalCount || 0;
      setTimeout(() => {
        this.listLoading = false;
      }, 300);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
