<template>
  <div class="item">
    <el-select
      ref="_value"
      v-bind="$attrs"
      v-model="value"
      placeholder="请选择"
      @change="handleChange"
      filterable
      clearable
    >
      <el-option
        v-for="item in $attrs.list"
        :key="item[$attrs._key]"
        :label="item[$attrs._name]"
        :value="item[$attrs._key]"
      ></el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    _value: String,
  },
  data() {
    return {
      value: null,
    };
  },
  methods: {
    handleChange(e) {
      this.$listeners.change(e, this._value);
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
.el-select {
  display: flex;
  flex: 1;
}
</style>