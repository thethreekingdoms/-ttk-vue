
<template>
  <div class="item">
    <el-input v-model="value" placeholder="请输入内容" @change="handleChange"></el-input>
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
</style>