import Layout from "@/layouts";
const login = () => import('@/views/edf/login/index')
const register = () => import('@/views/edf/register/index')
const sys401 = () => import('@/views/edf/401')
const sys404 = () => import('@/views/edf/404')
// const index = () => import('@/views/edf/index/index')

const edfRoutes = [
  {
    path: "/login",
    component: login,
    hidden: true,
  },
  {
    path: "/register",
    component: register,
    hidden: true,
  },
  {
    path: "/401",
    name: "401",
    component: sys401,
    hidden: true,
  },
  {
    path: "/404",
    name: "404",
    component: sys404,
    hidden: true,
  },
  // {
  //   path: "/",
  //   component: Layout,
  //   redirect: "index",
  //   children: [
  //     {
  //       path: "index",
  //       name: "Index",
  //       component: () => import("@/views/edf/index/index"),
  //       meta: {
  //         title: "首页",
  //         icon: "home",
  //         affix: true,
  //       },
  //     },
  //   ],
  // }

];



export default edfRoutes;
