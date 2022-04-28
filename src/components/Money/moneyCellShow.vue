<template>
  <div class="money-cell-show">
    <span
      v-for="(v, i) in getValue"
      :key="i"
      class="money-cell-bc"
      :class="getClass(i)"
    >
      {{ v }}
    </span>
  </div>
</template>

<script>
  export default {
    props: {
      column_: [String, Object],
      row_: [String, Object],
      renderComponent: [String, Boolean],
      list: [Array, Object],
      property: [String],
    },
    data() {
      return {
        value: "",
        isNegative: false,
        propertyProp: this.property,
      };
    },
    methods: {
      init() {
        if (this.column_) {
          this.propertyProp = this.column_.property;
          this.value = this.row_[this.propertyProp];
          this.tableData = this.column_.editRender.props.tableData;
        }
        if (this.list) {
          this.tableData = this.list;
          this.propertyProp = this.property;
          this.value = this.getFooterValue(this.tableData, this.propertyProp);
        }
      },
      getClass(i) {
        let cc = "",
          isNegative = this.getIsNegative;

        if ((i === 0) | (i === 3) || i === 6) {
          cc = "blue";
        } else if (i === 9) {
          cc = "red";
        }
        return { negative: isNegative, [cc]: true };
      },
      getFooterValue(list, property) {
        if (!list || !list.length) return 0;
        let sum = 0;
        list.forEach((o) => {
          if (o[property]) {
            sum += o[property];
          }
        });
        return sum;
      },
    },
    mounted() {
      this.init();
    },
    computed: {
      getValue() {
        let v;
        if (
          isNaN(this.value) ||
          this.value == "" ||
          this.value == "0" ||
          this.value == "0.00" ||
          this.value == undefined
        ) {
          v = "";
        } else {
          v = Math.abs(parseFloat(this.value))
            .toFixed(2)
            .toString()
            .replace(".", "");
        }
        if (Number(v) == 0) {
          v = "";
        }
        v = v.padStart(12, " ");
        return v;
      },
      getIsNegative() {
        if (isNaN(parseFloat(this.value))) return false;

        return parseFloat(this.value) < 0;
      },
    },
    watch: {
      renderComponent: {
        handler(n, o) {
          if (n !== o) {
            this.init();
          }
        },
        deep: true,
      },
      list: {
        handler(n, o) {
          // if (n !== o) {
          this.list = n;
          this.init();
          // }
        },
        deep: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .money-cell-show {
    display: flex;
    justify-content: space-around;
    height: 48px;
    line-height: 48px;
    width: 250px;
  }
  .money-cell-bc {
    border-right: 1px solid rgb(238, 238, 238);
    width: 100%;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
  }
  .blue {
    border-right: 1px solid rgb(122, 188, 255);
  }
  .red {
    border-right: 1px solid rgb(250, 107, 107);
  }
  .negative {
    color: red;
  }
</style>
