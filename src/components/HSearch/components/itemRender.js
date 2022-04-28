
import datePicker from './datePicker.vue'
import inputRange from './inputRange.vue'
import inputNumberRange from './inputNumberRange.vue'
import select from './select.vue'
import input from './input.vue'
import { InputNumber } from 'element-ui'

const renderComponents = {
  'el-date-picker': datePicker,
  'h-input-range': inputRange,
  'el-select': select,
  'el-input': input,
  'h-inputnumber-range': inputNumberRange
}

export default function (h, ele, $attrs, updateCallback, cacheCallback) {
  const _this = this

  let options = {
    attrs: {
      ...ele.attrs,
      list: ele.list ? $attrs[ele.list] : null
    },
    props: {
      _value: ele._value
    },
    on: {
      change: (v, t) => {
        updateCallback(v, t)
      },
      cache: (t, f) => {
        cacheCallback(t, f)
      }
    },
    nativeOn: {

    },
    directives: [

    ],
  }

  return h(renderComponents[ele.component], options)
}
