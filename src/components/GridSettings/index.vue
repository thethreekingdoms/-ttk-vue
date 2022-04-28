<template>
  <el-popover v-bind="$attrs" popper-class="grid-settings">
    <h4>栏目设置</h4>
    <div class="grid-settings-content" :class="{ moreColumns, nomoreColumns: !moreColumns }">
      <div class="grid-settings-items" v-if="!moreColumns">
        <el-checkbox
          v-for="item in list"
          :key="item.id"
          :label="item.caption"
          v-model="item.isVisible"
          :disabled="item.isMustSelect"
        ></el-checkbox>
      </div>
      <div class="grid-settings-items" v-if="moreColumns">
        <span class="grid-settings-items-title">{{ title[0] }}</span>
        <div class="grid-settings-items-content leftcontent">
          <el-checkbox
            v-for="item in list"
            :key="item.id"
            :label="item.caption"
            v-model="item.isVisible"
            :disabled="item.isMustSelect"
            v-show="item.isHeader"
          ></el-checkbox>
        </div>
      </div>
      <div class="grid-settings-items" v-if="moreColumns">
        <span class="grid-settings-items-title">{{ title[1] }}</span>
        <div class="grid-settings-items-content">
          <el-checkbox
            v-for="item in list"
            :key="item.id"
            :label="item.caption"
            v-model="item.isVisible"
            :disabled="item.isMustSelect"
            v-show="!item.isHeader"
          ></el-checkbox>
        </div>
      </div>
    </div>
    <div style="text-align: right; margin: 0">
      <el-button type="primary" size="mini" @click="_ => { handleClick('update') }">确定</el-button>
      <el-button size="mini" @click="_ => { handleClick('reset') }">重置</el-button>
      <el-button size="mini" @click="handleClick">取消</el-button>
    </div>
  </el-popover>
</template>

<script>
export default {
  props: { list: Array },
  data() {
    return {
      visible: false,
      title: [],
      list1: [],
      list2: [],
      // columnsList: this.list
    };
  },
  computed: {
    moreColumns() {
      return this.$attrs.columns == "2";
    },
  },
  methods: {
    handleClick(type) {
      if (type === "reset") {
        this.$emit("setting", type);
      } else if (type === "update") {
        let result = [],
          list = this.list;
        // if (!this.moreColumns) {
        //   list = this.list;
        // } else {
        //   list = this.list1.concat(this.list2);
        // }
        list.forEach((o) => {
          result.push({
            ...o,
          });
        });
        this.$emit("setting", result);
      } else {
        this.$emit("setting");
      }
    },
    init() {
      if (this.moreColumns) {
        this.title = this.$attrs.ctitle.split(",");
        // this.columnsList.forEach((o) => {
        //   if (o[this.$attrs.diff]) {
        //     this.list1.push({ ...o });
        //   } else {
        //     this.list2.push({ ...o });
        //   }
        // });
      }
    },
  },
  created() {
    this.init();
  },
  beforeUpdate() {    
    // this.$attrs.list.forEach((o) => {
    //   if (o[this.$attrs.diff]) {
    //     this.list1.push({ ...o });
    //   } else {
    //     this.list2.push({ ...o });
    //   }
    // });
  },
};
</script>

<style lang="scss">
.grid-settings {
  right: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;

  h4 {
    height: 16px;
    line-height: 16px;
    font-size: 16px;
    color: #333;
    letter-spacing: 0.39px;
    float: left;
  }

  &-content {
    flex: 1;
  }
  .nomoreColumns {
    padding-top: 20px;
    padding-left: 30px;
    overflow: scroll;
  }
  .moreColumns {
    display: flex;
    width: 287px;
    padding-top: 10px;
  }

  &-items {
    display: flex;
    flex-direction: column;

    &-title {
      display: block;
      height: 21px;
      margin: 5px;
      line-height: 21px;
      background: #f5f5f5;
      text-align: center;
      font-size: 13px;
      color: #333;
      letter-spacing: 0.34px;
    }

    &-content {
      margin: 10px 0;
      padding-left: 20px;
      flex: 1;
    }
    .leftcontent {
      border-right: 1px dashed #979797;
    }
    .el-checkbox {
      height: auto;
      line-height: 19px;
      margin-bottom: 14px;
    }
  }
}
</style>
