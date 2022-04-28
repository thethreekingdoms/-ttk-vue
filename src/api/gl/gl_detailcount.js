import request from "@/utils/request";

export function init(data) {
  return request({
    url: "/gl/init",
    method: "post",
    data,
  });
}
//凭证模板-查询
export function commonTemplateQuery(data = {}) {
  return request({
    url: "/gl/commonDoc/query",
    method: "post",
    data,
  });
}

//凭证模板 - saveValueList
export function saveValueList(data) {
  return request({
    url: "/gl/commonDoc/reOrderDocTemplate",
    method: "post",
    data,
  });
}
//凭证模板- 删除
export function commonTemplateDelete(data) {
  return request({
    url: "/gl/commonDoc/delete",
    method: "post",
    data,
  });
}

