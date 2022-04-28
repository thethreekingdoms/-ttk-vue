import Vue from 'vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import VXETablePluginShortcutKey from 'vxe-table-plugin-shortcut-key'
import 'vxe-table/lib/style.css'
// 将全局模态窗口挂载到 vue 实例中

import MoneyCellShow from "@/components/Money/moneyCellShow.vue";
import MoneyCellEdit from "@/components/Money/moneyCellEdit.vue";
// import SubjectShow from "@/components/Money/subjectShow.vue";
// import SubjectEdit from "@/components/Money/subjectEdit.vue";
// import SummaryEdit from "@/components/Money/summaryEdit.vue";
// import { stringify } from 'qs'

/**
 * 复用渲染器 
 */

//摘要
// VXETable.renderer.add('SummaryDisplay', {
//   renderEdit(h, editRender, { row, rowIndex, column }) {
//     return [<SummaryEdit row_={row} rowIndex_={rowIndex} column_={column}></SummaryEdit>]
//   }
// })
//科目
// VXETable.renderer.add('SubjectDisplay', {
//   //可编辑激活模板
//   renderEdit(h, editRender, { row, rowIndex, column }) {
//     return [<SubjectEdit row_={row} rowIndex_={rowIndex} column_={column}></SubjectEdit>]
//   },
//   //可编辑显示模板
//   renderCell(h, editRender, { row, rowIndex, column }) {    
//     return [<SubjectShow row_={row} rowIndex_={rowIndex} column_={column}></SubjectShow>]
//     // if (column.editRender.props.renderComponent) {
//     //   return [<SubjectShow row_={row} rowIndex_={rowIndex} column_={column} renderComponent={column.editRender.props.renderComponent}></SubjectShow>]
//     // } else {
//     //   return [<div></div>]
//     // }
//   }
// })

//金额
VXETable.renderer.add('MoneyCell', {
  renderEdit(h, editRender, { row, rowIndex, column }) {
    return [<MoneyCellEdit row_={row} rowIndex_={rowIndex} column_={column}></MoneyCellEdit>]
  },  
  renderCell(h, editRender, { row, rowIndex, column }) {
    return [<MoneyCellShow row_={row} column_={column} renderComponent={column.editRender.props.renderComponent}></MoneyCellShow>]
  },
  // renderDefault(h, editRender, { row, rowIndex, column }) {
  //   return [<MoneyCellShow row_={row} column_={column} renderComponent={column.editRender.props.renderComponent}></MoneyCellShow>]
  // }
})
VXETable.use(VXETablePluginShortcutKey, {
  // 快捷键监听
  // listener: {
  //   'ArrowUp'(params, evnt) {
  //     moveEditCell(params.$table, 'up')
  //   },
  //   'ArrowDown'(params, evnt) {
  //     moveEditCell(params.$table, 'down')
  //   },
  //   'ArrowRight'(params, evnt) {
  //     moveEditCell(params.$table, 'right')
  //   },
  //   'ArrowLeft'(params, evnt) {
  //     moveEditCell(params.$table, 'left')
  //   },
  //   'Enter'(params, evnt) {
  //     moveEditCell(params.$table, 'right')
  //   },
  //   'Shift + Enter'(params, evnt) {
  //     console.log('Shift + Enter')
  //   }
  // },
  setting: {
    'table.edit.leftTabMove': 'Shift + Enter',
    'table.edit.rightTabMove': 'Enter', // 将 Tab 键的按键值修改为回车键
    // 'table.cell.upMove': 'ArrowUp',
    // 'table.cell.downMove': 'ArrowDown',
    // 'table.cell.leftMove': 'ArrowLeft',
    // 'table.cell.rightMove': 'ArrowRight',
  }
})

Vue.use(VXETable)
Vue.prototype.$XModal = VXETable.modal
/**
    * 设置焦点移动
    */
function moveEditCell(table, action) {
  const { columnIndex, rowIndex } = table.getActiveRecord(),
    totalCols = table.getColumns(),
    rows = table.afterFullData
  const cols = table.getColumns().filter(x => x.className != 'cls-insert-remove' && x.className != 'cls-up-down')
  const cellInfo = {
    x: columnIndex,
    y: rowIndex,
    colCount: totalCols.length,
    rowCount: rows.length,
  }
  const position = move(cellInfo.rowCount, cellInfo.colCount, { x: cellInfo.x, y: cellInfo.y }, action)
  if (position.x === cellInfo.x && position.y === cellInfo.y) {
    return
  }
  const x = position.x
  const y = position.y
  const colName = totalCols[position.x].property
  const row = rows[y]
  table.setActiveCell(row, colName)
}

function move(rowCount, colCount, currentPosition, action) {
  if (action == 'right')
    currentPosition.x += 1
  else if (action == 'left')
    currentPosition.x -= 1
  else if (action == 'up')
    currentPosition.y -= 1
  else if (action == 'down')
    currentPosition.y += 1

  if (currentPosition.x > colCount - 1) {
    if (currentPosition.y == rowCount - 1) {
      return { x: colCount - 1, y: rowCount - 1 }
    }
    else {
      return { x: 0, y: currentPosition.y + 1 }
    }
  }
  else if (currentPosition.x < 0) {
    if (currentPosition.y == 0) {
      return { x: 0, y: 0 }
    }
    else {
      return { x: colCount - 1, y: currentPosition.y - 1 }
    }
  }
  else {
    if (currentPosition.y < 0) {
      return { x: currentPosition.x, y: 0 }
    }
    else if (currentPosition.y > rowCount - 1) {
      return { x: currentPosition.x, y: rowCount - 1 }
    }
    else {
      return currentPosition
    }
  }
}



