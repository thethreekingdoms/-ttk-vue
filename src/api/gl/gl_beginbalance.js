import request, { printPost, formPost } from "@/utils/request";

export function init(data) {
    return request({
        url: "/cw/kmqc/init",
        method: "post",
        data
    });
}
export function query(data) {
    return request({
        url: "/cw/kmqc/query",
        method: "post",
        data
    });
}

export function updatePeriod(data) {
    return request({
        url: "/edf/org/checkAndUpdateOrgInfo",
        method: "post",
        data
    });
}

export function clearImportDate(data) {
    return request({
        url: "/cw/kmqc/clearImportDate",
        method: "post",
        data
    });
}

export function exportData(data) {
    return formPost({
        url: "/v1/cw/kmqc/export",
        method: "post",
        data
    });
}


export function updateColumnWidth(data) {
    return request({
        url: "/edf/columnDetail/save",
        method: "post",
        data
    });
}

//设置期初试算平衡提示框下次不在显示接口
export function setNotShowNextTime(data) {
    return request({
        url: "/cw/kmqc/setNotShowNextTime",
        method: "post",
        data
    });
}

export function deleteAuxItem(data) {
    return request({
        url: "/cw/kmqc/delete",
        method: "post",
        data
    });
}
export function deleteDetails(data) {
    return request({
        url: "/cw/kmqc/deleteDetails",
        method: "post",
        data
    });
}
export function createAndUpdateBatch(data) {
    return request({
        url: "cw/kmqc/saveBatch",
        method: "post",
        data
    });
}

//分页
export function getPageSetting(data) {
    return request({
        url: "/edf/org/queryResSetting",
        method: "post",
        data
    });
}

export function setPageSetting(data) {
    return request({
        url: "/edf/org/modifyAppSetting",
        method: "post",
        data
    });
}

