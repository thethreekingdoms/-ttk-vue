<template>
  <div class="customerList-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="12">
        <el-input
          placeholder="请输入编码/名称"
          clearable
          suffix-icon="el-icon-search"
          class="input-search"
          v-model="entity.fuzzyCondition"
          @change="handleInputChange"
        ></el-input>
        <select-tree
          placeholder="选择客户分类"
          clearable
          class="select-tree-search"
          :treeOptions="category"
          selectedKey="0"
          @selectTreeChange="handleCategoryChange"
        ></select-tree>
        <el-col style="width:45px">
          <el-button icon="el-icon-refresh-right" @click="handleRefresh"></el-button>
        </el-col>
      </vab-query-form-left-panel>
      <vab-query-form-right-panel :span="12">
        <el-button type="primary" @click="handleAddCustomer">新增</el-button>
        <el-button @click="handleDelete">删除</el-button>
        <el-button @click="handleBatchBtn">批量修改</el-button>
        <el-button>科目自动生成档案</el-button>
        <el-button>导入</el-button>
        <el-button>导出</el-button>
      </vab-query-form-right-panel>
    </vab-query-form>

    <vxe-table
      border
      stripe
      highlight-hover-row
      ref="customerListTable"
      :data="tableData"
      @checkbox-all="selectAllEvent"
      @checkbox-change="selectChangeEvent"
      :checkbox-config="{checkMethod: handleCheckDisabled}"
      :loading="loading"
      :cell-class-name="cellClassName"
    >
      <vxe-table-column type="checkbox" width="34"></vxe-table-column>
      <vxe-table-column field="code" title="编码" width="90" show-overflow></vxe-table-column>
      <vxe-table-column field="name" title="名称" width="200" show-overflow></vxe-table-column>
      <vxe-table-column field="taxNumber" title="税号" width="140" show-overflow></vxe-table-column>
      <vxe-table-column field="receivableAccountName" title="应收科目" show-overflow></vxe-table-column>

      <vxe-table-column field="categoryName" title="客户分类" width="120" show-overflow></vxe-table-column>
      <vxe-table-column field="linkman" title="联系人" width="120" show-overflow></vxe-table-column>
      <vxe-table-column field="contactNumber" title="联系电话" width="120" show-overflow></vxe-table-column>
      <vxe-table-column field="operation" title="操作" width="100">
        <template v-slot="{ row }">
          <div class="operation">
            <el-button :icon="row.isEnable ? 'el-icon-open' : 'el-icon-turn-off'" 
            :title="row.isEnable ? '已启用' : '已停用'"
            @click="() => handleRowDisabled(row)"></el-button>
            <el-button title="编辑" icon="el-icon-edit-outline"></el-button>
            <el-button title="删除" icon="el-icon-delete" @click="() => handleDelete(row)" ></el-button>
          </div>
        </template>
      </vxe-table-column>
    </vxe-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="searchValue.page.currentPage"
      :page-sizes="[10, 20, 50, 500]"
      :page-size="searchValue.page.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchValue.page.totalCount"
    ></el-pagination>

    <el-dialog title="批量修改分类" :visible.sync="dialogCategoryVisible" class="ategoryDialogCss">
      <el-form>
        <el-form-item label="客户分类" >
          <select-tree
            placeholder="选择客户分类"
            class="select-tree-search-batch"
            :treeOptions="categorys"
            :defaultExpandAll="true"
            :clearable="false"
            selectedValue="未分类"
            selectedKey="1"
            @selectTreeChange="handleBatchCategoryChange"
          ></select-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCategoryVisible=false">取 消</el-button>
        <el-button type="primary" @click="handleBatchCategorySave">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增" :visible.sync="dialogAddCardVisible">
      <customerCard @handleAddOrEditRes="handleAddOrEditRes"/>
    </el-dialog>

    <!-- <div v-if="dialogAddCardVisible">
      <customerCard />
    </div> -->

  </div>
