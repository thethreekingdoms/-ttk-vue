<template>
  <div class="money-cell-header">
    <div class="money-cell-header-bottom">
      <span
        v-for="str in moneyList"
        :key="str[0]"
        class="money-cell-header-bc"
        :class="getClass(str[1].className)"
      >
        {{ str[1].str }}
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title_: String,
    },
    data() {
      return {
        moneyList: [],
      };
    },
    methods: {
      getClass(c) {
        return { [c]: true };
      },
      getMoneyStrList() {
        let columnCount = 12, //十亿千百十万千百十元角分
          moneyStrList = new Map(),
          strList = new Map([
            [0, "十"],
            [1, "亿"],
            [2, "千"],
            [3, "百"],
            [4, "十"],
            [5, "万"],
            [6, "千"],
            [7, "百"],
            [8, "十"],
            [9, "元"],
            [10, "角"],
            [11, "分"],
          ]),
          i = columnCount - 1;

        while (i >= 0) {
          let str = strList.get(i);

          if (i == columnCount - 1) {
            moneyStrList = moneyStrList.set(i, {
              str,
              className: "columnLast",
            });
          } else if (i == columnCount - 3) {
            moneyStrList = moneyStrList.set(i, { str, className: "columnRed" });
          } else if (
            i == columnCount - 6 ||
            i == columnCount - 9 ||
            i == columnCount - 12
          ) {
            moneyStrList = moneyStrList.set(i, {
              str,
              className: "columnBlue",
            });
          } else {
            moneyStrList = moneyStrList.set(i, {
              str,
              className: "columnGrey",
            });
          }
          i--;
        }
        return (this.moneyList = moneyStrList);
      },
    },
    created() {
      this.getMoneyStrList();
    },
  };
</script>

<style lang="scss" scoped>
  .money-cell-header-top {
    color: rgb(51, 51, 51);
    font-weight: bold;
    font-size: 13px;
    text-align: center;
    display: block;
  }
  .money-cell-header-bottom {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-around;
    border-top: 1px solid rgb(217, 217, 217);

    .money-cell-header-bc {
      color: rgb(153, 153, 153);
      width: 100%;
      text-align: center;
      height: 100%;
      padding-top: 2px;
    }
    .columnBlue {
      border-right: 1px solid rgb(165, 217, 246);
    }
    .columnGrey {
      border-right: 1px solid rgb(230, 230, 230);
    }
    .columnRed {
      border-right: 1px solid rgb(238, 185, 185);
    }
    .columnLast {
      border-width: initial;
      border-style: none;
      border-color: initial;
      border-image: initial;
    }
  }
</style>
