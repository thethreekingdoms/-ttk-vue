/**
 * @copyright ttk team
 * @description router全局配置，如有必要可分文件抽离，其中asyncRoutes只有在intelligence模式下才会用到
 */

import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "@/layouts";
import EmptyLayout from "@/layouts/EmptyLayout";
import { routerMode } from "@/config/settings";
import edfRoutes from "./edf/index";
import glRoutes from "./gl/index";
import baRoutes from "./ba/index";

Vue.use(VueRouter);

export const asyncRoutes = [
  {
    path: "/",
    component: Layout,
    redirect: "index",
    hidden: true,
    children: [
      {
        path: "index",
        name: "Index",
        component: () => import("@/views/edf/index/index"),
        meta: {
          title: "首页",
          icon: "home",
          affix: true,
        },
      },
    ],
  },
  {
    path: "/voucher",
    component: Layout,
    redirect: "noRedirect",
    meta: { title: "凭证", icon: "users-cog", permissions: ["admin"] },
    children: [
      {
        path: "glVoucherCard",
        name: "glVoucherCard",
        meta: { title: "填制凭证" },
      },
      {
        path: "proofList",
        name: "proofList",
        meta: { title: "凭证列表" },
      },
      // {
      //   path: "proofRecycle",
      //   name: "proofRecycle",
      //   meta: { title: "凭证回收站" },
      // },
    ],
  },
  {
    path: "/personnelManagement",
    component: Layout,
    hidden: true,
    redirect: "noRedirect",
    name: "PersonnelManagement",
    meta: { title: "人员", icon: "users-cog", permissions: ["admin"] },
    children: [
      {
        path: "userManagement",
        name: "UserManagement",
        meta: { title: "用户管理" },
      },
      {
        path: "roleManagement",
        name: "RoleManagement",
        meta: { title: "角色管理" },
      },
      {
        // zq
        path: "projectList",
        name: "ProjectList",
        meta: { title: "项目" },
      },
      {
        // zq
        path: "editProjectList",
        name: "EditProjectList",
        meta: { title: "客户" },
      },
    ],
  },

  {
    path: "/personalCenter",
    component: Layout,
    hidden: true,
    redirect: "personalCenter",
    children: [
      {
        path: "personalCenter",
        name: "PersonalCenter",
        component: () => import("@/views/edf/personalCenter/index"),
        meta: {
          title: "个人中心",
        },
      },
    ],
  },
  {
    path: "/error",
    component: EmptyLayout,
    redirect: "noRedirect",
    name: "Error",
    hidden: true,
    meta: { title: "错误页", icon: "bug" },
    children: [
      {
        path: "401",
        name: "Error401",
        component: () => import("@/views/edf/401"),
        meta: { title: "401" },
      },
      {
        path: "404",
        name: "Error404",
        component: () => import("@/views/edf/404"),
        meta: { title: "404" },
      },
    ],
  },
  {
    path: "*",
    redirect: "/404",
    hidden: true,
  },
];

const router = new VueRouter({
  mode: routerMode,
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: [...edfRoutes, ...baRoutes, ...glRoutes],
});
//注释的地方是允许路由重复点击，如果你觉得框架路由跳转规范太过严格可选择放开
/*const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};*/

export function resetRouter() {
  router.matcher = new VueRouter({
    mode: routerMode,
    scrollBehavior: () => ({
      y: 0,
    }),
    routes: [...edfRoutes, ...baRoutes, ...glRoutes],
  }).matcher;
}

export default router;
