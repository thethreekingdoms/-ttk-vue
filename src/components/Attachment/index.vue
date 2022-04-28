<template>
  <div class="attachment">
    <el-popover
      placement="bottom"
      width="350"
      trigger="click"
      popper-class="attachment-popover"
    >
      <el-upload
        class="upload-demo"
        ref="upload"
        :auto-upload="true"
        :action="action"
        :file-list="fileList"
        :show-file-list="false"
        :accept="uploadProps.accept"
        :data="uploadProps.data"
        :on-change="onChange"
        :before-upload="beforeUpload"
        :on-error="onError"
        :on-success="onSuccess"
        :on-remove="onRemove"
        :on-preview="onPreview"
        :disabled="attachDisable"
      >
        <div class="attachment-title">
          <span>附件列表</span>
          <el-button
            slot="trigger"
            size="small"
            type="primary"
            :disabled="attachDisable"
          >
            添加
          </el-button>
        </div>
        <div class="attachment-content" slot="tip">
          <ul v-if="data && data.length > 0" ref="imgFontInfo">
            <li v-for="(item, index) in data" :key="index">
              <div class="attachment-content-list">
                <div
                  class="attachment-content-left viewer-img"
                  @click="handleViewImg(item, index)"
                  v-viewer="options"
                >
                  <el-popover
                    trigger="hover"
                    placement="left-start"
                    v-if="item.type == 1000010001"
                  >
                    <div slot="reference">
                      <i
                        :type="getIcon(item).iconType"
                        :class="getIcon(item).iconClass"
                      ></i>
                      <img
                        v-for="src in images"
                        :src="src"
                        :key="src"
                        class="img"
                        v-show="false"
                      />
                      <span
                        :title="item.name || item.alt || item.file.originalName"
                      >
                        {{ item.name || item.alt || item.file.originalName }}
                      </span>
                    </div>
                    <div :style="{ height: '300px', width: '300px' }">
                      <img
                        :style="{ height: '300px', width: '300px' }"
                        :src="item.accessUrl"
                      />
                    </div>
                  </el-popover>
                  <div slot="reference" v-else>
                    <i
                      :type="getIcon(item).iconType"
                      :class="getIcon(item).iconClass"
                    ></i>
                    <!-- <img
                        v-for="src in images"
                        :src="src"
                        :key="src"
                        class="img"
                        v-show="false"
                    />-->
                    <span
                      :title="item.name || item.alt || item.file.originalName"
                    >
                      {{ item.name || item.alt || item.file.originalName }}
                    </span>
                  </div>
                </div>
                <div class="attachment-content-right">
                  <a
                    :style="{ marginRight: '8px' }"
                    :href="item.accessUrl"
                    title="下载"
                    @click="download(item)"
                  >
                    <i class="el-icon-download"></i>
                  </a>
                  <a title="删除" @click="handleDelete(item)">
                    <i class="el-icon-delete"></i>
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </el-upload>
      <!-- <el-button slot="reference" class="keyboard">附件</el-button> -->
      <div slot="reference" class="keyboard">
        <i class="el-icon-paperclip"></i>
        <span>附件</span>
      </div>
    </el-popover>
  </div>
</template>
<script>
  import { tokenName } from "@/config/settings";
  import "viewerjs/dist/viewer.css";
  import Viewer from "v-viewer";
  import Vue from "vue";
  Vue.use(Viewer);
  export default {
    name: "Attachment",
    components: {
      Viewer,
    },
    props: {
      isFromDocList: [Number, String],
      className: String,
      status: Number,
      uploadProps: Object,
      data: Array,
      attachDisable: Boolean,
    },
    data() {
      return {
        options: {
          // navbar: false,
          // fullscreen: false,
          // toolbar: false,
          // inline: true
          // zIndex: 9999,
          // container: null,
        },
        statusProp: this.status,
        headers: {},
        action: "",
        api: "",
        url: "",
        fileList: [],
        activeIndex: 0,
      };
    },
    created() {
      if ("development" === process.env.NODE_ENV) {
        this.api = process.env.VUE_APP_BASE_API;
      } else {
        this.api = `${window.location.protocol}//${window.location.host}`;
      }
      this.action = this.uploadProps.action
        ? this.uploadProps.action
        : "/v1/edf/file/upload?token=" + this.$baseAccessToken();
      this.headers[tokenName] = this.$baseAccessToken();
    },
    computed: {
      images: function () {
        let imgList = [];
        let curImg = [];
        if (this.data instanceof Array) {
          this.data.forEach((item) => {
            if (item.type == 1000010001) {
              imgList.push(item.accessUrl);
            }
          });
        }
        const activeIndex = imgList.findIndex((item) => {
          return item == this.data[this.activeIndex].accessUrl;
        });
        curImg.push(imgList[activeIndex]);
        return curImg;
      },
      attachmentClass: function () {
        return {
          attachment: true,
          [this.className]: !!this.className,
        };
      },
    },
    methods: {
      handleViewImg(item, index) {
        // this.images.push(item.accessUrl)
        if (item.type != 1000010001) {
          return;
        }
        const viewer = this.$refs.imgFontInfo.querySelectorAll(".viewer-img")[
          index
        ].$viewer;
        this.activeIndex = index;
        viewer.show();
      },
      getIcon(item) {
        let iconType, iconClass;
        switch (item.type || (item.file && item.file.type)) {
          case 1000010001:
            iconType = "el-icon-picture-outline";
            iconClass = "el-icon-picture-outline";
            break;
          case 1000010002:
            iconType = "el-icon-document";
            iconClass = "el-icon-document";
            break;
          case 1000010003:
            iconType = "Excel";
            iconClass = "Excel";
            break;
          case 1000010004:
            iconType = "ppt";
            iconClass = "ppt";
            break;
          case 1000010005:
            iconType = "pdf";
            iconClass = "pdf";
            break;
          case 1000010006:
            iconType = "yasuobao";
            iconClass = "yasuobao";
            break;
          default:
            break;
        }
        return { iconType, iconClass };
      },
      async onChange(file, fileList) {      
        if (!this.attachDisable) {
          this.$emit("attachment-change", file, fileList);
        }
      },
      beforeUpload(file) {       
        if (!this.attachDisable) {
          this.$emit("before-upload", file);
        }
      },
      onError(err, file, fileList) {       
        this.$emit("handle-error", err, file, fileList);
      },
      onSuccess(response, file, fileList) {       
        this.$emit("handl-success", response, file, fileList);
      },
      onRemove(file, fileList) {       
        this.$emit("handle-remove", file, fileList);
      },
      onPreview(file) {       
        if (!this.attachDisable) {
          this.$emit("handle-preview", file);
        }
      },
      download(file) {
        this.$emit("handle-download", file);
      },
      handleDelete(file) {
        this.$emit("handle-delete", file);
      },
    },
  };
