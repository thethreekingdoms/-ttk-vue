<template>
  <div :class="shortCutsClass">
    <div class="container">
      <div class="key_container">
        <div class="key_container_left">
          <ul v-for="item in leftData" :key="item.name">
            <li
              v-for="child in item.children"
              :key="child.key"
              :class="[
                child.className,
                active.includes(parseInt(child.code)) ? 'active' : '',
              ]"
            >
              <span>{{ child.name }}</span>
            </li>
          </ul>
        </div>
        <div class="key_container_center">
          <ul v-for="item in centerData" :key="item.name">
            <li
              v-for="child in item.children"
              :key="child.key"
              :class="{
                [child.className]: child.className ? true : false,
                active: active.includes(parseInt(child.code)) ? true : false,
              }"
            >
              <span>{{ child.name }}</span>
            </li>
          </ul>
        </div>
        <div class="key_container_right">
          <ul v-for="item in rightData" :key="item.name">
            <li
              v-for="child in item.children"
              :key="child.key"
              :class="[
                item.className,
                active.includes(parseInt(item.code)) ? 'active' : '',
              ]"
            >
              <span>{{ child.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="short-list">
        <ul>
          <li
            v-for="item in shortCuts"
            :key="item.code"
            @mouseover="selectShortCut(item)"
            :class="{ active: `${item.code}` == selectShort ? true : false }"
          >
            <div class="item_label">
              <span>{{ item.name }}</span>
            </div>
            <div class="item_detail">
              <span>{{ item.detail }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: "ShortKeyComponent",
    props: ["className", "shortCutsProp"],
    data() {
      return {
        selectShort: "",
        active: "",
        leftData: [
          {
            name: "top",
            className: "line_top",
            children: [
              {
                key: "Esc",
                name: "",
                className: "Esc",
                code: "27",
              },
              {
                key: "F1",
                name: "",
                className: "",
                code: "112 ",
              },
              {
                key: "F2",
                name: "F2",
                className: "",
                code: "113",
              },
              {
                key: "F3",
                name: "F3",
                className: "",
                code: "114",
              },
              {
                key: "F4",
                name: "F4",
                className: "",
                code: "115",
              },
              {
                key: "F5",
                name: "",
                className: "",
                code: "116",
              },
              {
                key: "F6",
                name: "",
                className: "",
                code: "117",
              },
              {
                key: "F7",
                name: "F7",
                className: "",
                code: "118",
              },
              {
                key: "F8",
                name: "",
                className: "",
                code: "119",
              },
              {
                key: "F9",
                name: "",
                className: "",
                code: "120",
              },
              {
                key: "F10",
                name: "F10",
                className: "show",
                code: "121",
              },
              {
                key: "F11",
                name: "",
                className: "",
                code: "122",
              },
              {
                key: "F12",
                name: "F12",
                className: "show",
                code: "123",
              },
            ],
          },
          {
            name: "1",
            className: "line_1",
            children: [
              {
                key: "`",
                name: "",
                className: "",
                code: "192",
              },
              {
                key: "1",
                name: "",
                className: "",
                code: "49",
              },
              {
                key: "2",
                name: "",
                className: "",
                code: "50",
              },
              {
                key: "3",
                name: "",
                className: "",
                code: "51",
              },
              {
                key: "4",
                name: "",
                className: "",
                code: "52",
              },
              {
                key: "5",
                name: "",
                className: "",
                code: "53",
              },
              {
                key: "6",
                name: "",
                className: "",
                code: "54",
              },
              {
                key: "7",
                name: "",
                className: "",
                code: "55",
              },
              {
                key: "8",
                name: "",
                className: "",
                code: "56",
              },
              {
                key: "9",
                name: "",
                className: "",
                code: "57",
              },
              {
                key: "0",
                name: "",
                className: "",
                code: "48",
              },
              {
                key: "-",
                name: "",
                className: "",
                code: "189",
              },
              {
                key: "=",
                name: "=",
                className: "show",
                code: "187",
              },
              {
                key: "backspaces",
                name: "",
                className: "backspaces",
                code: "8",
              },
            ],
          },
          {
            name: "2",
            className: "line_2",
            children: [
              {
                key: "Tab",
                name: "",
                className: "Tab",
                code: "9",
              },
              {
                key: "Q",
                name: "",
                className: "",
                code: "81",
              },
              {
                key: "W",
                name: "",
                className: "",
                code: "87",
              },
              {
                key: "E",
                name: "",
                className: "",
                code: "69",
              },
              {
                key: "R",
                name: "",
                className: "",
                code: "82",
              },
              {
                key: "T",
                name: "",
                className: "",
                code: "84",
              },
              {
                key: "Y",
                name: "Y",
                className: "show",
                code: "89",
              },
              {
                key: "U",
                name: "",
                className: "",
                code: "85",
              },
              {
                key: "I",
                name: "",
                className: "",
                code: "73",
              },
              {
                key: "O",
                name: "",
                className: "",
                code: "79",
              },
              {
                key: "P",
                name: "",
                className: "",
                code: "80",
              },
              {
                key: "[",
                name: "[",
                className: "show",
                code: "219",
              },
              {
                key: "]",
                name: "]",
                className: "show",
                code: "221",
              },
              {
                key: "\\",
                name: "",
                className: "\\",
                code: "220",
              },
            ],
          },
          {
            name: "3",
            className: "line_3",
            children: [
              {
                key: "Caps",
                name: "",
                className: "Caps",
                code: "20",
              },
              {
                key: "A",
                name: "",
                className: "",
                code: "65",
              },
              {
                key: "S",
                name: "S",
                className: "show",
                code: "83",
              },
              {
                key: "D",
                name: "",
                className: "",
                code: "68",
              },
              {
                key: "F",
                name: "",
                className: "",
                code: "70",
              },
              {
                key: "G",
                name: "",
                className: "",
                code: "71",
              },
              {
                key: "H",
                name: "",
                className: "",
                code: "72",
              },
              {
                key: "J",
                name: "",
                className: "",
                code: "74",
              },
              {
                key: "K",
                name: "",
                className: "",
                code: "75",
              },
              {
                key: "L",
                name: "",
                className: "",
                code: "76",
              },
              {
                key: ";",
                name: ";",
                className: "show",
                code: "186",
              },
              {
                key: "'",
                name: "",
                className: "",
                code: "222",
              },
              {
                key: "Enter",
                name: "Enter",
                className: "Enter show",
                code: "13",
              },
            ],
          },
          {
            name: "4",
            className: "line_4",
            children: [
              {
                key: "Shift",
                name: "",
                className: "Shift",
                code: "16",
              },
              {
                key: "Z",
                name: "",
                className: "",
                code: "90",
              },
              {
                key: "X",
                name: "",
                className: "",
                code: "88",
              },
              {
                key: "C",
                name: "",
                className: "",
                code: "67",
              },
              {
                key: "V",
                name: "",
                className: "",
                code: "86",
              },
              {
                key: "B",
                name: "",
                className: "",
                code: "66",
              },
              {
                key: "N",
                name: "N",
                className: "show",
                code: "78",
              },
              {
                key: "M",
                name: "M",
                className: "",
                code: "77",
              },
              {
                key: ",",
                name: "",
                className: "",
                code: "188",
              },
              {
                key: ".",
                name: "",
                className: "",
                code: "190",
              },
              {
                key: "/",
                name: "/",
                className: "show",
                code: "191",
              },
              {
                key: "Shift_right",
                name: "Shift",
                className: "Shift",
                code: "16",
              },
            ],
          },
          {
            name: "5",
            className: "line_5",
            children: [
              {
                key: "Ctrl",
                name: "Ctrl",
                className: "Ctrl show",
                code: "17",
              },
              {
                key: "Fn",
                name: "Fn",
                className: "Fn show",
                code: "9999",
              },
              {
                key: "win",
                name: "",
                className: "win",
                code: "91",
              },
              {
                key: "Alt",
                name: "Alt",
                className: "Alt",
                code: "18",
              },
              {
                key: "Space",
                name: "空格",
                className: "Space",
                code: "32",
              },
              {
                key: "Alt_right",
                name: "Alt",
                className: "Alt",
                code: "18",
              },
              {
                key: "Prt",
                name: "",
                className: "Prt",
                code: "",
              },
              {
                key: "win_right",
                name: "",
                className: "win_right",
                code: "91",
              },
              {
                key: "Ctrl_right",
                name: "Ctrl",
                className: "Ctrl_right show",
                code: "17",
              },
            ],
          },
        ],
        centerData: [
          {
            name: "top1",
            className: "center_top1",
            children: [
              {
                key: "PrtSc",
                name: "",
                className: "PrtSc",
                code: "",
              },
              {
                key: "ScrLk",
                name: "",
                className: "ScrLk",
                code: "145",
              },
              {
                key: "Pause",
                name: "",
                className: "Pause",
                code: "19",
              },
            ],
          },
          {
            name: "top2",
            className: "center_top2",
            children: [
              {
                key: "Ins",
                name: "",
                className: "Ins",
                code: "45",
              },
              {
                key: "Home",
                name: "",
                className: "Home",
                code: "36",
              },
              {
                key: "PageUp",
                name: "",
                className: "PageUp",
                code: "33",
              },
            ],
          },
          {
            name: "top3",
            className: "center_top3",
            children: [
              {
                key: "Del",
                name: "Del",
                className: "Del show",
                code: "46",
              },
              {
                key: "End",
                name: "",
                className: "End",
                code: "35",
              },
              {
                key: "PageDn",
                name: "",
                className: "PageDn",
                code: "34",
              },
            ],
          },
          {
            name: "top4",
            className: "center_top4",
            children: [
              {
                key: "↑",
                name: "",
                className: "↑",
                code: "38",
              },
            ],
          },
          {
            name: "top5",
            className: "center_top5",
            children: [
              {
                key: "←",
                name: "←",
                className: "←",
                code: "37",
              },
              {
                key: "↓",
                name: "",
                className: "↓",
                code: "40",
              },
              {
                key: "→",
                name: "→",
                className: "→",
                code: "39",
              },
            ],
          },
        ],
        rightData: [
          {
            name: "right1",
            className: "right_top1",
            children: [
              {
                key: "yuan1",
                name: "o",
                className: "o",
                code: "",
              },
              {
                key: "yuan2",
                name: "o",
                className: "o",
                code: "",
              },
              {
                key: "yuan3",
                name: "o",
                className: "o",
                code: "",
              },
            ],
          },
          {
            name: "right2",
            className: "right_top2",
            children: [
              {
                key: "Num",
                name: "",
                className: "Num",
                code: "144",
              },
              {
                key: "/",
                name: "",
                className: "/",
                code: "111",
              },
              {
                key: "*",
                name: "",
                className: "*",
                code: "106",
              },
              {
                key: "-",
                name: "",
                className: "-",
                code: "109",
              },
            ],
          },
          {
            name: "right3",
            className: "right_top3",
            children: [
              {
                key: "7",
                name: "",
                className: "7",
                code: "36",
              },
              {
                key: "8",
                name: "",
                className: "8",
                code: "38",
              },
              {
                key: "9",
                name: "",
                className: "9",
                code: "33",
              },
              {
                key: "+",
                name: "",
                className: "jia",
                code: "107",
              },
            ],
          },
          {
            name: "right4",
            className: "right_top4",
            children: [
              {
                key: "4",
                name: "←",
                className: "4",
                code: "37",
              },
              {
                key: "5",
                name: "",
                className: "5",
                code: "12",
              },
              {
                key: "6",
                name: "→",
                className: "6",
                code: "39",
              },
            ],
          },
          {
            name: "right5",
            className: "right_top5",
            children: [
              {
                key: "1",
                name: "",
                className: "1",
                code: "35",
              },
              {
                key: "2",
                name: "",
                className: "2",
                code: "40",
              },
              {
                key: "3",
                name: "",
                className: "3",
                code: "",
              },
              {
                key: "Enter",
                name: "Ent",
                className: "Enter show",
                code: "13",
              },
            ],
          },
          {
            name: "right6",
            className: "right_top6",
            children: [
              {
                key: "0",
                name: "",
                className: "right_0",
                code: "45",
              },
              {
                key: ".",
                name: "",
                className: "",
                code: "110",
              },
            ],
          },
        ],
        shortCutsData: [
          {
            code: 1,
            name: "Alt + n",
            keyCode: [18, 78],
            className: "show_style1",
            detail: "新增",
          },
          {
            code: 2,
            name: "Ctrl + s",
            keyCode: [17, 83],
            className: "show_style2",
            detail: "保存",
          },
          {
            code: 3,
            name: "F12",
            keyCode: [123],
            className: "show_style3",
            detail: "保存并新增",
          },
          {
            code: 4,
            name: "Ctrl + y",
            keyCode: [17, 89],
            className: "show_style4",
            detail: "审核/反审核",
          },
          {
            code: 10,
            name: "Ctrl + ;",
            keyCode: [17, 186],
            className: "show_style4",
            detail: "打印",
          },
          {
            code: 6,
            name: "Ctrl + ← ",
            keyCode: [17, 37],
            className: "show_style6",
            detail: "上一张凭证",
          },
          {
            code: 7,
            name: "Ctrl + →",
            keyCode: [17, 39],
            className: "show_style7",
            detail: "下一张凭证",
          },
          {
            code: 8,
            name: "Enter",
            keyCode: [13],
            className: "show_style7",
            detail: "下一个/下一行",
          },
          {
            code: 9,
            name: "=",
            keyCode: [187],
            className: "show_style7",
            detail: "自动平衡借贷方金额",
          },
          {
            code: 1011,
            name: "F10/Fn+F10",
            keyCode: [121, 9999],
            className: "show_style7",
            detail: "新增科目",
          },
          {
            code: 11,
            name: "F7/Fn+F7",
            keyCode: [118, 9999],
            className: "show_style7",
            detail: "插入分录行",
          },
          {
            code: 12,
            name: "F2/Fn+F2",
            keyCode: [113, 9999],
            className: "show_style7",
            detail: "删除分录行",
          },
          {
            code: 13,
            name: "F3/Fn+F3",
            keyCode: [114, 9999],
            className: "show_style7",
            detail: "使用模板",
          },
          {
            code: 14,
            name: "F4/Fn+F4",
            keyCode: [115, 9999],
            className: "show_style7",
            detail: "保存模板",
          },
          {
            code: 15,
            name: "Ctrl + M",
            keyCode: [17, 77],
            className: "show_style7",
            detail: "打开明细账",
          },
        ],
      };
    },
    created() {},
    mounted() {},
    computed: {
      shortCutsClass: function () {
        return {
          shortCuts: true,
          [this.className]: !!this.className,
        };
      },
      shortCuts: function () {
        return this.shortCutsProp ? this.shortCutsProp : this.shortCutsData;
      },
    },
    methods: {
      selectShortCut(item) {
        if (!item.code) {
          return;
        }
        this.selectShort = item.code;
        this.active = item.keyCode;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .shortCuts {
    font-family: "Microsoft Yahei", "Helvetica Neue", Helvetica, Arial,
      sans-serif;
    padding: 4px;
    word-break: normal;
    ul,
    li {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 390px;
      font-size: 40px;
      height: auto;
      overflow: hidden;
      .key_container {
        width: 100%;
        height: auto;
        overflow: hidden;
        background: #fff;
        padding: 0.04em;

        .key_container_left {
          width: 65%;
          float: left;
          ul {
            width: 100%;
            height: 0.4em;
            display: flex;
            margin: 0.05em 0;
            li {
              width: 0.4em;
              height: 0.4em;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 0.05em 0.05em 0;
              border: 1px solid #d9d9d9;
              background: #fff;
              border-radius: 3px;
              span {
                font-size: 15px;
                transform: scale(0.7, 0.7);
              }
            }
            .show {
              background: #ececec;
            }
            .active {
              color: #fff;
              background: $active-color;
            }
            .Esc {
              width: 0.6em;
              margin-right: 0.3em;
            }
            .backspaces {
              width: 0.84em;
            }
            .Tab {
              width: 0.72em;
            }
            .Caps {
              width: 0.82em;
            }
            .Enter {
              width: 0.79em;
            }
            .Shift {
              width: 0.97em;
            }
            .Ctrl {
              width: 0.52em;
            }
            .win {
              width: 0.52em;
            }
            .Alt {
              width: 0.52em;
            }
            .Prt {
              width: 0.5em;
            }
            .Ctrl_right {
              width: 0.54em;
            }
            .Space {
              width: 2.32em;
            }
          }
        }
        .key_container_center {
          width: 16%;
          float: left;
          .center_top4 {
            margin-top: 0.49em;
            text-align: center;
            li {
              margin-left: 0.5em;
            }
          }
          ul {
            width: 100%;
            height: 0.4em;
            display: flex;
            margin: 0.05em 0;
            li {
              width: 0.4em;
              height: 0.4em;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 0.05em 0.05em 0;
              border: 1px solid #d9d9d9;
              background: #fff;
              border-radius: 3px;
              span {
                font-size: 15px;
                transform: scale(0.7, 0.7);
              }
              .show {
                background: #ececec;
              }
            }
            .active {
              background: $active-color;
              span {
                color: #fff;
              }
            }
          }
        }
        .key_container_right {
          width: 19%;
          float: left;
          .right_top1 {
            li {
              background: rgba(0, 0, 0, 0);
              border: none;
            }
          }
          .right_top3 {
            position: relative;
            .jia {
              width: 0.4em;
              height: 0.85em;
              position: absolute;
              right: 0.04em;
            }
          }
          .right_top5 {
            position: relative;
            .Enter {
              width: 0.4em;
              height: 0.85em;
              position: absolute;
              right: 0.04em;
            }
          }
          .right_0 {
            width: 0.9em;
          }
          ul {
            width: 100%;
            height: 0.4em;
            display: flex;
            margin: 0.05em 0;
            li {
              width: 0.4em;
              height: 0.4em;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 0.05em 0.05em 0;
              border: 1px solid #d9d9d9;
              background: #fff;
              border-radius: 3px;
              span {
                font-size: 15px;
                transform: scale(0.7, 0.7);
              }
              .show {
                background: #ececec;
              }
            }
            .active {
              background: $active-color;
              span {
                color: #fff;
              }
            }
          }
        }
      }
      .short-list {
        margin-top: 7px;
        border-top: 1px solid #d9d9d9;
        ul {
          width: 100%;
          height: auto;
          overflow: hidden;
          li {
            width: 100%;
            height: auto;
            overflow: hidden;
            text-indent: 0.2em;
            div {
              width: 50%;
              float: left;
              line-height: 26px;
              display: flex;
              align-items: center;
            }
            span {
              font-size: 13px;
            }
            &.active div {
              color: $active-color;
            }
          }
        }
      }
    }
  }
</style>
