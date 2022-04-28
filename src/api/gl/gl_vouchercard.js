import request, { printPost } from "@/utils/request";

export function docInit(data) {
    return request({
        url: "/gl/doc/init",
        method: "post",
        data,
    });
}
export function docCreate(data) {
    return request({
        url: "/gl/doc/create",
        method: "post",
        data,
    });
}

export function docUpdate(data) {
    return request({
        url: "/gl/doc/update",
        method: "post",
        data,
    });
}

export function docDelete(data) {
    return request({
        url: "/gl/doc/delete",
        method: "post",
        data,
    });
}
//审核
export function docAudit(data) {
    return request({
        url: "/gl/doc/audit",
        method: "post",
        data,
    });
}
//反审核
export function docAntiAudit(data) {
    return request({
        url: "/gl/doc/unAudit",
        method: "post",
        data,
    });
}
export function docPrev(data) {
    return request({
        url: "/gl/doc/previousDoc",
        method: "post",
        data,
    });
}

export function docNext(data) {
    return request({
        url: "/gl/doc/nextDoc",
        method: "post",
        data,
    });
}
export function docFirst(data) {
    return request({
        url: "/gl/doc/firstDoc",
        method: "post",
        data,
    });
}
export function docLast(data) {
    return request({
        url: "/gl/doc/lastDoc",
        method: "post",
        data,
    });
}
export function docPrint(data) {
    return printPost({
        url: "/v1/gl/docManage/print",
        method: "post",
        data,
    });
}
export function docFindById(data) {
    return request({
        url: "/gl/doc/findById",
        method: "post",
        data,
    });
}
export function updateEnclosure(data) {
    return request({
        url: "/gl/doc/updateEnclosure",
        method: "post",
        data,
    });
}
//获取凭证编码
export function getNewCode(data = {}) {
    return request({
        url: "/cw/cypz/getNewCode",
        method: "post",
        data,
    });
}
//存为凭证模板
export function createTemplate(data) {
    return request({
        url: "/cw/cypz/create",
        method: "post",
        data,
    });
}
//更新凭证模板
export function updateTemplate(data) {
    return request({
        url: "/cw/cypz/update",
        method: "post",
        data,
    });
}
/**
 * 设置自动找平
 * @param 
 *  
 */
export function saveDocSetParam(data) {
    return request({
        url: "/gl/doc/saveDocSetParam",
        method: "post",
        data,
    });
}
/**
 * 获取自动找平
 * @param 
 *  
 */
export function getDocSetParam(data = {}) {
    return request({
        url: "/gl/doc/getDocSetParam",
        method: "post",
        data,
    });
}

/**
 * 批量获取科目余额
 * @param 
 *  
 */
export function getAccountsBalance(data) {
    return request({
        url: "/gl/doc/getAccountsBalance",
        method: "post",
        data,
    });
}
/**
 * 
 * @param {获取科目余额} data 
 */
export function getAccountBalance(data) {
    return request({
        url: "/gl/doc/getAccountBalance",
        method: "post",
        data,
    });
}

/**
 * 获取常用凭证模板数据
 * 无参
 *  
 */
export function commonTemplateQuery(data) {
    return request({
        url: "/cw/cypz/query",
        method: "post",
        data
    });
}
/**
 * 删除凭证模板
 * @param {模板id}
 *  
 */
export function commonTemplateDelete(data) {
    return request({
        url: "/cw/cypz/delete",
        method: "post",
        data
    });
}
/**
 * 根据凭证模板id获取凭证详情
 * @param {模板id}
 *  
 */
export function findById(data) {
    return request({
        url: "/cw/cypz/findById",
        method: "post",
        data
    });
}
/**
 * 根据日期查找凭证基础信息（包含摘要模板、汇率、科目信息）
 * @param {日期、是否查找对应的档案}
 * data 
 */
export function docGetAllBaseInfos(data) {
    return request({
        url: "/gl/doc/queryItemInfo",
        method: "post",
        data,
    });
}
/**
 * 
 * @param {批量获取辅助项} data 
 */
export function docGetAllBaseArchives(data) {
    return request({
        url: "/ba/basearchive/queryBaseArchives",
        method: "post",
        data,
    });
}
/**
 * 
 * @param {红冲凭证} data 
 */
export function getRedRushDocPeriod(data) {
    return request({
        url: "/gl/docManage/getRedRushDocPeriod",
        method: "post",
        data,
    });
}
/**
 * 
 * @param {红冲凭证确定} data 
 */
export function redRushDoc(data) {
    return request({
        url: "/gl/docManage/redRushDoc",
        method: "post",
        data,
    });
}
/**
 * 
 * @param {红冲凭证确定} data 
 */
// export function accountAdd(data) {
//     return request({
//         url: "/gl/account/query",
//         method: "post",
//         data,
//     });
// }

/**
 * 获取凭证号
 */
export function getNewDocCode(data) {
    return request({
        url: "/gl/doc/getNewDocCode",
        method: "post",
        data,
    });
}


