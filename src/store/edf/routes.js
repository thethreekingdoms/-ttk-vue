/**
 * @copyright ttk team
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式，其中partialRoutes是菜单暂未使用
 */
import { asyncRoutes } from "@/router";
import edfRoutes from "@/router/edf/index";
import glRoutes from "@/router/gl/index";
import { initPortalData } from "@/api/edf/router";
import { filterAllRoutes, filterAsyncRoutes } from "@/utils/handleRoutes";
import Layout from "@/layouts";
import tree from "@/utils/tree";
import { PATHLIST } from "@/utils/appToPath";
const test = () => import("@/views/edf/test/index");
const state = { routes: [], partialRoutes: [] };
const pathArr = PATHLIST;
const getters = {
  routes: (state) => state.routes,
  partialRoutes: (state) => state.partialRoutes,
};
const mutations = {
  setRoutes(state, { accessedRoutes, user, org }) {    
    state.routes = edfRoutes.concat(accessedRoutes);
    state.user = user;
    state.org = org;
  },
  setAllRoutes(state, routes) {
    state.routes = edfRoutes.concat(routes);
  },
  setPartialRoutes(state, routes) {
    state.partialRoutes = edfRoutes.concat(routes);
  },
  //期初余额里面修改启用期间，改变企业启用期间
  setOrg(state, org){
    state.org = org;
  },
};
const actions = {
  async setRoutes({ commit }, permissions) {
    if (location.href.indexOf('showPortal') > -1 && false) {
      let accessedRoutes = [];
      commit("setRoutes", { accessedRoutes, user: {}, org: {} });
      return [];
    }
    let { value = {}, result } = await initPortalData();
    let { menu = [] } = value;
    let asyncRoutesFromServer = [];
    menu.forEach((m) => (m.key = m.code));
    menu = tree.build(menu, { id: 0 }).children;
    formatMenu(asyncRoutesFromServer, menu.slice(1));
    let accessedRoutes = [];
    let asyncRoutesCopy = asyncRoutes;
    // let asyncRoutesCopy = asyncRoutesFromServer;
    // asyncRoutesCopy = asyncRoutesCopy.concat(asyncRoutesFromServer);
    asyncRoutesCopy.splice(2, 0, ...asyncRoutesFromServer);   
    if (permissions.includes("admin")) {
      accessedRoutes = asyncRoutesCopy;
    } else {
      accessedRoutes = await filterAsyncRoutes(asyncRoutesCopy, permissions);
    }
    commit("setRoutes", { accessedRoutes, user: value.user, org: value.org });
    return accessedRoutes;
  },
  async setAllRoutes({ commit }) {
    let { data } = await initPortalData();
    data.push({ path: "*", redirect: "/404", hidden: true });
    let accessRoutes = filterAllRoutes(data);
    commit("setAllRoutes", accessRoutes);
    return accessRoutes;
  },
  setPartialRoutes({ commit }, accessRoutes) {
    commit("setPartialRoutes", accessRoutes);
    return accessRoutes;
  },
};

// const formatMenu = (routers, data) => {
//   data.forEach((item) => {
//     let menu = {
//       path: !item.appName
//         ? "/test" + item.code
//         : "test" + item.appName + Math.random(),
//       component: !item.appName ? Layout : test,
//       // hidden: true,
//       children: [],
//       name: item.appName ? item.appName : item.name,
//       meta: {
//         title: item.name,
//         // icon: item.iconFont ? item.iconFont : null,
//       },
//     };
//     if (item.children) {
//       formatMenu(menu.children, item.children);
//     }
//     routers.push(menu);
//   });
// };


const formatMenu = (routers, data, type) => {
  data.forEach((item) => {
    const moduleName = type ? type : item.iconFont

    let path = '/test' + item.code
    let currentPath = pathArr.find(el => el.path == item.appName)
    if (currentPath && currentPath.newPath) {
      path = currentPath.newPath
    }
    let menu = {
      path,
      component: !item.appName ? Layout : test,
      children: [],
      name: item.appName ? item.appName : item.name,
      meta: {
        title: item.name,
      },
    };

    if (item.children) {
      formatMenu(menu.children, item.children, moduleName);
    }
    routers.push(menu);
  });
};

// const pathArr = [{
//   name: '凭证',
//   path: 'app-proof-of-list',
//   newPath: '/voucher/proofList'
// }, {
//   name: '客户',
//   path: 'app-list-customer',
//   newPath: '/customerManagement/customerList'
// }]


export default { state, getters, mutations, actions };
