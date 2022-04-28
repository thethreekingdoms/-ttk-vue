<script>
export default {
  name: "NoteInput",
  props: {
    noteContent: String,
    noteDisable: Boolean,
  },
  data() {
    return {
      noteContentValue: "",
      isGetState: false,
    };
  },
  computed: {},
  methods: {
    handleInput(value) {     
      this.noteContentValue =
        value && value.length > 100 ? value.substring(0, 100) : value;
      this.isGetState = true;
    },
    handleChange(value) {     
    },
    handleBlur(event) {
      this.isGetState = false;
      this.$emit("handle-note", this.noteContentValue);
    },
  },
  render() {
    const noteContent = this.isGetState
      ? this.noteContentValue
      : this.noteContent;
    return (
      <div class="noteInput">
        <el-input
          placeholder="请输入批注内容"
          type="textarea"
          maxlength="100"
          show-word-limit
          onInput={this.handleInput}
          // onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={noteContent}
          disabled={this.noteDisable}
        ></el-input>
      </div>
    );
  },
};
</script>
<style lang="scss">
.noteInput-popover {
  padding: 0;
  width: 250px;
}
.noteInput {
  textarea {
    height: 150px !important;
  }
}
</style>
