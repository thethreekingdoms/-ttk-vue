import request from "@/utils/request";

/**
 * 会计科目
 * @param {*} data 
 */
export function query(data={}) {
  return request({
    url: "/gl/account/query",
    method: "post",
    data,
  });
}
export function deleteSubject(data={}) {
    return request({
      url: "/gl/account/delete",
      method: "post",
      data,
    });
  }
  export function setAccountGrade(data={}) {
    return request({
      url: "/gl/account/setAccountGradeSetting",
      method: "post",
      data,
    });
  }
  export function findFirstUnusedCode(data={}) {
    return request({
      url: "/gl/account/findFirstUnusedCode",
      method: "post",
      data,
    });
  }
  export function checkBeforeDelete(data={}) {
    return request({
      url: "/gl/account/checkBeforeDelete",
      method: "post",
      data,
    });
  }
  export function deleteWithBatch(data={}) {
    return request({
      url: "/gl/account/deleteWithBatch",
      method: "post",
      data,
    });
  }
  export function checkBeforeDeleteWithBatch(data={}) {
    return request({
      url: "/gl/account/checkBeforeDeleteWithBatch",
      method: "post",
      data,
    });
  }
  export function getMaxSizeForBatchInsert(data={}) {
    return request({
      url: "/gl/account/getMaxSizeForBatchInsert",
      method: "post",
      data,
    });
  }
  export function availableDeleteAccounts(data={}) {
    return request({
      url: "/gl/account/queryAvailableAccountsWhenDeleteOneAccount",
      method: "post",
      data,
    });
  }
  export function deleteWithOne(data={}) {
    return request({
      url: "/gl/account/deleteWithOne",
      method: "post",
      data,
    });
  }
  export function createBatchForSubSyncBA(data={}) {
    return request({
      url: "/gl/account/createBatchForSubSyncBA",
      method: "post",
      data,
    });
  }
  export function getSyncBABatch(data={}) {
    return request({
      url: "/gl/account/getSyncBABatch",
      method: "post",
      data,
    });
  }
  //新增科目需要的接口
export function queryUnit(data) {
  return request({
      url: "/ba/unit/queryList",
      method: "post",
      data,
  });
}
export function queryCurrency(data) {
  return request({
      url: "/ba/currency/queryList",
      method: "post",
      data,
  });
}
export function quertSubjects(data) {
  return request({
      url: "/gl/account/query",
      method: "post",
      data,
  });
}
export function getById(data) {
  return request({
      url: "/gl/account/getById",
      method: "post",
      data,
  });
}
export function updateSubject(data) {
  return request({
      url: "/gl/account/update",
      method: "post",
      data,
  });
}
export function isUsedInCertificate(data) {
  return request({
      url: "/gl/account/isUsedInCertificate",
      method: "post",
      data,
  });
}
export function createSubject(data) {
  return request({
      url: "/gl/account/create",
      method: "post",
      data,
  });
}

export function getSyncBA(data) {
  return request({
      url: "/gl/account/getSyncBA",
      method: "post",
      data,
  });
}

export function getAccountGrade(data) {
  return request({
      url: "/gl/account/getAccountGradeSetting",
      method: "post",
      data,
  });
}

export function canModifyAccountType(data) {
  return request({
      url: "/gl/account/canModifyAccountType",
      method: "post",
      data,
  });
}
export function findGradeOneCode(data) {
  return request({
      url: "/gl/account/findGradeOneCode",
      method: "post",
      data,
  });
}
export function afterOperateTargetGlAccount(data) {
  return request({
      url: "/gl/imp/afterOperateTargetGlAccount",
      method: "post",
      data,
  });
}
export function createRevenueAccountForArrival(data) {
  return request({
      url: "/biz/scm/invoice/createRevenueAccountForArrival",
      method: "post",
      data,
  });
}
export function createRevenueAccount(data) {
  return request({
      url: "/biz/scm/invoice/createRevenueAccount",
      method: "post",
      data,
  });
}
export function getSonListByPidList(data) {
  return request({
      url: "/gl/account/getSonListByPidList",
      method: "post",
      data,
  });
}
export function findSonListByPCodeList(data) {
  return request({
      url: "/gl/account/getSonListByPCodeList",
      method: "post",
      data,
  });
}
export function getAccountTypeList(data) {
  return request({
      url: "/gl/account/getAccountTypeList",
      method: "post",
      data,
  });
}
/**
 * 系统预制辅助核算数据
 * @param {*} data 
 * @param {*} title 
 */
export function calcDict(data, title) {
  return request({
      url: `/ba/${title}/queryList`,
      method: "post",
      data,
  });
}
/**
 * 自定义档案列表
 * @param {*} data 
 */
export function userdefinearchive(data) {
  return request({
      url: "/ba/userdefinearchive/queryListDataByCalcName",
      method: "post",
      data,
  });
}