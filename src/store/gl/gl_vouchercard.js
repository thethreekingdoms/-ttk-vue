/**
 * @copyright ttk team
 * @description 凭证卡片
 */
import Vue from "vue";
import { docInit } from "@/api/gl/gl_vouchercard";
/**
* 财务辅助项显示有顺序要求,
* 后端返回辅助项没有进行排序，只能前端固定上顺序
*/
const orderAux = [
  "isCalcCustomer",
  "isCalcSupplier",
  "isCalcProject",
  "isCalcDepartment",
  "isCalcPerson",
  "isCalcInventory",
  "isExCalc1",
  "isExCalc2",
  "isExCalc3",
  "isExCalc4",
  "isExCalc5",
  "isExCalc6",
  "isExCalc7",
  "isExCalc8",
  "isExCalc9",
  "isExCalc10",
];

/**
 * 存放凭证状态
 */
const state = {
  userName: "",
  avatar: "",
  permissions: [],
  glDocTemplateDtos: [],
  summarys: [],
  glAccounts: [],
  isAuxPopoverShow: false,
  voucherStatus: false
};
/**
 * state的计算属性
 */
const getters = {
  summaryList: state => {
    const list = []
    if (state.glDocTemplateDtos.length) {
      state.glDocTemplateDtos.forEach(o => {
        list.push({
          ...o,
          type: 'template',
          docTemplateName: `${o.docTemplateName} [模板]`
        })
      })
    }
    return list
  },
  isAuxPopoverShow: (state) => state.isAuxPopoverShow,
  voucherStatus: (state) => state.voucherStatus
};

/**
 *  更改state中状态的逻辑，同步操作
 */
const mutations = {
  setDocBaseInfo(state, data) {
    const { currencyDtos, glAccountQueryDto, glDocTemplateDtos, summarys } = data
    if (glAccountQueryDto && glAccountQueryDto.glAccounts) state.glAccounts = glAccountQueryDto.glAccounts
    if (glAccountQueryDto && glAccountQueryDto.calcDict) state.calcDict = glAccountQueryDto.calcDict
    if (glDocTemplateDtos) state.glDocTemplateDtos = glDocTemplateDtos
    if (summarys) state.summarys = summarys
    if (currencyDtos) state.currencyList = currencyDtos
    state.orderAux = orderAux
  },
  setAuxPopoverShow: (state, value) => {
    state.isAuxPopoverShow = value;
  },
  setVoucherStatus(state, val) {
    if (!state.voucherStatus && val) {
      state.voucherStatus = val;
    }
  }
};
/**
 * 提交mutation，异步操作
 */
const actions = {
  setAuxPopoverShow({ commit }, value) {
    commit("setAuxPopoverShow", value);
  },
  setVoucherStatus({ commit }, val) {
    commit("setVoucherStatus", val)
  }
}
export default { state, getters, mutations, actions };
