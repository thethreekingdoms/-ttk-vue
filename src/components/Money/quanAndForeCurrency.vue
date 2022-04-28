<template>
  <div @keydown.enter="handlerEnter">
    <el-form
      :model="quantityAndForeignCurrency"
      label-width="50px"
      class="qafc-dispaly-show"
      ref="form"
    >
      <el-form-item
        label="币种:"
        v-if="currentAccount.isCalcMulti"
        id="currency"
      >
        <el-select
          v-model="quantityAndForeignCurrency.currency"
          value-key="id"
          id="el-select"
          @focus="onCurrencyChange('focus')"
          @change="onCurrencyChange()"
          ref="currency"
          filterable
        >
          <el-option
            v-for="item in currencyList"
            class="infinite-list-item"
            :key="item.id"
            :label="item.name"
            :value="item"
            :disabled="item.disabled"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数量:" v-if="currentAccount.isCalcQuantity">
        <el-input
          v-model.trim="quantityAndForeignCurrency.quantity"
          max="9999999999.99"
          ref="quantity"
          @input="changeModalVerific('quantity', 6)"
          @focus="onQuantity('focus')"
          @blur="onQuantity()"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="单价:" v-if="currentAccount.isCalcQuantity">
        <el-input
          v-model.trim="quantityAndForeignCurrency.price"
          min="0"
          max="9999999999.99"
          ref="price"
          @input="changeModalVerific('price', 6)"
          @focus="onPrice('focus')"
          @blur="onPrice()"
          clearable
        ></el-input>
        <span class="qafc-form-rmb">
          {{
            this.quantityAndForeignCurrency.currency
              ? this.quantityAndForeignCurrency.currency.name
              : ""
          }}
        </span>
      </el-form-item>
      <el-form-item label="外币:" v-if="currentAccount.isCalcMulti">
        <el-input
          v-model.trim="quantityAndForeignCurrency.origAmount"
          max="9999999999.99"
          ref="origAmount"
          @input="changeModalVerific('origAmount', 2)"
          @focus="onOrigAmount('focus')"
          @blur="onOrigAmount()"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="汇率:" v-if="currentAccount.isCalcMulti">
        <el-input
          v-model.trim="quantityAndForeignCurrency.exchangeRate"
          min="0"
          max="9999999999.99"
          ref="exchangeRate"
          :disabled="quantityAndForeignCurrency.currency.isBaseCurrency"
          @input="changeModalVerific('exchangeRate', 6)"
          @focus="onExchangeRate('focus')"
          @blur="onExchangeRate()"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="currentAccount.isCalcMulti ? '本币:' : '金额:'"
        v-if="currentAccount.isCalcQuantity || currentAccount.isCalcMulti"
      >
        <el-input
          v-model.trim="quantityAndForeignCurrency.amount"
          ref="amount"
          @input="changeModalVerific('amount', 2)"
          @focus="onAmount('focus')"
          @blur="onAmount()"
          clearable
        ></el-input>
      </el-form-item>
      <div class="qafc-footer-btn">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit" ref="save">确定</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  import XEUtils from "xe-utils/methods/xe-utils";
  import { mapState } from "vuex";
  export default {
    props: {
      currentAccount: {
        type: Object,
        default: function () {
          return {
            isCalcMulti: false,
            isCalcQuantity: false,
            unitName: "",
          };
        },
      },
      isReverseForeignCurrency: Boolean,
      rowIndex: Number,
      isqfcPopver: Boolean,
      quantityAndForeignCurrency: {
        type: Object,
        default: function () {
          return {
            currency: {},
            quantity: 0,
            price: 0,
            exchangeRate: 0,
            origAmount: 0,
            amount: 0,
          };
        },
      },
      amount: [String, Number],
    },
    data() {
      return {
        //金额小数位
        aPrecision: 2,
        //数量单价小数位
        qpPrecision: 6,
        orderFocusList: [
          "currency",
          "quantity",
          "price",
          "origAmount",
          "exchangeRate",
          "amount",
          "save",
        ], //按照此顺序进行焦点控制
        amount_: 0,
        isPopverShow: false,
      };
    },
    created() {
      this.init();
    },
    mounted() {
      this.init();
    },
    /**
     * 计算属性
     */
    computed: {
      ...mapState({
        currencyList: (state) => state.gl_vouchercard.currencyList,
      }),
    },
    watch: {
      isqfcPopver(newValue, oldValue) {
        // watch监听props里status的变化，然后执行操作
        if (newValue && !oldValue && !this.isPopverShow) {          
          this.init();
          if (this.currentAccount && this.currentAccount.code) {
            this.setFocusEle(this.orderFocusList[0]);            
          }
        }
      },
      amount(newValue, oldValue) {
        newValue = XEUtils.toNumber(newValue || 0);
        oldValue = XEUtils.toNumber(oldValue || 0);
        if (newValue != oldValue) {
          this.onAmount();
        }
      },
    },
    methods: {
      /**
       * 初始化
       */
      init() {
        const account = this.currentAccount;
        let _focusList = [];
        if (account && account.code) {
          if (account.isCalcMulti && !account.isCalcQuantity) {
            _focusList = [
              "currency",
              "origAmount",
              "exchangeRate",
              "amount",
              "save",
            ];
          } else if (!account.isCalcMulti && account.isCalcQuantity) {
            _focusList = ["quantity", "price", "amount", "save"];
          } else {
            _focusList = [
              "currency",
              "quantity",
              "price",
              "origAmount",
              "exchangeRate",
              "amount",
              "save",
            ];
          }
          this.orderFocusList = _focusList;
        }
        const amount = this.quantityAndForeignCurrency.amount,
          origAmount = this.quantityAndForeignCurrency.origAmount;
        this.quantityAndForeignCurrency.amount = amount == 0 ? "" : amount;
        this.quantityAndForeignCurrency.origAmount =
          origAmount == 0 ? "" : origAmount;
        this.isPopverShow = this.isqfcPopver;
      },

      /**
       * 确定
       */
      onSubmit() {
        let error = this.checkQuantityAndCurrency();
        if (error) {
          this.$baseMessage(error, "error");
          return;
        }
        this.$emit(
          "handle-qfc-submit",
          this.quantityAndForeignCurrency,
          this.rowIndex,
          "submit"
        );
        this.isPopverShow = false;
      },

      /**
       * 取消
       */
      onCancel() {
        this.$emit("handle-qfc-submit", null, this.rowIndex, "cancel");
        this.isPopverShow = false;
      },

      /**
       * 校验界面录入
       */
      changeModalVerific(type, precision = 2) {
        this.$nextTick(() => {
          const indexChar = this.quantityAndForeignCurrency[type].charAt(0);
          // 先把非数字的都替换掉(空)，除了数字和.-
          this.quantityAndForeignCurrency[
            type
          ] = this.quantityAndForeignCurrency[type].replace(/[^\d.-]/g, "");
          // 必须保证第一个为数字或者是-而不是.
          this.quantityAndForeignCurrency[
            type
          ] = this.quantityAndForeignCurrency[type].replace(/^\./g, "");
          // 保证只有出现一个.而没有多个.
          this.quantityAndForeignCurrency[
            type
          ] = this.quantityAndForeignCurrency[type].replace(/\.{3,}/g, "");
          // 保证只有出现一个-而没有多个-
          this.quantityAndForeignCurrency[
            type
          ] = this.quantityAndForeignCurrency[type].replace(/\-/g, "");

          // 保证.只出现一次，而不能出现两次以上
          this.quantityAndForeignCurrency[
            type
          ] = this.quantityAndForeignCurrency[type]
            .replace(".", "$#$")
            .replace(/\./g, "")
            .replace("$#$", ".");
          // 限制几位小数
          let subscript = -1;
          for (let i in this.quantityAndForeignCurrency[type]) {
            if (this.quantityAndForeignCurrency[type][i] === ".") {
              subscript = i;
            }
            if (subscript !== -1) {
              if (i - subscript > precision) {
                this.quantityAndForeignCurrency[
                  type
                ] = this.quantityAndForeignCurrency[type].substring(
                  0,
                  this.quantityAndForeignCurrency[type].length - 1
                );
              }
            }
          }
          //如果第一位是负号，则允许添加
          if (indexChar == "-") {
            this.quantityAndForeignCurrency[type] =
              "-" + this.quantityAndForeignCurrency[type];
          }
        });
      },

      /**
       * 1、币种切换
       */
      onCurrencyChange(opkey = "change", value) {
        if (opkey == "focus") {
          this.setFocusEle("currency");
        } else {
          const {
            currency,
            quantity,
            price,
            origAmount,
          } = this.quantityAndForeignCurrency;
          //修改币种: 获取汇率 -> 本币金额=原币金额*汇率
          const exchangeRate = this.quantityAndForeignCurrency.currency
            .exchangeRate;

          //汇率不一致才进行计算
          if (exchangeRate != this.quantityAndForeignCurrency.exchangeRate) {
            if (currency.isBaseCurrency) {
              this.quantityAndForeignCurrency["exchangeRate"] = 1;
            } else {
              this.quantityAndForeignCurrency[
                "exchangeRate"
              ] = this.toFixedLocal(exchangeRate, this.qpPrecision);
            }
            this.onExchangeRate();
          }
        }
      },

      /**
       * 2、数量失去焦点处理
       */
      onQuantity(opkey = "blur") {
        if (opkey == "focus") {
          this.setFocusEle("quantity");
        } else {
          //修改数量:
          //  单价不为空（或0）时，计算：外币 = 数量 * 单价
          //  单价为空（或0）时，计算：单价 = 外币 ÷ 数量
          //  如果数量*单价为0，则不更新借方或贷方金额
          //  本币金额 = 外币 * 汇率
          const {
            quantity,
            price,
            origAmount,
            exchangeRate,
          } = this.quantityAndForeignCurrency;
          let _quantity = XEUtils.toNumber(quantity),
            _price = XEUtils.toNumber(price),
            _origAmount = XEUtils.toNumber(origAmount),
            _exchangeRate = XEUtils.toNumber(exchangeRate);

          this.quantityAndForeignCurrency["quantity"] = _quantity;

          if (_price && _quantity * _price != 0) {
            this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
              _quantity * _price,
              this.aPrecision
            );
          } else if (_quantity) {
            this.quantityAndForeignCurrency["price"] = this.toFixedLocal(
              Math.abs(_origAmount / _quantity),
              this.qpPrecision
            );
          }
          if (_quantity) {
            _origAmount = XEUtils.toNumber(
              this.quantityAndForeignCurrency["origAmount"]
            );
            if (_exchangeRate) {
              this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
                _origAmount * _exchangeRate,
                this.aPrecision
              );
            } else {
              this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
                _origAmount,
                this.aPrecision
              );
            }
          }
        }
      },

      /**
       * 3、单价失去焦点处理
       */
      onPrice(opkey = "blur") {
        if (opkey == "focus") {
          this.setFocusEle("price");
        } else {
          //修改单价:
          //  数量不为空时，计算：外币 = 数量 * 单价
          //  数量为空（或0）时，计算：数量 = 外币 ÷ 单价
          //  如果数量*单价为0，则不更新借方或贷方金额
          //  本币金额 = 外币 * 汇率
          //修改单价:
          //  数量不为空时，计算：外币 = 数量 * 单价
          //  数量为空（或0）时，计算：数量 = 外币 ÷ 单价
          //  如果数量*单价为0，则不更新借方或贷方金额
          //  本币金额 = 外币 * 汇率
          const {
            quantity,
            price,
            origAmount,
            exchangeRate,
          } = this.quantityAndForeignCurrency;
          const _quantity = XEUtils.toNumber(quantity),
            _price = XEUtils.toNumber(price),
            _origAmount = XEUtils.toNumber(origAmount),
            _exchangeRate = XEUtils.toNumber(exchangeRate);

          this.quantityAndForeignCurrency["price"] = _price;

          if (_quantity && _quantity * _price != 0) {
            this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
              _quantity * _price,
              this.aPrecision
            );
          }

          //获取最新的数据
          const _tmpOrigAmount = XEUtils.toNumber(
            this.quantityAndForeignCurrency["origAmount"]
          );
          if (_exchangeRate) {
            this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
              _tmpOrigAmount * _exchangeRate,
              this.aPrecision
            );
          } else {
            this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
              _tmpOrigAmount,
              this.aPrecision
            );
          }
        }
      },

      /**
       * 4、(外币)失去焦点处理
       */
      onOrigAmount(opkey = "blur") {
        if (opkey == "focus") {
          this.setFocusEle("origAmount");
        } else {
          //修改原币金额:（弹层的本币金额与借贷方金额是同一个值在不同地方的显示，应始终保持他们的一致）
          //  1、如果数量不为0，反算单价，
          //  2、如果外币不为0，反算汇率。
          //  3、不管单价汇率是否为0(空) 只计算单价和汇率，不反算数量、外币
          //  4、如果外币*汇率为0，则不更新借方或贷方金额，也不更新弹框里的本币
          //  5、修改外币，如果金额不为0，汇率为0（空），反算汇率，如果汇率不为0，计算金额。

          const {
            quantity,
            price,
            origAmount,
            exchangeRate,
            amount,
          } = this.quantityAndForeignCurrency;
          const _quantity = XEUtils.toNumber(quantity),
            _price = XEUtils.toNumber(price),
            _origAmount = XEUtils.toNumber(origAmount),
            _exchangeRate = XEUtils.toNumber(exchangeRate),
            _amount = XEUtils.toNumber(amount);

          this.quantityAndForeignCurrency["origAmount"] = _origAmount;
          if (_quantity) {
            //1、如果数量不为0，反算单价
            this.quantityAndForeignCurrency["price"] = this.toFixedLocal(
              Math.abs(_origAmount / _quantity),
              this.qpPrecision
            );
          }
          //数量和外币正负号同步
          if (
            `${_origAmount}`.substr(0, 1) == "-" &&
            `${_quantity}`.substr(0, 1) != "-"
          ) {
            this.quantityAndForeignCurrency["quantity"] = `-${_quantity}`;
          } else if (
            `${_origAmount}`.substr(0, 1) != "-" &&
            `${_quantity}`.substr(0, 1) == "-"
          ) {
            this.quantityAndForeignCurrency["quantity"] = `${_quantity}`.substr(
              1,
              `${_quantity}`.length - 1
            );
          }

          // 5、修改外币，如果金额不为0，汇率为0（空），反算汇率，如果汇率不为0，计算金额。
          if (!_exchangeRate && _origAmount && _amount) {
            this.quantityAndForeignCurrency["exchangeRate"] = Math.abs(
              this.toFixedLocal(_amount / _origAmount, this.qpPrecision)
            );
          }

          if (_origAmount) {
            if (_origAmount * _exchangeRate != 0) {
              this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
                _origAmount * _exchangeRate,
                this.aPrecision
              );
            }
          }
        }
      },

      /**
       * 5、汇率切换
       */
      onExchangeRate(opkey = "blur") {
        if (opkey == "focus") {
          this.setFocusEle("exchangeRate");
        } else {
          //修改汇率:
          //  如果外币不为0，用外币乘以汇率作为借方金额
          //  如果外币金额*汇率为0，则不更新借方或贷方金额
          //  如果币种是本位币，保持外币和本位币金额一致，汇率=1
          const {
            currency,
            quantity,
            price,
            origAmount,
            exchangeRate,
            amount,
          } = this.quantityAndForeignCurrency;
          const _quantity = XEUtils.toNumber(quantity),
            _price = XEUtils.toNumber(price),
            _origAmount = XEUtils.toNumber(origAmount),
            _exchangeRate = XEUtils.toNumber(exchangeRate),
            _amount = XEUtils.toNumber(amount);
          this.quantityAndForeignCurrency["exchangeRate"] = _exchangeRate;

          if (_origAmount) {
            if (_origAmount * _exchangeRate != 0) {
              this.quantityAndForeignCurrency["amount"] = this.toFixedLocal(
                origAmount * _exchangeRate,
                this.aPrecision
              );
            }
          }
          if (
            this.isReverseForeignCurrency &&
            !_origAmount &&
            _amount &&
            _exchangeRate
          ) {
            if (_exchangeRate) {
              this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
                Math.abs(_amount / _exchangeRate),
                this.aPrecision
              );
            }
          }
        }
      },

      /**
       * 6、本币失去焦点处理
       */
      onAmount(opkey = "blur") {
        if (opkey == "focus") {
          this.amount_ = this.quantityAndForeignCurrency.amount;
          this.setFocusEle("amount");
        } else {
          //如果外币为0，汇率不为0，不反算外币；
          //1、修改金额，如果数量不为0，反算单价，
          //2、如果外币不为0，反算汇率。不管单价汇率是否为0(空)
          //只反算单价和汇率，不反算数量、外币
          const {
            currency,
            quantity,
            price,
            origAmount,
            exchangeRate,
            amount,
          } = this.quantityAndForeignCurrency;
          let _quantity = XEUtils.toNumber(quantity),
            _price = XEUtils.toNumber(price),
            _origAmount = XEUtils.toNumber(origAmount),
            _exchangeRate = XEUtils.toNumber(exchangeRate),
            _amount = XEUtils.toNumber(amount);
          this.quantityAndForeignCurrency["amount"] = _amount;
          //金额失去焦点，如果没有变动金额不需要重算
          if (this.amount_ == this.quantityAndForeignCurrency.amount) {
            return;
          }
          //启用外币
          if (this.currentAccount["isCalcMulti"]) {
            if (!currency.isBaseCurrency) {
              if (_origAmount) {
                const _tmpValue = this.toFixedLocal(
                  Math.abs(_amount / _origAmount),
                  6
                );
                //处理分子很小、分母很大，计算出来无限接近0
                this.quantityAndForeignCurrency["exchangeRate"] = isNaN(
                  _tmpValue
                )
                  ? "0"
                  : _tmpValue;
              } else {
                if (_exchangeRate && this.isReverseForeignCurrency) {
                  this.quantityAndForeignCurrency[
                    "origAmount"
                  ] = this.toFixedLocal(
                    Math.abs(_amount / _exchangeRate),
                    this.aPrecision
                  );
                }
              }
            } else {
              this.quantityAndForeignCurrency["exchangeRate"] = 1;
              this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
                _amount,
                this.aPrecision
              );
              this.onOrigAmount();
            }

            //mvvm 获取最新值
            _origAmount = XEUtils.toNumber(
              this.quantityAndForeignCurrency["origAmount"]
            );
            _exchangeRate = XEUtils.toNumber(
              this.quantityAndForeignCurrency["exchangeRate"]
            );

            if (_origAmount && _exchangeRate) {
              if (
                `${_amount}`.substr(0, 1) == "-" &&
                `${_origAmount}`.substr(0, 1) != "-"
              ) {
                this.quantityAndForeignCurrency["origAmount"] =
                  "-" + `${_origAmount}`;
                this.onOrigAmount();
              } else if (
                `${_amount}`.substr(0, 1) != "-" &&
                `${_origAmount}`.substr(0, 1) == "-"
              ) {
                this.quantityAndForeignCurrency[
                  "origAmount"
                ] = `${_origAmount}`.substr(1, `${_origAmount}`.length - 1);
                this.onOrigAmount();
              }
            }
            if (this.isReverseForeignCurrency && _origAmount && _exchangeRate) {
              this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
                Math.abs(_amount / _exchangeRate),
                this.aPrecision
              );
            }
          }
          // --如果没有启用外币核算, 视同修改原币(此时汇率=1)
          else {
            this.quantityAndForeignCurrency["origAmount"] = this.toFixedLocal(
              _amount,
              this.aPrecision
            );
            this.onOrigAmount();
          }
        }
        //修改本币金额--如果启用了外币核算
      },

      /**
       * 转换
       */
      toFixedLocal(value, precision) {
        let ret = value;
        if (value && value.toString().indexOf(".") > -1) {
          if (value.toString().split(".")[1].length > precision) {
            if (!isNaN(value)) {
              //以下有问题，类似1.255这样的，四舍五入后，变成了1.25,调整成新的
              // ret = Math.round(value * Math.pow(10, precision) / Math.pow(10, precision))
              ret =
                Math.round(Math.abs(value) + "e" + precision) /
                Math.pow(10, precision);
              ret = value < 0 ? -ret : ret;
            } else {
              ret = 0;
            }
          }
        }
        return ret;
      },

      /**
       * 校验检查输入值
       */
      checkQuantityAndCurrency() {
        const {
          currency,
          quantity,
          price,
          origAmount,
          exchangeRate,
          amount,
        } = this.quantityAndForeignCurrency;
        const _quantity = XEUtils.toNumber(quantity),
          _price = XEUtils.toNumber(price),
          _origAmount = XEUtils.toNumber(origAmount),
          _exchangeRate = XEUtils.toNumber(exchangeRate),
          _amount = XEUtils.toNumber(amount);
        let error = "";
        if (this.currentAccount.isCalcQuantity) {
          if (_price < 0) {
            error = "单价不能小于零";
          }
        }
        if (this.currentAccount.isCalcMulti) {
          if (_exchangeRate < 0) {
            error += "汇率不能小于零";
          }
          if (
            this.quantityAndForeignCurrency &&
            JSON.stringify(currency) == "{}"
          ) {
            error += "请填写币种";
          }
        }
        if (
          this.isReverseForeignCurrency &&
          !_origAmount &&
          this.currentAccount.isCalcMulti
        ) {
          error += "外币不能为空";
        }
        if (_amount && _amount > 9999999999.99) {
          if (this.currentAccount.isCalcMulti) {
            error
              ? (error += "本币不能大于9999999999.99，请调整")
              : (error = "本币不能大于9999999999.99，请调整");
          } else {
            error
              ? (error += "金额不能大于9999999999.99，请调整")
              : (error = "金额不能大于9999999999.99，请调整");
          }
        } else if (_amount < -9999999999.99) {
          if (this.currentAccount.isCalcMulti) {
            error
              ? (error += "本币不能小于-9999999999.99，请调整")
              : (error = "本币不能小于-9999999999.99，请调整");
          } else {
            error
              ? (error += "金额不能小于-9999999999.99，请调整")
              : (error = "金额不能小于-9999999999.99，请调整");
          }
        }
        return error;
      },

      /**
       * 移动焦点
       */
      setFocusEle(_focusEle) {
        const element = this.$refs[_focusEle];
        //处理按钮
        if (element && element.$el.className.indexOf("el-button--small") > -1) {
          this.onSubmit();
        }
        //处理界面元素
        if (element) {
          element.focus && element.focus();
          element.select && element.select();
        }
      },

      /**
       * 递归查找元素
       */
      findFormItem(el) {
        const parent = el.parentElement;
        if (!parent) return document.body;
        if (
          parent.className.includes("el-form-item") &&
          parent.className.includes("el-form-item--small")
        ) {
          return parent;
        }
        return this.findFormItem(parent);
      },

      /**
       * 查找下一个焦点元素
       */
      findNextFocusEle(container) {
        let nextEl = container.nextElementSibling;
        if (!nextEl) return;
        const input = nextEl.querySelector("input");
        if (input && input.className.includes("el-input__inner")) {
          if (input.disabled) {
            return this.findNextFocusEle(nextEl);
          }
          return input;
        }
        const btn = nextEl.querySelector("button");
        if (btn && btn.className.includes("el-button--default")) {
          const nextSibEl = btn.nextSibling;
          if (!nextSibEl) return;
          return nextSibEl;
        }
      },

      /**
       * enter键
       */
      handlerEnter() {
        const container = this.findFormItem(document.activeElement);
        if (container && container.id == "currency") {
          this.$refs[container.id] && this.$refs[container.id].blur();
        }
        const ele = this.findNextFocusEle(container);
        if (
          ele.className &&
          ele.className.includes("el-button") &&
          ele.className.includes("el-button--primary")
        ) {
          ele && ele.click();
        } else {
          ele && ele.focus();
          ele && ele.select();
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .qafc-dispaly-show {
    text-align: left;
    min-width: 200px;
    padding: 20px 5px 0px 10px;
    .el-select--small {
      width: 100px;
    }
    .el-form-item--small {
      margin-bottom: 8px !important;
    }
    .el-input--small {
      width: 100px;
    }
  }
  .infinite-list-item {
    font-size: 13px;
    height: 26px;
    line-height: 22px;
    padding: 2px 12px;
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.3s ease;
  }
  .qafc-form-rmb {
    margin-left: 3px;
  }
  .qafc-footer-btn {
    margin-left: 30px;
  }
</style>
