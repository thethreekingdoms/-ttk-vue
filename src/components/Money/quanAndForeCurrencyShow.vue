<template>
  <div
    :title="qfcTitle"
    class="account-quantity"
    v-show="currentAccount.isCalcMulti || currentAccount.isCalcQuantity"
  >
    <span v-show="currentAccount.isCalcMulti">
      币种：{{
        quantityAndForeignCurrency.currency.name || currentAccount.currencyName
      }}
    </span>
    <span v-show="currentAccount.isCalcQuantity">
      数量：{{ quantityAndForeignCurrency.quantity }}
      {{ currentAccount.unitName }}
    </span>
    <span v-show="currentAccount.isCalcQuantity">
      单价：{{ quantityAndForeignCurrency.price }}
    </span>
    <span v-show="currentAccount.isCalcMulti">
      外币：{{ quantityAndForeignCurrency.origAmount }}
    </span>
    <span v-show="currentAccount.isCalcMulti">
      汇率：{{ quantityAndForeignCurrency.exchangeRate }}
    </span>
  </div>
</template>
<script>
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
    },
    data() {
      return {};
    },
    watch: {},
    created() {},
    /**
     * 计算属性
     */
    computed: {
      accounts() {
        return this.$store.state.gl_vouchercard.glAccounts;
      },
      qfcTitle() {
        const currentAccount = this.currentAccount,
          quantityAndForeignCurrency = this.quantityAndForeignCurrency;
        return (
          `${
            currentAccount.isCalcMulti
              ? `币种：${
                  quantityAndForeignCurrency.currency.name ||
                  currentAccount.currencyName
                }`
              : ""
          } ` +
          `${
            currentAccount.isCalcQuantity
              ? `数量：${quantityAndForeignCurrency.quantity} ${
                  currentAccount.unitName || ""
                } `
              : ""
          }` +
          `${
            currentAccount.isCalcQuantity
              ? `单价：${quantityAndForeignCurrency.price} `
              : ""
          }` +
          `${
            currentAccount.isCalcMulti
              ? `外币：${quantityAndForeignCurrency.origAmount} `
              : ""
          }` +
          `${
            currentAccount.isCalcMulti
              ? ` 汇率：${quantityAndForeignCurrency.exchangeRate} `
              : ""
          }`
        );
      },
    },
    methods: {},
  };
</script>
<style lang="scss">
  .account-quantity {
    overflow: auto;
    padding: 0px 6px;
    width: 100%;
    height: 100%;
    span {
      line-height: 16px;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
  }
</style>
