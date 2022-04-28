/**
 * @copyright ttk team
 * @description 所有全局配置的状态管理，如无必要请勿修改
 */

import defaultSettings from "@/config/settings";

const { tagsBar, logo, layout, header, showPortal } = defaultSettings;
const theme = JSON.parse(localStorage.getItem("ttk-theme")) || "";
const state = {
  tagsBar: theme.tagsBar || tagsBar,
  logo,
  collapse: false,
  layout: theme.layout || layout,
  header: theme.header || header,
  device: "desktop",
  showPortal
};
const getters = {
  collapse: (state) => state.collapse,
  device: (state) => state.device,
  header: (state) => state.header,
  layout: (state) => state.layout,
  logo: (state) => state.logo,
  tagsBar: (state) => state.tagsBar,
  showPortal: (state) => state.showPortal
};
const mutations = {
  changeLayout: (state, layout) => {
    if (layout) state.layout = layout;
  },
  changeHeader: (state, header) => {
    if (header) state.header = header;
  },
  changeTagsBar: (state, tagsBar) => {
    if (tagsBar) state.tagsBar = tagsBar;
  },
  changeCollapse: (state) => {
    state.collapse = !state.collapse;
  },
  foldSideBar: (state) => {
    state.collapse = true;
  },
  openSideBar: (state) => {
    state.collapse = false;
  },
  toggleDevice: (state, device) => {
    state.device = device;
  },
  changeShowPortal: (state, showPortal) => {
    if (showPortal) state.showPortal = showPortal;
  },
};
const actions = {
  changeLayout({ commit }, layout) {
    commit("changeLayout", layout);
  },
  changeHeader({ commit }, header) {
    commit("changeHeader", header);
  },
  changeTagsBar({ commit }, tagsBar) {
    commit("changeTagsBar", tagsBar);
  },
  changeCollapse({ commit }) {
    commit("changeCollapse");
  },
  foldSideBar({ commit }) {
    commit("foldSideBar");
  },
  openSideBar({ commit }) {
    commit("openSideBar");
  },
  toggleDevice({ commit }, device) {
    commit("toggleDevice", device);
  },
  changeShowPortal({ commit }, showPortal) {
    commit("changeShowPortal", showPortal);
  },
};
export default { state, getters, mutations, actions };
