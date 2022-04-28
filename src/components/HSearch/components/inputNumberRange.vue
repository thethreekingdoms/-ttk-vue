<template>
  <div class="item">
    <el-input-number
      v-model="input1"
      placeholder="请输入内容"
      @change="e => { handleChange(e, 'input1') }"
      :controls="false"
      :precision="2"
    ></el-input-number>
    <span>{{ $attrs.rangeSeparator }}</span>
    <el-input-number
      v-model="input2"
      placeholder="请输入内容"
      @change="e => { handleChange(e, 'input2') }"
      :controls="false"
      :precision="2"
    ></el-input-number>
  </div>
</template>

<script>
export default {
  props: {
    _value: String,
  },
  data() {
    return {
      input1: undefined,
      input2: undefined,
    };
  },
  methods: {
    handleChange(e, type) {
      if(type == 'input1' && typeof this.input2 == 'undefined') {
        this.input2 = this.input1
      }
      if(type == 'input2' && typeof this.input1 == 'undefined') {
        this.input1 = this.input2
      }
      this.$listeners.change([this.input1, this.input2], this._value);
    },
    handleClear() {
      this.input1 = undefined;
      this.input2 = undefined;
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