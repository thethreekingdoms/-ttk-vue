<template>
    <div class="customerCard-container">
        <el-form :model="form">

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="编码" >
                        <el-input v-model="form.code" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="名称" >
                        <el-input v-model="form.name" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="客户分类" >
                        <select-tree
                            v-model="form.categoryId"
                            placeholder="选择客户分类"
                            class="select-tree-search-batch"
                            :treeOptions="categorys"
                            :defaultExpandAll="true"
                            :clearable="false"
                        ></select-tree>
                       
                          <!-- selectedValue="未分类"
                            selectedKey="1"
                            @selectTreeChange="handleBatchCategoryChange" -->
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="" >
                      <a href="javascript:;">分类设置</a>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20" class="smallTitle">
                <el-col :span="3">
                    <div>对应科目</div>
                </el-col>
                <el-col :span="21">
                    <div class="lineCss"></div>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="应收科目" >
                        <el-select 
                        v-model="form.receivableAccountId" 
                        :clearable="true" 
                        :filterable="true">
                            <el-option
                                v-for="item in glAccounts"
                                :key="item.id"
                                :label="item.codeAndName"
                                :value="item.id"
                                :class="item.id ? '' : 'addOptionclass'"
                                >
                            </el-option>
                            <div class="addOptionclass">新增</div>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="预收科目" >
                        <el-select 
                        v-model="form.receivableInAdvanceAccountId" 
                        :clearable="true" 
                        :filterable="true">
                            <el-option
                                v-for="item in glAccounts"
                                :key="item.id"
                                :label="item.codeAndName"
                                :value="item.id"
                                :class="item.id ? '' : 'addOptionclass'"
                                >
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="其他应收科目" >
                         <el-select 
                        v-model="form.otherReceivableAccountId" 
                        :clearable="true" 
                        :filterable="true">
                            <el-option
                                v-for="item in glAccounts"
                                :key="item.id"
                                :label="item.codeAndName"
                                :value="item.id"
                                :class="item.id ? '' : 'addOptionclass'"
                                >
                            </el-option>
                            <div class="addOptionclass">新增</div>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                </el-col>
            </el-row>

            <el-row :gutter="20" class="smallTitle">
                <el-col :span="3">
                    <div>基本信息</div>
                </el-col>
                <el-col :span="21">
                    <div class="lineCss"></div>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="税号" >
                        <el-input v-model="form.taxNumber" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系人" >
                        <el-input v-model="form.linkman" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="联系电话" >
                        <el-input v-model="form.contactNumber" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="开户银行" >
                        <el-input v-model="form.openingBank" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

             <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="账号" >
                        <el-input v-model="form.bankAccout" autocomplete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="地址及电话" >
                        <el-input v-model="form.addressAndTel" autocomplete="off" type="textarea" :rows="2"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="备注" >
                        <el-input v-model="form.remark" autocomplete="off" type="textarea" :rows="1"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="停用" >
                        <el-checkbox v-model="form.isEnable"></el-checkbox>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
    </div>
</template>
<script>
import {
account, 
queryAll, 
updateBatchByparamKey, 
queryByparamKeys, 
canGenerateAccount, 
create, 
query,
getCode
} from '@/api/ba/customerList'
export default {
    name: "customerCard",
    props:{
    },
    data(){
        return{
            form:{},
            categorys:[],
            addCardVisible: true,
            glAccounts: []
        }
    },
    created(){
        this.initLoad()
    },
    methods:{
        async initLoad(){
             let response = {}, codeRes, accountRes, category;
            // const linkConfig = this.metaAction.context.get('linkConfig');
            // if (linkConfig) {
            //     this.metaAction.sf('data.linkT',false);
            // }
            // if (this.component.props.personId || this.component.props.personId === 0) {
            //     response = await this.webapi.customer.query(this.component.props.personId)
            // } else {
            //     code = await this.webapi.customer.getCode()
            // }

            codeRes = await getCode({archiveName: "ba_customer"})
            if(codeRes.value) this.$set(this.form, 'code', codeRes.value)

            //获取客户分类
            let requestCats = {
                "baseArchiveType": 3000160001,
            }
            category = await queryAll(requestCats)
            if(category.value) this.categorys = this.getTreeNode(category.value)
         
            //科目
            accountRes = await account()
            if (accountRes.value && accountRes.value.glAccounts) {
                
                let glAccounts = accountRes.value.glAccounts
                // glAccounts.push({id: null, codeAndName: '新增'})
                this.glAccounts = glAccounts
            }

            let noPointStatusQuery= await queryByparamKeys({paramKeys: ["PromptGenerateSpecificAccount4Customer"]})
            this.noPointStatus = noPointStatusQuery.value && noPointStatusQuery.value[0] && noPointStatusQuery.value[0].paramValue

        },
        handleCancel(){
            this.$emit("handleAddOrEditRes", null, 'cancel')
        },
        handleSave(){
            console.log(this.form, '111111')
            this.$emit("handleAddOrEditRes", null, 'save')
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
        handleFilterOption() {
            if (option && option.props && option.props.children) {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            return true
        }
    }
}
</script>   
<style lang="scss" scoped>
.customerCard-container{
    
    .lineCss {
        width: 105%;
        height: 1px;
        border-bottom: 1px dashed #E8E8E8;
        position: relative;
        top: 9px;
    }

    .dialog-footer{
        text-align: right;
        margin-top: 20px;
    }

    ::v-deep .el-form-item {
        display: flex;
        .el-form-item__label{
            width: 100px;
            text-align: right;
            padding-right: 8px;
        }
    }

    ::v-deep .el-dialog__wrapper{
        .el-dialog__body {
            padding: 12px;
        }
    }
    .smallTitle{
        height: 30px;
    }

    // .el-select-dropdown__list{
    //     position: relative;
    //     .addOptionclass{
    //         position: absolute;
    //         bottom: 0px;
    //         left: 0;
    //         right: 0;
    //         background: #409EFF;
    //         color: #fff;
    //         text-align: center;
    //     }
    // }
    
    
}
::v-deep .el-select-dropdown {
    .popper__arrow {
        display: none;
    }
}
.el-scrollbar{

}
    .el-select-dropdown__list{
        // position: relative;
        // padding-bottom: 35px;
       
    }
    ::v-deep .el-select-dropdown__item:last-child{
        margin-bottom: 34px;
    }
     .addOptionclass{
            position: absolute;
            bottom: 0px;
            left: 0;
            right: 0;
            background: #409EFF;
            color: #fff;
            text-align: center;
            height: 34px;
            line-height: 34px;
        }
    
</style>   