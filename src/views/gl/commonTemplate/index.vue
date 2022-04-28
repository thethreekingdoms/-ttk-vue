<template>
  <div class="commonTemplate-container">
    <div class="header">
      <el-input
        placeholder="请输入内容"
        v-model="simpleValue"
        class="input-with-select"
        @change="onSearch"
      >
        <el-button
          @click="onSearch"
          slot="append"
          icon="el-icon-search"
        ></el-button>
      </el-input>
    </div>
    <div class="commonTemplate-container-content">
      <div
        v-for="item in list"
        :key="item.docTemplateCode"
        @click="setSelectedCommon(item)"
      >
        <el-card
          class="card"
          :class="{ 'card-checked': selectedCommon == item.docTemplateId }"
        >
          <div slot="header" class="clearfix">
            <span :title="item.docTemplateCode + item.docTemplateName">
              {{ item.docTemplateCode }} {{ item.docTemplateName }}
            </span>
            <el-button
              @click.stop="deleteTemplate(item)"
              style="float: right; padding: 3px 0;"
              type="text"
            >
              删除
            </el-button>
            <!-- <el-button style="float: right; padding: 3px 0;" type="text"
              >编辑</el-button
            > -->
          </div>
          <div v-for="(o, i) in getList(item)" :key="i" :class="o.className">
            <div>{{ o.children }}</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script>
  import {
    commonTemplateQuery,
    saveValueList,
    commonTemplateDelete,
  } from "@/api/gl/gl_detailcount";
  import Sortable from "./Sortable";
  export default {
    name: "commonTemplate",
    data() {
      return {
        show: true,
        list: [],
        allList: [],
        simpleValue: "",
        selectedCommon: undefined,
      };
    },

    created() {
      this.fetchData();
      this.move();
    },

    mounted() {},
    methods: {
      async fetchData() {
        let { value, result } = await commonTemplateQuery();
        value.map((item, index) => {
          item.showIndex = index;
        });

        this.allList = this.list = value.map((item) => {
          // item.entrys = this.getList(item);
          return item;
        });
      },

      getList(option) {
        /*常用凭证借贷显示，为了防止出现滚动条,  最多显示4条记录，优先截取借，然后才是贷，
		  数据只有一个方向得，另一个要默认带出科目方向，为空即可*/
        let drArrayList = [],
          crArrayList = [],
          result = [];
        if (option && option.entrys)
          option.entrys.map((item) => {
            let myKey = `${item.directionName}`;
            let accountCode = item.accountCode ? item.accountCode : "";
            let accountName = item.accountName ? item.accountName : "";
            if (myKey == "借") {
              if (drArrayList.length == 0) {
                drArrayList.push({
                  tip: true,
                  ellipsis: true,
                  name: "content",
                  title: `借 : ${accountCode} ${accountName}`,
                  component: "::div",
                  className: "content-list",
                  children: `借 : ${accountCode} ${accountName}`,
                });
              } else {
                drArrayList.push({
                  tip: true,
                  ellipsis: true,
                  name: "content",
                  title: `${accountCode} ${accountName}`,
                  component: "::div",
                  className: "content-list-ll",
                  children: `${accountCode} ${accountName}`,
                });
              }
            } else {
              if (crArrayList.length == 0) {
                crArrayList.push({
                  tip: true,
                  ellipsis: true,
                  name: "content",
                  title: `贷 : ${accountCode} ${accountName}`,
                  component: "::div",
                  className: "content-list",
                  children: `贷 : ${accountCode} ${accountName}`,
                });
              } else {
                crArrayList.push({
                  tip: true,
                  ellipsis: true,
                  name: "content",
                  title: `${accountCode} ${accountName}`,
                  component: "::div",
                  className: "content-list-ll",
                  children: `${accountCode} ${accountName}`,
                });
              }
            }
          });
        if (drArrayList.length == 0) {
          drArrayList.push({
            tip: true,
            ellipsis: true,
            name: "content",
            component: "::div",
            className: "content-list",
            children: "借:",
          });
        }
        if (crArrayList.length == 0) {
          crArrayList.push({
            tip: true,
            ellipsis: true,
            name: "content",
            component: "::div",
            className: "content-list",
            children: "贷:",
          });
        }
        if (drArrayList.length > 2) {
          result = [...drArrayList.slice(0, 3), ...crArrayList.slice(0, 1)];
        } else if (crArrayList.length > 2) {
          let length = drArrayList.length;
          result = [
            ...drArrayList.slice(0, length),
            ...crArrayList.slice(0, 4 - length),
          ];
        } else {
          result = [...drArrayList, ...crArrayList];
        }
        return result;
      },
      //绑定move事件
      move() {
        let that = this;
        let common = document.querySelector(
          ".commonTemplate-container-content"
        );
        if (!common)
          return setTimeout(() => {
            this.move();
          }, 0);
        this.sortable = new Sortable(common, {
          animation: 500,
          onEnd: function (evt) {
            that.moveEnd(evt);
          },
        });
      },
      //拖动结束事件
      async moveEnd(evt) {
        let newIndex = evt.newIndex;
        let oldIndex = evt.oldIndex;
        let value = this.list,
          sortOption = [],
          res;

        for (let i = 0; i < value.length; i++) {
          if (value[i].showIndex == oldIndex) {
            value[i].showIndex = newIndex;
            continue;
          }
          if (newIndex < oldIndex) {
            if (
              value[i].showIndex >= newIndex &&
              value[i].showIndex < oldIndex
            ) {
              value[i].showIndex++;
            }
          } else if (newIndex > oldIndex) {
            if (
              value[i].showIndex <= newIndex &&
              value[i].showIndex > oldIndex
            ) {
              value[i].showIndex--;
            }
          }
        }
        // this.list = value
        var sortArr = value.sort(this.compare);
        this.list = sortArr;
        sortArr.filter((item) => {
          sortOption.push({ docTemplateId: item.docTemplateId });
        });
        if (sortOption.length) res = await saveValueList(sortOption);
      },

      onSearch() {
        let list = this.list;
        let alllist = this.allList;
        let value = this.simpleValue;
        let searchLists = [];
        console.log(list, value, alllist);
        if (value != "") {
          for (let index = 0; index < alllist.length; index++) {
            let element = alllist[index];
            if (
              element.docTemplateName.indexOf(value) != -1 ||
              element.docTemplateCode.indexOf(value) != -1
            ) {
              searchLists.push(element);
            }
          }
          this.sortable.option("disabled", true);
        } else {
          searchLists = alllist;
          // this.move()
          this.sortable && this.sortable.option("disabled", false);
        }
        this.list = [...searchLists];
        return searchLists;
      },

      deleteTemplate(template) {
        this.$baseConfirm("确认删除?", null, async () => {
          const { result } = await commonTemplateDelete({
            docTemplateId: template.docTemplateId,
          });
          this.$baseMessage(
            result ? "删除常用凭证成功" : "删除常用凭证失败",
            result ? "success" : "info"
          );
          let templateDataSource = this.list;
          templateDataSource = templateDataSource.filter(
            (item) => item.docTemplateId != template.docTemplateId
          );
          this.list = templateDataSource;
        });
      },
      setSelectedCommon(item) {
        this.selectedCommon = item.docTemplateId;
        this.$emit("select-template", item.docTemplateId);
      },

      showSelectedCommon() {
        if (this.selectedCommon) {
          this.$baseMessage("提交模板：" + this.selectedCommon, "success");
        } else {
          this.$baseMessage("请选择需要使用的模板", "warning");
        }
      },
      compare(obj1, obj2) {
        var val1 = obj1.showIndex;
        var val2 = obj2.showIndex;
        if (val1 > val2) {
          return 1;
        } else if (val1 < val2) {
          return -1;
        } else {
          return 0;
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .commonTemplate-container {
    .header {
      width: 240px;
      margin-left: 20px;
      margin-bottom: 20px;
    }

    &-content {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      flex-wrap: wrap;
      overflow-x: auto;
      max-height: 350px;

      .card {
        width: 210px;
        height: 165px;
        cursor: pointer;
        margin-bottom: 20px;
        margin-left: 20px;
        border-radius: 3px;
        border: 1px solid #d9d9d9;
        box-shadow: 0 0 0 1px #fff;

        .ant-card-head {
          padding: 0px 4px 0px 13px;
          flex: 0 0 37px;
          min-height: 37px;
          border-bottom: 1px solid #d9d9d9;
          background: #f5f5f5;

          .edficon-bianji:before {
            color: #999;
          }

          .edficon-guanbi:before {
            color: #999;
          }

          .ant-card-head-title {
            font-size: 14px;
            color: #252525;
          }

          .ant-card-extra {
            div > span {
              display: inline-block;
            }
          }
        }
        ::v-deep {
          .el-card__body {
            padding: 7px 13px;
            overflow: hidden;

            .content-list,
            .content-list-ll {
              margin-bottom: 0px;
              padding-bottom: 4px;
              font-size: 13px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              color: #515151;
            }

            .content-list-ll {
              margin-left: 22px;
            }
          }
        }
      }
    }
    .card:hover,
    .card.card-checked {
      border: 1px solid $editCell-active-color;
      box-shadow: 0 0 0 1px $editCell-active-color;
    }

    .card.card-checked {
      .ant-card-head-title {
        color: $editCell-active-color;
      }
    }
  }
</style>