</script>
<style lang="scss">
  .attachment-popover {
    padding: 0;
    // height: 200px;
    .el-upload {
      width: 100%;
    }
    .attachment-title {
      // font-size: 13px;
      line-height: 30px;
      display: flex;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid #ddd;
      .upload {
        // font-size: 13px;
        cursor: pointer;
        display: inline-block;
        line-height: 25px;
        &:hover {
          color: $active-color;
          text-decoration: none;
        }
      }
    }
    .attachment-content {
      height: 200px;
      ul {
        overflow-y: auto;
        height: 100%;
      }
      .attachment-content-list {
        display: flex;
        justify-content: space-between;
        line-height: 36px;
        padding: 0px 12px;
        border-bottom: 1px dashed #ddd;
        .img {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
      }
      .attachment-content-left {
        text-align: left;
        display: flex;
        align-items: center;
      }
      .attachment-content-right {
        text-align: right;
      }
    }
  }
  .attachment-popover.isFromDocList {
    z-index: 9999999 !important;
    top: 87px !important;
    right: 29px !important;
  }
  .attachment-title {
    .upload {
      &:hover {
        text-decoration: underline;
      }
    }
    .mk-upload {
      float: right;
    }
  }

  .mk-attachment > i {
    margin-left: 35px;
  }

  .mk-attachment:hover {
    // .edficon-fujian{
    //     &:hover{
    color: $active-color;
    cursor: pointer; // }
    // }
  }
  .mk-attachment > span:hover {
    color: $active-color;
    cursor: pointer;
  }
  .mk-attachment-content {
    width: 250px;
    height: 220px;
    display: flex;
    flex-direction: column;
    .fixedDataTableCellLayout_main {
      border-bottom-style: dashed;
      border-width: 0 0 1px 0;
      text-align: left;
      .edficon {
        font-size: 24px;
        height: 35px;
        line-height: 35px;
        vertical-align: sub;
        &.del {
          font-size: 20px;
          vertical-align: sub;
        }
        &.download {
          &:before {
            color: #33c2a1;
          }
          &:hover {
            &:before {
              color: #009875;
            }
          }
        }
      }
    }
    &-link-cell {
      justify-content: flex-start;
      padding-left: 10px;
      font-size: 13px;
      display: flex !important;
      a {
        height: 100%; // float: left;
      }
      span {
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 145px;
        overflow: hidden;
        // display: inline-block;
      }
    }
    .picture {
      font-size: 20px;
      margin-right: 5px;
      color: #3eabe8;
    }
    &-footer {
      flex: 0 0 35px;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      .anticon {
        margin-right: 4px;
      }
    }
  }

  .upload-content {
    flex-direction: row;
    justify-content: center; //无附件显示图片加文字，2018/2/8 myf
    // line-height: 100px;
    height: 220px;
    .mk-nodata-message {
      font-size: 13px;
    }
  }

  .react-viewer-mask {
    z-index: 99991 !important;
  }

  .react-viewer-close {
    z-index: 99995 !important;
  }

  .react-viewer-canvas {
    z-index: 99993 !important;
  }

  .react-viewer-footer {
    z-index: 99994 !important;
  }
  .keyboard {
    .el-icon-paperclip {
      margin-right: 3px;
      font-size: 15px;
    }
  }
</style>
