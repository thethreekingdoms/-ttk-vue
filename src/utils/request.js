import axios from "axios";
import {
  baseURL,
  contentType,
  invalidCode,
  messageDuration,
  noPermissionCode,
  requestTimeout,
  successCode,
  tokenName,
  debounce,
} from "@/config/settings";
import { Loading, Message } from "element-ui";
import store from "@/store";
import qs from "qs";
import router from "@/router";
import _ from "lodash";
import * as env from './environment'

const service = axios.create({
  baseURL,
  timeout: requestTimeout,
  headers: {
    "Content-Type": contentType,
  },
});
let loadingInstance;
service.interceptors.request.use(
  (config) => {
    if (store.getters["user/accessToken"]) {
      config.headers[tokenName] = store.getters["user/accessToken"];
    }
    else if (location.href.indexOf('token') > -1) {
      const accessToken = location.href.substr(location.href.indexOf('token') + 6);
      config.headers[tokenName] = accessToken;
      // alert(config.headers[tokenName])
    }
    /* if (config.data) {
      config.data = _.pickBy(config.data, _.identity);
    } */
    if (process.env.NODE_ENV !== "test") {
      if (contentType === "application/x-www-form-urlencoded;charset=UTF-8") {
        if (config.data && !config.data.param) {
          config.data = qs.stringify(config.data);
        }
      }
    }
    // if(process.env.NODE_ENV === "production") {
    //   config.url = '/v1' + config.url
    // }
    const needLoading = () => {
      let status = false;
      debounce.forEach((item) => {
        if (_.includes(config.url, item)) {
          status = true;
        }
      });
      return status;
    };
    if (needLoading()) {
      loadingInstance = Loading.service();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const errorMsg = (message) => {
  return Message({
    message: message,
    type: "error",
    duration: messageDuration,
  });
};

service.interceptors.response.use(
  (response) => {
    if (loadingInstance) {
      loadingInstance.close();
    }

    const { status, data } = response;
    if (status === 200) {
      return data
    }

    /*    const { status, data, config } = response;
        const { code, msg } = data;
        if (code !== successCode) {
          switch (code) {
            case invalidCode:
              errorMsg(msg || `后端接口${code}异常`);
              store.dispatch("user/resetAccessToken");
              break;
            case noPermissionCode:
              router.push({
                path: "/401",
              });
              break;
            default:
              errorMsg(msg || `后端接口${code}异常`);
              break;
          }
          return Promise.reject(
            "@ttk/vue请求异常拦截:" +
              JSON.stringify({ url: config.url, code, msg }) || "Error"
          );
        } else {
          return data;
        }*/
  },
  (error) => {
    if (loadingInstance) {
      loadingInstance.close();
    }
    /*网络连接过程异常处理*/
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    }
    if (message.includes("timeout")) {
      message = "后端接口请求超时";
    }
    if (message.includes("Request failed with status code")) {
      message = "后端接口" + message.substr(message.length - 3) + "异常";
    }
    errorMsg(message || "后端接口未知异常");
    return Promise.reject(error);
  }
);
export default service;

export function printPost({ url, data }) {
  data = data || {}

  var keys = Object.keys(data)
  var tempWindow

  if (!!data['tempWindow']) {
    tempWindow = data['tempWindow']
  }

  var postForm = document.createElement("form"),
    formatedUrl = formatUrl(url),
    index = 0

  postForm.method = "post"
  postForm.target = "_blank"

  for (var k of keys) {
    if (k == 'tempWindow') {
      continue
    }

    let val = data[k] == null ? false : true
    if (val) {
      var hiddenInput = document.createElement("input")
      hiddenInput.setAttribute("name", k)
      if (typeof data[k] == "object") {
        hiddenInput.setAttribute("value", JSON.stringify(data[k]))
        if (index == 0) {
          formatedUrl = formatedUrl + '?' + k + '=' + JSON.stringify(data[k])
        } else {
          formatedUrl = formatedUrl + '&' + k + '=' + JSON.stringify(data[k])
        }
      } else {
        hiddenInput.setAttribute("value", data[k])
        if (index == 0) {
          formatedUrl = formatedUrl + '?' + k + '=' + data[k]
        } else {
          formatedUrl = formatedUrl + '&' + k + '=' + data[k]
        }
      }
      index++
      postForm.appendChild(hiddenInput)
    }
  }
  let browserType = env.getBrowserVersion()

  //解决容器框打印导出问题
  if (window.ttkclient) {
    window.parent.postMessage({ pdfLoad: true, url: formatedUrl }, '*')
    return
  }
  if (tempWindow != undefined) {
    tempWindow.location.href = formatedUrl
    return
  }

  if (env.isClientMode() && formatedUrl) {
    //client模式下打开，chrome模式.防止token被截取
    window.open(formatedUrl, "_blank")
    return
  }
  // Edge、微信浏览器通过URL传递token等参数
  else if (browserType && (browserType.edge || browserType.wechat)) {
    //解决edge MicrosoftEdge 20.10240.16384.0 版本中弹不出打印页面得问题
    window.open(formatedUrl, "_blank")
    return;
  } else {
    postForm.action = formatUrl(url)
  }

  document.body.appendChild(postForm)
  postForm.submit()
  document.body.removeChild(postForm)
}
export function formPost({ url, data, isFree }) {
  data = data || {}
  var accessToken = store.getters["user/accessToken"]
  if (!!accessToken && !isFree) {
    data.token = accessToken
  }
  var postForm = document.createElement("form"),
    formatedUrl = formatUrl(url),
    index = 0
  postForm.method = "post"
  //IE内核时生效
  // if (isClientMode()) {
  // 	//client模式下打开，防止弹出新窗体
  // 	postForm.target = "_self"
  // }
  // else {
  // 	postForm.target = "_blank"
  // }

  var keys = Object.keys(data)
  var tempWindow

  for (var k of keys) {
    if (k == 'tempWindow') {
      tempWindow = data[k]
      continue
    }
    let val = data[k] == null ? false : true
    if (val) {
      var hiddenInput = document.createElement("input")
      hiddenInput.setAttribute("name", k)
      if (typeof data[k] == "object") {
        hiddenInput.setAttribute("value", JSON.stringify(data[k]))
        if (index == 0) {
          formatedUrl = formatedUrl + '?' + k + '=' + JSON.stringify(data[k])
        } else {
          formatedUrl = formatedUrl + '&' + k + '=' + JSON.stringify(data[k])
        }
      } else {
        hiddenInput.setAttribute("value", data[k])
        if (index == 0) {
          formatedUrl = formatedUrl + '?' + k + '=' + data[k]
        } else {
          formatedUrl = formatedUrl + '&' + k + '=' + data[k]
        }
      }
      index++
      postForm.appendChild(hiddenInput)
    }
  }

  let browserType = env.getBrowserVersion()

  if (env.isClientMode() && formatedUrl) {
    //client模式下打开，chrome模式.防止token被截取
    window.open(formatedUrl, "_self")
    return
  }

  if (window.ttkclient) { //解决容器框打印导出问题
    const cookiearr = document.cookie.split(';') || []
    const isDownload = cookiearr.filter(o => o.includes('__options_type__'))[0] || ''
    const optionType = isDownload.split('=')[1] || 'downloadsth'
    window.parent.postMessage({ [optionType]: true, url: formatedUrl }, '*')
    if (isDownload) clearCookie('__options_type__')
    return
  }

  if (tempWindow != undefined) {
    tempWindow.location.href = formatedUrl
    // 因Edge、IE、Safari、搜狗浏览器会弹出提示是否进行保存，所以Edge、IE、Safari、搜狗浏览器新打开的页签让用户自己去关闭
    if (browserType && !browserType.edge && !browserType.ie && !browserType.safari && !browserType.modesogo) {
      setTimeout(() => {
        tempWindow.close()
      }, 3000)
    }
    return
    // Edge、微信浏览器通过URL传递token等参数
  } else if (browserType && (browserType.edge || browserType.wechat)) {
    postForm.action = formatedUrl
  } else {
    postForm.action = formatUrl(url)
  }

  document.body.appendChild(postForm)
  postForm.submit()
  document.body.removeChild(postForm)
}
function formatUrl(url) {
  return window.location.protocol + '//' + window.location.host + url
}