import ETable from './e-table.js'

const components = [ETable]

const install = function (Vue) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

/**
 * 基于Element UI 表格组件封装的数据化表格
 * 自定义编辑单元格
 * 自定义下拉筛选 （可获取远程数据显示）
 * 快捷选择数据（支持快捷键ctrl和shift/alt）
 * 保留elementui table原有功能
 */

export default {
  install,
  ETable
}