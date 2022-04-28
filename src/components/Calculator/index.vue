<template>
  <div class="calculator-container" v-on:keydown="enterCallback">
    <el-button
      icon="el-icon-notebook-2"
      class="calculator-btn"
      @click="handleCalc"
    ></el-button>
    <el-dialog
      title="计算器"
      :visible.sync="dialogVisible"
      width="300px"
      custom-class="calculator-dialog"
      :close-on-click-modal="false"
    >
      <div ref="calculator">
        <div class="result-panel">
          <div class="last-row">
            {{ last.replace(/\*/, "×").replace(/\//, "÷") }}
          </div>
          <div class="cur-row">
            {{ cur.replace(/\*/, "×").replace(/\//, "÷") }}
          </div>
        </div>
        <div class="calculator-buttons" ref="calculatorButtons">
          <div class="button-panel row">
            <div class="s3 column">
              <div class="s1 row">
                <button
                  class="button s1"
                  data-code="67"
                  data-value="c"
                  @click="handleClick"
                >
                  C
                </button>
                <button
                  class="button s1"
                  data-code="8"
                  data-value="back"
                  @click="handleClick"
                >
                  ←
                </button>
                <button
                  class="button s1"
                  data-code="191||111"
                  data-value="/"
                  @click="handleClick"
                >
                  ÷
                </button>
              </div>
              <div class="s1 row">
                <button
                  class="button s1"
                  data-code="55||103"
                  data-value="7"
                  @click="handleClick"
                >
                  7
                </button>
                <button
                  class="button s1"
                  data-code="56||104"
                  data-value="8"
                  @click="handleClick"
                >
                  8
                </button>
                <button
                  class="button s1"
                  data-code="57||105"
                  data-value="9"
                  @click="handleClick"
                >
                  9
                </button>
              </div>
              <div class="s1 row">
                <button
                  class="button s1"
                  data-code="52||100"
                  data-value="4"
                  @click="handleClick"
                >
                  4
                </button>
                <button
                  class="button s1"
                  data-code="53||101"
                  data-value="5"
                  @click="handleClick"
                >
                  5
                </button>
                <button
                  class="button s1"
                  data-code="54||102"
                  data-value="6"
                  @click="handleClick"
                >
                  6
                </button>
              </div>
              <div class="s1 row">
                <button
                  class="button s1"
                  data-code="49||97"
                  data-value="1"
                  @click="handleClick"
                >
                  1
                </button>
                <button
                  class="button s1"
                  data-code="50||98"
                  data-value="2"
                  @click="handleClick"
                >
                  2
                </button>
                <button
                  class="button s1"
                  data-code="51||99"
                  data-value="3"
                  @click="handleClick"
                >
                  3
                </button>
              </div>
              <div class="s1 row">
                <button
                  class="button s2"
                  data-code="48||96"
                  data-value="0"
                  @click="handleClick"
                >
                  0
                </button>
                <button
                  class="button s1"
                  data-code="190||110"
                  data-value="."
                  @click="handleClick"
                >
                  .
                </button>
              </div>
            </div>
            <div class="s1 column">
              <button
                class="button s1"
                data-code="shift+56||106"
                data-value="*"
                @click="handleClick"
              >
                ×
              </button>
              <button
                class="button s1"
                data-code="189||109"
                data-value="-"
                @click="handleClick"
              >
                -
              </button>
              <button
                class="button s1"
                data-code="187||107"
                data-value="+"
                @click="handleClick"
              >
                +
              </button>
              <button
                class="button s2 button-equal"
                data-code="13||108"
                data-value="="
                @click="handleClick"
              >
                =
              </button>
            </div>
          </div>
        </div>
        <!-- <button-panel></button-panel> -->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirm">确定</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: "calculator",
    components: {},
    data() {
      return {
        dialogVisible: false,
        keyMapping: {},
        cur: "0",
        last: "",
      };
    },
    mounted() {},
    methods: {
      handleCalc() {
        this.dialogVisible = true;
        setTimeout(() => {
          let btnDiv = this.$refs["calculatorButtons"].getElementsByTagName(
            "button"
          );
          let btnList = [...btnDiv];
          btnList.forEach((button) => {
            var list = button.dataset.code
              ? button.dataset.code.split("||")
              : [];
            list.forEach((item) => {
              this.keyMapping[item] = button;
            });
          });
        });
      },
      handleClick(event) {       
        let type = event.target.dataset.value;
        let cur;
        let lastLetter;
        switch (type) {
          case "c":
            this.cur = "0";
            this.last = "";
            break;
          case "back":
            this.cur =
              this.cur === "0" ? this.cur : this.cur.slice(0, -1) || "0";

            break;
          case "=":
            try {
              this.last = this.cur + "=";
              this.cur = this.mathRound(eval(this.cur), 2) + "";
            } catch (e) {
              this.last = this.cur + "=";
              this.cur = "NAN";
            }
            break;
          case "+":
          case "-":
          case "*":
          case "/":
            cur = this.cur;
            lastLetter = cur.slice(-1);
            if (
              lastLetter === "+" ||
              lastLetter === "-" ||
              lastLetter === "*" ||
              lastLetter === "/"
            )
              this.cur = cur.slice(0, -1) + type;
            else this.cur = this.cur + type;
            break;
          case ".":
            cur = this.cur;
            lastLetter = cur.slice(-1);
            if (lastLetter !== ".") {
              this.cur = this.cur + type;
            }
            break;
          default:
            this.cur = this.cur === "0" ? type : this.cur + type;
            break;
        }
      },
      enterCallback(event) {
        event.stopPropagation();
        event.preventDefault();        
        var button;
        var key =
          (event.shiftKey ? "shift+" : "") + event.keyCode || event.which;
        if (event.keyCode == 13 || event.keyCode == 108) {
          this.confirm();
        } else {
          if ((button = this.keyMapping[key])) {
            button.click();
          }
        }
      },
      mathRound(num, digit = 2) {
        return parseFloat(num).toFixed(2);
      },
      confirm() {
        if (!this.last) {
          try {
            this.cur = this.mathRound(eval(this.cur), 2) + "";
          } catch (e) {
            this.cur = 0;
          }
        }
        this.$emit("calculator-confirm", this.cur);
        this.dialogVisible = false;
      },
    },
  };
</script>
<style lang="scss">
  .calculator-dialog {
    width: 100%;
    //   height: 365px;
    display: flex;
    flex-direction: column;
    .el-dialog__body {
      padding: 0px;
    }
    .el-dialog__header {
      text-align: left;
      padding: 0 20px 0;
    }
    .dialog-footer {
      margin-right: 10px;
    }
    .result-panel {
      display: flex;
      padding-top: 40px;
      flex: 2;
      flex-direction: column;
      background-color: #e3e7e9;
      text-align: right;
      padding: 0px 10px;
      line-height: 40px;
      height: 85px;
      .last-row {
        flex: 1;
        color: #969ba3;
        font-size: 20px;
        align-items: flex-end;
        display: flex;
        justify-content: flex-end;
        overflow: auto;
        max-width: 100%;
      }
      .cur-row {
        flex: 1;
        color: #46494d;
        font-size: 22px;
        overflow: auto;
        max-width: 100%;
      }
    }

    .button-panel {
      flex: 5;

      .button {
        cursor: pointer;
        position: relative;
        margin: 0;
        padding: 0;
        box-shadow: inset 1px 1px 0 0 #e3e7e9;
        border: none;
        background-color: #fafafa;
        font-size: 30px;
        text-align: center;
        color: #979ca4;
        overflow: hidden;
        height: 50px;
        &:before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #aaa;
          opacity: 0;
        }
        &.clicked:before {
          animation: react-calculator-click 0.5s ease-out 0s 1 alternate
            forwards;
        }
        &.button-equal {
          color: #fff;
          background-color: #fa722e;
        }
        &:focus {
          outline: none;
        }
      }
    }

    .text-center {
      display: flex;
      justify-content: center;
      flex-direction: column;
      text-align: center;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .s1 {
      flex: 1;
    }
    .s2 {
      flex: 2;
    }
    .s3 {
      flex: 3;
    }
    .s4 {
      flex: 4;
    }
    .s5 {
      flex: 5;
    }
    .s6 {
      flex: 6;
    }
    .s7 {
      flex: 7;
    }
    .s8 {
      flex: 8;
    }
    .s9 {
      flex: 9;
    }
    .s10 {
      flex: 10;
    }
    .s11 {
      flex: 11;
    }
    .s12 {
      flex: 12;
    }

    .center {
      display: flex;
      justify-content: center;
      flex-direction: column;
      text-align: center;
    }
  }  
</style>
