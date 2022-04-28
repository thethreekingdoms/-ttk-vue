<template>
  <div class="q-timeline" ref="timeline">
    <div
      class="q-timeline-content"
      v-for="(item, index) in list"
      :key="index"
      :class="getClass(item, index)"
      @click="_ => { handleClick(item, index) }"
    >
      <div class="yearnode" v-if="item.yearnode">
        <span class="yearnode-text">{{ item.yearnode }}</span>
        <span class="line" style="top: 20px;height:25px"></span>
      </div>
      <div class="active" v-if="item.active">{{ item.activeText }}</div>
      <span class="circle" v-if="!item.active"></span>
      <span class="content" v-if="!item.active">{{ item.month }}</span>
      <span class="line"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "timeline",
  props: ["disValue", "timeValue"],
  data() {
    return {
      list: [],
      // disValue: ["2020-01","2020-01"],
      activeIndex: "",
      timePeriod: this.timeValue ? this.timeValue : {},
    };
  },
  watch: {
    disValue: {
      handler(n, o) {
        this.init();

        if (n[0] === n[1] && n[0] != o[0]) {
          this.changeActive(n[0]);
        } else {
          this.changeActive();
        }
        setTimeout(() => {
          this.tposition();
        });
      },
    },
    timeValue: function (newVal, oldVal) {
      this.timePeriod = newVal;
    },
  },
  methods: {
    init() {
      if (!this.disValue) return;
      let initActiveDate =
        this.disValue[0] === this.disValue[1]
          ? this.disValue[0]
          : this.formatNow();
      this.list = this.initList(initActiveDate);
    },
    handleClick(item, i, type) {
      if (item.disabled) return;
      if (this.activeIndex || this.activeIndex == 0) {
        this.$set(this.list[this.activeIndex], "active", false);
        this.$set(this.list[this.activeIndex], "activeText", "");
      }
      this.activeIndex = i;
      this.$set(this.list[i], "active", true);
      this.$set(this.list[i], "activeText", `${item.year}-${item.month}`);
      if (!type) {
        item.active = true;
        this.$emit("timelineClick", item);
      }
      this.tposition();
    },
    formatNow() {
      let now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    },
    initList(now) {
      const all = 60;
      const year = now.split("-")[0];
      const month = now.split("-")[1];
      const result = new Array(all);
      const nowIndex = all / 2 - 1;
      this.activeIndex = nowIndex;
      result[nowIndex] = {
        year,
        month,
        active: true,
        activeText: `${year}-${month}`,
        yearnode: this.isYearNode(month) ? year : undefined,
      };
      let before = nowIndex,
        nDate;
      while (before > 0) {
        before--;
        nDate = this.getYearMonth("prev", result[before + 1]);
        result[before] = nDate;
      }
      let after = nowIndex;
      while (after < all - 1) {
        after++;
        nDate = this.getYearMonth("next", result[after - 1]);
        result[after] = nDate;
      }
      return result;
    },
    getYearMonth(type, afDate) {
      let result = {},
        y,
        m;
      if (type === "prev") {
        y =
          parseInt(afDate.month) - 1 > 0
            ? afDate.year
            : parseInt(afDate.year - 1);
        m = parseInt(afDate.month) - 1 > 0 ? parseInt(afDate.month) - 1 : 12;
      } else if (type === "next") {
        y =
          parseInt(afDate.month) + 1 > 12
            ? parseInt(afDate.year) + 1
            : afDate.year;
        m = parseInt(afDate.month) + 1 > 12 ? 1 : parseInt(afDate.month) + 1;
      }
      result.year = y.toString();
      result.month = m < 10 ? `0${m}` : m.toString();
      result.yearnode = this.isYearNode(m) ? y.toString() : undefined;
      return result;
    },
    isYearNode(y) {
      return parseInt(y) === 1;
    },
    tposition() {
      let lp =
        parseInt(this.activeIndex) * 40 - 200 > 0
          ? parseInt(this.activeIndex) * 40 - 200
          : 0;

      this.$refs.timeline.scrollTop = lp;
    },
    changeActive(d) {
      if (!d) {
        this.$set(this.list[this.activeIndex], "active", false);
        this.$set(this.list[this.activeIndex], "activeText", "");
      } else {
        let index;
        for (let i = 0; i < this.list.length; i++) {
          if (d == `${this.list[i].year}-${this.list[i].month}`) {
            index = i;
            break;
          }
        }
        if (index) {
          this.handleClick(this.list[index], index, "cb");
        }
      }
    },
    getClass(item, index) {
      let { minDataPeriod, maxDataPeriod } = this.timePeriod;
      let disabled;
      let obj = { hasyearnode: item.yearnode };
      if (!minDataPeriod && !maxDataPeriod) {
        disabled = true;
      } else {
        disabled =
          Number(`${item.year}${item.month}`) < Number(minDataPeriod) ||
          Number(`${item.year}${item.month}`) > Number(maxDataPeriod);
      }
      obj.timelineItemDis = disabled;
      this.$set(this.list[index], "disabled", disabled);
      return obj;
    },
  },
  created() {
    // this.init();
  },
  mounted() {
    // this.tposition();
  },
};
</script>

<style lang="scss" scoped>
.q-timeline {
  max-height: 750px;
  overflow: scroll;
  font-size: 13px;
  animation: none 1s ease;
  .timelineItemDis {
    opacity: 0.6;
    .circle {
      border-color: #d9d9d9;
    }
    &:hover {
      cursor: not-allowed;
    }
  }
  &-content {
    position: relative;
    height: 40px;
    cursor: pointer;

    .circle {
      border: 1px solid;
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 50%;
      border-color: rgb(0, 102, 179);
      margin-top: 5px;
      z-index: 11;
    }

    .content {
      padding-left: 20px;
      position: absolute;
    }

    .line {
      position: absolute;
      left: 4px;
      border: 1px dotted #d9d9d9;
      height: 40px;
    }

    .active {
      background-color: #0066b3;
      color: #fff;
      text-align: center;
      border-radius: 13px;
      line-height: 25px;
      z-index: 11;
    }

    .yearnode {
      height: 40px;
      position: relative;
    }
  }

  .hasyearnode {
    height: 80px;
  }
}
</style>