</template>
<script>
import {queryList, queryAll, update, doDelete, getSetting, setSetting, changeCustomer} from '@/api/ba/customerList'
import customerCard from "@/views/ba/customerManagement/customerCard/index.vue";
export default {
    name: "customerList",
    components:{
      customerCard
    },
    data(){
        return {
            loading: false,
            entity:{
              fuzzyCondition:null,
            },
            category:[],//客户分类
            categorys:[],//客户分类不包含全部,用于批量修改
            searchValue:{
                page: { pageSize: 50, currentPage: 1, totalCount: 0 },
            },
            tableData: [],
            isNeedRefreshCategory: true, //为了阻止重新渲染selectTree导致选中失败
            dialogCategoryVisible: false,
            changeCategoryCustomerId: null,
            dialogAddCardVisible: false
        }
    },
    created(){
        this.loading = true;
        this.initLoad();
    },
    computed:{
        
    },
    methods:{
        async initLoad(page) {
            let data,category;
            if (!page) {
              let pageObj = this.searchValue.page
              page = { currentPage: pageObj.currentPage, pageSize: pageObj.pageSize };

              let response = await getSetting({
                  moduleKey: 'app-list-customer',
                  resourceKey: 'app-list-customer-grid',
              })
              //获取客户分类
              category =  await queryAll({
                "baseArchiveType": 3000160001
              })
              if(response.pageSize){
                  page.pageSize = response.pageSize
              }
            }
            if (category && category.value) {
              let genTreeNode = {
                title:'全部',
                id: '0',//这里的字符串是为了跟组件里面默认展开的属性类型一致，才设置成string类型
                key: 'genid',
                code:'',
                value:'',
                name: '全部',
                label: '全部',
                baseArchiveType: 3000160001,
                isEnable: false,
                isLeaf: false,
                isReloadTree: false,
                level: 1,
              }
              let cats = this.getTreeNode(category.value);
              if (cats && cats.length > 0) {
                genTreeNode.children = cats;
              } else {
                genTreeNode.children = [];
              }
              this.categorys = cats || []
              // this.category = [genTreeNode]
              if(this.isNeedRefreshCategory) this.category = [genTreeNode]
              this.isNeedRefreshCategory = false
            }

            this.loading = true;
            data = await this.getData(page, this.entity);

            if(data && data.value) {
              this.tableData = data.value.list || []
              this.$set(this.searchValue, 'page', {
                currentPage: data.value.page.currentPage,
                totalCount: data.value.page.totalCount,
                pageSize: data.value.page.pageSize
              })
            }
            this.loading = false;
        },
        	//获取列表内容
        async getData (pageInfo, params){
          let response,
            pagination = this.searchValue.page,
            page = {
              pageSize: pagination.pageSize,
              currentPage: pagination.currentPage
            },
            entity = {
              fuzzyCondition: null,
              categoryHierarchyCode:null,
            };
            if (pageInfo && pageInfo['currentPage']) {
              page.currentPage = pageInfo.currentPage;
              page.pageSize = pageInfo.pageSize;
            }
            if (params) entity = params;
            response = await queryList({ page, entity });
            return response;
        },
        getTreeNode(list, pid=0, key){
          var tree = [];
          var temp;
          for (var i = 0; i < list.length; i++) {
            if (list[i].parentId == pid) {
              var obj = list[i];
              if (key != undefined && Number(key) != NaN) {
                obj.key = key + '-' + i;
              } else {
                obj.key = i + 1;
              }
              temp = this.getTreeNode(list, list[i].id, i);
              if (temp.length > 0) {
                obj.children = temp;
              }
              // obj.value = obj.code;
              obj.value = obj.id;
              obj.title = obj.name;
              obj.label = obj.name;
              obj.rank = ''
              tree.push(obj);
            }
          }
          return tree;
        },
        handleInputChange(v) {
          this.$set(this.entity, "fuzzyCondition", v)
          this.initLoad()
        },
        handleCategoryChange(id) {
          if(id) {
            const currentObj = this.category.find(el => el.id == id)
            if(currentObj)this.$set(this.entity, "categoryHierarchyCode", currentObj.code)
          } else {
            this.$set(this.entity, "categoryHierarchyCode", null)
          }
          this.initLoad()
        },
        handleRefresh() {
          this.initLoad()
        },
        handleDelete(rowData){
          // let isCurrentSelected = this.isCurrentSelected
          let isCurrentSelected = this.$refs.customerListTable.getCheckboxRecords()
          if(rowData) {
            isCurrentSelected = [rowData]
          } else {
            if(!isCurrentSelected.length) {
              this.$baseMessage('请选择客户', 'warning')
              return 
            }
          }
          this.$confirm('确认删除?', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
              let response = await doDelete(isCurrentSelected);
              if (response.length && response.length > 0) {
                response.forEach((data) => {
                  this.$baseMessage(data.message, 'warning')
                });
              } else {
                this.$message({
                  type: 'success',
                  message: '删除成功'
                });
              }
              this.initLoad();
          }).catch(() => {
            return false;        
          });
        },
        async handleSizeChange(val) {
            let page = this.searchValue.page;
            page.pageSize = val;
            this.$set(this.searchValue, "page", page);
            // this.initLoad(page);
            this.initLoad();
            let request = {
                moduleKey: 'app-list-customer',
                resourceKey: 'app-list-customer-grid',
                settingKey:"pageSize",
                settingValue:val
            }
            await setSetting([request])

        },
        async handleCurrentChange(val) {
            let page = this.searchValue.page;
            page.currentPage = val;
            this.$set(this.searchValue, "page", page);
            this.initLoad();
            let request = {
                moduleKey: 'app-list-customer',
                resourceKey: 'app-list-customer-grid',
                settingKey:"pageSize",
                settingValue: page.pageSize
            }
            await setSetting([request])
        },
        handleCheckDisabled({ row }) {
          return row.isEnable
        },
        async handleRowDisabled(row) {
          let tableData = this.tableData
          if (row.isEnable) {
            row.isEnable = false;
            let response = await update(row);
            if (response) {
              this.$message({
                  type: 'success',
                  message: '停用客户成功'
              })
            
              tableData.forEach(item=> {
                if(item.id == row.id) item.isEnable = false
              })
              this.tableData = tableData
            }
          } else {
            row.isEnable = true;
            let response = await update(row);
            if (response) {
              this.$message({
                  type: 'success',
                  message: '启用客户成功'
              })
              tableData.forEach(item=> {
                if(item.id == row.id) item.isEnable = true
              })
              this.tableData = tableData
            }
          }
        },
        handleBatchBtn() {
          let selectRecords = this.$refs.customerListTable.getCheckboxRecords()
          if(!selectRecords.length) {
            this.$baseMessage('请选择客户', 'warning')
            return 
          }
          this.dialogCategoryVisible = true
        },
        handleBatchCategoryChange(v){
          this.changeCategoryCustomerId = v
        },
        async handleBatchCategorySave(){
          let changeCategoryCustomerId = this.changeCategoryCustomerId 
          let selectRecords = this.$refs.customerListTable.getCheckboxRecords()
          if(changeCategoryCustomerId) {
            let list = []
            selectRecords.forEach(item=> {
              list.push({
                id: item.id,
                categoryId: changeCategoryCustomerId
              })
            })
            const res = await changeCustomer(list)

            if(res) {
              this.$message({
                  type: 'success',
                  message: '保存成功'
              })
              this.initLoad();
            }
          }

          this.dialogCategoryVisible = false
        },
        handleAddCustomer(){
          this.dialogAddCardVisible = true
        },
        handleAddOrEditRes(result, type){
          this.dialogAddCardVisible = false
          if(result) {
          }
        },
        selectAllEvent ({ checked, records }) {
          // console.log(checked ? '所有勾选事件' : '所有取消事件', records)
          // this.isCurrentSelected = records
        },
        selectChangeEvent ({ checked, records }) {
          // console.log(checked ? '勾选事件' : '取消事件', records)
          // this.isCurrentSelected = records
        },
        getSelectEvent () {
          let selectRecords = this.$refs.customerListTable.getCheckboxRecords()
          // this.$XModal.alert(selectRecords.length)
        },
        cellClassName({ row, rowIndex, column, columnIndex }) {
          // if (column.property === 'code' || column.property === 'taxNumber') {
          //   return 'cell-class-center'
          // }
        },
    }
}
</script>
<style lang="scss" scoped>
.customerList-container {
  padding: 12px;
  .input-search {
    width: 165px;
    margin-right: 8px;
  }
  .select-tree-search {
    width: 165px;
    margin-right: 8px;
  }
  .operation {
    button {
      border: none;
      font-size: 18px;
      padding: 0;
    }
    .comment {
      margin-left: 10px;
    }
  }
  ::v-deep .vxe-cell {
    line-height: 16px;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 13px;
  }
  .vxe-table ::v-deep .vxe-body--column,
  ::v-deep .vxe-header--column {
    height: 38px;
    padding: 0;
  }

  ::v-deep .vxe-header--column {
    .vxe-cell {
      width: 100%;
      text-align: center;
    }
  }

  .ategoryDialogCss {
    ::v-deep .el-dialog{
      width: 35%;
    }
    ::v-deep .el-dialog__body {
      padding: 30px;
    }
    .el-form-item{
      display: flex;
    }
  }
  .select-tree-search-batch {
      width: 200px;
  }
}
</style>

