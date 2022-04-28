import Layout from "@/layouts";
const glVoucherCard = () => import('@/views/gl/voucher/index2')
const commonTemplate = () => import('@/views/gl/commonTemplate')
const proofList = () => import('@/views/gl/proofList')
const proofRecycle = () => import('@/views/gl/proofRecycle')
const subjectsBeginning = () => import('@/views/gl/subjectsBeginning')
const accountingSubject = () => import('@/views/gl/accountingSubject')
const beginBalance = () => import('@/views/gl/beginBalance')
const addMultiauxItem = () => import('@/views/gl/addMultiauxItem')
const glRoutes = [
  {
    path: "/voucher",
    name: "voucher",
    meta: { title: "凭证" },
    component: Layout,
    redirect: "noRedirect",
    children: [
      {
        path: "glVoucherCard",
        name: "glVoucherCard",
        component: glVoucherCard,
        meta: { title: "填制凭证", closeTips: true }
      },
      {
        path: "commonTemplate",
        name: "commonTemplate",
        component: commonTemplate,
        meta: { title: "凭证模板" }
      },
      {
        path: "proofList",
        name: "proofList",
        component: proofList,
        meta: { title: "凭证列表" }
      },
    ]
  },
  {
    path: "/subjects",
    name: "subjects",
    component: Layout,
    redirect: "noRedirect",
    meta: { title: "科目期初" },
    children: [
      {
        path: "subjectsBeginning",
        name: "subjectsBeginning",
        component: subjectsBeginning,
        meta: { title: "科目期初" },
      },
      {
        path: "accountingSubject",
        name: "accountingSubject",
        component: accountingSubject,
        meta: { title: "会计科目" },
      },
      {
        path: "beginBalance",
        name: "beginBalance",
        component: beginBalance,
        meta: { title: "期初余额" },
      }, {
        path: 'addMultiauxItem',
        name: 'addMultiauxItem',
        component: addMultiauxItem,
        meta: { title: "新增辅助核算明细" },
      }
    ]
  }  
]

export default glRoutes;