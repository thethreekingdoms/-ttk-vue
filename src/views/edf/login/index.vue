<template>
  <div class="login-container">
    <!-- <div class="login-header">
      <header>
        <img src="@/assets/error_images/401.png"/>
      </header>
    </div>-->
    <!--     <el-alert v-if="nodeEnv !== 'development'" title="@ttk/vue" type="success" :closable="false"></el-alert> -->
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="9" :xl="9">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          auto-complete="off"
          class="login-form"
          label-position="left"
        >
          <div class="title">登录</div>
          <!-- <div class="title-tips">欢迎来到{{ title }}！</div> -->
          <el-form-item style="margin-top: 26px;" prop="mobile">
            <span class="svg-container svg-container-admin">
              <vab-icon :icon="['fas', 'user']" />
            </span>
            <span class="split-line"></span>
            <el-input
              v-model.trim="loginForm.mobile"
              v-focus
              auto-complete="off"
              placeholder="请输入手机号"
              tabindex="1"
              type="text"
            />
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container svg-container-pass">
              <vab-icon :icon="['fas', 'lock']" />
            </span>
            <span class="split-line"></span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model.trim="loginForm.password"
              :type="passwordType"
              auto-complete="off"
              placeholder="请输入密码"
              tabindex="2"
              @keyup.enter.native="handleLogin"
            />
            <span v-if="passwordType === 'password'" class="show-pwd" @click="showPwd">
              <vab-icon :icon="['fas', 'eye-slash']" />
            </span>
            <span v-else class="show-pwd" @click="showPwd">
              <vab-icon :icon="['fas', 'eye']" />
            </span>
          </el-form-item>
          <el-button :loading="loading" class="login-btn" type="primary" @click="handleLogin">登录</el-button>
          <el-form-item>
            <el-checkbox v-model="remember">一周内自动登录</el-checkbox>
            <router-link to="/register">
              <el-link style="float: right">忘记密码</el-link>
            </router-link>
            <i style="float: right; margin: 0 10px; font-style: normal; font-size: 13px">|</i>
            <router-link to="/register">
              <el-link style="float: right; color:#333333 ">立即注册</el-link>
            </router-link>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { isPassword } from "@/utils/validate";
// import { Base64 } from '@/utils/base64'
import {
  Logo,
} from "@/layouts/components";

import md5 from 'md5'

export default {
  name: "Login",
  directives: {
    focus: {
      inserted(el) {
        el.querySelector("input").focus();
      },
    },
  },
  components: {
    Logo,
  },
  data() {
    const validateMobile = (rule, value, callback) => {
      if ("" == value) {
        callback(new Error("手机号不能为空"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!isPassword(value)) {
        callback(new Error("密码不能少于6位"));
      } else {
        callback();
      }
    };
    return {
      nodeEnv: process.env.NODE_ENV,
      title: this.$baseTitle,
      loginForm: {
        mobile: "",
        password: "",
      },
      remember: false,
      loginRules: {
        mobile: [
          {
            required: true,
            trigger: "blur",
            validator: validateMobile,
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            validator: validatePassword,
          },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || "/";
      },
      immediate: true,
    },
  },
  mounted() {
    // this.loginForm.mobile = "13161861573";
    // this.loginForm.password = "Aa111111";
  },
  methods: {
    showPwd() {
      this.passwordType === "password"
        ? (this.passwordType = "")
        : (this.passwordType = "password");
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          const formData = { ...this.loginForm }
          // console.log(Base64, '==========')
          // formData.clearText = Base64.encode(this.loginForm.password)
          formData.password = md5(`${this.loginForm.password}*the3Kingdom*`)
          formData.requestUrl = location.hostname
          if (/^127.|^192./.test(location.hostname)) {
            formData.requestUrl = 'localhost'
          }
          const params = Object.assign({ isReturnValue: true, remember: false, version: "v1.0.55" }, formData)
          await this.$store.dispatch("user/login", params);
          // await this.$store.dispatch("user/login", { "isReturnValue": true, "account": "", "password": "01411f82677540bd4fa2e1927a5c0932", "mobile": "13161861573", "remember": false, "version": "v1.0.55", "clearText": "QWExMTExMTE=", "requestUrl": "test.bj.jchl.com" });
          const routerPath =
            this.redirect === "/404" || this.redirect === "/401"
              ? "/"
              : this.redirect;
          await this.$router.push(routerPath).catch(() => { });
          this.loading = false;
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  min-height: 600px;
  // background: url("~@/assets/login_images/background.png") center center fixed
  //   no-repeat;
  // background-size: cover;
  background: url("~@/assets/login_images/background.png") center center fixed
    no-repeat;
  background-size: cover;
  background-color: #fff;

  [class*="el-col-"] {
    float: right;
    box-sizing: border-box;
  }
  .title {
    height: 50px;
    font-size: 32px;
    color: #333333;
    font-weight: 700;
    text-align: center;
  }

  .title-tips {
    height: 24px;
    margin-top: 29px;
    font-size: 26px;
    font-weight: 400;
    color: rgba(14, 18, 26, 1);
  }

  .login-btn {
    display: inherit;
    // width: 220px;
    height: 52px;
    margin-top: 5px;
    border: 0;
    border-radius: 25px;
    width: 100%;
    font-size: 16px;
    background-color: #0066b3;

    &:hover {
      opacity: 0.9;
    }
  }

  .login-form {
    position: relative;
    max-width: 100%;
    margin: 22vh 10% 10%;
    overflow: hidden;

    .forget-password {
      width: 100%;
      margin-top: 40px;
      text-align: left;

      .forget-pass {
        width: 129px;
        height: 19px;
        font-size: 20px;
        font-weight: 400;
        color: rgba(92, 102, 240, 1);
      }
    }
  }

  .tips {
    margin-bottom: 10px;
    font-size: $base-font-size-default;
    color: $base-color-white;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      margin: 0 auto 40px auto;
      font-size: 34px;
      font-weight: bold;
      color: $base-color-blue;
      text-align: center;
    }
  }

  .svg-container {
    position: absolute;
    left: 17px;
    z-index: $base-z-index;
    font-size: 16px;
    color: #666666;
    cursor: pointer;
    user-select: none;
    line-height: 52px;
  }
  .split-line {
    border: 1px solid #d9d9d9;
    height: 30px;
    margin: 11px 0;
    left: 45px;
    position: absolute;
    z-index: $base-z-index;
  }

  .show-pwd {
    position: absolute;
    top: 14px;
    right: 25px;
    font-size: 16px;
    color: $base-font-color;
    cursor: pointer;
    user-select: none;
  }

  ::v-deep {
    .el-form-item {
      padding-right: 0;
      margin: 20px 0;
      color: #454545;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;

      &__content {
        min-height: $base-input-height;
        line-height: $base-input-height;
      }

      &__error {
        position: absolute;
        top: 100%;
        left: 18px;
        font-size: $base-font-size-small;
        line-height: 18px;
        color: $base-color-red;
      }
    }

    .el-input {
      box-sizing: border-box;

      input {
        height: 52px;
        border-radius: 25px;
        padding-left: 60px;
        font-size: 16px;
        line-height: 52px;
        color: $base-font-color;
        border: 0;
        caret-color: $base-font-color;
        border: 2px solid #c6c6c6;
      }
    }
  }
}
</style>
