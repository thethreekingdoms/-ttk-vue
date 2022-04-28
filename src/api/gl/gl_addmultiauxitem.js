import request from "@/utils/request";

/**
 * 是否存在辅助核算
 * @param {*} data 
 */
export function isExCalc(data = {}) {
  return request({
    url: "/ba/userdefinearchive/queryListDataByCalcName",
    method: "post",
    data,
  });
}
/**
 * 客户
 * @param {*} data 
 */
export function customer(data = {}) {
  return request({
    url: "/ba/customer/queryList",
    method: "post",
    data,
  });
}
/**
 * 部门
 * @param {} data 
 */

export function department(data = {}) {
  return request({
    url: "/ba/department/queryList",
    method: "post",
    data,
  });
}
/**
 * 员工
 * @param {*} data 
 */

export function person(data = {}) {
  return request({
    url: "/ba/person/queryList",
    method: "post",
    data,
  });
}
/**
 * 存货
 * @param {*} data 
 */
export function inventory(data = {}) {
  return request({
    url: "/ba/inventory/queryList",
    method: "post",
    data,
  });
}
/**
 * 供应商
 * @param {*} data 
 */
export function supplier(data = {}) {
  return request({
    url: "/ba/supplier/queryList",
    method: "post",
    data,
  });
}
/**
 * 项目
 * @param {*} data 
 */
export function project(data = {}) {
  return request({
    url: "/ba/project/queryList",
    method: "post",
    data,
  });
}
/**
 * 币种
 * @param {*} data 
 */
export function currency(data = {}) {
  return request({
    url: "/ba/currency/queryList",
    method: "post",
    data,
  });
}
