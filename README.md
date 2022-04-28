## 安装

```bash

# 进入项目目录
cd @ttk/vue
# 安装依赖
cnpm i
# 本地开发 启动项目
npm run serve
```


表头：
column：列配置对象
columnIndex：相对于 columns 中的索引
$columnIndex：相对于可视区渲染中的列索引（也就是说和实际渲染 th 相对应）
_columnIndex：相对于当前表格列的索引

单元格：
row：行数据对象
rowIndex：相对于 data 中的索引
$rowIndex：相对于可视区渲染中的行索引（也就是说和实际渲染 tr 相对应）
_rowIndex：相对于当前表格数据的索引（比如排序后、筛选之后等的相对索引）
column：列配置对象
columnIndex：相对于 columns 中的索引
$columnIndex：相对于可视区渲染中的列索引（也就是说和实际渲染 th 相对应）
_columnIndex：相对于当前表格列的索引

表尾：
$rowIndex：相对于 footerData 中的索引
items：行的数据集
itemIndex：行的数据集中项索引（相对于 items 的索引）
column：列配置对象
columnIndex：相对于 columns 中的索引
_columnIndex：相对于当前表格列的索引