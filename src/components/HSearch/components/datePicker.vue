<template>
  <div class="item">
    <el-date-picker
      v-model="value"
      v-bind="$attrs"
      class="item-date"
      :clearable="false"
      :picker-options="pickerOptions"
      @change="handleChange"
    ></el-date-picker>
  </div>
</template>

<script>
export default {
  props: ["_value"],
  data() {
    return {
      value: this._value,
      pickerOptions: {
        disabledDate: this.$attrs.disabledDate,
      },
    };
  },
  watch: {
    _value: {
      handler(n, o) {        
        this.value = n;
      },
    },
  },
  methods: {
    handleChange(e) {
      this.$listeners.change(e, this.$attrs.name);
    },
    handleClear() {
      this.value = null;
    },
  },
  mounted() {
    this.$listeners.cache(this._value, this.handleClear);
  },
};
</script>

<style lang="scss" scoped>
.item-date {
  flex: 1;
}
</style>