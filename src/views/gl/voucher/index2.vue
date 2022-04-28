<template>
  <div class="glVoucherList">
    <div class="glVoucherList-head">
      <div class="glVoucherList-head-left">
        <p class="glVoucherList-form-title">记账凭证</p>
        <el-popover placement="bottom" trigger="hover">
          <ShortCut />
          <div slot="reference" class="keyboard">
            <vab-icon :icon="['fas', 'keyboard']" class="keyicon"></vab-icon>
            <span>快捷键</span>
          </div>
        </el-popover>
      </div>
      <div class="glVoucherList-head-right">
        <div @click="gotoList" class="icondiv">
          <i class="el-icon-document keyicon"></i>
          <span>凭证管理</span>
        </div>
        <el-popover placement="bottom" trigger="click">
          <div class="autoEqualSetting">
            <label class="auto-balance">
              <el-checkbox
                v-model="isAutoEqualAmount"
                @change="(e) => autoEqualChange('isAutoEqualAmount', e)"
              ></el-checkbox>
              自动找平
            </label>
            <div class="reverse" v-if="isReverseForeignCurrency != -1">
              <el-checkbox
                v-model="isReverseForeignCurrency"
                @change="(e) => autoEqualChange('isReverseForeignCurrency', e)"
              ></el-checkbox>
              反算外币
            </div>
            <div class="tipOrg" v-if="isReverseForeignCurrency != -1">
              勾选【自动反算外币】后，勾选后外币将会自动进行反算且不可为空；不勾选时仅反算汇率，外币可以为空或0
            </div>
          </div>
          <div slot="reference" class="icondiv settingclass">
            <i class="el-icon-setting"></i>
            <span>找平设置</span>
          </div>
        </el-popover>
        <el-button
          type="ghost"
          @click="loadPaging('home')"
          :disabled="prevDisabled"
        >
          |<
        </el-button>
        <el-button
          type="ghost"
          @click="loadPaging('prev')"
          :disabled="prevDisabled"
        >
          <
        </el-button>
        <el-button
          type="ghost"
          @click="loadPaging('next')"
          :disabled="nextDisabled"
        >
          >
        </el-button>
        <el-button
          type="ghost"
          @click="loadPaging('end')"
          :disabled="nextDisabled"
        >
          >|
        </el-button>
      </div>
    </div>
    <div class="glVoucherList-body">
      <div class="glVoucherList-body-title">
        <div class="glVoucherList-body-title-left">
          <span>
            <span>记字第</span>
            <el-input
              :min="0"
              :max="99999"
              maxlength="5"
              :controls="false"
              :class="{
                'input-right': true,
                redDoc: doc.redSourceDocId ? true : false,
              }"
              :disabled="getVoucherStatus()"
              @keyup.native="handleDocCode"
              v-model="doc.docCode"
              class="lineclass"
            ></el-input>
          </span>
          <span>
            <span>制单日期</span>
            <el-date-picker
              :clearable="false"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              class="date lineclass"
              v-model="voucherDate"
              :picker-options="pickerOptions"
              :disabled="getVoucherStatus()"
              @change="handleDate"
            ></el-date-picker>
          </span>
        </div>
        <div class="glVoucherList-body-title-right">
          <img v-show="getAudited()" :src="auditedImgPath" class="auditedImg" />
          <span class="degree">
            {{ this.focusRowIndex + 1 + "/" + this.doc.entrys.length }}
          </span>
          <i class="el-icon-edit"></i>
          <el-popover
            placement="bottom"
            trigger="click"
            popper-class="noteInput-popover"
          >
            <NoteInput
              :noteContent="doc.note"
              @handle-note="onBlurNoteInput"
              :noteDisable="getVoucherStatus()"
            />
            <span slot="reference" class="comment">批注</span>
          </el-popover>
          <span>
            附单据
            <el-input
              :controls="false"
              class="input lineclass"
              :max="9999"
              :min="0"
              ref="attachedNum"
              style="width: 50px"
              maxlength="4"
              @focus="showAttachedNum"
              @keyup.native="attachedNumChange"
              v-model="doc.attachedNum"
              :disabled="getVoucherStatus()"
            ></el-input>
            张
          </span>

          <attachment
            :uploadProps="uploadProps"
            :data="doc.enclosures"
            @attachment-change="attachmentChange"
            @before-upload="beforeUpload"
            @handle-error="handleError"
            @handle-success="handleSuccess"
            @handle-remove="handleRemove"
            @handle-preview="handlePreview"
            @handle-download="handleDownload"
            @handle-delete="handleDelete"
            :attachDisable="getVoucherStatus()"
          >
            <template slot="attachment"></template>
          </attachment>
        </div>
      </div>
      <div class="glVoucherList-content">
        <vxe-table
          border
          ref="xTable1"
          keep-source
          show-overflow
          highlight-hover-row
          show-footer
          max-height="470"
          :loading="loading"
          :data="doc.entrys"
          :edit-config="{
            trigger: 'click',
            mode: 'cell',
            showStatus: true,
            showIcon: false,
            activeMethod: activeCellMethod,
          }"
          :mouse-config="{ selected: true }"
          :checkbox-config="{ range: true }"
          :keyboard-config="{
            isArrow: true,
            isDel: true,
            isEnter: true,
            isTab: true,
            isEdit: true,
            editMethod,
          }"
          @edit-disabled="getVoucherStatus"
          @edit-actived="editActivedEvent"
          @edit-closed="editClosedEvent"
          @cell-mouseenter="handleMouseEnter"
          @cell-mouseleave="handleMouseLeave"
          :footer-method="footerMethod"
          :footer-class-name="footerClassName"
          :footer-span-method="footerRowspanMethod"
        >
          <vxe-table-column
            field="operateCol"
            width="18"
            :visible="true"
            class-name="cls-insert-remove"
          >
            <template v-slot="{ row, $rowIndex }">
              <span
                class="drag-btn"
                v-show="
                  $rowIndex === currentRowIndex && doc.docStatus != '1000020002'
                "
              >
                <i
                  class="vxe-icon--plus"
                  @click="insertRow(row, $rowIndex)"
                ></i>
                <p></p>
                <i
                  class="vxe-icon--close"
                  @click="removeRow(row, $rowIndex)"
                ></i>
              </span>
              <span v-show="$rowIndex != currentRowIndex"></span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="summary"
            title="摘要"
            class-name="summary"
            min-width="110"
            :edit-render="{}"
          >
            <template v-slot:edit="{ row, $rowIndex, column }">
              <SummaryEdit
                :row_="row"
                :rowIndex_="$rowIndex"
                :column_="column"
                @changeCb="summaryChange"
                @arrowOption="arrowOption"
              ></SummaryEdit>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="accountCode"
            title="科目名称"
            min-width="200"
            :edit-render="{}"
          >
            <template v-slot:edit="{ row, $rowIndex, column }">
              <SubjectEdit
                :row_="row"
                :rowIndex_="$rowIndex"
                :column_="column"
                @changeCb="accountChange"
                @arrowOption="arrowOption"
              ></SubjectEdit>
            </template>
            <template v-slot="{ row, $rowIndex, column }">
              <SubjectShow
                :row_="row"
                :rowIndex_="$rowIndex"
                :column_="column"
                :editStatus_="editStatus"
                :certificateStatus="doc.docStatus"
                :renderComponent="renderComponent"
                @clickBalance="handleClickBalance"
                @changeAuxSubjects="setAuxSubjects"
              ></SubjectShow>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="quantityAndForeignCurrency"
            min-width="159"
            width="159"
            :title="qfcColTitle"
            :visible="isqfcColShow"
          >
            <template v-slot="{ row, $rowIndex }">
              <el-popover
                placement="right"
                :trigger="
                  doc.entrys[$rowIndex].accountingSubject &&
                  (doc.entrys[$rowIndex].accountingSubject.isCalcMulti ||
                    doc.entrys[$rowIndex].accountingSubject.isCalcQuantity) &&
                  doc.docStatus == '1000020001'
                    ? 'click'
                    : 'manual'
                "
                v-model="doc.entrys[$rowIndex]['isqfcPopver']"
              >
                <quan-and-fore-currency
                  :currentAccount="
                    doc.entrys[$rowIndex] &&
                    doc.entrys[$rowIndex].accountingSubject
                  "
                  :quantityAndForeignCurrency="
                    doc.entrys[$rowIndex] &&
                    doc.entrys[$rowIndex].quantityAndForeignCurrency
                  "
                  :rowIndex="$rowIndex"
                  :amount="
                    doc.entrys[$rowIndex].amountDr ||
                    doc.entrys[$rowIndex].amountCr
                  "
                  :isReverseForeignCurrency="isReverseForeignCurrency"
                  :isqfcPopver="doc.entrys[$rowIndex]['isqfcPopver']"
                  @handle-qfc-submit="setQuantityAndForeignCurrency"
                />
                <div slot="reference" class="quantityandfore">
                  <quan-and-fore-currency-show
                    :currentAccount="
                      doc.entrys[$rowIndex] &&
                      doc.entrys[$rowIndex].accountingSubject
                    "
                    :quantityAndForeignCurrency="
                      doc.entrys[$rowIndex] &&
                      doc.entrys[$rowIndex].quantityAndForeignCurrency
                    "
                  />
                </div>
              </el-popover>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="amountDr"
            align="right"
            width="249"
            class-name="voucher-money"
            :edit-render="{
              name: 'MoneyCell',
              props: {
                changeCb: moneyChange,
                tableData: doc.entrys,
                isAutoEqual: isAutoEqualAmount,
                renderComponent,
                switchCrDr,
                arrowOption,
              },
            }"
          >
            <template slot="header">
              <span>借方金额</span>
              <money-header title_="借方金额"></money-header>
            </template>
            <template slot="footer">
              <money-footer :list="doc.entrys" property="amountDr" />
            </template>
          </vxe-table-column>

          <vxe-table-column
            align="right"
            width="250"
            field="amountCr"
            class-name="voucher-money"
            :edit-render="{
              name: 'MoneyCell',
              props: {
                changeCb: moneyChange,
                tableData: doc.entrys,
                isAutoEqual: isAutoEqualAmount,
                renderComponent,
                switchCrDr,
                arrowOption,
              },
            }"
          >
            <template slot="header">
              <span>贷方金额</span>
              <money-header title_="贷方金额"></money-header>
            </template>
            <template slot="footer">
              <money-footer :list="doc.entrys" property="amountCr" />
            </template>
          </vxe-table-column>
          <vxe-table-column
            width="18"
            field="up-down"
            class-name="cls-up-down"
            :visible="true"
          >
            <template v-slot="{ row, $rowIndex }">
              <span
                class="drag-btn"
                v-show="
                  $rowIndex === currentRowIndex && doc.docStatus != '1000020002'
                "
              >
                <i
                  class="vxe-icon--arrow-top"
                  @click="moveRowUp(row, $rowIndex)"
                ></i>
                <p></p>
                <i
                  class="vxe-icon--arrow-bottom"
                  @click="moveRowDown(row, $rowIndex)"
                ></i>
              </span>
              <span v-show="$rowIndex != currentRowIndex"></span>
            </template>
          </vxe-table-column>
        </vxe-table>
      </div>
      <div class="glVoucherList-footer">
        <div class="glVoucherList-footer-left">
          <span class="glVoucherList-footer-left-zdr" v-show="showTreasurer">
            主管:{{ doc.treasurer }}
          </span>
          <span class="glVoucherList-footer-left-zdr">
            制单人:{{ doc.creator }}
          </span>
          <span class="glVoucherList-footer-left-shr">
            审核人:{{ doc.auditor }}
          </span>
        </div>
        <div class="glVoucherList-footer-right">
          <!-- <el-button type="primary" @click="saveAndNew" v-if="isDisplayButton('save')">保存并新增</el-button>
          <el-button type="ghost" @click="save" v-if="isDisplayButton('save')">保存</el-button>-->
          <el-dropdown class="commonTemplate">
            <el-button type="ghost">
              凭证模板
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                @click.native="handleTemplate"
                :disabled="getVoucherStatus()"
              >
                凭证模板
              </el-dropdown-item>
              <el-dropdown-item @click.native="saveTemplate">
                存为模板
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            type="primary"
            @click="saveAndNew"
            v-if="isDisplayButton('save')"
          >
            保存并新增
          </el-button>
          <el-button
            type="primary"
            @click="addDoc"
            v-if="isDisplayButton('add')"
          >
            新增
          </el-button>
          <el-button type="ghost" @click="save" v-if="isDisplayButton('save')">
            保存
          </el-button>
          <el-button
            type="ghost"
            @click="audit"
            v-if="isDisplayButton('audit')"
          >
            {{ getAuditText() }}
          </el-button>
          <el-button
            type="ghost"
            @click="reset"
            v-if="isDisplayButton('reset')"
          >
            清空
          </el-button>
          <el-button
            type="ghost"
            @click="printDoc"
            v-if="isDisplayButton('print')"
          >
            打印
          </el-button>
          <el-dropdown v-if="isDisplayButton('more')" class="more">
            <el-button type="ghost">
              更多
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                @click.native="deleteDoc"
                v-if="isDisplayButton('del')"
              >
                删除
              </el-dropdown-item>
              <el-dropdown-item @click.native="insertDoc">
                插入凭证
              </el-dropdown-item>
              <el-dropdown-item @click.native="redDashed">
                红冲
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <el-dialog title="凭证模板" :visible.sync="showCommonTemplate">
        <common-template @select-template="selectTemplate"></common-template>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancelTemplate">取 消</el-button>
          <el-button type="primary" @click="confirmTemplate">
            使用凭证模板
          </el-button>
        </div>
      </el-dialog>
      <el-dialog
        title="存为凭证模板"
        :visible.sync="showAddTemplate"
        class="commonTemplate-dialog"
      >
        <add-template
          @save-template="confirmAddTemplate"
          @cancel-template="cancelAddTemplate"
          :docData="doc"
        ></add-template>
      </el-dialog>
      <el-dialog title="红冲凭证" :visible.sync="showRedDashed" width="320px">
        <span>请选择红冲凭证的会计期间</span>
        <el-date-picker
          v-model="redDashedDate"
          :picker-options="pickerOptions"
          type="month"
          format="yyyy-MM"
          value-format="yyyy-MM"
          placeholder="选择月"
          :clearable="false"
        ></el-date-picker>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleRedDashed">确 定</el-button>
          <el-button @click="showRedDashed = false">取 消</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import {
    docInit,
    docGetAllBaseInfos,
    updateEnclosure,
    docCreate,
    docUpdate,
    findById,
    docDelete,
    docAudit,
    docAntiAudit,
    docPrev,
    docNext,
    docFirst,
    docLast,
    getAccountsBalance,
    getAccountBalance,
    getRedRushDocPeriod,
    redRushDoc,
    docPrint,
    saveDocSetParam,
    getDocSetParam,
    createTemplate,
    updateTemplate,
    docFindById,
    isUsedInCertificate,
    getNewDocCode,
  } from "@/api/gl/gl_vouchercard";
  import InputCellVue from "../component/InputCell.vue";
  import Edit from "../component/glVoucherListEdit";
  import MoneyHeader from "@/components/Money/moneyCellHeader.vue";
  import SubjectAuxDisplay from "@/components/Money/subjectAuxDisplay.vue";
  import QuanAndForeCurrency from "@/components/Money/quanAndForeCurrency.vue";
  import QuanAndForeCurrencyShow from "@/components/Money/quanAndForeCurrencyShow.vue";
  import MoneyCellShow from "@/components/Money/moneyCellShow.vue";
  import MoneyCellEdit from "@/components/Money/moneyCellEdit.vue";
  import SubjectShow from "@/components/Money/subjectShow.vue";
  import SubjectEdit from "@/components/Money/subjectEdit.vue";
  import SummaryEdit from "@/components/Money/summaryEdit.vue";
  import XEUtils from "xe-utils/methods/xe-utils";
  import { mapMutations, mapActions, mapState } from "vuex";
  import ShortCut from "@/components/ShortCut/index.vue";
  import NoteInput from "@/components/NoteInput/index.vue";
  import Attachment from "@/components/Attachment/index.vue";
  import auditedImg from "@/assets/comparison/audited_charge.png";
  import CommonTemplate from "@/views/gl/commonTemplate/index.vue";
  import MoneyFooter from "@/components/Money/moneyCellShow.vue";
  import AddTemplate from "../component/addTemplate.vue";
  import * as consts from "@/utils/consts.js";
  import * as env from "@/utils/environment.js";
  import { resolve } from "url";
  const entrysData = {
    summary: "",
    accountingSubject: undefined,
    quantityAndForeignCurrency: undefined,
    amountDr: 0,
    amountCr: 0,
  };
  export default {
    name: "glVoucherCard",
    components: {
      Edit,
      MoneyHeader,
      SubjectAuxDisplay,
      ShortCut,
      NoteInput,
      Attachment,
      QuanAndForeCurrency,
      QuanAndForeCurrencyShow,
      CommonTemplate,
      MoneyCellShow,
      MoneyCellEdit,
      SubjectShow,
      SubjectEdit,
      SummaryEdit,
      MoneyFooter,
      AddTemplate,
    },
    data() {
      return {
        //凭证主数据结构
        doc: {
          docCode: "",
          docType: "",
          docId: "",
          voucherDate: "",
          attachedNum: 0,
          enclosures: [],
          isInsert: false,
          isModifiedDocCode: true,
          docStatus: consts.docConsts.STATUS_VOUCHER_NOT_AUDITED, //默认未审核状态
          note: "",
          period: 6,
          year: 2020,
          entrys: [
            { ...entrysData },
            { ...entrysData },
            { ...entrysData },
            { ...entrysData },
            { ...entrysData },
          ],
          treasurer: null, //主管 （新代账有开关）
          auditor: null, //审核人
          creator: null, //制单人
        },
        isFromDocList: false,
        isAutoEqualAmount: true,
        isReverseForeignCurrency: false,
        showTreasurer: false,
        renderComponent: true,
        prevDisabled: false,
        nextDisabled: false,
        glDocTemplateDtos: [],
        loading: false,
        auditedImgPath: auditedImg,
        showCommonTemplate: false,
        showAddTemplate: false,
        showRedDashed: false,
        redDashedDate: undefined,
        docTemplateId: "",
        editStatus: consts.docConsts.ADD_STATUS, //默认凭证状态为新增
        uploadProps: {
          action: "",
          accept: "",
          data: { fileClassification: "ATTACHMENT" },
        },
        validRules: {
          summary: [{ required: true, message: "摘要不为能空" }],
          accountCode: [{ required: true, message: "科目不为能空" }],
          amountCr: [],
          amountDr: [],
        },
        deletedEntrys: [],
        currentRowIndex: undefined,
        isqfcColShow: false,
        qfcColTitle: "数量",
        quantityAndForeignCurrency: "",
        defaultLength: 0,
        focusRowIndex: 0,
        pickerOptions: {
          disabledDate: (v) => {
            let _disabledDate = new Date(this.getEnabledYearMonth());
            return this.isEarlyThan(_disabledDate, v);
          },
        },
        showPortal: true,
        voucherDate: "",
      };
    },
    created() {
      this.init({ isReturnValue: true });
      this.getAllBaseInfos({});
      document.addEventListener("keydown", this.handleKeyboard);
      if (window.frames && window.frames.length > 0) {
        if (window.addEventListener) {
          window.addEventListener("message", this.onMessage, false);
        } else if (window.attachEvent) {
          window.attachEvent("onmessage", this.onMessage);
        } else {
          window.onmessage = this.onMessage;
        }
      }
    },
    mounted() {
      // if (this.$route.params) {
      //   this.linkDoc(this.$route.params);
      // }
      //如果行数太少,则用空行补足
      this.setEmptyRow();
      this.forceRerender();
      setTimeout((_) => {
        let row = this.$refs.xTable1.afterFullData[0],
          nextType;
        this.$refs.xTable1.setActiveCell(row, "summary");
      }, 0);
    },
    destroyed() {
      document.removeEventListener("keydown", this.handleKeyboard);
      document.removeEventListener("message", this.onMessage);
    },
    computed: {
      ...mapState({
        currencyList: (state) => state.gl_vouchercard.currencyList,
        calcDict: (state) => state.gl_vouchercard.calcDict,
      }),
    },
    watch: {
      "doc.voucherDate": {
        deep: true,
        handler: function (newV, oldV) {
          this.voucherDate = newV;
        },
      },
    },
    methods: {
      ...mapMutations({
        setDocBaseInfo: "gl_vouchercard/setDocBaseInfo",
      }),
      ...mapActions({
        setAuxPopoverShow: "gl_vouchercard/setAuxPopoverShow",
      }),
      ...mapActions({
        setVoucherStatus: "gl_vouchercard/setVoucherStatus",
      }),
      async handleDate(e) {
        let diffMonth = 0;
        const oldDate = XEUtils.getWhatYear(this.doc.voucherDate),
          newDate = XEUtils.getWhatYear(this.voucherDate);
        diffMonth = newDate.getMonth() - oldDate.getMonth();
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          //编辑状态下，修改日期，要显示保存按钮
          this.changeStatus(
            consts.docConsts.EDIT_STATUS,
            consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          );

          if (Math.abs(diffMonth) > 0) {
            this.$baseMessage(
              `您将凭证日期所在月份从${oldDate.getFullYear()}年${
                oldDate.getMonth() + 1
              }月修改到了${newDate.getFullYear()}年${
                newDate.getMonth() + 1
              }月，查询该凭证时请选择修改后的月份！`,
              "warning"
            );
          }
        }
        //新增或者编辑状态，跨月修改凭证日期，要重新获取新的doccode
        if (Math.abs(diffMonth) > 0) {
          let response = await getNewDocCode({
            year: this.voucherDate.split("-")[0],
            period: this.voucherDate.split("-")[1],
          });
          if (response && response.result) {
            this.$set(this.doc, "docCode", response.value.docCode);
          }
        }

        //为了解决双向绑定doc.VoucherDate变化，
        //无法判断到底是翻页、凭证管理联查等场景的来源，因为在日期变更后，超过一个月后需要弹出提示

        this.$set(this.doc, "voucherDate", this.voucherDate);
      },
      handleDocCode(e) {
        let value = e.target.value;
        this.$set(this.doc, "docCode", value.replace(/[^\d.]/g, ""));
        if (this.editStatus == consts.docConsts.ADD_STATUS || !this.doc.docId) {
          this.changeStatus(
            consts.docConsts.ADD_STATUS,
            consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          );
        } else {
          this.changeStatus(
            consts.docConsts.EDIT_STATUS,
            consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          );
        }
      },
      async linkToDoc(params) {
        const baseArchiveList = await docGetAllBaseInfos({
          voucherDate: this.doc.voucherDate,
        });
        let subjectList = null;
        const currencyList = baseArchiveList.value.currencyDtos;
        if (params && params.newCertificate) {
          //凭证管理---->新增凭证
          subjectList = this.getSubjectList(
            baseArchiveList.value.glAccountQueryDto,
            consts.docConsts.ADD_STATUS
          );
          let response = await docInit({
            isReturnValue: true,
          });
          if (
            response.result == false &&
            response.error &&
            response.error.code == "70002"
          ) {
            this.$baseMessage(response.error.message, "error");
            return;
          }
          const initCertificateData = response.value;
          this.clearAndNewDoc(
            {
              docCode: initCertificateData.docCode,
              voucherDate: initCertificateData.voucherDate,
              docId: initCertificateData.docId,
            },
            subjectList,
            currencyList
          );
          //设置焦点
          setTimeout((_) => {
            let row = this.$refs.xTable1.afterFullData[0],
              nextType;
            this.$refs.xTable1.setActiveCell(row, "summary");
          }, 0);
        } else if (params && params.id) {
          //凭证管理---->联查、编辑凭证
          let docId = params.id;
          subjectList = this.getSubjectList(
            baseArchiveList.value.glAccountQueryDto
          );
          let response = await docFindById({ docId });
          if (response && !response.error) {
            this.loadDoc(response.value, consts.docConsts.VIEW_STATUS);
          } else {
            this.$baseMessage(response.error.message, "error");
          }
        } else if (params && params.docCode) {
          //凭证管理---->插入凭证
          if (params.code == "99999") {
            this.$baseMessage("凭证号达到99999，不能再增加凭证", "error");
            return;
          }
          subjectList = this.getSubjectList(
            baseArchiveList.value.glAccountQueryDto,
            consts.docConsts.ADD_STATUS
          );
          this.clearAndNewDoc(params, subjectList, currencyList);
          //设置焦点
          setTimeout((_) => {
            let row = this.$refs.xTable1.afterFullData[0],
              nextType;
            this.$refs.xTable1.setActiveCell(row, "summary");
          }, 0);
        }
      },
      async init(params) {
        const docSetParam = await getDocSetParam();
        const response = await docInit(params);
        if (docSetParam && docSetParam.result) {
          this.isAutoEqualAmount = docSetParam.value.autoBalance;
          this.isReverseForeignCurrency =
            docSetParam.value.autoCalcMultiAmount == 1 ? true : false;
        }
        if (response && response.result) {
          this.$set(
            this.doc,
            "docCode",
            `${response.value.docCode}`.padStart(5, "0")
          );
          this.$set(this.doc, "docId", response.value.docId);
          this.$set(this.doc, "showTreasurer", response.value.showTreasurer);
          this.$set(this.doc, "voucherDate", response.value.voucherDate);
        } else if (response && !response.result) {
          this.$baseMessage(response.error.message, "error");
          return;
        }
      },
      async getAllBaseInfos(params) {
        const response = await docGetAllBaseInfos(params);
        if (response && response.result) {
          this.setDocBaseInfo(response.value);
          this.glDocTemplateDtos = response.value.glDocTemplateDtos;
        }
      },
      isEarlyThan(dateA, dateB) {
        // dateA 比 dateB 早则为 true(严格小于)
        const yearA = dateA.getFullYear();
        const yearB = dateB.getFullYear();

        if (yearA > yearB) {
          return true;
        }
        if (yearA === yearB) {
          return dateA.getMonth() > dateB.getMonth();
        }

        return false;
      },
      async onMessage(e) {
        if (typeof e.data == "string") {
          let data = JSON.parse(e.data || "{}") || {},
            appData = data.value || {};
          switch (data.method) {
            case "taxOpenSecondTab":
              await this.linkToDoc(data);
              break;
            case "closeModal":
              // alert(JSON.stringify(appData.ret))
              // this.$store.state.gl_vouchercard.glAccounts.pu
              // const glAccountQueryDto = { glAccounts: subjectList.glAccounts };
              // this.setDocBaseInfo({ glAccountQueryDto });
              await this.setAddVoucher(appData.ret);
              break;
          }
        }
      },

      async setAddVoucher(val) {
        const baseArchiveList = await docGetAllBaseInfos({
          isNotGetDoc: true,
          isNotGetCurrency: true,
          isNotGetSummary: true,
        });
        const subjectList = this.getSubjectList(
          baseArchiveList.value.glAccountQueryDto
        );
        if (subjectList && subjectList.glAccounts) {
          const glAccountQueryDto = { glAccounts: subjectList.glAccounts };
          this.setDocBaseInfo({ glAccountQueryDto });
        }
        let entrys = this.doc.entrys;
        entrys[0]["accountingSubject"] = val;
        this.$set(this.doc, "entrys", entrys);
        this.forceRerender();
      },
      handleKeyboard(e) {
        //事件对象兼容
        let e1 =
          e || event || window.event || arguments.callee.caller.arguments[0];
        //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
        if (e1.keyCode == 37 || e1.keyCode == 39) {
        } else if (
          (e1.key && e1.key.toLowerCase() == "f4") ||
          e1.keyCode == 115
        ) {
          // 保存凭证模板
          this.saveTemplate();
          if (e1.preventDefault) {
            e1.preventDefault();
          }
          if (e1.stopPropagation) {
            e1.stopPropagation();
          }
        } else if (
          (e1.key && e1.key.toLowerCase() == "f3") ||
          e1.keyCode == 114
        ) {
          // 使用凭证模板
          const editStatus = this.editStatus;
          if (editStatus == consts.docConsts.ADD_STATUS) {
            this.handleTemplate();
          }
        } else if (
          (e1.key && e1.key.toLowerCase() == "f2") ||
          e1.keyCode == 113
        ) {
          // 删除分录行
          const _rowIndex = this.focusRowIndex,
            certificateStatus = this.doc.docStatus,
            row = this.$refs.xTable1.afterFullData[_rowIndex];

          if (
            certificateStatus == consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          ) {
            this.removeRow(row, _rowIndex);
          }

          //设置焦点
          setTimeout((_) => {
            let row = this.$refs.xTable1.afterFullData[_rowIndex],
              nextType;
            this.$refs.xTable1.setActiveCell(row, "summary");
          }, 0);
          if (e1.preventDefault) {
            e1.preventDefault();
          }
          if (e1.stopPropagation) {
            e1.stopPropagation();
          }
        } else if (
          (e1.key && e1.key.toLowerCase() == "f7") ||
          e1.keyCode == 118
        ) {
          // 插入分录行
          const _rowIndex = this.focusRowIndex || 0,
            certificateStatus = this.doc.docStatus,
            row = this.$refs.xTable1.afterFullData[_rowIndex];
          if (
            certificateStatus == consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          ) {
            this.insertRow(row, _rowIndex);
          }
          if (e1.preventDefault) {
            e1.preventDefault();
          }
          if (e1.stopPropagation) {
            e1.stopPropagation();
          }
        } else if (
          e1.ctrlKey &&
          !e1.altKey &&
          (e1.key == "m" || e1.keyCode == 77)
        ) {
          // 打开明细账
          const _rowIndex = this.focusRowIndex || 0,
            row = this.$refs.xTable1.afterFullData[_rowIndex];

          if (row.accountingSubject) {
            let option = this.getParamOption(row.accountingSubject);
            option.accessType = 1;

            const appName = "app-detailaccount-rpt";
            let win = top.window.frames[0];
            if (!!win) {
              if (!!window.postMessage) {
                window.parent.postMessage(
                  {
                    method: "taxSecondTabOpenApp",
                    data: {
                      title: "明细账",
                      appName,
                      appProps: option,
                    },
                  },
                  "*"
                );
              }
            }
          }
          if (e1.preventDefault) {
            e1.preventDefault();
          }
          if (e1.stopPropagation) {
            e1.stopPropagation();
          }
        }
        if (e1.altKey && (e1.key == "n" || e1.keyCode == 78)) {
          // 新增
          if (this.isDisplayButton("add")) {
            this.addDoc();
          }
        } else if (
          e1.ctrlKey &&
          !e1.altKey &&
          (e1.key == "s" || e1.keyCode == 83)
        ) {
          //保存 防止并发
          if (this.isDisplayButton("save")) {
            this.save(undefined, "快捷键");
          }
          if (e1.preventDefault) {
            e1.preventDefault();
          }
          if (e1.stopPropagation) {
            e1.stopPropagation();
          }
        } else if (
          (e1.key && e1.key.toLowerCase() == "f12") ||
          e1.keyCode == 123
        ) {
          //保存并新增 防止并发
          e1.preventDefault();
          if (this.isDisplayButton("save")) {
            this.saveAndNew(undefined, "快捷键");
          }
        } else if (
          (e1.key && e1.key.toLowerCase() == "f10") ||
          e1.keyCode == 121
        ) {
          // 新增科目
        } else if (
          e1.ctrlKey &&
          !e1.altKey &&
          (e1.key == "y" || e1.keyCode == 89)
        ) {
          //审核
          if (this.isDisplayButton("audit")) {
            this.audit();
          }
        } else if (
          e1.ctrlKey &&
          !e1.altKey &&
          (e1.key == ";" || e1.keyCode == 186)
        ) {
          //打印
          if (this.isDisplayButton("print")) {
            this.printDoc();
          }
        } else if (
          e1.key == "Enter" ||
          e1.keyCode == 13 ||
          e1.keyCode == 108 ||
          (e1.key == "Tab" && e1.keyCode == 9)
        ) {
        }
        //判断设备是否为mac
        else if (navigator.userAgent.indexOf("Mac OS X") !== -1) {
          if (
            e1.ctrlKey &&
            !e1.altKey &&
            (e1.key == "[" || e1.keyCode == 219)
          ) {
            //上一张
            this.loadPaging("prev");
          } else if (
            e1.ctrlKey &&
            !e1.altKey &&
            (e1.key == "]" || e1.keyCode == 221)
          ) {
            //下一张
            this.loadPaging("next");
          }
        } else {
          if (
            e1.ctrlKey &&
            !e1.altKey &&
            (e1.key == "[" || e1.keyCode == 37 || e1.keyCode == 219)
          ) {
            //219 win7 IE11下的keyCode
            //上一张
            this.loadPaging("prev");
          } else if (
            e1.ctrlKey &&
            !e1.altKey &&
            (e1.key == "]" || e1.keyCode == 39 || e1.keyCode == 221)
          ) {
            //221 win7 IE11下的keyCode
            //下一张
            this.loadPaging("next");
          }
        }
      },
      getVoucherStatus() {
        return this.doc.docStatus == consts.docConsts.STATUS_VOUCHER_AUDITED;
      },
      getVoucherEditStatus() {
        let res = false;
        if (this.editStatus == consts.docConsts.EDIT_STATUS) {
          res = true;
        } else if (this.editStatus == consts.docConsts.ADD_STATUS) {
          const arLes = this.doc.entrys.filter(
            (el) =>
              el.summary || el.accountingSubject || el.amountDr || el.amountCr
          );
          if (arLes && arLes.length > 0) {
            res = true;
          }
        }
        return res;
      },
      /**
       * 只对 isEdit=true 有效，用于重写选中编辑处理逻辑，该函数 Function({ row, rowIndex, column, columnIndex })
       * 可以返回 false 来阻止默认行为
       */
      editMethod({ row, column }) {
        // 重写默认的覆盖式，改为追加式
        this.$refs.xTable1.setActiveCell(row, column.property);
        // 返回 false 阻止默认行为
        return false;
      },

      /**
       * 该方法 Function({ row, rowIndex, column, columnIndex }) 的返回值
       * 用来决定该单元格是否允许编辑
       */
      activeCellMethod({ column, columnIndex }) {
        if (this.doc.docStatus == consts.docConsts.STATUS_VOUCHER_AUDITED) {
          return false;
        }
        return true;
      },
      editActivedEvent({ row, $rowIndex, column }, event) {
        if ($rowIndex) {
          this.focusRowIndex = $rowIndex;
        }
        if ($rowIndex > 0 && column.property === "summary" && !row.summary) {
          let preSummary = this.doc.entrys[$rowIndex - 1].summary;
          row.summary = preSummary;
        }
        this.keyAddRow($rowIndex);
      },
      editClosedEvent(info, event) {
        if (
          event &&
          event.code &&
          (event.code === "Enter" ||
            event.code === "NumpadEnter" ||
            event.code === "Tab")
        ) {
          // this.stimulateNextCell(info);
          const { row, rowIndex, column } = info;
          const field = this.getNextField(column.property);
          this.arrowOption(row, rowIndex, field, event.code);
        }
      },

      arrowOption(row, index, field, type) {
        if (type === "ArrowUp") {
          if (index === 0) return;
          index--;
          this.keyJump(index, field);
        } else if (type === "ArrowDown") {
          this.keyAddRow(index);
          index++;
          this.keyJump(index, field);
        } else if (
          type === "ArrowRight" ||
          type === "Tab" ||
          type === "Enter" ||
          type === "NumpadEnter"
        ) {
          this.keyAddRow(index);
          let nextField = field;
          if (type === "ArrowRight") {
            nextField = this.getNextField(field);
          }
          if (nextField === "summary") {
            index++;
          }
          this.keyJump(index, nextField);
        } else if (type === "ArrowLeft") {
          const prevField = this.getPrevField(field);
          if (prevField) {
            this.$refs.xTable1.setActiveCell(row, prevField);
          }
        }
      },
      keyAddRow(index) {
        const len = this.$refs.xTable1.afterFullData.length;
        if (index >= len - 2) {
          const details = this.doc.entrys;
          details.push({ ...entrysData });
          this.$set(this.doc, "entrys", details);
        }
      },
      getPrevField(c) {
        let n = "";
        switch (c) {
          case "amountCr":
            n = "amountDr";
            break;
          case "amountDr":
            n = "accountCode";
            break;
          case "accountCode":
            n = "summary";
            break;
          default:
            n = "";
        }
        return n;
      },
      keyJump(index, field) {
        const row = this.$refs.xTable1.afterFullData[index];
        if (field == "summary") {
          if (index > 0) {
            let preSummary = this.$refs.xTable1.afterFullData[index - 1]
              .summary;
            row.summary = preSummary;
          }
        }
        this.$refs.xTable1.setActiveCell(row, field);
      },

      getMsgList(msg) {
        return (
          <div
            style={{
              textAlign: "left",
              fontSize: "14px",
              display: "inline-block",
              verticalAlign: "top",
            }}
          >
            {msg.map((o, index) => (
              <p style={{ marginBottom: "0" }}>{index + 1 + "." + o}</p>
            ))}
          </div>
        );
      },

      /**
       * 切换借贷
       */
      switchCrDr(row, oldEntry, rowIndex, field) {
        this.$refs.xTable1.setActiveCell(row, field);
        if (row && row.accountingSubject) {
          if (this.editStatus != consts.docConsts.ADD_STATUS) {
            let entry = this.doc.entrys[rowIndex],
              amountCr = XEUtils.toNumber(entry.amountCr || 0),
              amountDr = XEUtils.toNumber(entry.amountDr || 0);
            if (amountCr != 0 || amountDr != 0) {
              this.reCaculateBalanceEdit(oldEntry, rowIndex);
            }
          } else {
            this.reCaculateBalance(rowIndex, false);
          }
          this.forceRerender();
        }
      },
      /**
       * 保存
       */
      async save() {
        //校验表单
        // alert(this.getVoucherEditStatus())
        this.fullValidEvent(); //表格自带的校验
        let errorMsg = this.checkVoucherDataBeforeSave(); //自定义校验，先保留。
        if (errorMsg.length > 0) {
          this.$baseMessage(this.getMsgList(errorMsg), "error");
          return;
        }
        let isNext = true;
        //校验资产类科目余额为负数的问题
        let assetMinsMsg = await this.checkAssetAccountMinus(this.doc);
        if (assetMinsMsg.length > 0) {
          await this.$confirm(
            `${assetMinsMsg.join(",")}余额为负数,是否确认保存?`,
            "温馨提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              isNext = true;
            })
            .catch((action) => {
              isNext = false;
            });
        }
        if (!isNext) return;
        //组装当前界面的数据
        let params = this.getCurDocData();
        params.isReturnValue = true;
        if (this.editStatus == consts.docConsts.ADD_STATUS) {
          //新增状态
          let response = await docCreate(params);
          if (response && response.error) {
            if (response.error.code == "9999") {
              this.$baseMessage("凭证保存失败，请重试", "error");
            } else {
              this.$baseMessage(response.error.message, "error");
            }
          } else {
            this.$baseMessage("凭证保存成功", "success");
            //保存凭证状态
            this.loadDoc(response.value, consts.docConsts.VIEW_STATUS, true);
            this.deletdocedEntrys = []; //清空
            const baseInfo = await docGetAllBaseInfos({
              isNotGetAccount: true,
              isNotGetCurrency: params.isNotGetCurrency == false ? false : true,
            });
            if (baseInfo && baseInfo.result) {
              let summaryList = baseInfo.value.summarys;
              let templateList = baseInfo.value.glDocTemplateDtos;
              baseInfo.value.summarys = [
                ...summaryList,
                ...this.translateTemplate(templateList),
              ];
              this.setDocBaseInfo(baseInfo.value);
            }
          }
        } else {
          //更新状态
          let response = await docUpdate(params);
          if (response && response.error) {
            if (response.error.code == "9999") {
              this.$baseMessage("凭证更新失败，请重试", "error");
            } else {
              this.$baseMessage(response.error.message, "error");
            }
          } else {
            this.$baseMessage("凭证更新成功", "success");
            //保存凭证状态
            this.loadDoc(response.value, consts.docConsts.VIEW_STATUS);

            this.deletedEntrys = []; //清空
            const baseInfo = await docGetAllBaseInfos({
              isNotGetAccount: true,
              isNotGetCurrency: params.isNotGetCurrency == false ? false : true,
            });
            if (baseInfo && baseInfo.result) {
              let summaryList = baseInfo.value.summarys;
              let templateList = baseInfo.value.glDocTemplateDtos;
              baseInfo.value.summarys = [
                ...summaryList,
                ...this.translateTemplate(templateList),
              ];
              this.setDocBaseInfo(baseInfo.value);
            }
          }
        }
      },

      /**
       * 保存并新增
       */
      async saveAndNew() {
        if (this.$refs.xTable1.getActiveRecord()) {
          this.$refs.xTable1.clearActived();
        }
        //校验表单
        this.fullValidEvent(); //表格自带的校验
        let errorMsg = this.checkVoucherDataBeforeSave(); //自定义校验，先保留。
        if (errorMsg.length > 0) {
          this.$baseMessage(this.getMsgList(errorMsg), "error");
          return;
        }
        let isNext = true;
        //校验资产类科目余额为负数的问题
        let assetMinsMsg = await this.checkAssetAccountMinus(this.doc);
        if (assetMinsMsg.length > 0) {
          await this.$confirm(
            `${assetMinsMsg.join(",")}余额为负数,是否确认保存?`,
            "温馨提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              isNext = true;
            })
            .catch((action) => {
              isNext = false;
            });
        }
        if (!isNext) return;
        //组装当前界面的数据
        let params = this.getCurDocData();
        params.isReturnValue = true;
        if (this.editStatus == consts.docConsts.ADD_STATUS) {
          //新增状态
          let response = await docCreate(params);
          if (response && response.error) {
            if (response.error.code == "9999") {
              this.$baseMessage("凭证保存失败，请重试", "error");
            } else {
              this.$baseMessage(response.error.message, "error");
            }
          } else {
            this.$baseMessage("凭证保存成功", "success");
            let voucherDate = response.value && response.value.voucherDate,
              year = voucherDate.split("-")[0],
              period = voucherDate.split("-")[1],
              option = { year: year, period: period, isReturnValue: true };
            let initDocData = await docInit(option);
            if (initDocData && initDocData.error) {
              this.$baseMessage(initDocData.error.message, "error");
              this.clearAndNewDoc(initDocData.value);
            } else {
              this.clearAndNewDoc(initDocData.value);
            }
            this.deletedEntrys = []; //清空
            const baseInfo = await docGetAllBaseInfos({
              isNotGetAccount: true,
              isNotGetCurrency: params.isNotGetCurrency == false ? false : true,
            });
            if (baseInfo && baseInfo.result) {
              let summaryList = baseInfo.value.summarys;
              let templateList = baseInfo.value.glDocTemplateDtos;
              baseInfo.value.summarys = [
                ...summaryList,
                ...this.translateTemplate(templateList),
              ];
              this.setDocBaseInfo(baseInfo.value);
            }
          }
        } else {
          //更新状态
          let response = await docUpdate(params);
          if (response && response.error) {
            if (response.error.code == "9999") {
              this.$baseMessage("凭证更新失败，请重试", "error");
            } else {
              this.$baseMessage(response.error.message, "error");
            }
          } else {
            this.$baseMessage("凭证更新成功", "success");
            let voucherDate = this.doc.voucherDate,
              year = voucherDate.split("-")[0],
              period = voucherDate.split("-")[1],
              option = { year: year, period: period, isReturnValue: true };
            let initDocData = await docInit(option);
            if (initDocData && initDocData.error) {
              this.$baseMessage(initDocData.error.message, "error");
              this.clearAndNewDoc(initDocData.value);
            } else {
              this.clearAndNewDoc(initDocData.value);
            }

            this.deletedEntrys = []; //清空
            const baseInfo = await docGetAllBaseInfos({
              isNotGetAccount: true,
              isNotGetCurrency: params.isNotGetCurrency == false ? false : true,
            });
            if (baseInfo && baseInfo.result) {
              let summaryList = baseInfo.value.summarys;
              let templateList = baseInfo.value.glDocTemplateDtos;
              baseInfo.value.summarys = [
                ...summaryList,
                ...this.translateTemplate(templateList),
              ];
              this.setDocBaseInfo(baseInfo.value);
            }
          }
        }
      },

      //把服务端返回的字段名, 做转换
      translateTemplate(templates) {
        let templateList = [];
        for (let i = 0; i < templates.length; i++) {
          templateList.push({
            id: templates[i].docTemplateId,
            code: templates[i].docTemplateCode,
            name: templates[i].docTemplateName + " [模板]",
            type: "template",
          });
        }

        return templateList;
      },
      /**
       * 清空
       */
      async reset() {
        let subjectList,
          certificateDate = this.doc.voucherDate,
          year = certificateDate.split("-")[0],
          period = certificateDate.split("-")[1],
          option = { year: year, period: period, isReturnValue: true },
          enabledYearMonth = "";
        // enabledYearMonth = this.getEnabledYearMonth(),
        // baseArchiveList = await docGetAllBaseInfos({ isNotGetAccount: true, isNotGetCurrency: true })

        const initDocData = await docInit(option);

        if (
          initDocData.result == false &&
          initDocData.error &&
          initDocData.error.code == "70002"
        ) {
          this.$baseMessage(initDocData.error.message, "error");
          this.clearAndNewDoc(initDocData.value, subjectList, null);
        } else {
          this.clearAndNewDoc(initDocData.value, subjectList, null);
          setTimeout((_) => {
            let row = this.$refs.xTable1.afterFullData[0],
              nextType;
            this.$refs.xTable1.setActiveCell(row, "summary");
          }, 0);
        }
        this.$refs.xTable1.hideColumn(
          this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
        );
      },
      /**
       * 清空当前单据状态,并进入新建状态(重建一个getEmptyDoc)
       */
      clearAndNewDoc(newDocData, subjectList, currencyDS) {
        let dateTemp = this.doc.voucherDate;
        let isAutoEqualAmount = this.isAutoEqualAmount;
        //这里执行了清除动作
        Object.assign(this.$data, this.$options.data());
        if (newDocData.docId) {
          this.$set(this.doc, "docId", newDocData.docId);
        }
        this.isAutoEqualAmount = isAutoEqualAmount;
        this.$set(this.doc, "voucherDate", newDocData.voucherDate || dateTemp);
        if (newDocData.docCode) {
          this.$set(this.doc, "docCode", newDocData.docCode);
        }
        const pickerOptions = {
          disabledDate: (v) => {
            let _disabledDate = new Date(this.getEnabledYearMonth());
            return this.isEarlyThan(_disabledDate, v);
          },
        };

        this.pickerOptions = pickerOptions;
        if (subjectList && subjectList.glAccounts) {
          const glAccountQueryDto = { glAccounts: subjectList.glAccounts };
          this.setDocBaseInfo({ glAccountQueryDto });
        }
        if (currencyDS) {
          this.setDocBaseInfo({ currencyDtos: currencyDS });
        }
        this.setEmptyRow();
        this.forceRerender();
      },
      forceRerender(changeFocus) {
        if (event && event.type == "blur") {
          this.setVoucherStatus(this.getVoucherEditStatus());
        }
        this.renderComponent = false;
        this.$nextTick().then(() => {
          this.renderComponent = true;
        });
      },
      /**
       *
       * @param {凭证校验} form
       */
      checkVoucherDataBeforeSave() {
        let msg = [],
          allItemEmpty = true,
          isBackCaculate = false,
          form = this.doc,
          details = this.doc.entrys;

        //凭证号校验
        if (!form.docCode) {
          msg.push("凭证号不能为空");
        } else if (!/^\d+$/.test(form.docCode)) {
          msg.push("凭证号必须为纯数字，请修改");
        }
        if (form.docCode === "0") {
          msg.push("凭证号不能为0，请修改");
        }
        if (!form.voucherDate) {
          msg.push("日期不能为空");
        }
        details.forEach((detail, i) => {
          if (
            !detail ||
            (!detail.accountingSubject &&
              !detail.summary &&
              !detail.amountCr &&
              !detail.amountDr) ||
            (!detail.accountingSubject &&
              detail.summary &&
              !detail.amountCr &&
              !detail.amountDr)
          ) {
            return;
          }
          allItemEmpty = false;
          //凭证号校验
          //摘要、科目和金额 同时填写或不填
          let emptyItemNames = [];
          if (!detail.summary) {
            emptyItemNames.push("摘要");
          }
          if (
            !detail.accountingSubject ||
            (detail.accountingSubject && detail.accountingSubject.length < 1)
          ) {
            emptyItemNames.push("科目");
          }
          if (!detail.amountCr && !detail.amountDr) {
            emptyItemNames.push("金额");
          }
          if (emptyItemNames.length > 0) {
            let rowError;
            if (emptyItemNames.length > 2) {
              rowError = "摘要、科目和金额";
            } else if (emptyItemNames.length == 2) {
              rowError = emptyItemNames[0] + "和" + emptyItemNames[1];
            } else {
              rowError = emptyItemNames[0];
            }
            msg.push("第" + (i + 1) + "行，请填写" + rowError);
            return;
          }
          if (detail.summary && detail.summary.length > 200)
            msg.push("第" + (i + 1) + "行，摘要输入过长，请调整");

          // 数量/外币 核算
          if (
            detail.accountingSubject &&
            detail.accountingSubject.isCalcQuantity &&
            (!detail.quantityAndForeignCurrency ||
              !detail.quantityAndForeignCurrency.amount)
          ) {
            let lastFocusPath = this.originalFieldPath,
              rowIndex = lastFocusPath ? lastFocusPath.split(",")[1] : -1,
              lastEditField;
            // 解决360、IE、Edge浏览器下保存时借贷方金额未反算的问题 TTK-3055
            if (lastFocusPath && rowIndex == i) {
              if (lastFocusPath && lastFocusPath.indexOf("amountDr") != -1) {
                lastEditField = "amountDr";
              } else if (
                lastFocusPath &&
                lastFocusPath.indexOf("amountCr") != -1
              ) {
                lastEditField = "amountCr";
              } else {
                lastEditField = undefined;
              }
              let newDetail = { ...details[rowIndex] };
              newDetail["quantityAndForeignCurrency"]["amount"] =
                detail[lastEditField];
              this.$set(details, rowIndex, newDetail);
              isBackCaculate = true;
            } else {
              msg.push("第" + (i + 1) + "行，请填写数量核算");
              return;
            }
          }
          if (
            detail.accountingSubject &&
            detail.accountingSubject.isCalcMulti &&
            (!detail.quantityAndForeignCurrency ||
              !detail.quantityAndForeignCurrency.currency)
          ) {
            msg.push("第" + (i + 1) + "行，请填写外币核算");
            return;
          }
          //4) 启用辅助核算
          if (detail.accountingSubject && detail.accountingSubject.isCalc) {
            if (!detail.accountingSubject.auxAccountSubjects) {
              msg.push("第" + (i + 1) + "行，请填写科目辅助核算");
              return;
            }
            let auxAccountSubjects =
              detail.accountingSubject.auxAccountSubjects;
            //部门
            if (
              detail.accountingSubject.isCalcDepartment &&
              !(auxAccountSubjects && auxAccountSubjects.departmentId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写部门辅助核算");
              return;
            }
            //人员
            if (
              detail.accountingSubject.isCalcPerson &&
              !(auxAccountSubjects && auxAccountSubjects.personId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写人员辅助核算");
              return;
            }
            //客户
            if (
              detail.accountingSubject.isCalcCustomer &&
              !(auxAccountSubjects && auxAccountSubjects.customerId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写客户辅助核算");
              return;
            }
            //供应商
            if (
              detail.accountingSubject.isCalcSupplier &&
              !(auxAccountSubjects && auxAccountSubjects.supplierId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写供应商辅助核算");
              return;
            }
            //存货
            if (
              detail.accountingSubject.isCalcInventory &&
              !(auxAccountSubjects && auxAccountSubjects.inventoryId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写存货辅助核算");
              return;
            }
            //项目
            if (
              detail.accountingSubject.isCalcProject &&
              !(auxAccountSubjects && auxAccountSubjects.projectId)
            ) {
              msg.push("第" + (i + 1) + "行，请填写项目辅助核算");
              return;
            }
            //自定义档案
            let calcDict = this.calcDict;
            for (var j = 1; j <= 10; j++) {
              if (
                detail.accountingSubject[`isExCalc${j}`] &&
                !auxAccountSubjects[`exCalc${j}`]
              ) {
                let userDefineItemName = calcDict[`isExCalc${j}`];
                msg.push(
                  "第" + (i + 1) + `行，请填写${userDefineItemName}辅助核算`
                );
                return;
              }
            }
          }
        });
        if (isBackCaculate) {
          this.$set(this.doc, "entrys", [...details]);
        }
        //不能全为空行
        if (allItemEmpty) {
          msg.push("请填写凭证分录");
        } else {
          //) 借贷平衡
          let debitSum = 0,
            creditSum = 0;
          for (let item of details) {
            let debitAmountItem = parseInt(
                (parseFloat(item.amountDr || 0) * 100).toFixed(0)
              ),
              creditAmountItem = parseInt(
                (parseFloat(item.amountCr || 0) * 100).toFixed(0)
              );
            debitSum =
              (parseInt((debitSum * 100).toFixed(0)) + debitAmountItem) / 100;
            creditSum =
              (parseInt((creditSum * 100).toFixed(0)) + creditAmountItem) / 100;
          }
          if (debitSum.toFixed(2) !== creditSum.toFixed(2)) {
            msg.push("凭证借贷不平");
          }
        }
        return msg;
      },
      /**
       * 保存时增加校验资产类负值
       */
      async checkAssetAccountMinus() {
        let entrys = this.doc.entrys,
          msg = [];
        for (let index = 0; index < entrys.length; index++) {
          const entry = entrys[index],
            accountingSubject = entry.accountingSubject;

          if (
            accountingSubject &&
            accountingSubject.accountTypeId == 5000010001 &&
            accountingSubject.isShowBalance &&
            !msg.includes(accountingSubject.codeAndName) &&
            Number(accountingSubject.balance || 0) < 0
          ) {
            msg.push(accountingSubject.codeAndName);
          }
        }
        return msg;
      },
      /**
       * 组装当前界面的数据,供新增接口
       */
      getCurDocData() {
        let doc = this.doc;
        let certificate = { ...doc };

        const enclosures = certificate.enclosures;
        if (enclosures && enclosures.length > 0) {
          certificate.enclosures = this.getEnclosures(enclosures, "get");
        }
        if (doc.docId) {
          certificate.docId = doc.docId;
        }
        //是否修改过凭证号
        certificate.isModifiedDocCode =
          certificate.docCode != doc.initVoucherCode;
        //凭证号小于4为自动补0
        certificate.docCode = `${doc.docCode}`.padStart(5, "0");
        //考虑修改的情况: 单据id
        let oldId = doc.docId;
        if (oldId) {
          certificate.docId = oldId;
          certificate.ts = doc.ts;
        }

        let entrys = [],
          details = doc.entrys;
        for (let item of details) {
          let entry = this.convertVoucherItemForServer(item, true);

          if (
            certificate.isNotGetCurrency != false &&
            item.currencyForUpdateRate
          ) {
            certificate.isNotGetCurrency = false;
          }

          if (entry) {
            entrys.push(entry);
          }
        }

        //考虑修改的情况: 删除分录
        let deletedEntrys = this.deletedEntrys;
        if (deletedEntrys && deletedEntrys.length > 0) {
          for (let delEntry of deletedEntrys) {
            entrys.push({ id: delEntry.id, rowStatus: 3, ts: delEntry.ts });
          }
        }
        certificate.entrys = entrys;
        let currentUser = this.$store.state.routes.user;
        certificate.creator = currentUser.nickname;
        return certificate;
      },
      convertVoucherItemForServer(item, isForUpdate) {
        if (!item || !item.accountingSubject) {
          return undefined;
        }
        //如果需要数量/外币 核算,但是没有填写
        if (
          (item.accountingSubject.isCalcQuantity ||
            item.accountingSubject.isCalcMulti) &&
          !item.quantityAndForeignCurrency
        ) {
          return undefined;
        }
        //如果需要辅助核算,但是没有填写
        if (
          item.accountingSubject.isCalc &&
          !item.accountingSubject.auxAccountSubjects
        ) {
          return undefined;
        }
        let entry = {
          id: item.id ? item.id : null,
          summary: item.summary,
          accountCode: item.accountCode,
          accountId: item.accountingSubject.id
            ? item.accountingSubject.id
            : null,
          origAmountDr: item.amountDr == undefined ? null : item.amountDr,
          amountDr: item.amountDr == undefined ? null : item.amountDr,
          origAmountCr: item.amountCr == undefined ? null : item.amountCr,
          amountCr: item.amountCr == undefined ? null : item.amountCr,
          ts: item.ts ? item.ts : null,
          inPutTaxDeductId: item.inPutTaxDeductId
            ? item.inPutTaxDeductId
            : null,
          ...item.accountingSubject,
        };

        //考虑修改的情况: 修改分录
        if (isForUpdate) {
          if (item.id) {
            entry.id = item.id;
            entry.rowStatus = 2;
            entry.ts = item.ts;
          } else {
            entry.rowStatus = 1; //--分录状态 0:未变化  1:新增  2:修改  3:删除
          }
        }

        //数量辅助核算
        if (item.accountingSubject.isCalcQuantity) {
          entry.quantity = item.quantityAndForeignCurrency.quantity;
          entry.price = item.quantityAndForeignCurrency.price;
          entry.unitId = item.accountingSubject.unitId; //计量单位, 暂不支持编辑, 所以用科目里设置的即可
          entry.exchangeRate = 1;
        } else {
          entry.quantity = null;
          entry.price = null;
          entry.unitId = null;
          entry.exchangeRate = null;
        }

        //外币辅助核算
        if (item.accountingSubject.isCalcMulti) {
          entry.currencyId = item.quantityAndForeignCurrency.currency
            ? item.quantityAndForeignCurrency.currency.id
            : "";
          entry.exchangeRate = item.quantityAndForeignCurrency.exchangeRate;
          if (entry.amountDr) {
            entry.origAmountDr =
              item.quantityAndForeignCurrency.origAmount || 0;
          } else {
            entry.origAmountCr =
              item.quantityAndForeignCurrency.origAmount || 0;
          }
        } else {
          entry.currencyId = null;
          entry.exchangeRate = 1;
          entry.origAmountDr = null;
          entry.origAmountCr = null;
        }
        let auxAccountSubjects = item.accountingSubject.auxAccountSubjects;
        entry = { ...entry, ...auxAccountSubjects };
        if (item.currencyForUpdateRate) {
          entry.currencyForUpdateRate = item.currencyForUpdateRate;
        } else {
          entry.currencyForUpdateRate = null;
        }
        entry.accountingSubject = undefined;
        entry.auxAccountSubjects = undefined;
        entry.activeAuxPopoverList = undefined;
        return entry;
      },

      getEnclosures(attachmentFiles, type) {
        let enclosures = [];
        let fileList = attachmentFiles || [];

        if (fileList && fileList.length > 0) {
          fileList.map((o) => {
            enclosures.push({
              fileId: o.id,
              file: {
                id: o.id,
                type: o.type,
                alt: o.alt,
                name: o.name,
                ts: o.ts,
                accessUrl: o.accessUrl,
              },
              operateStatus: 1,
            });
            return enclosures;
          });
        }
        if (type == "get") {
          //
        }
        this.setAttachmentFilesState(
          enclosures,
          undefined,
          fileList ? fileList.length : undefined
        );
        return enclosures;
      },
      /**
       * 设置附件状态, 或者从服务端返回的附件数据
       */
      setAttachmentFilesState(file, ts, attachedNum) {
        let isAttachCount = this.doc.attachedNum != 0 ? false : true,
          attachCount = this.doc.attachedNum,
          editStatus = this.editStatus,
          enclosures = [];

        if (file && file.length > 0) {
          enclosures = file.map((o) => {
            return {
              alt: o.name || o.file.originalName || o.file.name,
              id: o.id || o.file.id,
              type: o.type || o.file.type,
              name: o.name || o.file.originalName || o.file.name,
              ts: o.ts || o.file.ts,
              accessUrl: o.accessUrl || o.file.accessUrl,
            };
          });
        }
        if (attachedNum > -1) {
          this.$set(this.doc, "attachedNum", attachedNum);
        } else {
          if (isAttachCount || file.length >= attachCount) {
            this.$set(this.doc, "attachedNum", file.length);
          }
        }
        if (!!ts) {
          this.$set(this.doc, "ts", ts);
        }
        this.$set(this.doc, "enclosures", enclosures);
      },
      /**
       * 加载新的凭证数据, 或者从服务端返回的数据
       */
      loadDoc(docData, editStatus, isShow = false) {
        let newDoc = {
          docId: docData.docId,
          docCode: `${docData.docCode}`.padStart(5, "0"),
          voucherDate: docData.voucherDate,
          docType: docData.docType,
          attachedNum: docData.attachedNum,
          note: docData.note || "",
          creatorId: docData.creatorId,
          treasurer: docData.treasurer,
          creator: docData.creator,
          auditorId: docData.auditorId,
          auditor: docData.auditor,
          docStatus: docData.voucherState,
          certificateStatusName: docData.voucherStateName,
          ts: docData.ts,
          redSourceDocId: docData.redSourceDocId || undefined,
          voucherSource: docData.sourceVoucherCode || "",
          sourceVoucherId: docData.sourceVoucherId || "",
          sourceVoucherTypeId: docData.sourceVoucherTypeId || "",
          enclosures: this.convertToAttachmentFiles(
            docData.enclosures ? docData.enclosures : []
          ),
          isAttachCount: docData.attachedNum != 0 ? false : true,
        };
        let details = [],
          preEntrys = this.doc.entrys,
          entrys = docData.entrys,
          dymicColTypes = { isCalcMulti: false, isCalcQuantity: false };
        for (let i = 0; i < entrys.length; i++) {
          let entry = entrys[i];
          let quantityAndForeignCurrencyData = {
            quantity: entry.quantity,
            price: entry.price,
          };
          let detail = this.getVoucherItemFromEntry(
            entry,
            quantityAndForeignCurrencyData
          );
          if (isShow) {
            //凭证保存后，余额显示需要和录入得时候保持一致
            let oldEntry = preEntrys[i];
            let curAccountSubject = detail.accountingSubject;
            if (curAccountSubject) {
              curAccountSubject["balance"] =
                oldEntry["accountingSubject"]["balance"];
              curAccountSubject["initBalance"] =
                oldEntry["accountingSubject"]["initBalance"];

              if (oldEntry["accountingSubject"]["isShowBalance"]) {
                curAccountSubject["isShowBalance"] =
                  oldEntry["accountingSubject"]["isShowBalance"];
              }
            } //设置余额部分先注释掉
            detail.accountingSubject = curAccountSubject;
          }
          //detail.accountingSubject有为Null的情况
          if (detail.accountingSubject) {
            if (detail.accountingSubject.isCalcMulti) {
              dymicColTypes["isCalcMulti"] = true;
            } else if (detail.accountingSubject.isCalcQuantity) {
              dymicColTypes["isCalcQuantity"] = true;
            }
          }

          details.push(detail);
        }
        if (details.length < 10) {
          let moreEntrys = [];
          for (let i = 0; i < 10 - details.length; i++) {
            details.push({ ...entrysData });
          }
          details = details.concat(moreEntrys);
        }
        newDoc.entrys = details;
        this.doc = newDoc;
        //检查是否需要显示"数量/外币"字段
        if (dymicColTypes["isCalcMulti"] || dymicColTypes["isCalcQuantity"]) {
          this.$refs.xTable1.showColumn(
            this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
          );
          this.getQuantityAndCurrentTitle();
        } else {
          this.$refs.xTable1.hideColumn(
            this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
          );
        }
        this.setAuxPopoverShow(false); //互斥
        this.setEmptyRow();
        this.forceRerender();
        setTimeout(() => {
          this.changeStatus(editStatus, this.doc.docStatus);
        });
      },
      /**
       * 调用此接口需要保证主结构数据绑定后再进行
       */
      getQuantityAndCurrentTitle() {
        const entrys = this.doc.entrys,
          dymicColTypes = { isCalcMulti: false, isCalcQuantity: false };
        for (let entry of entrys) {
          if (entry.accountingSubject && entry.accountingSubject.isCalcMulti) {
            dymicColTypes["isCalcMulti"] = true;
          }
          if (
            entry.accountingSubject &&
            entry.accountingSubject.isCalcQuantity
          ) {
            dymicColTypes["isCalcQuantity"] = true;
          }
        }
        if (dymicColTypes["isCalcMulti"] && dymicColTypes["isCalcQuantity"]) {
          this.qfcColTitle = "数量/外币";
        } else if (dymicColTypes["isCalcMulti"]) {
          this.qfcColTitle = "外币";
        } else {
          this.qfcColTitle = "数量";
        }
      },
      //修改单据状态
      changeStatus(editStatus, docStatus, sourceDocCode) {
        this.editStatus = editStatus || consts.docConsts.ADD_STATUS;
        this.$set(
          this.doc,
          "docStatus",
          docStatus || consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
        );
      },
      convertToAttachmentFiles(file) {
        let attachmentFiles = [];

        if (file && file.length > 0) {
          file.map((o) => {
            attachmentFiles.push({
              alt: o.name || o.file.name,
              id: o.id,
              type: o.type || o.file.type,
              fileId: o.fileId,
              name: o.name || o.file.originalName,
              ts: o.ts || o.file.ts,
              accessUrl: o.accessUrl || o.file.accessUrl,
            });
            return attachmentFiles;
          });
        }

        return attachmentFiles;
      },
      fullValidEvent() {
        this.$refs.xTable1.fullValidate((errMap) => {
          if (errMap) {
            let msgList = [];
            Object.values(errMap).forEach((errList) => {
              errList.forEach((params) => {
                let { rowIndex, column, rules } = params;
                rules.forEach((rule) => {
                  msgList.push(
                    `第 ${rowIndex} 行 ${column.title} 校验错误：${rule.message}`
                  );
                });
              });
            });
            this.$XModal.message({
              status: "error",
              message: (h) => {
                return [
                  h(
                    "div",
                    {
                      class: "red",
                      style: {
                        maxHeight: "400px",
                        overflow: "auto",
                      },
                    },
                    msgList.map((msg) => h("div", msg))
                  ),
                ];
              },
            });
          }
        });
      },
      //增行
      insertRow(row, rowIndex) {
        const editStatus = this.editStatus,
          certificateStatus = this.doc.docStatus; //审核反审核
        let newEntrys = this.doc.entrys;
        // this.$refs.xTable1.insert({ ...entrysData }, '');
        //快捷键增加行，已审核直接返回
        if (certificateStatus == consts.docConsts.STATUS_VOUCHER_AUDITED) {
          return;
        }
        this.editStatus =
          editStatus == consts.docConsts.ADD_STATUS
            ? consts.docConsts.ADD_STATUS
            : consts.docConsts.EDIT_STATUS;
        newEntrys.splice(rowIndex, 0, { ...entrysData });
        this.doc.entrys = newEntrys;
        this.forceRerender();
      },
      //删行
      removeRow(entry, rowIndex) {
        this.$refs.xTable1.remove(entry);
        const editStatus = this.editStatus,
          certificateStatus = this.doc.docStatus; //审核反审核
        //快捷键删除行，已审核直接返回
        if (certificateStatus == consts.docConsts.STATUS_VOUCHER_AUDITED) {
          return;
        }
        if (!entry) {
          return;
        }
        if (entry["id"] && editStatus != consts.docConsts.ADD_STATUS) {
          this.deletedEntrys.push(entry);
        }
        this.editStatus =
          editStatus == consts.docConsts.ADD_STATUS
            ? consts.docConsts.ADD_STATUS
            : consts.docConsts.EDIT_STATUS;
        //删除行进行余额计算
        if (editStatus != consts.docConsts.ADD_STATUS) {
          //编辑凭证，余额联动计算
          let amount = 0,
            accountingSubject = entry["accountingSubject"];
          if (accountingSubject && accountingSubject.isShowBalance) {
            let balance = XEUtils.toNumber(accountingSubject["balance"]);
            if (
              accountingSubject["balanceDirection"] ==
              consts.docConsts.DIRECTION_DEBIT
            ) {
              //借
              amount =
                XEUtils.toNumber(entry["amountDr"]) -
                XEUtils.toNumber(entry["amountCr"]);
            } else {
              amount =
                XEUtils.toNumber(entry["amountDr"]) +
                XEUtils.toNumber(entry["amountCr"]);
            }
            balance = (balance - XEUtils.toNumber(amount)).toFixed(2);
            const entrys = this.doc.entrys;
            this.updateEntrysBalance(rowIndex, false, entrys, balance);
          }
        } else {
          this.reCaculateBalance(rowIndex, true);
        }
        this.setEmptyRow();
        this.forceRerender();
        this.$delete(this.doc.entrys, rowIndex);
      },
      //上移
      moveRowUp(row, rowIndex) {
        const editStatus = this.editStatus;
        const temp = this.doc.entrys[rowIndex];
        if (rowIndex > 0 && rowIndex < this.doc.entrys.length) {
          this.doc.entrys.splice(rowIndex, 1);
          this.doc.entrys.splice(rowIndex - 1, 0, temp);
        }
        this.editStatus =
          editStatus == consts.docConsts.ADD_STATUS
            ? consts.docConsts.ADD_STATUS
            : consts.docConsts.EDIT_STATUS;
        this.forceRerender();
      },
      //下移
      moveRowDown(row, rowIndex) {
        const editStatus = this.editStatus;
        const temp = this.doc.entrys[rowIndex];
        if (rowIndex >= 0 && rowIndex < this.doc.entrys.length - 1) {
          this.doc.entrys.splice(rowIndex, 1);
          this.doc.entrys.splice(rowIndex + 1, 0, temp);
        }
        this.editStatus =
          editStatus == consts.docConsts.ADD_STATUS
            ? consts.docConsts.ADD_STATUS
            : consts.docConsts.EDIT_STATUS;
        this.forceRerender();
      },
      rowDrop() {
        //上移下移
        this.$nextTick(() => {
          let xTable = this.$refs.xTable1;
          this.sortable = Sortable.create(
            xTable.$el.querySelector(".body--wrapper>.vxe-table--body tbody"),
            {
              handle: ".drag-btn",
              onEnd: ({ newIndex, oldIndex }) => {
                let currRow = this.doc.entrys.splice(oldIndex, 1)[0];
                this.doc.entrys.splice(newIndex, 0, currRow);
              },
            }
          );
        });
      },
      footerMethod({ columns, data }) {
        // columns = ['summary', 'accountCode', 'amountDr', 'amountCr']
        return [
          columns.map((column, columnIndex) => {
            switch (column.property) {
              case "summary":
                return (
                  "合计：" +
                  this.moneySmalltoBig(`${XEUtils.sum(data, "amountDr")}`)
                );
              case "amountDr":
                return `${XEUtils.sum(data, "amountDr")}`;
              case "amountCr":
                return `${XEUtils.sum(data, "amountCr")}`;
            }
          }),
        ];
      },

      moneySmalltoBig(money) {
        //贷方金额为负时未处理
        let cnNums = new Array(
            "零",
            "壹",
            "贰",
            "叁",
            "肆",
            "伍",
            "陆",
            "柒",
            "捌",
            "玖"
          ), //汉字的数字
          cnIntRadice = new Array("", "拾", "佰", "仟"), //基本单位
          cnIntUnits = new Array("", "万", "亿", "兆"), //对应整数部分扩展单位
          cnDecUnits = new Array("角", "分", "毫", "厘"), //对应小数部分单位
          cnInteger = "整", //整数金额时后面跟的字符
          cnIntLast = "元", //整型完以后的单位
          maxNum = 999999999999999.9999, //最大处理的数字
          IntegerNum, //金额整数部分
          DecimalNum, //金额小数部分
          ChineseStr = "", //输出的中文金额字符串
          parts, //分离金额后用的数组，预定义
          zeroCount,
          IntLen;

        if (money === "") {
          return "";
        }

        money = parseFloat(money);
        //alert(money);
        if (money >= maxNum) {
          $.alert("超出最大处理数字");
          return "";
        }
        if (money == 0) {
          ChineseStr = cnNums[0] + cnIntLast + cnInteger;
          return ChineseStr;
        }

        money = money.toString(); //转换为字符串

        if (money.indexOf(".") == -1) {
          if (money > 0) {
            IntegerNum = money;
          } else {
            var tempInteger = money.split("");
            tempInteger.splice(0, 1);
            IntegerNum = tempInteger.join("");
          }
          DecimalNum = "";
        } else {
          if (money.split(".")[1].length > 2) {
            money = parseFloat(money).toFixed(2);
          }
          parts = money.split(".");
          if (money > 0) {
            IntegerNum = parts[0];
          } else {
            var tempInteger = parts[0].split("");
            tempInteger.splice(0, 1);
            IntegerNum = tempInteger.join("");
          }
          DecimalNum = parts[1].substr(0, 4);
        }
        if (parseInt(IntegerNum, 10) > 0) {
          //获取整型部分转换
          zeroCount = 0;
          IntLen = IntegerNum.length;
          for (let i = 0; i < IntLen; i++) {
            let n = IntegerNum.substr(i, 1);
            let p = IntLen - i - 1;
            let q = p / 4;
            let m = p % 4;
            if (n == "0") {
              zeroCount++;
            } else {
              if (zeroCount > 0) {
                ChineseStr += cnNums[0];
              }
              zeroCount = 0; //归零
              ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
              ChineseStr += cnIntUnits[q];
            }
          }
          ChineseStr += cnIntLast;
          //整型部分处理完毕
        }
        if (DecimalNum != "") {
          //小数部分
          let decLen = DecimalNum.length;
          for (let i = 0; i < decLen; i++) {
            let n = DecimalNum.substr(i, 1);
            if (n != "0") {
              ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
          }
        }
        if (ChineseStr == "") {
          ChineseStr += cnNums[0] + cnIntLast + cnInteger;
        } else if (DecimalNum == "") {
          ChineseStr += cnInteger;
        }

        if (money < 0) {
          ChineseStr = `负${ChineseStr}`;
        }

        return ChineseStr;
      },
      // 计算逻辑
      handleSummary(children) {
        return {
          num: XEUtils.sum(children, "num"),
          level: Math.floor(XEUtils.sum(children, "level")),
          age: parseInt(XEUtils.mean(children, "age")),
          rate: XEUtils.sum(children, "rate"),
        };
      },
      footerClassName({ $rowIndex, column, columnIndex }) {
        return "glVoucherList-col-blue";
      },
      footerRowspanMethod({
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        data,
      }) {
        if ($rowIndex === 0) {
          if (columnIndex === 1) {
            return { colspan: 2 };
          } else if (columnIndex === 2) {
            return { colspan: 0 };
          }
        }
      },
      getActionUrl() {
        return "/v1/edf/file/upload?token=" + this.$baseAccessToken();
      },
      async attachmentChange(file, fileList) {
        if (file.status == "success") {
          //附件上传成功事件处理
          let response = file.response && file.response.value;
          if (
            response.type != "1000010001" &&
            response.type != "1000010002" &&
            response.type != "1000010003" &&
            response.type != "1000010004" &&
            response.type != "1000010005" &&
            response.type != "1000010006"
          ) {
            this.$baseMessage("此文件类型不支持上传", "error");
            return false;
          }

          let fileList = this.doc.enclosures;
          fileList.push({
            accessUrl: response.accessUrl,
            ts: response.ts || "",
            type: response.type,
            name: response.originalName,
            id: response.id,
          });
          //凭证已经存在
          if (this.editStatus !== consts.docConsts.ADD_STATUS) {
            let enclosures = [];
            enclosures.push({
              fileId: response.id,
              operateStatus: 1,
              file: {
                id: response.id,
                type: response.type,
              },
            });
            let fileData = { docId: this.doc.docId, enclosures: enclosures },
              data = await updateEnclosure(fileData);
            if (data && data.result) {
              let newEnclosures = data.value.enclosures;
              this.doc.enclosures = newEnclosures;
              this.doc.attachedNum = newEnclosures.length;
              this.editStatus = consts.docConsts.EDIT_STATUS;
            }
          } else {
            //凭证不存在
            this.doc.enclosures = fileList;
            this.doc.attachedNum = fileList.length;
          }
        }
      },
      beforeUpload(file) {
        const isLt10M = file.size / 1024 / 1024 < 20;

        if (file.size && !isLt10M) {
          this.$baseMessage("文件过大，请上传小于20兆的附件", "error");
          return false;
        }

        if (this.doc.enclosures.length == 20) {
          this.$baseMessage("附件凭证数最多为20", "error");
          return false;
        }
      },
      handleError(err, file, fileList) {},
      handleSuccess(response, file, fileList) {},
      handleRemove(file, fileList) {},
      handlePreview(file) {},
      handleDownload(file) {
        let targetMode,
          requestUrl = file.accessUrl;
        if (env.isClientMode()) {
          targetMode = "_self";
        } else {
          targetMode = "_blank";
        }
        window.open(requestUrl, targetMode);
      },
      handleDelete(file) {
        this.$baseConfirm("确认删除?", null, async () => {
          if (this.editStatus !== consts.docConsts.ADD_STATUS) {
            let enclosures = [];
            enclosures.push({
              id: file.id,
              operateStatus: 3,
              ts: file.ts,
              file: {
                type: file.type,
              },
            });
            let params = { docId: this.doc.docId, enclosures };
            const { result } = await updateEnclosure(params);
            if (result) {
              this.editStatus = consts.docConsts.EDIT_STATUS;
              this.delAttachOption(file);
            }
          } else {
            this.delAttachOption(file);
          }
        });
      },
      delAttachOption(file) {
        for (let i in this.doc.enclosures) {
          if (this.doc.enclosures[i].fileId === file.fileId) {
            this.doc.enclosures.splice(i, 1);
            break;
          }
        }
        this.doc.attachedNum--;
        this.$baseMessage("删除成功", "success");
      },
      moneyChange(entry, index, type) {
        const oldEntry = Object.assign({}, this.doc.entrys[index]),
          oldValue = oldEntry[type];
        let newValue = XEUtils.toNumber(entry[type]);
        if (newValue > 9999999999.99) {
          newValue = 9999999999.99;
        } else if (newValue < -9999999999.99) {
          newValue = -9999999999.99;
        }
        entry[type] = newValue;
        this.focusRowIndex = index;
        this.editcb(entry, index, ["amountDr", "amountCr"]);
        this.onAmountBlur(oldEntry, oldValue, newValue, index, type);
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.changeStatus(consts.docConsts.EDIT_STATUS, this.doc.editStatus);
        }
        this.forceRerender();
      },
      /**
       * 金额失去焦点，反算外币
       */
      onAmountBlur(oldEntry, oldValue, newValue, rowIndex, type) {
        const editStatus = this.editStatus;
        let entry = this.doc.entrys[rowIndex];
        /**
         * 这里外币数量框对应的金额,需要考虑金额找平、取负数的情况
         */
        const anotherField = type == "amountDr" ? "amountCr" : "amountDr";
        if (
          entry["accountingSubject"] &&
          (entry["accountingSubject"]["isCalcQuantity"] ||
            entry["accountingSubject"]["isCalcMulti"])
        ) {
          const rowAmount =
            XEUtils.toNumber(entry[anotherField]) ||
            XEUtils.toNumber(entry[type]);

          if (
            rowAmount !=
            XEUtils.toNumber(entry["quantityAndForeignCurrency"]["amount"])
          ) {
            const quantityAndForeignCurrency =
              entry["quantityAndForeignCurrency"];
            if (quantityAndForeignCurrency) {
              this.doc.entrys[rowIndex]["quantityAndForeignCurrency"][
                "amount"
              ] = newValue || 0;
            } else {
              this.doc.entrys[rowIndex]["quantityAndForeignCurrency"] =
                entry["quantityAndForeignCurrency"];
            }
          }
        }

        if (editStatus != consts.docConsts.ADD_STATUS) {
          if (
            (newValue == "" && oldValue) ||
            (newValue != "" && oldValue != newValue)
          ) {
            this.reCaculateBalanceEdit(oldEntry, rowIndex);
          }
        } else {
          this.reCaculateBalance(rowIndex, false);
        }
      },
      //填写"数量/外币": 修改借方/贷方金额,规则:
      // 1)如果有一方填写了金额,则修改该金额的值
      // 2)如果损益类科目(accountTypeId==ACCOUNTTYPE_PROFITANDLOSS),根据科目方向
      // 3）在已经【借贷平】的情况下，数量核算外币核算的弹出框确定后，返回到借方金额。
      // 4)其他科目,且借贷方都没有金额,第一行或上一行为空则填借方,否则与上一行方向相同
      reCalcAmount(rowIndex, oldValue, newValue) {
        let isFillDebit = true, //是否填写借方
          entry = this.doc.entrys[rowIndex],
          amountDr = entry["amountDr"],
          amountCr = entry["amountCr"],
          //格式化精度
          amount = newValue["amount"],
          quantity = newValue["quantity"],
          curEditField;

        if (amount) {
          amount = XEUtils.toNumber(amount).toFixed(2);
          quantity = XEUtils.toNumber(quantity).toFixed(6);
        }

        if (amountDr != 0) {
          isFillDebit = true;
        } else if (amountCr != 0) {
          isFillDebit = false;
        } else {
          const accountSubject = entry["accountingSubject"];
          if (
            accountSubject["accountTypeId"] ==
            consts.docConsts.ACCOUNTTYPE_PROFITANDLOSS
          ) {
            //损益类科目,根据科目方向填
            isFillDebit = accountSubject["balanceDirection"] == 0;
          } else {
            if (rowIndex == 0) {
              isFillDebit = true;
            } else {
              let lastRowDebitAmount = this.doc.entrys[rowIndex - 1][
                  "amountDr"
                ],
                lastRowCreditAmount = this.doc.entrys[rowIndex - 1]["amountCr"];
              const { differAmount } = this.getTotalAmount(rowIndex);
              if (differAmount == 0) {
                isFillDebit = true;
              } else {
                if (lastRowDebitAmount != 0) {
                  //借
                  isFillDebit = true;
                } else if (lastRowCreditAmount != 0) {
                  //贷
                  isFillDebit = false;
                } else {
                  isFillDebit = true;
                }
              }
            }
          }
        }
        curEditField = isFillDebit ? "amountDr" : "amountCr";
        this.doc.entrys[rowIndex][curEditField] = amount;
        if (curEditField == "amountDr" && newValue) {
          this.doc.entrys[rowIndex]["amountCr"] = (0).toFixed(2);
        } else {
          this.doc.entrys[rowIndex]["amountDr"] = (0).toFixed(2);
        }
        this.doc.entrys[rowIndex]["quantityAndForeignCurrency"] = newValue;
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          if (
            XEUtils.toNumber(amountDr) != 0 ||
            XEUtils.toNumber(amountCr) != 0 ||
            XEUtils.toNumber(amount) != 0
          ) {
            this.reCaculateBalanceEdit(entry, rowIndex);
          }
        } else {
          this.reCaculateBalance(rowIndex, undefined);
        }
        return curEditField;
      },
      //计算使得借贷平衡的金额
      getTotalAmount(rowIndex) {
        let entrys = this.doc.entrys,
          entry = this.doc.entrys[rowIndex],
          drTotalAmount = 0,
          crTotalAmount = 0;
        entrys.forEach((o, i) => {
          if (i != rowIndex) {
            drTotalAmount += o["amountDr"]
              ? XEUtils.toNumber(o["amountDr"])
              : 0;
            drTotalAmount += o["amountCr"]
              ? XEUtils.toNumber(o["amountCr"])
              : 0;
          }
        });
        const differAmount =
          drTotalAmount -
          crTotalAmount -
          XEUtils.toNumber(entry["amountDr"]) +
          XEUtils.toNumber(entry["amountCr"]);
        return { drTotalAmount, crTotalAmount, differAmount };
      },
      /**
       * 获取当前科目在列表中最新余额
       */
      getExistsBalance(accountCode, rowIndex, initBalance) {
        let entrys = this.doc.entrys,
          balance = initBalance || 0;
        for (var i = 0; i < entrys.length; i++) {
          if (
            i != rowIndex &&
            entrys[i]["accountingSubject"] &&
            entrys[i]["accountingSubject"]["code"] == accountCode &&
            entrys[i]["accountingSubject"]["balance"] != undefined
          ) {
            balance = entrys[i]["accountingSubject"]["balance"];
          }
        }
        return balance;
      },
      async getBalance(accountingSubject, auxAccountSubjects) {
        const certificateDate = this.doc.voucherDate;
        let queryParams = {
            accountId: accountingSubject["id"],
            year: certificateDate.split("-")[0],
            period: certificateDate.split("-")[1],
          },
          balance;

        const response = await getAccountBalance({
          ...queryParams,
          ...auxAccountSubjects,
        });
        if (response) {
          balance = response.value;
        }
        return balance;
      },
      /**
       * 批量更新余额
       */
      async getMultiAccountBalance(entrys) {
        const certificateDate = this.doc.voucherDate;
        if (
          this.editStatus == consts.docConsts.ADD_STATUS ||
          this.editStatus == consts.docConsts.EDIT_STATUS
        ) {
          let queryParams = [],
            param,
            entry;

          for (var i = 0; i < entrys.length; i++) {
            entry = entrys[i];
            param = {};
            param.accountId = entry.accountId || "";
            param.departmentId = entry.departmentId || undefined;
            param.personId = entry.personId || undefined;
            param.customerId = entry.customerId || undefined;
            param.supplierId = entry.supplierId || undefined;
            param.inventoryId = entry.inventoryId || undefined;
            param.projectId = entry.projectId || undefined;
            param.year = certificateDate.split("-")[0];
            param.period = certificateDate.split("-")[1];

            for (var j = 1; j <= 10; j++) {
              param[`exCalc${j}`] = entry[`exCalc${j}`]
                ? entry[`exCalc${j}`]
                : undefined;
            }

            queryParams.push(param);
          }
          const response = await getAccountsBalance(queryParams);
          if (response && response.value) {
            const res = response.value;
            for (var i = 0; i < entrys.length; i++) {
              entrys[i].balance = res[i].balance;
              entrys[i].initBalance = res[i];
            }
          }
        }

        return entrys;
      },
      /**
       * 摘要选择
       */
      async summaryChange(data, index, templateInfo, keyOpt) {
        if (templateInfo && templateInfo.entrys && templateInfo.entrys.length) {
          let templateDoc = null,
            oldEntrys = [];
          if (templateInfo.type == "template") {
            const response = await findById({
              docTemplateId: templateInfo.docTemplateId,
            });
            if (response && response.value) {
              templateDoc = response.value;
              //常用凭证引用id需要干掉，凭证保存不需要此id
              templateDoc.entrys = templateDoc.entrys.map((el) => {
                el.id = "";
                return { ...el };
              });
              templateDoc.entrys = await this.getMultiAccountBalance(
                templateDoc.entrys
              );
            }
            this.removeRow(this.doc.entrys[index], index);
            let curEntrys = this.doc.entrys;
            for (let i = 0; i < curEntrys.length; i++) {
              let _entryTemplate = Object.assign({}, curEntrys[i]);
              if (_entryTemplate.summary || _entryTemplate.accountingSubject) {
                _entryTemplate.isOldTemplate = true;
                oldEntrys.push(_entryTemplate);
              }
            }
            templateDoc.entrys = oldEntrys.concat(templateDoc.entrys);
            this.setDocTemplate(templateDoc);
            this.setEmptyRow();
          }
        } else {
          if (data.summary) {
            this.editcb(data, index, "summary", { keyOpt });
            setTimeout((_) => {
              const row = this.$refs.xTable1.afterFullData[index],
                nextField = this.getNextField("summary");
              this.gotoNextCell(row, index, nextField, "summary");
            }, 0);
          }
        }
        this.focusRowIndex = index;
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.changeStatus(consts.docConsts.EDIT_STATUS, this.doc.editStatus);
        }
      },
      /**
       * 科目选择
       */
      async accountChange(data, index, account, keyOpt) {
        let oldAccount_ = this.doc.entrys[index]["accountingSubject"],
          balanceData_ = {},
          newAccount_ = {};
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.editStatus = consts.docConsts.EDIT_STATUS;
        }
        if (account) {
          if (oldAccount_ && oldAccount_["id"] == account["id"]) {
            newAccount_ = { ...oldAccount_ };
            if (!oldAccount_["isCalc"]) {
              if (this.editStatus != consts.docConsts.ADD_STATUS) {
                //解决编辑情况下，先编辑金额，然后余额没有获取，导账余额实时计算不正确得问题
                if (!oldAccount_["initBalance"]) {
                  balanceData_ = await this.getBalance(oldAccount_, null);
                  let balanceSum = this.getExistsBalance(
                    oldAccount_["code"],
                    index,
                    balanceData_.balance
                  );
                  newAccount_.balance = XEUtils.toNumber(balanceSum).toFixed(2);
                  newAccount_.initBalance = balanceData_;
                }
              } else {
                //新增凭证状态下，实时获取余额
                balanceData_ = await this.getBalance(oldAccount_, null);
                let balanceSum = this.getExistsBalance(
                  oldAccount_["code"],
                  index,
                  balanceData_.balance
                );
                newAccount_.balance = XEUtils.toNumber(balanceSum).toFixed(2);
                newAccount_.initBalance = balanceData_;
              }
            }
            newAccount_.activeAuxPopoverList = null; //激活辅助项页面
            newAccount_.isShowBalance = true;
          } else {
            if (!account["isCalc"]) {
              balanceData_ = await this.getBalance(account);
              let balanceSum = this.getExistsBalance(
                account["code"],
                index,
                balanceData_.balance
              );
              account.balance = XEUtils.toNumber(balanceSum).toFixed(2);
              account.initBalance = balanceData_;
            }
            account.isShowBalance = true;
            newAccount_ = { ...account };
          }
          if (account && (account.isCalcQuantity || account.isCalcMulti)) {
            //选择科目后，处理外币、数量值
            data.quantityAndForeignCurrency = this.checkQuantityAndForeignCurrency(
              index,
              newAccount_,
              oldAccount_
            );
          }
          data.accountingSubject = newAccount_;
          this.editcb(data, index, "accountCode", { keyOpt });
          //启用外币数量列
          if (account && (account.isCalcQuantity || account.isCalcMulti)) {
            this.getQuantityAndCurrentTitle();
            this.$refs.xTable1.showColumn(
              this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
            );
            //外币列
            this.isqfcColShow = true;
            //是否自动弹出浮动框
            if (!account.isCalc) {
              setTimeout(() => {
                this.doc.entrys[index]["isqfcPopver"] = true;
              }, 30);
            }
          }
          if (this.editStatus != consts.docConsts.ADD_STATUS) {
            this.reCaculateBalanceEdit(this.doc.entrys[index], index);
          } else {
            this.reCaculateBalance(index, false, this.doc.entrys);
          }
          this.forceRerender();
          if (
            (account && account.isCalc) ||
            account.isCalcQuantity ||
            account.isCalcMulti
          ) {
            return;
          }
        }
        this.focusRowIndex = index;
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.changeStatus(consts.docConsts.EDIT_STATUS, this.doc.editStatus);
        }
        setTimeout((_) => {
          const row = this.$refs.xTable1.afterFullData[index],
            nextField = this.getNextField("accountCode");
          this.gotoNextCell(row, index, nextField, "accountCode");
        }, 0);
      },
      //检查是否出"数量/外币"列
      checkQuantityAndForeignCurrency(rowIndex, newAccount, oldAccount) {
        let entrys = this.doc.entrys,
          quantityAndForeignCurrency =
            entrys[rowIndex]["quantityAndForeignCurrency"];
        if (newAccount["isCalcQuantity"] || newAccount["isCalcMulti"]) {
          let currencyData,
            currencyDS = this.currencyList;
          if (currencyDS) {
            currencyData = currencyDS.filter(
              (e) => e.id == newAccount.currencyId
            )[0];
          }
          if (!quantityAndForeignCurrency) {
            let amountDr = entrys[rowIndex]["amountDr"],
              amountCr = entrys[rowIndex]["amountCr"];
            quantityAndForeignCurrency = {
              isCalcQuantity: newAccount["isCalcQuantity"] || false,
              isCalcMulti: newAccount["isCalcMulti"] || false,
              quantity: 0,
              price:
                (newAccount["initBalance"] &&
                  newAccount["initBalance"]["price"]) ||
                0, //新增单价默认带入当前科目余额对应的单价
              origAmount: 0,
              exchangeRate: newAccount["exchangeRate"] || 1, //默认取科目档案上面的汇率
              amount: 0,
              currency: undefined,
              unitName: newAccount["unitName"] || "",
            };

            if (!!amountDr && amountDr != 0) {
              quantityAndForeignCurrency.amount = amountDr;
            } else if (!!amountCr && amountCr != 0) {
              quantityAndForeignCurrency.amount = amountCr;
            } else {
              quantityAndForeignCurrency.amount = amountDr;
            }

            if (currencyData) {
              quantityAndForeignCurrency.currency = {
                id: currencyData.id,
                name: currencyData.name,
                exchangeRate: currencyData.exchangeRate || 1, //月汇率从币种档案取值
                isBaseCurrency: currencyData.isBaseCurrency,
              };
            } else {
              quantityAndForeignCurrency.currency = null;
            }
          } else {
            //对象两种不同的赋值方式，数组。
            quantityAndForeignCurrency.isCalcMulti = newAccount.isCalcQuantity;
            quantityAndForeignCurrency.isCalcQuantity = newAccount.isCalcMulti;
            quantityAndForeignCurrency.unitName = newAccount.unitName;
            //默认取科目档案上面的汇率
            quantityAndForeignCurrency.exchangeRate =
              newAccount.exchangeRate || 1;
            quantityAndForeignCurrency.price = quantityAndForeignCurrency.price
              ? quantityAndForeignCurrency.price
              : newAccount.initBalance && newAccount.initBalance.price;
            if (currencyData) {
              quantityAndForeignCurrency.currency = {
                id: currencyData.id,
                name: currencyData.name,
                exchangeRate: currencyData.exchangeRate || 1, //月汇率从币种档案取值
                isBaseCurrency: currencyData.isBaseCurrency,
              };
            } else {
              quantityAndForeignCurrency.currency = null;
            }
          }
        }
        return quantityAndForeignCurrency;
      },
      //获取当前对象list
      getAuxList(auxObject, key = false) {
        let auxs = [];
        if (auxObject && auxObject instanceof Object) {
          for (const [key, value] of Object.entries(auxObject)) {
            let newData = { ...value };
            if (key) {
              delete newData.categoryHierarchyName;
              delete newData.specification;
            }
            auxs.push(newData);
          }
        }
        return auxs;
      },
      /**
       * 辅助项设置值
       */
      async setAuxSubjects(accountingSubject, auxTmpData_, rowIndex, type) {
        if (type == "cancel") {
          //取消
          const row = this.$refs.xTable1.afterFullData[rowIndex],
            nextField = this.getNextField("summary");
          this.gotoNextCell(row, rowIndex, nextField, "accountCode");
        } else {
          accountingSubject.activeAuxPopoverList =
            accountingSubject.auxAccountSubjects;
          //确定
          if (
            accountingSubject.isCalcQuantity ||
            accountingSubject.isCalcMulti
          ) {
            setTimeout(() => {
              this.doc.entrys[rowIndex]["isqfcPopver"] = true;
            }, 30);
          } else {
            const row = this.$refs.xTable1.afterFullData[rowIndex],
              nextField = this.getNextField("accountCode");
            this.gotoNextCell(row, rowIndex, nextField, "accountCode");
          }

          if (this.editStatus != consts.docConsts.ADD_STATUS) {
            //场景：凭证编辑状态下，切换辅助核算项，默认是没有获取余额的，但是如果这个时候切换辅助项，余额计算不准确
            let oldEntrys = this.doc.entrys,
              oldAccount = Object.assign(
                {},
                oldEntrys[rowIndex].accountingSubject
              ),
              newAccount = Object.assign({}, accountingSubject),
              amountCr = XEUtils.toNumber(oldEntrys[rowIndex]["amountCr"] || 0),
              amountDr = XEUtils.toNumber(oldEntrys[rowIndex]["amountDr"] || 0),
              oldAuxs = [],
              newAuxs = [];

            if (oldEntrys[rowIndex] && oldEntrys[rowIndex].auxTmpData_) {
              const oldAuxs_ = oldEntrys[rowIndex].auxTmpData_;
              for (const [key, value] of Object.entries(oldAuxs_)) {
                oldAuxs.push({ ...value });
              }
            }

            if (auxTmpData_) {
              for (let [key, value] of Object.entries(auxTmpData_)) {
                let newData = { ...value };
                delete newData.categoryHierarchyName;
                delete newData.specification;
                newAuxs.push(newData);
              }
            }
            let isSame = XEUtils.isEqual(oldAuxs, newAuxs);
            //考虑科目编码是否一致，辅助项是否一致、是否已查过余额
            //切换辅助项前列表中余额需要计算一下
            if (!isSame && oldAuxs.length > 0) {
              if (!oldAccount.initBalance) {
                const oldres_ = await this.getBalance(
                  oldAccount,
                  oldAccount.auxAccountSubjects
                );
                oldAccount.initBalance = oldres_;
                oldAccount.balance = XEUtils.toNumber(oldres_.balance);
              }

              if (!newAccount.initBalance) {
                const newres_ = await this.getBalance(
                  newAccount,
                  newAccount.auxAccountSubjects
                );
                newAccount.initBalance = newres_;
                newAccount.balance = XEUtils.toNumber(newres_.balance);
              }
              if (amountCr != 0 || amountDr != 0) {
                //1、计算旧科目余额
                let oldBalance = XEUtils.toNumber(oldAccount.balance);
                if (
                  oldAccount.balanceDirection ==
                  consts.docConsts.DIRECTION_DEBIT
                ) {
                  //借
                  oldBalance = oldBalance - amountDr - amountCr;
                } else {
                  //贷
                  oldBalance = oldBalance - amountCr - amountDr;
                }

                for (var j = 0; j < oldEntrys.length; j++) {
                  let itemSubject = oldEntrys[j]["accountingSubject"],
                    oldAuxLists = this.getAuxList(
                      oldEntrys[rowIndex].auxTmpData_
                    ),
                    newAuxLists = this.getAuxList(oldEntrys[j].auxTmpData_);
                  let isx = XEUtils.isEqual(oldAuxLists, newAuxLists);
                  if (
                    itemSubject &&
                    itemSubject.code == oldAccount.code &&
                    rowIndex != j &&
                    newAuxLists.length > 0 &&
                    isx
                  ) {
                    //旧科目辅助项
                    oldEntrys[j].accountingSubject.balance = XEUtils.toNumber(
                      oldBalance
                    );
                    oldEntrys[j].accountingSubject.initBalance =
                      oldAccount.initBalance;
                  }
                }
              }
              //切换前余额算一遍
              this.doc.entrys = oldEntrys;

              //切换后辅助项余额
              if (amountCr != 0 || amountDr != 0) {
                let newBalance = XEUtils.toNumber(newAccount.balance);
                if (
                  newAccount.balanceDirection ==
                  consts.docConsts.DIRECTION_DEBIT
                ) {
                  //借
                  newBalance = newBalance + amountDr - amountCr;
                } else {
                  //贷
                  newBalance = newBalance + amountCr - amountDr;
                }
                let entrys = this.doc.entrys;
                for (var j = 0; j < entrys.length; j++) {
                  let itemSubject = entrys[j]["accountingSubject"],
                    oldAuxLists = this.getAuxList(entrys[j].auxTmpData_);
                  let isx = XEUtils.isEqual(oldAuxLists, newAuxs);
                  if (
                    itemSubject &&
                    itemSubject.code == newAccount.code &&
                    rowIndex != j &&
                    oldAuxLists.length > 0 &&
                    isx
                  ) {
                    //新科目辅助项
                    entrys[j].accountingSubject.balance = XEUtils.toNumber(
                      newBalance
                    );
                    entrys[j].accountingSubject.initBalance =
                      newAccount.initBalance;
                  }
                }
                newAccount.balance = newBalance;
                //更新分录数据
                entrys[rowIndex]["accountingSubject"] = newAccount;
                entrys[rowIndex]["auxTmpData_"] = auxTmpData_;
                this.doc.entrys = entrys;
              }
            } else {
              let tmpEntrys = this.doc.entrys;
              if (!newAccount.initBalance) {
                const _resBalance = await this.getBalance(
                  newAccount,
                  newAccount.auxAccountSubjects
                );
                newAccount.initBalance = _resBalance;
                newAccount.balance = XEUtils.toNumber(_resBalance.balance);
              }
              //在页面查找最新余额
              for (var j = 0; j < tmpEntrys.length; j++) {
                let itemSubject = tmpEntrys[j]["accountingSubject"],
                  oldAuxLists = this.getAuxList(tmpEntrys[j].auxTmpData_, true);
                let isx = XEUtils.isEqual(oldAuxLists, newAuxs);
                if (
                  itemSubject &&
                  itemSubject.code == newAccount.code &&
                  rowIndex != j &&
                  itemSubject.balance &&
                  oldAuxLists.length > 0 &&
                  isx
                ) {
                  //新科目辅助项
                  newAccount.balance = XEUtils.toNumber(itemSubject.balance);
                  break;
                }
              }
              let entry = this.doc.entrys[rowIndex];
              entry["accountingSubject"] = newAccount;
              entry["auxTmpData_"] = auxTmpData_;
              this.$set(this.doc.entrys, rowIndex, entry);
              this.reCaculateBalanceEdit(this.doc.entrys[rowIndex], rowIndex);
            }
          } else {
            //获取余额
            const res = await this.getBalance(
              accountingSubject,
              accountingSubject.auxAccountSubjects
            );
            accountingSubject.initBalance = res;
            accountingSubject.balance = XEUtils.toNumber(res.balance);
            //更新分录数据
            let entry = this.doc.entrys[rowIndex];
            entry["accountingSubject"] = accountingSubject;
            entry["auxTmpData_"] = auxTmpData_;
            this.$set(this.doc.entrys, rowIndex, entry);
            this.reCaculateBalance(rowIndex, false, this.doc.entrys);
          }
        }
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.changeStatus(consts.docConsts.EDIT_STATUS, this.doc.editStatus);
        }
        this.forceRerender();
      },
      /**
       * 外币设置值
       */
      setQuantityAndForeignCurrency(
        quantityAndForeignCurrency,
        rowIndex,
        type
      ) {
        let curEditField = "amountDr",
          oldValue = this.doc.entrys[rowIndex]["quantityAndForeignCurrency"];
        this.doc.entrys[rowIndex]["isqfcPopver"] = false;
        if (type == "cancel") {
          quantityAndForeignCurrency = oldValue;
        }
        curEditField = this.reCalcAmount(
          rowIndex,
          oldValue,
          quantityAndForeignCurrency
        );
        const row = this.$refs.xTable1.afterFullData[rowIndex];
        this.gotoNextCell(row, rowIndex, curEditField, curEditField);
        if (this.editStatus != consts.docConsts.ADD_STATUS) {
          this.changeStatus(consts.docConsts.EDIT_STATUS, this.doc.editStatus);
        }
        this.forceRerender();
      },
      /**
       * 获取下一个焦点
       */
      getNextField(c) {
        let n = "";
        switch (c) {
          case "summary":
            n = "accountCode";
            break;
          case "accountCode":
            n = "amountDr";
            break;
          case "amountDr":
            n = "amountCr";
            break;
          case "amountCr":
            n = "summary";
            break;
          default:
            n = "amountDr";
        }
        return n;
      },

      editcb(data, index, type, others) {
        if (Array.isArray(type)) {
          type.forEach((o) => {
            this.doc.entrys[index][o] = data[o];
          });
          this.forceRerender();
        } else if (others && others.templateInfo) {
          this.doc.entrys[index]["summary"] =
            others.templateInfo.entrys[0].summary;
          this.doc.entrys[index]["accountCode"] =
            others.templateInfo.entrys[0].accountCode;
          this.doc.entrys.splice(index, 0, others.templateInfo.entrys[1]);
          this.forceRerender();
        } else {
          this.$set(this.doc.entrys, index, data);
        }
      },
      handleMouseEnter({
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        $event,
      }) {
        this.currentRowIndex = $rowIndex;
      },
      handleMouseLeave({
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        $event,
      }) {
        this.currentRowIndex = undefined;
      },
      onBlurNoteInput(value) {
        if (this.editStatus == consts.docConsts.ADD_STATUS) {
          this.editStatus = consts.docConsts.ADD_STATUS;
        } else {
          this.editStatus = consts.docConsts.EDIT_STATUS;
        }

        this.$set(this.doc, "note", value);
      },
      stimulateNextCell(info) {
        const { row, rowIndex, column } = info;
        const field = this.getNextField(column.property);
        const property = column.property;
        this.gotoNextCell(row, rowIndex, field, property);
      },
      gotoNextCell(row, rowIndex, field, property) {
        if (property === "amountCr") {
          this.$refs.xTable1.setActiveCell(
            this.$refs.xTable1.afterFullData[rowIndex + 1],
            field
          );
        } else {
          this.$refs.xTable1.setActiveCell(row, field);
        }
      },
      //打开凭证模板
      async handleTemplate() {
        this.docTemplateId = "";
        let needSave = false, //是否需要提示保存: 编辑状态 || 新增状态并填写了分录
          editStatus = this.editStatus;
        if (editStatus == consts.docConsts.EDIT_STATUS) {
          needSave = true;
        } else if (editStatus == consts.docConsts.ADD_STATUS) {
          let entrys = this.doc.entrys;
          if (entrys) {
            for (let entry of entrys) {
              delete entry._XID;
              if (entry && !XEUtils.isEqual(entry, entrysData)) {
                needSave = true;
                break;
              }
            }
          }
        }

        if (needSave) {
          await this.$confirm(`您的凭证尚未保存，是否要保存?`, "温馨提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.save();
            })
            .catch((action) => {
              this.showCommonTemplate = true;
            });
        } else {
          this.showCommonTemplate = true;
        }
      },
      //打开存为模板
      saveTemplate() {
        if (!this.canSaveAsTemplate()) {
          this.$baseMessage("没有填写科目的凭证不能存为模板", "warning");
          return;
        }
        this.showAddTemplate = true;
      },
      /**
       * 能否存为模板(空凭证不能存为模板)
       */
      canSaveAsTemplate() {
        let details = this.doc.entrys;
        for (let item of details) {
          let itemForServer = this.convertVoucherItemForServer(item);
          if (itemForServer) {
            return true;
          }
        }
        return false;
      },
      cancelAddTemplate() {
        this.showAddTemplate = false;
      },
      //存为模板
      async confirmAddTemplate(form = {}) {
        this.showAddTemplate = false;
        if (!this.doc) {
          let editTemplate = {};
          editTemplate.docTemplateId = this.doc.docId;
          editTemplate.docTemplateCode = form.code;
          editTemplate.docTemplateName = form.name;
          editTemplate.isReturnValue = true;
          let response = await updateTemplate(editTemplate);
          if (response && response.result == false) {
            this.$baseMessage(response.error.message, "warning");
            return false;
          } else {
            this.$baseMessage("常用模版保存成功", "success");
          }
        } else {
          let response = await createTemplate(
            this.getTemplateFromCertificate(form)
          );
          if (response && response.result == false) {
            this.$baseMessage(response.error.message, "warning");
            return false;
          } else {
            this.$baseMessage("常用模版保存成功", "success");
          }
        }
      },
      //把凭证单据,转换成模板数据
      getTemplateFromCertificate(form) {
        let doc = this.doc,
          templateForm = form,
          template = {};
        template.docTemplateCode = templateForm.code;
        template.docTemplateName = templateForm.name;
        template.isSaveAmount = templateForm.isSaveAmount || false;
        template.docType = doc.docType;
        template.isReturnValue = true;
        template.entrys = [];
        let details = doc.entrys;
        if (details && details.length) {
          for (let item of details) {
            let entry = this.convertVoucherItemForServer(item, false);
            if (entry) {
              template.entrys.push(entry);
            }
          }
        }
        return template;
      },
      async selectTemplate(id) {
        this.docTemplateId = id;
      },
      cancelTemplate() {
        this.showCommonTemplate = false;
      },
      cancelAddTemplate() {
        this.showAddTemplate = false;
      },
      async confirmTemplate() {
        if (!this.docTemplateId) {
          this.$baseMessage("请选择需要使用的模板", "warning");
          return;
        } else {
          this.showCommonTemplate = false;
          let response = await findById({ docTemplateId: this.docTemplateId }),
            doc;
          if (response && response.value) {
            doc = response.value;
            doc.entrys = await this.getMultiAccountBalance(doc.entrys);
          }
          this.setDocTemplate(doc);
          this.setEmptyRow();
        }
      },
      //如果行数太少,则用空行补足
      setEmptyRow(__init) {
        const portalContainer = document.getElementsByClassName("vab-main"),
          entrys = this.doc.entrys;
        let height = 440;
        if (portalContainer && portalContainer.length == 0) {
          // height = document.getElementsByClassName("ttk-edf-app-iframe-iframe")[0].height;
        } else {
          height = portalContainer[0].clientHeight - 210;
        }
        let length,
          defaultLen = entrys.length,
          emptyRows = [];
        if (portalContainer.length != 0) {
        }

        length =
          Math.floor(height / 49) > defaultLen ? Math.floor(height / 49) : 5;
        const diffLength = length - defaultLen;
        for (let i = 0; i < diffLength; i++) {
          emptyRows.push({ ...entrysData });
        }
        if (entrys.length <= length) {
          this.doc.entrys = this.doc.entrys.concat(emptyRows);
        }
        this.defaultLength = this.doc.entrys;
      },
      /**
       * 使用常用凭证模板: 把常用凭证模板里的项替换界面上的现有项	 *
       */
      setDocTemplate(doc) {
        let curEntrys = [],
          dymicColTypes = { isCalcMulti: false, isCalcQuantity: false };
        for (let entry of doc.entrys) {
          //摘要中引用常用凭证、在新增状态下通过凭证模板引用常用凭证，外币数量框需要保留客户历史的数据
          if (entry.isOldTemplate) {
            curEntrys.push(entry);
          } else {
            let quantityAndForeignCurrencyData = {
              quantity: entry.quantity || 0,
              price: entry.price || 0,
            };
            let entryData = this.getVoucherItemFromEntry(
              entry,
              quantityAndForeignCurrencyData
            );
            if (entryData.accountingSubject.isCalcMulti) {
              dymicColTypes["isCalcMulti"] = true;
            } else if (entryData.accountingSubject.isCalcQuantity) {
              dymicColTypes["isCalcQuantity"] = true;
            }
            entryData.accountingSubject.isShowBalance = true;
            if (entry.balance != undefined && entry.initBalance) {
              entryData.accountingSubject.balance = entry.balance.toFixed(2);
              entryData.accountingSubject.initBalance = entry.initBalance;
            }
            curEntrys.push(entryData);
          }
        }
        this.$set(this.doc, "entrys", curEntrys);
        //检查是否需要显示"数量/外币"字段
        if (dymicColTypes["isCalcMulti"] || dymicColTypes["isCalcQuantity"]) {
          this.$refs.xTable1.showColumn(
            this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
          );
          this.getQuantityAndCurrentTitle();
        } else {
          this.$refs.xTable1.hideColumn(
            this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
          );
        }
        //在新增凭证中，引入常用凭证无需及时计算余额
        for (var i = 0; i < curEntrys.length; i++) {
          this.reCaculateBalance(i);
        }
        this.forceRerender();
      },
      copyList(value) {
        var newList = [];
        //value是父组件传递的对象
        newList = JSON.parse(JSON.stringify(value));
        return newList;
      },
      //根据科目id返回科目对象
      getAccountById(accountId) {
        const newAccountList = this.copyList(
          this.$store.state.gl_vouchercard.glAccounts
        );
        let accountSubjects = [...newAccountList],
          targetAccount;
        if (accountSubjects) {
          targetAccount = accountSubjects.find((o) => o.id == accountId);
        }
        delete targetAccount.activeAuxPopoverList;
        delete targetAccount.isShowBalance;
        delete targetAccount.balance;
        delete targetAccount.initBalance;
        return targetAccount;
      },
      getVoucherItemFromEntry(entry, quantityAndForeignCurrencyData) {
        let accountSubject =
            entry.accountDto || this.getAccountById(entry.accountId),
          auxTmpData_ = {};
        if (accountSubject && accountSubject.isCalc) {
          let auxAccountSubjects = {};
          const array = this.calcDict;
          for (const [key, value] of Object.entries(this.calcDict)) {
            const _field =
              `${key}`.toLowerCase().indexOf("excalc") > -1
                ? `${key}`.replace("isExCalc", "exCalc")
                : `${key}`.replace("isCalc", "").toLowerCase();
            if (accountSubject && accountSubject[key]) {
              let auxData = {};
              if (_field.indexOf("exCalc") != -1) {
                auxAccountSubjects[_field] = entry[_field];
                auxData[_field] = entry[_field];
              } else {
                auxAccountSubjects[`${_field}Id`] = entry[`${_field}Id`];
                auxData[`${_field}Id`] = entry[`${_field}Id`];
              }
              auxData[`${_field}Name`] = entry[`${_field}Name`];
              if (_field == "inventory") {
                auxData["specification"] = entry["inventorySpecification"]; //规格型号//规格型号
              }
              auxTmpData_[`${_field}`] = auxData;
            }
          }
          accountSubject["auxAccountSubjects"] = auxAccountSubjects;
          //控住辅助项是否默认弹出
          accountSubject["activeAuxPopoverList"] = auxAccountSubjects;
        }
        quantityAndForeignCurrencyData = {
          ...quantityAndForeignCurrencyData,
          origAmount:
            entry["origAmountDr"] != undefined
              ? entry["origAmountDr"]
              : entry["origAmountCr"],
          exchangeRate: entry["exchangeRate"]
            ? entry["exchangeRate"]
            : accountSubject["exchangeRate"],
          amount:
            entry["amountDr"] != undefined
              ? entry["amountDr"]
              : entry["amountCr"],
          currency: {
            id: entry["currencyId"]
              ? entry["currencyId"]
              : accountSubject["currencyId"],
            name: entry["currencyName"]
              ? entry["currencyName"]
              : accountSubject["currencyName"],
            exchangeRate: entry["exchangeRate"]
              ? entry["exchangeRate"]
              : accountSubject["exchangeRate"],
            isBaseCurrency: entry["exchangeRate"] == 1 ? true : false,
          },
          unitName: entry["unitName"],
          isCalcQuantity: accountSubject
            ? accountSubject["isCalcQuantity"]
            : "",
          isCalcMulti: accountSubject ? accountSubject["isCalcMulti"] : "",
        };
        let detail = {
          id: entry.id,
          accountId: entry.accountId,
          accountCode: entry.accountCode,
          summary: entry.summary,
          accountingSubject: accountSubject,
          auxTmpData_: auxTmpData_,
          quantityAndForeignCurrency: quantityAndForeignCurrencyData,
          amountDr: entry.amountDr || 0,
          amountCr: entry.amountCr || 0,
          ts: entry.ts,
          inPutTaxDeductId: entry.inPutTaxDeductId,
        };

        return detail;
      },
      getAuditText() {
        const docStatus = this.doc.docStatus;
        if (docStatus === consts.docConsts.STATUS_VOUCHER_AUDITED) {
          return "反审核";
        } else {
          return "审核";
        }
      },
      isDisplayButton(btnName) {
        let editStatus = this.editStatus,
          docStatus = this.doc.docStatus,
          // sourceVoucherTypeId = this.metaAction.gf('data.form.sourceVoucherTypeId'),
          isDisplay = true,
          isFromXdz = this.isFromXdz;
        if (isFromXdz == true && (btnName == "add" || btnName == "save")) {
          return false;
        }
        if (btnName == "add") {
          isDisplay = editStatus == consts.docConsts.VIEW_STATUS ? true : false;
        } else if (btnName == "del") {
          isDisplay =
            this.doc.docStatus == consts.docConsts.STATUS_VOUCHER_NOT_AUDITED;
        } else if (btnName == "save" || btnName == "redDashed") {
          isDisplay = editStatus != consts.docConsts.VIEW_STATUS ? true : false;
        } else if (btnName == "audit") {
          isDisplay = editStatus == consts.docConsts.VIEW_STATUS ? true : false;
        } else if (btnName == "print") {
          isDisplay = editStatus == consts.docConsts.VIEW_STATUS ? true : false;
        } else if (btnName == "more") {
          isDisplay = editStatus != consts.docConsts.ADD_STATUS ? true : false;
        }
        if (btnName == "linkinvoice") {
          //销项：1000030025；进项：1000030026
          // isDisplay = editStatus != data.ADD_STATUS && (sourceVoucherTypeId == '1000030025' || sourceVoucherTypeId == '1000030026') ? true : false
        } else if (btnName == "reset") {
          isDisplay = editStatus == consts.docConsts.ADD_STATUS ? true : false;
        }
        return isDisplay;
      },
      //删除凭证
      async deleteDoc() {
        let id = this.doc.docId,
          ts = this.doc.ts,
          sourceVoucherCode = this.doc.voucherSource,
          sourceVoucherTypeId = this.doc.sourceVoucherTypeId,
          delText,
          delSuccessText;

        if (sourceVoucherCode) {
          if (sourceVoucherTypeId == 143) {
            //TODO  143
            delText =
              "单据：" +
              sourceVoucherCode +
              "是TTK会计填写的凭证，如果驳回，会将对应的流水账同时删除，请确认要驳回吗？";
          } else {
            if (sourceVoucherTypeId == 1000030017) {
              // 1000030017 未认证进项清单
              delText = "删除凭证会对已认证的发票撤销认证，是否删除？";
            } else {
              delText =
                "单据：" +
                sourceVoucherCode +
                "将被驳回到业务，当前凭证会被删除。请确认要驳回吗？";
            }
          }
          delSuccessText = "驳回";
        } else {
          delText = "确定删除该凭证?";
          delSuccessText = "删除";
        }
        if (!id || !ts) {
          this.$baseMessage("请先保存凭证!", "warning");
          return;
        }
        this.$baseConfirm(delText, delSuccessText + "凭证", async () => {
          const response = await docDelete({
            docId: id,
            ts: ts,
            isReturnValue: true,
          });
          // 删除或者驳回凭证后自动跳转到下一张凭证
          if (response && response.result == false && response.error) {
            this.$baseMessage(response.error.message, "error");
          } else if (response.value) {
            this.loadDoc(response.value, consts.docConsts.VIEW_STATUS);
            this.$baseMessage("删除凭证成功", "success");
          } else {
            this.addDoc(undefined);
            this.$baseMessage("删除凭证成功", "success");
          }
        });
      },
      // 红冲凭证
      async redDashed() {
        let date = this.doc.voucherDate;
        let param = {
          year: date.split("-")[0],
          period: date.split("-")[1],
        };
        const response = await getRedRushDocPeriod(param);
        if (!response || !response.result) return;

        this.showRedDashed = true;
        this.redDashedDate = `${
          response.value.year
        }-${response.value.period.toString().padStart(2, "0")}`;
      },
      async handleRedDashed() {
        this.showRedDashed = false;
        const date = this.redDashedDate,
          docIds = this.doc.docId,
          currentUser = this.$store.state.routes.user,
          nickname = currentUser.nickname,
          params = {
            year: date.split("-")[0],
            period: date.split("-")[1],
            docIds: [docIds],
            creator: nickname,
          };
        const response = await redRushDoc(params);
        if (response && response.result) {
          if (response.value.errorList.length == 0) {
            this.$baseMessage("红冲成功", "success");
          } else if (response.value.errorList.length > 0) {
            this.$baseMessage(
              this.getErrorMessage(response.value.errorList),
              "warning"
            );
            return;
          }
        }
      },
      getErrorMessage(message) {
        return (
          <div>
            {message.map((item) => {
              return <div>{item}</div>;
            })}
          </div>
        );
      },
      //新增凭证
      async addDoc() {
        let certificateDate = this.doc.voucherDate,
          year = certificateDate.split("-")[0],
          period = certificateDate.split("-")[1],
          option = { year: year, period: period, isReturnValue: true },
          enabledYearMonth = this.getEnabledYearMonth(),
          baseArchiveList = await docGetAllBaseInfos({
            isNotGetCurrency: true,
          });
        const enableAccountList = this.getSubjectList(
          baseArchiveList.value.glAccountQueryDto,
          consts.docConsts.ADD_STATUS
        );
        const initCertificateData = await docInit(option);
        if (
          initCertificateData.result == false &&
          initCertificateData.error &&
          initCertificateData.error.code == "70002"
        ) {
          this.$baseMessage(initCertificateData.error.message, "error");
          this.clearAndNewDoc(
            initCertificateData.value,
            enableAccountList.glAccounts,
            undefined,
            enabledYearMonth
          );
        } else {
          this.clearAndNewDoc(
            initCertificateData.value,
            enableAccountList.glAccounts,
            undefined,
            enabledYearMonth
          );
        }

        let summaryList = baseArchiveList.value.summarys;
        let templateList = baseArchiveList.value.glDocTemplateDtos;
        baseArchiveList.value.summarys = [
          ...summaryList,
          ...this.translateTemplate(templateList),
        ];
        baseArchiveList.value.glAccountQueryDto = {
          glAccounts: enableAccountList.glAccounts,
        };
        this.$refs.xTable1.hideColumn(
          this.$refs.xTable1.getColumnByField("quantityAndForeignCurrency")
        );
        this.setDocBaseInfo(baseArchiveList.value);
        this.setEmptyRow();
        this.forceRerender();
        setTimeout((_) => {
          let row = this.$refs.xTable1.afterFullData[0],
            nextType;
          this.$refs.xTable1.setActiveCell(row, "summary");
        }, 0);
      },
      getSubjectList(subjectList, editStatus = consts.docConsts.VIEW_STATUS) {
        let subjectListEnable = [];
        subjectList.glAccounts.map((item) => {
          if (editStatus == consts.docConsts.ADD_STATUS) {
            //新增过滤科目是否已启用
            if (!!item.isEnable) {
              subjectListEnable.push(item);
            }
          } else {
            //编辑全部显示出来，让科目可以显示，在保存的时候后端校验科目是否已停用
            subjectListEnable.push(item);
          }
        });
        subjectList.glAccountsAll = subjectList.glAccounts;
        subjectList.glAccounts = subjectListEnable;

        return subjectList;
      },
      getEnabledYearMonth() {
        let currentOrg = this.$store.state.routes.org;
        let enabledYearMonth =
          currentOrg.enabledYear +
          "-" +
          currentOrg.enabledMonth.toString().padStart(2, "0");
        return enabledYearMonth;
      },
      /**
       * 新增余额实时计算
       */
      reCaculateBalance(rowIndex, isDelRow, formdetails) {
        /**
         * 余额实时计算场景：
         * 1、借贷找平、借贷金额切换
         * 2、删除分录
         * 3、使用摘要模板、凭证模板里的项替换界面上的现有项
         * 4、辅助核算填写完
         * 5、科目填写完
         *
         * 余额计算分析：
         * 1、编辑金额、删除当前分录，及时计算金额
         * 2、在新增引入常用凭证，默认从后端获取余额即可
         * 3、在摘要中引入常用凭证，需要提前在分录中获取到最新科目的余额
         */
        let entrys = formdetails ? formdetails : this.doc.entrys,
          editStatus = this.editStatus;

        if (
          !entrys[rowIndex]["accountingSubject"] ||
          editStatus != consts.docConsts.ADD_STATUS
        ) {
          return entrys;
        }
        let entry = entrys[rowIndex],
          accountingSubject = entry["accountingSubject"],
          balance = XEUtils.toNumber(accountingSubject["balance"]),
          initBalance = accountingSubject["initBalance"],
          amount = 0,
          itemSubject;

        //1、先计算当前编辑科目的 "最新" 余额，然后在加上或者减去当前默认带出来的余额
        for (var i = 0; i < entrys.length; i++) {
          itemSubject = entrys[i]["accountingSubject"];
          if (
            itemSubject &&
            itemSubject["code"] == accountingSubject["code"] &&
            (!isDelRow || (isDelRow && rowIndex != i))
          ) {
            if (!itemSubject["isCalc"]) {
              if (
                itemSubject["balanceDirection"] ==
                consts.docConsts.DIRECTION_DEBIT
              ) {
                //借
                amount =
                  amount +
                  XEUtils.toNumber(entrys[i]["amountDr"]) -
                  XEUtils.toNumber(entrys[i]["amountCr"]);
              } else {
                amount =
                  amount -
                  XEUtils.toNumber(entrys[i]["amountDr"]) +
                  XEUtils.toNumber(entrys[i]["amountCr"]);
              }
            } else if (
              itemSubject["isCalc"] &&
              XEUtils.isEqual(
                itemSubject["auxAccountSubjects"],
                accountingSubject["auxAccountSubjects"]
              )
            ) {
              if (
                itemSubject["balanceDirection"] ==
                consts.docConsts.DIRECTION_DEBIT
              ) {
                amount =
                  amount +
                  XEUtils.toNumber(entrys[i]["amountDr"]) -
                  XEUtils.toNumber(entrys[i]["amountCr"]);
              } else {
                amount =
                  amount -
                  XEUtils.toNumber(entrys[i]["amountDr"]) +
                  XEUtils.toNumber(entrys[i]["amountCr"]);
              }
            }
          }
        }
        balance = (initBalance ? initBalance["balance"] + amount : 0).toFixed(
          2
        );

        this.updateEntrysBalance(rowIndex, isDelRow, entrys, balance);
      },
      /**
       * 编辑状态下，计算当前编辑列余额
       */
      reCaculateBalanceEdit(oldEntry, rowIndex, newDetails) {
        let entrys = newDetails ? newDetails : this.doc.entrys,
          newEntry = entrys[rowIndex];
        oldEntry = oldEntry ? oldEntry : entrys[rowIndex];
        let oldAccount = oldEntry["accountingSubject"],
          newAccount = newEntry["accountingSubject"];
        if (oldAccount && newAccount) {
          if (oldAccount["code"] != newAccount["code"]) {
            //科目切换
            //1、计算旧科目余额
            let oldAccountBalance = XEUtils.toNumber(oldAccount["balance"]);
            if (
              oldAccount["balanceDirection"] == consts.docConsts.DIRECTION_DEBIT
            ) {
              //借
              oldAccountBalance =
                oldAccountBalance -
                (XEUtils.toNumber(oldEntry["amountDr"] || 0) -
                  XEUtils.toNumber(oldEntry["amountCr"] || 0));
            } else {
              //贷
              oldAccountBalance =
                oldAccountBalance -
                (XEUtils.toNumber(oldEntry["amountCr"] || 0) -
                  XEUtils.toNumber(oldEntry["amountDr"] || 0));
            }
            //2、计算新科目余额
            let newAccountbalance = XEUtils.toNumber(newAccount["balance"]);
            if (
              newAccount["balanceDirection"] == consts.docConsts.DIRECTION_DEBIT
            ) {
              //借
              newAccountbalance =
                newAccountbalance +
                (XEUtils.toNumber(newEntry["amountDr"] || 0) -
                  XEUtils.toNumber(newEntry["amountCr"] || 0));
            } else {
              //贷
              newAccountbalance =
                newAccountbalance +
                (XEUtils.toNumber(newEntry["amountCr"] || 0) -
                  XEUtils.toNumber(newEntry["amountDr"] || 0));
            }
            for (var j = 0; j < entrys.length; j++) {
              let itemSubject = entrys[j]["accountingSubject"];
              if (itemSubject) {
                if (
                  itemSubject["code"] == oldAccount["code"] &&
                  rowIndex != j
                ) {
                  this.doc.entrys[
                    j
                  ].accountSubject.balance = oldAccountBalance.toFixed(2);
                  this.doc.entrys[j].accountSubject.initBalance =
                    oldAccount["initBalance"];
                }
                if (itemSubject.get("code") == newAccount.get("code")) {
                  this.doc.entrys[
                    j
                  ].accountingSubject.balance = newAccountbalance.toFixed(2);

                  this.doc.entrys[j].accountingSubject.initBalance =
                    newAccount["initBalance"];
                }
              }
            }
          } else {
            let balance = XEUtils.toNumber(oldAccount["balance"]),
              oldValue = 0,
              newValue = 0;
            if (
              oldAccount["balanceDirection"] == consts.docConsts.DIRECTION_DEBIT
            ) {
              //借
              oldValue =
                XEUtils.toNumber(oldEntry["amountDr"] || 0) -
                XEUtils.toNumber(oldEntry["amountCr"] || 0);
              newValue =
                XEUtils.toNumber(newEntry["amountDr"] || 0) -
                XEUtils.toNumber(newEntry["amountCr"] || 0);
            } else {
              //贷
              oldValue =
                XEUtils.toNumber(oldEntry["amountCr"] || 0) -
                XEUtils.toNumber(oldEntry["amountDr"] || 0);
              newValue =
                XEUtils.toNumber(newEntry["amountCr"] || 0) -
                XEUtils.toNumber(newEntry["amountDr"] || 0);
            }
            balance = balance - oldValue + newValue;
            this.updateEntrysBalance(
              rowIndex,
              false,
              entrys,
              balance.toFixed(2)
            );
          }
        }
      },
      //判断两个对象是否相等
      isObjectValueEqual(a, b) {
        // 判断两个对象是否指向同一内存，指向同一内存返回true
        if (a === b) return true;
        // 获取两个对象键值数组
        let aProps = Object.getOwnPropertyNames(a);
        let bProps = Object.getOwnPropertyNames(b);
        // 判断两个对象键值数组长度是否一致，不一致返回false
        if (aProps.length !== bProps.length) return false;
        // 遍历对象的键值
        for (let prop in a) {
          // 判断a的键值，在b中是否存在，不存在，返回false
          if (b.hasOwnProperty(prop)) {
            // 判断a的键值是否为对象，是则递归，不是对象直接判断键值是否相等，不相等返回false
            if (typeof a[prop] === "object") {
              if (!isObjectValueEqual(a[prop], b[prop])) return false;
            } else if (a[prop] !== b[prop]) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      },
      /**
       * 更新余额
       */
      updateEntrysBalance(rowIndex, isDelRow, entrys, balance) {
        let itemSubject,
          accountingSubject = entrys[rowIndex]["accountingSubject"];
        for (var j = 0; j < entrys.length; j++) {
          itemSubject = entrys[j]["accountingSubject"];
          if (
            itemSubject &&
            itemSubject["code"] == accountingSubject["code"] &&
            (itemSubject["code"] || accountingSubject["code"]) && //删除科目，凭证模板引入进来的凭证，没有科目就不要计算余额了
            (!isDelRow || (isDelRow && rowIndex != j))
          ) {
            if (!itemSubject["isCalc"]) {
              this.doc.entrys[j].accountingSubject.balance = balance;
              this.doc.entrys[j].accountingSubject.initBalance =
                accountingSubject["initBalance"];
            } else if (
              itemSubject["isCalc"] &&
              this.isObjectValueEqual(
                itemSubject["auxAccountSubjects"],
                accountingSubject["auxAccountSubjects"]
              )
            ) {
              this.doc.entrys[j].accountingSubject.balance = balance;
              this.doc.entrys[j].accountingSubject.initBalance =
                accountingSubject["initBalance"];
            }
          }
        }
      },
      //审核凭证
      async audit() {
        let id = this.doc.docId,
          ts = this.doc.ts,
          certificateStatus = this.doc.docStatus,
          currentUser = this.$store.state.routes.user,
          auditor = currentUser.nickname;
        if (!id || !ts) {
          this.$baseMessage("请先保存凭证", "success");
          return;
        }

        if (certificateStatus == consts.docConsts.STATUS_VOUCHER_NOT_AUDITED) {
          const response = await docAudit({
            docId: id,
            ts: ts,
            auditor: auditor,
          });
          if (response && response.result) {
            this.$baseMessage("凭证审核成功", "success");
            this.changeAuditStatus(
              consts.docConsts.STATUS_VOUCHER_AUDITED,
              currentUser,
              response.value
            );
          }
        } else {
          const response = await docAntiAudit({ docId: id, ts: ts });
          if (response && response.result) {
            this.$baseMessage("凭证反审核成功", "success");
            this.changeAuditStatus(
              consts.docConsts.STATUS_VOUCHER_NOT_AUDITED,
              currentUser,
              response.value
            );
          }
        }
      },
      //保存审核状态: 修改审核人信息 + 单据状态
      changeAuditStatus(auditStatus, user, ts) {
        if (auditStatus == consts.docConsts.STATUS_VOUCHER_AUDITED) {
          this.$set(this.doc, "auditor", user.nickname);
          this.$set(this.doc, "auditorId", user.id);
          this.$set(this.doc, "ts", ts);
        } else {
          this.$set(this.doc, "auditor", null);
          this.$set(this.doc, "auditorId", null);
          this.$set(this.doc, "ts", ts);
        }
        //审核/反审核时,清空焦点
        this.changeStatus(consts.docConsts.VIEW_STATUS, auditStatus);
      },
      getAudited() {
        return this.doc.docStatus == consts.otherConsts.VOUCHERSTATUS_Approved;
      },
      /**
       * 首页、上一页、下一页、尾页
       */
      async loadPaging(type) {
        let code = `${this.doc.docCode}`.padStart(5, "0"),
          voucherMoment = this.doc.voucherDate,
          currentYear = voucherMoment.split("-")[0],
          currentPeriod = voucherMoment.split("-")[1],
          editStatus = this.editStatus,
          certificateTemplate = {},
          response = {},
          isCreate;

        if (editStatus == consts.docConsts.ADD_STATUS) {
          isCreate = true;
        } else {
          isCreate = false;
        }
        if (type == "home") {
          response = await docFirst({
            year: currentYear,
            period: currentPeriod,
            isReturnValue: true,
          });
        } else if (type == "prev") {
          response = await docPrev({
            docCode: code,
            year: currentYear,
            period: currentPeriod,
            isReturnValue: true,
            isCreate: isCreate,
          });
        } else if (type == "next") {
          response = await docNext({
            docCode: code,
            year: currentYear,
            period: currentPeriod,
            isReturnValue: true,
            isCreate: isCreate,
          });
        } else if (type == "end") {
          response = await docLast({
            year: currentYear,
            period: currentPeriod,
            isReturnValue: true,
          });
        }
        const errorCode =
          type == "next"
            ? consts.docConsts.ALREADY_LAST_CERTIFICATE
            : type == "prev"
            ? consts.docConsts.ALREADY_FIRST_CERTIFICATE
            : "";
        if (response.result == false && response.error.code == errorCode) {
          this.$baseMessage(response.error.message, "warning");
          this.setNextOrPrivDis(type);
        } else {
          // certificateTemplate.entrys = await this.getMultiAccountBalance(response.value.entrys, consts.docConsts.VIEW_STATUS)
          //销项：1000030025；进项：1000030026
          let other = {};
          if (
            response &&
            response.value &&
            (response.value.sourceVoucherTypeId == "1000030025" ||
              response.value.sourceVoucherTypeId == "1000030026")
          ) {
            const period = response.value.voucherDate;
            const voucherDate = `${period.split("-")[0]}${
              period.split("-")[1]
            }`;
            // const invoices = await this.webapi.linkInvoice.getInvoiceInfoByVoucherId(
            //     { vchId: response.value.docId, yearPeriod: voucherDate, sourceVoucherTypeId: response.value.sourceVoucherTypeId })
            // if (invoices) {
            //     other['data.other.invoices'] = invoices
            // }
          }
          const oldperiod = this.doc.voucherDate;
          if (oldperiod != response.voucherDate) {
            const baseArchiveList = await docGetAllBaseInfos({
              voucherDate: response.value.voucherDate,
              isNotGetDoc: true,
              isNotGetAccount: true,
              isNotGetSummary: true,
            });
            this.setDocBaseInfo(baseArchiveList.value);
          }
          this.focusRowIndex = response.value.entrys.length - 1;
          this.loadDoc(response.value, consts.docConsts.VIEW_STATUS);
          if (type == "home" || type == "end") {
            this.setNextOrPrivDis(type);
          } else if (type == "next" || type == "prev") {
            this.nextDisabled = false;
            this.prevDisabled = false;
          }
        }
      },
      //设置翻页按钮可用与否的标识
      setNextOrPrivDis(type) {
        if (type == "home" || type == "prev") {
          this.prevDisabled = true;
          this.nextDisabled = false;
        } else if (type == "end" || type == "next") {
          this.prevDisabled = false;
          this.nextDisabled = true;
        }
      },
      showAttachedNum(e) {
        setTimeout(() => {
          this.$refs["attachedNum"].focus();
          this.$refs["attachedNum"].select();
        }, 0);
      },
      attachedNumChange(e) {
        let value = e.target.value;
        this.$set(this.doc, "attachedNum", value.replace(/[^0-9]/g, ""));
        if (this.editStatus == consts.docConsts.ADD_STATUS || !this.doc.docId) {
          this.changeStatus(
            consts.docConsts.ADD_STATUS,
            consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          );
        } else {
          this.changeStatus(
            consts.docConsts.EDIT_STATUS,
            consts.docConsts.STATUS_VOUCHER_NOT_AUDITED
          );
        }
        // this.$set(this.doc, "attachedNum", e);
      },
      gotoList() {
        let win = top.window.frames[0];
        if (!!win) {
          if (!!window.postMessage) {
            let url =
              env.accessUrl() +
              "/#/voucher/proofList?showPortal=false&token=" +
              this.$baseAccessToken();
            window.parent.postMessage(
              {
                method: "taxOpenSecondTab",
                data: { title: "凭证", url: url },
              },
              "*"
            );
          }
        } else {
          this.$router.push({
            name: "proofList",
          });
        }
      },
      //打印凭证
      async printDoc() {
        let tempWindow = window.open();
        if (tempWindow == null) {
          tempWindow = window;
        }
        let id = this.doc.docId;
        let option = {
          docIdsStr: `${id}`,
          token: this.$baseAccessToken(),
        };
        option.tempWindow = tempWindow;
        await docPrint(option);
      },
      //自动找平
      async autoEqualChange(type, value) {
        let otherObj = {},
          option = {};
        if (type.indexOf("isReverseForeignCurrency") > -1) {
          option.autoCalcMultiAmount = value ? 1 : 0;
          this.isReverseForeignCurrency = value;
        } else {
          option.autoBalance = value ? 1 : 0;
          this.isAutoEqualAmount = value;
        }
        await saveDocSetParam({ ...option });
      },
      //插入凭证
      insertDoc() {
        let currentCode = `${this.doc.docCode}`.padStart(5, "0"),
          currentDate = this.doc.voucherDate;
        if (currentCode == "99999") {
          this.$baseMessage("凭证号达到99999，不能再增加凭证", "error");
          return;
        }
        const enabledYearMonth = this.getEnabledYearMonth();
        this.clearAndNewDoc(
          { docCode: currentCode, voucherDate: currentDate, isInsert: true },
          undefined,
          undefined,
          enabledYearMonth
        );
      },
      //余额联查
      async handleClickBalance(accountingSubject) {
        if (accountingSubject && !accountingSubject.id) {
          this.$message({
            type: "warning",
            message: "不存在科目数据",
          });
          return;
        }

        const response = await isUsedInCertificate({
          id: accountingSubject.id,
        });
        if (response && !response.value) {
          this.$message({
            type: "warning",
            message: "此科目本期间内无数据",
          });
          return;
        }
        let option = this.getParamOption(accountingSubject);
        option.accessType = 1;
        if (!!accountingSubject.isCalc) {
          const appName = "app-auxdetailaccount-rpt";
          let win = top.window.frames[0];
          if (!!win) {
            if (!!window.postMessage) {
              window.parent.postMessage(
                {
                  method: "taxSecondTabOpenApp",
                  data: {
                    title: "辅助明细账",
                    appName,
                    appProps: option,
                  },
                },
                "*"
              );
            }
          }
        } else {
          const appName = "app-detailaccount-rpt";
          let win = top.window.frames[0];
          if (!!win) {
            if (!!window.postMessage) {
              window.parent.postMessage(
                {
                  method: "taxSecondTabOpenApp",
                  data: {
                    title: "明细账",
                    appName,
                    appProps: option,
                  },
                },
                "*"
              );
            }
          }
        }
      },

      getParamOption(accountingSubject) {
        const accountCode = accountingSubject.code,
          accountName = accountingSubject.codeAndName,
          auxItem = accountingSubject.auxAccountSubjectsPreSelected,
          date = this.voucherDate;

        let option = {},
          autItemParam = {};

        if (accountingSubject.isCalc) {
          const auxs = accountingSubject.calcDict;
          for (const [key] of Object.entries(auxs)) {
            //前后端字段不一样，大小写不一致，只能进行转换适配
            const _auxKey =
              `${key}`.toLowerCase().indexOf("excalc") > -1
                ? `${key}`.replace("isEx", "ex")
                : `${key}`.replace("isCalc", "").toLowerCase();

            if (accountingSubject[key] && auxItem[_auxKey]) {
              autItemParam[
                `${_auxKey.indexOf("exCalc") > -1 ? key : _auxKey + "Id"}`
              ] = auxItem[_auxKey].id;
            }
          }
          option = {
            linkInSearchValue: {
              accountCode: accountCode,
              date_start: date,
              date_end: date,
              assitForm: autItemParam,
            },
            linkInAccountName: accountName,
          };
        } else {
          option = {
            initSearchValue: {
              accountCode: accountCode,
              date_start: date,
              date_end: date,
            },
            linkInAccountName: accountName,
          };
        }
        return option;
      },
    },
    /**
     * 路由导航守卫
     * 1、beforeRouteEnter
     * 2、beforeRouteUpdate
     * 3、beforeRouteLeave
     */

    beforeRouteEnter(to, from, next) {
      next((vm) => {
        //因为当钩子执行前，组件实例还没被创建
        // vm 就是当前组件的实例相当于上面的 this，所以在 next 方法里你就可以把 vm 当 this 来用了。
        if (to && to.path.includes("/voucher/glVoucherCard")) {
          document.addEventListener("keydown", vm.handleKeyboard);
        }
        if (from && from.path.includes("/voucher/proofList")) {
          vm.isFromDocList = true;
        }
        let params = to.params;
        if (
          JSON.stringify(params) == "{}" &&
          to.query &&
          to.query.queryParams
        ) {
          params.accessType = JSON.parse(to.query.queryParams).accessType;
          params.id = JSON.parse(to.query.queryParams).initData.id;
          //处理参数
        }
        if (params) {
          vm.linkToDoc(params);
          vm.forceRerender();
        }
      });
    },

    beforeRouteUpdate(to, from, next) {
      //在当前路由改变，但是该组件被复用时调用
      //对于一个带有动态参数的路径 /good/:id，在 /good/1 和 /good/2 之间跳转的时候，
      // 由于会渲染同样的good组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
      // 可以访问组件实例 `this`
      next();
    },

    beforeRouteLeave(to, from, next) {
      // 导航离开该组件的对应路由时调用
      // 可以访问组件实例 `this`
      if (from && from.path == "/voucher/glVoucherCard") {
        document.removeEventListener("keydown", this.handleKeyboard);
        document.removeEventListener("message", this.onMessage);
      }
      next();
    },
  };
