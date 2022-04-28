/**
 * @copyright ttk team
 * @description 路由守卫，目前两种模式：all模式与intelligence模式
 */
import router from "@/router";
import store from "@/store";
// import VabProgress from "nprogress";
import "nprogress/nprogress.css";
import getPageTitle from "@/utils/pageTitle";
import {
  authentication,
  loginInterception,
  routesWhiteList,
  recordRoute,
} from "./settings";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/utils/accessToken";

// VabProgress.configure({
//   easing: "ease",
//   speed: 500,
//   trickleSpeed: 200,
//   showSpinner: false,
// });


function GetUrlParam(paraName) {
  var url = location.href;
  var arrObj = url.split("?");

  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;

    for (var i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");

      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return "";
  }
  else {
    return "";
  }
}

router.beforeResolve(async (to, from, next) => {
  // if (progressBar) VabProgress.start();
  let hasToken = store.getters["user/accessToken"];
  if (!hasToken || location.href.indexOf('token') > -1) {
    // await store.dispatch("user/accessToken");
    if (location.href.indexOf('token') > -1) {
      // const accessToken = location.href.substr(location.href.indexOf('token') + 6);
      const accessToken = GetUrlParam("token")
      setAccessToken(accessToken)
      hasToken = true
    }
    // await store.dispatch("user/login", accessToken);
  }
  if (!loginInterception) hasToken = true;
  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
      // if (progressBar) VabProgress.done();
    } else {
      const hasPermissions =
        store.getters["user/permissions"] &&
        store.getters["user/permissions"].length > 0;
      if (hasPermissions) {
        next();
      } else {
        try {
          const permissions = await store.dispatch("user/getInfo");
          let accessRoutes = [];
          if (authentication === "intelligence") {
            accessRoutes = await store.dispatch(
              "routes/setRoutes",
              permissions
            );
          } else if (authentication === "all") {
            accessRoutes = await store.dispatch("routes/setAllRoutes");
          }
          router.addRoutes(accessRoutes);
          next({ ...to, replace: true });
        } catch {
          await store.dispatch("user/resetAccessToken");
          // if (progressBar) VabProgress.done();
        }
      }
    }
  } else {
    if (routesWhiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      if (recordRoute) {
        next(`/login?redirect=${to.path}`);
      } else {
        next("/login");
      }

      // if (progressBar) VabProgress.done();
    }
  }
  document.title = getPageTitle(to.meta.title);
});
// router.afterEach(() => {
//   if (progressBar) VabProgress.done();
// });
