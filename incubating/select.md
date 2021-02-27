# Select 下拉框组件

**Select** 组件扩展了原生 SELECT 标签，调整了显示样式，增加了输入功能。

## 使用

Select 组件的依赖库和组件列表如下：

* [root.js 基础库](/root.js/root.md)
* [Model 数据加载模型 root.model.js](/root.js/model.md)
* Select 组件样式 `root.select.css`

```html
<script type="text/javascript" src="/root.js"></script>
<script type="text/javascript" src="/root.model.js"></script>
<script type="text/javascript" src="/root.select.js"></script>
<link href="/root.select.css" rel="stylesheet" type="text/css" />
```

## 示例

<script type="text/javascript" src="@/root.model.js"></script>
<script type="text/javascript" src="@/root.select.js"></script>
<link href="@/root.select.css" rel="stylesheet" type="text/css" />

### 默认下拉框

```html
    <select name="select1">
        <option value="1">a1</option>
        <option value="2">a2</option>
        <option value="3">a3</option>
    </select>
```

不设置其他属性时效果如下

<select name= "select1">
    <option value="1">a1</option>
    <option value="2">a2</option>
    <option value="3">a3</option>
</select>

### 设置 data 属性

```html
    <select name="select2"
            data='[{"id":0,"title":"测试0"},{"id":1,"title":"测试1"},{"id":2,"title":"测试2"},{"id":3,"title":"测试3"},{"id":4,"title":"测试4"},{"id":5,"title":"测试5"}]'>
        <option value="@[id]">@[title]</option>
    </select>
```

`data`属性可接收 Json 数据、PQL 查询语句或接口地址，具体参考 [data 属性](/root.js/data.md)

<select name="select2"
        data='[{"id":0,"title":"测试0"},{"id":1,"title":"测试1"},{"id":2,"title":"测试2"},{"id":3,"title":"测试3"},{"id":4,"title":"测试4"},{"id":5,"title":"测试5"}]'>
    <option value="@[id]">@[title]</option>
</select>


### 是否可输入

```html
    <select name="select3"
            inputable="true"
            data="SELECT id, title FROM table1">
        <option value="@[id]">@[title]</option>
    </select>
```

`inputable` 属性可不写，默认值 `false` ，为 `true` 时可以添加输入内容为新选项，输入完成后按下回车键即可。`inputable`也接受可转成布尔值的其他值，如`1`、`yes`、`on`等。

<select
        name="select3"
        inputable="true"
        data='[{"id":0,"title":"测试0"},{"id":1,"title":"测试1"},{"id":2,"title":"测试2"},{"id":3,"title":"测试3"},{"id":4,"title":"测试4"},{"id":5,"title":"测试5"}]'>
    <option value="@[id]">@[title]</option>
</select>


## 标签和类

### 标签属性

标签属性在 SELECT 标签上设置。

* `name` 选择器的名称或 id，可用于事件绑定、获取结果等操作，为使用方便这项尽量赋值。
* `inputable` 是否可输入，默认值为`false`。
* `size` 调整组件大小，可选值为`middle`、`small`、`large`，默认值为`middle`;
* `disabled` 设置选择框是否禁用，默认值为`false`。

### 选择器

Select 下拉框组件可用的选择器有两个：

* `$select(name)` 这个选择器返回 Select 对象，可以访问 Select 对象的属性和方法，由于加载顺序问题，需要在页面加载完成后使用。例如：
    ```javascript
    $finish(function() {
        let value = $select(name).value;
    });
    ```
* `$listen(name)` 这个主要为 Select 对象添加事件，不需要等待页面加载完成，可随时调用。如
    ```javascript
    $listen('name').on('change', function(before, current) {
        ......
    });
    ```

### 属性

* `value` 返回当前选择框的结果。
* `text` 返回当前选择框的结果对应的文字描述。
* `selectedIndex` 返回或设置当前选中结果的索引，默认值为`-1`。

### 事件

只有一个`onchange`事件，当选择框结果改变（选择完成）后触发，事件接受两个参数：`before` 改变前的选项，`current` 为当前的选项。

```javascript
$finish(function() {
    $select(name).on('change', function(before, current) {
        let text = before.text;
        let value = current.value;
        /*
        before: {
            value: value,
            text: text
        }
        */
    });
});
```

建议使用`$listen`方法绑定事件，不需要等待页面和组件加载完成。

---
参考链接

* [root.js 基础库](/root.js/root.md)
* [Model 数据加载模型 root.model.js](/root.js/model.md)


