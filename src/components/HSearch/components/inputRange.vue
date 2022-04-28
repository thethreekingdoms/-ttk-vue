<template>
  <div class="item">
    <el-input v-model="input1" placeholder="请输入内容" @change="e => { handleChange(e, 'input1') }"></el-input>
    <span>{{ $attrs.rangeSeparator }}</span>
    <el-input v-model="input2" placeholder="请输入内容" @change="e => { handleChange(e, 'input2') }"></el-input>
  </div>
</template>

<script>
export default {
  props: {
    _value: String,
  },
  data() {
    return {
      input1: null,
      input2: null,
    };
  },
  methods: {
    handleChange(e, type) {
      this.$listeners.change([this.input1, this.input2], this._value);
    },
    handleClear() {
      this.input1 = null;
      this.input2 = null;
    },
  },
  mounted() {
    this.$listeners.cache(this._value, this.handleClear);
  },
};
</script>

<style lang="scss" scoped>
.el-input {
  flex: 1;
}
</style>