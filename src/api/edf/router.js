import request from "@/utils/request";

export function initPortalData(data = {}) {
  return request({
    url: "/edf/portal/initPortal",
    method: "post",
    data
  });
  // return request({
  //   url: "/menu/navigate",
  //   method: "post",
  //   data,
  // });
}
