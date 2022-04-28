import request, { printPost, formPost } from "@/utils/request";

export function docManageInit(data) {
  return request({
    url: "/cw/pzgl/init",
    method: "post",
    data: { "startYear": null, "startPeriod": null, "endYear": null, "endPeriod": null, "page": { "currentPage": 1, "pageSize": 50 }, "userOrderField": null, "order": null },
  });
}
export function docManageQuery(data) {
  return request({
    url: "/cw/pzgl/query",
    method: "post",
    data
  });
}
//凭证审核
export function docManageAudit(data) {
  return request({
    url: "/gl/doc/auditBatch",
    method: "post",
    data
  });
}
export function docManageDel(data) {
  return request({
    url: "/gl/doc/deleteBatch",
    method: "post",
    data
  });
}
export function docManageUnAudit(data) {
  return request({
    url: "/gl/doc/unAuditBatch",
    method: "post",
    data
  });
}
export function delSingleDoc(data) {
  return request({
    url: "/gl/doc/delete",
    method: "post",
    data
  });
}
export function findByParam(data) {
  return request({
    url: "/edf/column/findByParam",
    method: "post",
    data
  });
}
//栏目更新
export function updateColumn(data) {
  return request({
    url: "/edf/column/updateWithDetail",
    method: "post",
    data
  });
}
//栏目重置
export function resetColumn(data) {
  return request({
    url: "/edf/column/reInitByUser",
    method: "post",
    data
  });
}
//整理凭证号
export function reorganizeDocCode(data) {
  return request({
    url: "/cw/pzgl/reorganizeDocCode",
    method: "post",
    data
  });
}
export function docManageExport(data = {}) {
  return formPost({
    url: "/v1/cw/pzgl/export",
    method: "post",
    data
  });
}
export function docManagePrint(data = {}) {
  return printPost({
    url: "/v1/cw/pzgl/print",
    method: "post",
    data
  });
}
export function getPrintConfig(data = {}) {
  return request({
    url: "/cw/pzgl/getPrintConfig",
    method: "post",
    data
  });
}
export function savePrintConfig(data = {}) {
  return request({
    url: "/cw/pzgl/savePrintConfig",
    method: "post",
    data
  });
}
export function updateNote(data = {}) {
  return request({
    url: "/gl/doc/updateNote",
    method: "post",
    data
  });
}
export function redRushDoc(data = {}) {
  return request({
    url: "/cw/pzgl/redRushDoc",
    method: "post",
    data
  });
}
//红冲默认期间
export function getRedRushDocPeriod(data) {
  return request({
    url: "/cw/pzgl/getRedRushDocPeriod",
    method: "post",
    data
  });
}
//复制凭证
export function copyDoc(data) {
  return request({
    url: "/cw/pzgl/copyDoc",
    method: "post",
    data
  });
}
export function getExportConfig(data) {
  return request({
    url: "/cw/pzgl/exportConfig",
    method: "post",
    data
  });
}
export function saveDocConfig(data) {
  return request({
    url: "/cw/pzgl/saveDocConfig",
    method: "post",
    data
  });
}
export function getDocConfig(data) {
  return request({
    url: "/cw/pzgl/getDocConfig",
    method: "post",
    data
  });
}
//检查是否存在断号凭证
export function checkDocCode(data) {
  return request({
    url: "/cw/pzgl/checkDocCode",
    method: "post",
    data
  });
}
export function modifyCreatorInit(data) {
  return request({
    url: "/gl/doc/modifyPageInit",
    method: "post",
    data
  });
}
//批量修改制单人
export function modifyCreator(data) {
  return request({
    url: "/gl/doc/batchUpdate4CreatorByIds",
    method: "post",
    data
  });
}
export function updateCreatorAndEditorByBatch(data) {
  return request({
    url: "/gl/doc/updateCreatorAndEditorByBatch",
    method: "post",
    data
  });
}
//导入模板
export function exportTemplate(data) {
  return formPost({
    url: "/v1/cw/pzgl/exportTemplate",
    method: "post",
    data
  });
}
export function getImportDocFromExcelStatus(data) {
  return request({
    url: "/cw/pzgl/getImportDocFromExcelStatus",
    method: "post",
    data
  });
}
export function importDocFromExcelAsync(data) {
  return request({
    url: "/cw/pzgl/importDocFromExcelAsync",
    method: "post",
    data
  });
}
//保存批量保存列宽
export function updateColumnWidth(data) {
  return request({
    url: "/edf/columnDetail/save",
    method: "post",
    data
  });
}
export function reSetDocCodeWithCustomer(data) {
  return request({
    url: "/cw/pzgl/reSetDocCodeWithCustomer",
    method: "post",
    data
  });
}
export function docRecycleInit(data = {}) {
  return request({
    url: "/cw/pzgl/backup/init",
    method: "post",
    data
  });
}
export function docRecycleQuery(data) {
  return request({
    url: "/cw/pzgl/backup/query",
    method: "post",
    data
  });
}
export function docRecycleBatchDel(data) {
  return request({
    url: "/cw/pzgl/backup/deleteBatch",
    method: "post",
    data
  });
}
export function recoveryDoc(data) {
  return request({
    url: "/cw/pzgl/backup/recoveryDoc",
    method: "post",
    data
  });
}
export function clear(data) {
  return request({
    url: "/cw/pzgl/backup/clear",
    method: "post",
    data
  });
}
//时间轴：获取账套内期初凭证数据的最小和最大期间接口
export function getExistsDataScope(data) {
  return request({
    url: "/gl/doc/getExistsDataScope",
    method: "post",
    data
  });
}


