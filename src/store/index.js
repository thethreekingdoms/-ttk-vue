/**
 * @copyright ttk team
 * @description 导入所有 vuex 模块，自动加入namespaced:true，用于解决vuex命名冲突，请勿修改。
 */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
const edfState = require.context("./edf", false, /\.js$/);
const baState = require.context("./ba", false, /\.js$/);
const glState = require.context("./gl", false, /\.js$/);
const modules = {};

edfState.keys().forEach((key) => {
  modules[key.replace(/(\.\/|\.js)/g, "")] = edfState(key).default;
});

baState.keys().forEach((key) => {
  modules[key.replace(/(\.\/|\.js)/g, "")] = baState(key).default;
});

glState.keys().forEach((key) => {
  modules[key.replace(/(\.\/|\.js)/g, "")] = glState(key).default;
});


Object.keys(modules).forEach((key) => {
  if (modules[key]) {
    modules[key]["namespaced"] = true;
  }
});

// console.log(modules)
const store = new Vuex.Store({
  modules,
});
export default store;
