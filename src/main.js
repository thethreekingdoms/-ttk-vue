import './public-path';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import App from "./App";
import store from "./store";
import router from "./router";
import "./plugins";
import "@/styles/common.scss"

// if (process.env.NODE_ENV === "production") {
//   const { mockXHR } = require("../mock/static");
//   mockXHR();
// }
let instance = null
function render(props) {
  instance = new Vue({
    el: "#app2",
    router,
    store,
    render: (h) => h(App),
  });

}
if (!window.__POWERED_BY_QIANKUN__) { // 默认独立运行
  render();
}
export async function bootstrap(props) {
  console.log('starting');
};
export async function mount(props) {
  render(props)
}
export async function unmount(props) {
  instance.$destroy();
  instance = null;
}


Vue.config.productionTip = false;

Vue.directive('numberInt', { bind: function(el, binding, vnode) { 
  const element = el.getElementsByTagName('input')[0] 
  const len = binding.arg  
  element.value = Number(element.value ).toFixed(len)  
  element.addEventListener('blur', function() { 
  if (isNaN(element.value)) {   
    vnode.data.model.callback(0)  
   } else {   
    vnode.data.model.callback(Number(element.value).toFixed(len)) 
   }  
   }) 
 }})