</script>

<style lang="scss">
  .glVoucherList {
    padding: 10px;

    &-head {
      display: flex;
      justify-content: space-between;
      width: 1020px;
      margin: 0 auto 10px;
      align-items: flex-end;
      height: 30px;
      color: #333333;
      &-left {
        display: flex;
        align-items: center;
        p {
          font-size: 18px;
          color: #333333;
          font-weight: bold;
          margin-right: 25px;
        }
        .keyboard {
          &:hover {
            color: #409eff;
          }
          cursor: pointer;
          .keyicon {
            margin-right: 5px;
            font-size: 15px;
          }
        }
      }
      &-right {
        display: flex;
        align-items: center;
        .icondiv {
          margin-right: 20px;
          // line-height: 32px;
          &:hover {
            color: #409eff;
          }
          cursor: pointer;
          i {
            margin-right: 5px;
            font-size: 15px;
          }
        }
        .settingclass {
          &:focus {
            color: #409eff;
          }
        }
        .el-button {
          border-radius: 50%;
          width: 24px;
          height: 24px;
          padding: 0;
          font-size: 14px;
          line-height: 22px;
          color: #333333;
        }
      }
    }

    &-body {
      width: 1020px;
      margin: auto;
      .lineclass {
        input {
          border-radius: 0;
          border: none;
          border-bottom: 1px solid #979797;
          height: 20px;
          line-height: 20px;
        }
      }
      &-title {
        background: #fff;
        border: 1px solid #d9d9d9;
        border-bottom: none;
        display: flex;
        justify-content: space-between;
        padding: 10px 18px;
        color: #333;
        span {
          font-weight: 300;
          font-size: 13px;
        }

        .input-right {
          width: 60px;
          margin-right: 30px;
        }
        .redDoc {
          input {
            color: red;
          }
        }

        .date {
          width: 115px;

          .el-input__inner {
            // padding-right: 10px;
            padding: 0 10px;
          }
          .el-input__prefix {
            left: 95px;
            top: -5px;
          }
        }
        &-left {
          height: 25px;
        }

        &-right {
          display: flex;
          align-items: center;
          height: 25px;

          .el-icon-tickets {
            margin-right: 0px;
            font-size: 15px;
            top: 2px;
            position: relative;
          }
          .el-icon-edit {
            margin-right: 3px;
            font-size: 15px;
          }
          .auditedImg {
            // transform: scale(0.5);
            // overflow: hidden;
            // position: absolute;
            // margin-top: -32px;
            // right: 450px;
            height: 30px;
          }
          .degree {
            font-size: 13px;
            font-weight: 700;
            font-family: "Microsoft Yahei,Helvetica Neue,Helvetica,Arial,sans-serif";
            display: inline-block;
            margin-right: 10px;
            line-height: 17px;
          }
          .isreversefc {
            margin-left: 8px;
            font-weight: 300;
            font-size: 13px;
          }
          .auto-balance {
            margin-left: 8px;
            font-weight: 300;
            font-size: 13px;
          }

          .comment {
            width: 50px;
            margin-right: 10px;
          }

          .input {
            width: 49px;
            // margin: 0 8px;
          }

          .attachment {
            margin-left: 10px;
            display: inline;
          }
          .quantityandfore {
            display: inline-block;
            vertical-align: top;
            white-space: normal;
          }
        }
      }
    }

    .commonTemplate-dialog {
      .el-dialog {
        width: 500px;
      }
    }
    .el-button {
      font-family: "Microsoft Yahei,Helvetica Neue,Helvetica,Arial,sans-serif";
      font-weight: 400;
    }

    &-content {
      border-left: 1px solid #d9d9d9;
      border-right: 1px solid #d9d9d9;
      padding: 0px;
      // .vxe-table--header-wrapper,
      // .vxe-table--footer-wrapper,
      // .vxe-table--body-wrapper,
      // .body--wrapper {
      //   position: inherit;
      //   position: inherit !important;
      // }
      .vxe-table.vxe-editable .vxe-body--column.col--dirty:before {
        border: none !important;
      }
      .quantityandfore {
        display: block;
        vertical-align: top;
        white-space: pre-line;
        height: 49px;
        overflow: auto;
        padding: 0px 6px;
        word-break: break-word;
        padding-left: 2px;
      }
      .vxe-table--footer-wrapper {
        overflow: hidden !important;
        vertical-align: top;
        height: 50px;
        display: inline-block;
      }
      .addColumn {
        position: absolute;
      }
      .cls-insert-remove {
        position: relative;
        background: #fff;
        width: 24px;
      }
      .cls-up-down {
        // position: absolute;
        // width: 20px;
        // right: -20px;
        position: relative;
        background: #fff;
        width: 24px;
      }
      .drag-btn {
        i {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 1px solid #666666;
          line-height: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .vxe-icon--plus:hover {
          color: #409eff;
          border: 1px solid #409eff;
        }
        .vxe-icon--close:hover {
          color: red;
          border: 1px solid red;
        }
        .vxe-icon--arrow-top,
        .vxe-icon--arrow-bottom {
          &:hover {
            opacity: 1;
          }
        }
        .vxe-icon--arrow-top:before {
          left: 0.25em;
          top: 0.3em;
        }
        .vxe-icon--arrow-bottom:before {
          top: 0.02em;
          left: 0.22em;
        }
      }
      .vxe-table {
        .vxe-table--header-wrapper {
          // zq opt
          .vxe-table--header-border-line {
            display: none;
          }
          .vxe-header--row {
            th {
              border-top: 1px solid #e8eaec;
            }
            th:first-child {
              background-image: none;
              background-color: #fff;
              border-top: none;
            }
            th:nth-child(2) {
              border-left: 1px solid #e8eaec;
            }
            th:last-child {
              background-image: none;
              background-color: #fff;
              border-top: none;
            }
            th:nth-last-child(2) {
              border-right: 1px solid #e8eaec;
              background-image: none;
            }
          }
        }
        .vxe-table--body-wrapper {
          overflow-x: hidden;
          .vxe-body--row {
            .col--selected {
              -webkit-box-shadow: none;
              box-shadow: none;
            }
            // zq opt
            .vxe-body--column:first-child {
              background-image: none;
              text-align: center;
            }
            .vxe-body--column:nth-child(2) {
              border-left: 1px solid #e8eaec;
            }
            .vxe-body--column:last-child {
              background-image: none;
              text-align: center;
            }
            .vxe-body--column:nth-last-child(2) {
              border-right: 1px solid #e8eaec;
            }
          }

          .vxe-cell {
            font-size: 13px;
            height: 49px;

            .el-input__inner,
            .vxe-input--inner {
              height: 49px;
            }
          }

          .summary {
            .vxe-cell {
              // padding-left: 4px;
              padding-left: 0px;
              display: block;
              padding-top: 1px;
              white-space: normal;
              line-height: 14px;
              font-size: 13px;
            }
            .vxe-input--suffix {
              display: none;
            }
          }
        }
        .vxe-table--footer-wrapper {
          border-top: none; // zq opt
          .vxe-footer--row {
            td {
              padding: 0;
              font-weight: bold;
              border-top: 1px solid #e8eaec; // zq opt
              background-image: linear-gradient(#fff6ea, #fff6ea);
              background-size: auto;
              border-bottom: 1px solid #e8eaec;
              border-right: 1px solid #e8eaec;
              // border-right: 1px solid #e8eaec;
            }
            td:first-child {
              // zq opt
              border-top: none;
              background-image: none;
              border-bottom: none;
            }
            td:nth-child(2) {
              // zq opt
              // border-right: none;
            }
            td:last-child {
              border-top: none;
              background-image: none;
              border-bottom: none;
            }
            td:nth-last-child(2) {
              border-right: 1px solid #e8eaec;
            }

            .money-cell-show .money-cell-bc:first-child {
              // border-left: 1px solid #e8eaec;
            }
          }
        }
        .vxe-table--border-line {
          // zq opt
          border-left: none;
          border-top: none;
          border-bottom: none;
        }
        .vxe-cell {
          padding: 0;
        }
        .vxe-header--column {
          padding: 0;
          text-align: center;
        }
      }
    }

    &-footer {
      display: flex;
      justify-content: space-between;
      padding: 10px 18px;
      border: 1px solid #d9d9d9;
      border-top: none;
      background: #fff;
      &-left {
        span {
          display: inline-block;
          min-width: 200px;
          font-weight: 300;
          font-size: 13px;
        }
      }

      &-right {
        .commonTemplate {
          margin-right: 10px;
        }
        .more {
          margin-left: 10px;
        }
      }
    }
    &-col-blue {
      background-color: #f9f9f9;
      height: 50px;
      overflow: hidden;
    }
  }
  .el-popover {
    .aux-dispaly-show {
      .aux-footer-btn {
        text-align: right;
      }
      .el-input__inner {
        border-radius: 0;
        border: none;
        border-bottom: 1px solid #409eff;
        height: 20px;
        line-height: 20px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  .app-main-height {
    height: 100%;
    background: #f6f6f6;
  }

  .el-popover {
    .autoEqualSetting {
      width: 260px;
      display: flex;
      flex-direction: column;

      .el-checkbox {
        margin-right: 5px;
      }

      .reverse {
        margin: 5px 0;
        font-size: 13px;
      }

      .tipOrg {
        color: #f58d3e;
        margin-left: 18px;
        font-size: 13px;
      }
    }
  }
</style>
