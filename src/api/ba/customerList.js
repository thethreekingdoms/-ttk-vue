import request from "@/utils/request";

//列表
export function queryList(data) {
    return request({
        url: "/ba/customer/queryList",
        method: "post",
        data,
    });
}

//客户分类
export function queryAll(data) {
    return request({
        url: "/ba/archCat/queryAll",
        method: "post",
        data,
    });
}

//编辑
export function update(data) {
    return request({
        url: "/ba/customer/update",
        method: "post",
        data,
    });
}

//删除
export function doDelete(data) {
    return request({
        url: "/ba/customer/delete",
        method: "post",
        data,
    });
}

// 分页记忆
export function getSetting(data) {
    return request({
        url: "/edf/org/queryResSetting",
        method: "post",
        data,
    });
}

// 分页记忆
export function setSetting(data) {
    return request({
        url: "/edf/org/modifyAppSetting",
        method: "post",
        data,
    });
}



// 修改客户分类
export function changeCustomer(data) {
    return request({
        url: "/ba/customer/modifyBatchCategory",
        method: "post",
        data,
    });
}


// 新增弹框 获取编码code
// getCode: () => fetch.post('/v1/ba/basearchive/getAutoCode', { archiveName: 'ba_customer' }),
export function getCode(data) {
    return request({
        url: "/ba/basearchive/getAutoCode",
        method: "post",
        data,
    });
}



export function query(data) {
    return request({
        url: "/ba/customer/query",
        method: "post",
        data,
    });
}


export function create(data) {
    return request({
        url: "/ba/customer/create",
        method: "post",
        data,
    });
}


export function canGenerateAccount(data) {
    return request({
        url: "/ba/customer/canGenerateAccount",
        method: "post",
        data,
    });
}

export function queryByparamKeys(data) {
    return request({
        url: "/edf/orgparameter/queryByparamKeys",
        method: "post",
        data,
    });
}

export function updateBatchByparamKey(data) {
    return request({
        url: "/edf/orgparameter/updateBatchByparamKey",
        method: "post",
        data,
    });
}

// 科目
export function account() {
    return request({
        url: "/gl/account/query",
        method: "post",
        data:{isEnable: true, isEndNode: true },
    });
}



