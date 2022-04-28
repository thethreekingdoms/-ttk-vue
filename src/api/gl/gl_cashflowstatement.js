import request from "@/utils/request";

/**
 * 初始化期初现金流量
 * @param {*} data 
 */
export function periodBeginInit(data) {
  return request({
    url: "/cw/bb/xjllb/periodBeginInit",
    method: "post",
    data,
  });
}

/**
 * 保存期初现金流量
 * @param {*} data 
 */

export function savePeriodBegin(data) {
  return request({
    url: '/cw/bb/xjllb/savePeriodBegin',
    method: "post",
    data,
  });
}

/**
 * 重置
 * @param {*} data 
 */
export function resetCashFlowPeriodBegin(data) {
  return request({
    url: '/cw/bb/xjllb/resetCashFlowPeriodBegin',
    method: "post",
    data,
  });
}
/**
 * 初使化
 * @param {*} data 
 */

export function init(data) {
  return request({
    url: '/cw/bb/xjllb/init',
    method: "post",
    data,
  });
}
export function updatePeriod(data) {
  return request({
      url: "/edf/org/checkAndUpdateOrgInfo",
      method: "post",
      data
  });
}