import request from "@/utils/request";

export function getList(data) {
  return request({
    url: "/ba/project/queryList",
    method: "post",
    data,
  });
}
export function getAutoCode(data) {
  return request({
    url: "/ba/basearchive/getAutoCode",
    method: "post",
    data: { archiveName: "ba_project" },
  });
}
export function create(data) {
  return request({
    url: "/ba/project/create",
    method: "post",
    data
  });
}
export function update(data) {
  return request({
    url: "/ba/project/update",
    method: "post",
    data
  });
}
export function doDelete(data) {
  return request({
    url: "/ba/project/delete",
    method: "post",
    data,
  });
}
