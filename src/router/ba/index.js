import Layout from "@/layouts";
const userManagement = () => import('@/views/ba/personnelManagement/userManagement/index')
const roleManagement = () => import('@/views/ba/personnelManagement/roleManagement/index')
const projectList = () => import('@/views/ba/personnelManagement/projectList/index')
const editProjectList = () => import('@/views/ba/personnelManagement/editProjectList/index')
const customerList = () => import('@/views/ba/customerManagement/customerList/index')
const baRoutes = [
  {
    path: "/personnelManagement",
    component: Layout,
    redirect: "noRedirect",
    name: "PersonnelManagement",
    meta: { title: "人员", icon: "users-cog", permissions: ["admin"] },
    children: [
      {
        path: "userManagement",
        name: "UserManagement",
        component: userManagement,
        meta: { title: "用户管理" },
      },
      {
        path: "roleManagement",
        name: "RoleManagement",
        component: roleManagement,
        meta: { title: "角色管理" },
      },
      { // zq
        path: "projectList",
        name: "ProjectList",
        component: projectList,
        meta: { title: "项目" },
      },
      { // zq
        path: "editProjectList",
        name: "EditProjectList",
        component: editProjectList,
        meta: { title: "客户列表" },
      },
    ],
  },{
    path: "/customerManagement",
    component: Layout,
    redirect: "noRedirect",
    name: "customerManagement",
    meta: { title: "客户"},
    children:[{
      path: "customerList",
      name: "customerList",
      component: customerList,
      meta: { title: "客户" },
    }]
  }]

export default baRoutes;