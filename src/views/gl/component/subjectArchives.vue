<template>
  <div class="subjectArchives">
    <div class="info">
      <span>
        新增辅助核算项目后，涉及该科目的期初数据、历史凭证均会结转到以下指定的核算项目，此操作不可恢复，请谨慎修改！
      </span>
    </div>
    <div class="content">
      <el-form
        ref="form"
        :model="form"
        label-width="90px"
        class="subjectCodeSet-form"
        :rules="rules"
      >
        <el-form-item
          v-for="item in calcArr"
          :label="item.title"
          :key="item.title"
          :prop="item.name"
          :rules="{
            required: true,
            message: `${item.title.replace('：', '')}不能为空!`,
            trigger: ['blur', 'change'],
          }"
        >
          <el-select
            @focus="(e) => handleFocus(e, item.name)"
            v-model="form[item.name]"
          >
            <el-option
              v-for="option in list[item.name]"
              class="infinite-list-item"
              :key="option.id"
              :label="option.name"
              :value="option.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="tips">此操作不能恢复，是否继续？</div>
    <div class="footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancelForm">取消</el-button>
    </div>
  </div>
</template>
<script>
import { calcDict, userdefinearchive } from "@/api/gl/gl_accountingSubject";
export default {
  name: "subjectArchives",
  props: ["subjectArchivesProps"],
  data() {
    return {
      value: this.subjectArchivesProps.newCalc,
      calcDict: this.subjectArchivesProps.calcDict,
      calcArr: [],
      form: {},
      list: [],
      rules: {}
    };
  },
  created() {
    let list = [
        "isCalcCustomer",
        "isCalcSupplier",
        "isCalcProject",
        "isCalcDepartment",
        "isCalcPerson",
        "isCalcInventory",
        "isExCalc1",
        "isExCalc2",
        "isExCalc3",
        "isExCalc4",
        "isExCalc5",
        "isExCalc6",
        "isExCalc7",
        "isExCalc8",
        "isExCalc9",
        "isExCalc10",
      ],
      calcDict = this.calcDict,
      // selectValue = this.metaAction.gf('data.selectValue').toJS(),
      // error = this.metaAction.gf('data.error').toJS(),
      newData = [],
      name,
      title;
    for (let i in list) {
      if (this.value.indexOf(list[i]) != -1) {
        newData.push({ name: list[i], title: calcDict[list[i]] });
      }
    }
    this.calcArr = newData;
  },
  methods: {
    submitForm() {
      this.$refs["form"].validate(async (valid) => {
        if(valid){
          let { form, value, calcDict } = this,
            warning = [],
            result = {},
            name = '',
            title = '',
            pathList = []
        for (let i = 0; i < value.length; i++) {
            title = value[i]
            if (!form[title]) {
                // pathList.push({
                //     path: 'data.error.' + title,
                //     title: calcDict[title]
                // })
            } else {
                if (title.indexOf('isCalc') != -1) {
                    name = title.slice(6).toLowerCase() + 'Id'
                } else {
                    name = 'e' + title.slice(3)
                }
                result[name] = form[title]
            }
        }
        console.log(result)
        this.$emit("subjectArchives-set", result)
        }else{
          this.$baseMessage("请按页面提示信息修改信息后才可提交", "error");
          return
        }
      })
    },
    cancelForm() {
      this.$emit("subjectArchives-set")
    },
    async handleFocus(e, title) {
      if (typeof title == "string" && title.constructor == String) {
        const list = this.list;
        //判断是否为预制辅助核算
        if (title.indexOf("isCalc") != -1) {
          let name = title.slice(6).toLowerCase();
          const response = await calcDict("", name);
          this.$set(this.list, [title], response.value.list);
        } else {
          const response = await userdefinearchive({
            entity: { calcName: title },
          });
          this.$set(this.list, [title], response.value.list);
        }
      }
    },
  },
};
</script>
<style lang="scss">
.subjectArchives {
  .info {
    padding: 8px 16px;
    margin-bottom: 20px;
    border: 1px solid #91d5ff;
    background-color: #e6f7ff;
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.65);
    span {
      color: #ff0000;
    }
  }
  .tips {
    padding: 16px 16px 0;
    color: #ff0000;
    font-weight: bold;
  }
  .footer {
    text-align: right;
    margin-top: 10px;
  }
}
</style>