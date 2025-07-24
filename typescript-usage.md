# c-htmlpdf TypeScript 支持

本项目现已支持 TypeScript，提供完整的类型定义。

## 安装和配置

1. 安装包：
```bash
npm install c-htmlpdf
```

2. 确保您的项目支持 TypeScript 和 DOM 类型：
```bash
npm install --save-dev typescript @types/node
```

## TypeScript 使用示例

### 基础用法

#### 🆕 推荐：对象配置方式

```typescript
import PdfLoader from 'c-htmlpdf';

// 获取 DOM 元素
const element = document.querySelector('#pdf-content') as HTMLElement;

if (element) {
  // 使用对象配置方式创建 PdfLoader 实例（推荐）
  const pdfLoader = new PdfLoader(element, {
    pdfFileName: '我的PDF文件',
    width: 595,
    height: 842,
    orientation: 'portrait'
  });
  
  // 生成并下载 PDF
  pdfLoader.outPutPdfFn().then(() => {
    console.log('PDF 生成完成');
  }).catch((error) => {
    console.error('PDF 生成失败:', error);
  });
}
```

#### 传统参数方式（向后兼容）

```typescript
import PdfLoader from 'c-htmlpdf';

const element = document.querySelector('#pdf-content') as HTMLElement;

if (element) {
  // 传统方式（仍然支持）
  const pdfLoader = new PdfLoader(element, '我的PDF文件', 595, 842, 'p');
  
  pdfLoader.outPutPdfFn().then(() => {
    console.log('PDF 生成完成');
  });
}
```

### 高级配置

#### 🆕 对象配置方式（清晰易读）

```typescript
import PdfLoader from 'c-htmlpdf';

const element = document.querySelector('#content') as HTMLElement;

if (element) {
  const pdfLoader = new PdfLoader(element, {
    pdfFileName: '高级PDF',
    width: 595,                        // PDF 宽度
    height: 842,                       // PDF 高度
    orientation: 'portrait',           // PDF 方向：'p'|'l'|'portrait'|'landscape'
    splitClassName: 'no-break-item',   // 防止截断的类名
    breakClassName: 'page-break',      // 分页符类名
    processChildScrollable: true       // 是否处理子元素滚动
  });

  // 预览 PDF
  await pdfLoader.previewPdf();
}
```

#### 仅指定部分配置

```typescript
import PdfLoader from 'c-htmlpdf';

const element = document.querySelector('#content') as HTMLElement;

if (element) {
  // 只配置需要的参数，其他使用默认值
  const pdfLoader = new PdfLoader(element, {
    pdfFileName: '简单配置',
    orientation: 'landscape',          // 只改变方向为横向
    processChildScrollable: false      // 禁用子元素滚动处理
  });

  await pdfLoader.outPutPdfFn();
}
```

#### 传统参数方式（向后兼容）

```typescript
import PdfLoader from 'c-htmlpdf';

const element = document.querySelector('#content') as HTMLElement;

if (element) {
  const pdfLoader = new PdfLoader(
    element,           // DOM 元素
    '高级PDF',         // 文件名
    595,              // 宽度 (可选，默认 595)
    842,              // 高度 (可选，默认 842)
    'portrait',       // 方向 (可选，默认 'p')
    'no-break-item',  // 防止截断的类名 (可选，默认 'itemClass')
    'page-break',     // 分页符类名 (可选，默认 'break_page')
    true              // 是否处理子元素滚动 (可选，默认 true)
  );

  // 预览 PDF
  await pdfLoader.previewPdf();
}
```

### 获取 PDF 实例进行自定义操作

```typescript
import PdfLoader from 'c-htmlpdf';

async function customPdfGeneration() {
  const element = document.querySelector('#content') as HTMLElement;
  
  if (!element) return;

  const pdfLoader = new PdfLoader(element, '自定义PDF');
  
  try {
    // 获取 jsPDF 实例
    const pdfInstance = await pdfLoader.genPDf();
    
    // 进行自定义操作
    // pdfInstance.addImage(...);
    // pdfInstance.addPage();
    
    // 手动保存
    pdfInstance.save('自定义文件名.pdf');
  } catch (error) {
    console.error('生成失败:', error);
  }
}
```

### 表格数据处理

#### 🆕 对象配置方式

```typescript
import PdfLoader from 'c-htmlpdf';

function createTablePdf() {
  const tableElement = document.querySelector('#data-table') as HTMLElement;
  
  if (!tableElement) return;

  // 为表格行添加防截断类名
  const rows = tableElement.querySelectorAll('tr');
  rows.forEach(row => {
    row.classList.add('table-row-item');
  });

  const pdfLoader = new PdfLoader(tableElement, {
    pdfFileName: '数据表格',
    splitClassName: 'table-row-item',  // 防止表格行被截断
    orientation: 'portrait',
    processChildScrollable: true       // 处理表格内的滚动内容
  });

  return pdfLoader.outPutPdfFn('数据报表');
}
```

### 横向布局

#### 🆕 对象配置方式

```typescript
import PdfLoader from 'c-htmlpdf';

function createLandscapePdf() {
  const element = document.querySelector('#landscape-content') as HTMLElement;
  
  if (!element) return;

  const pdfLoader = new PdfLoader(element, {
    pdfFileName: '横向PDF',
    width: 842,              // 横向时宽度更大
    height: 595,             // 横向时高度较小
    orientation: 'landscape' // 横向布局
  });

  return pdfLoader.outPutPdfFn();
}
```

### 处理子元素滚动 (新功能)

#### 🆕 对象配置方式

```typescript
import PdfLoader from 'c-htmlpdf';

function handleChildScrollableElements() {
  // 场景：父容器不滚动，但内部有多个可滚动的子元素
  const parentContainer = document.querySelector('#parent-container') as HTMLElement;
  
  if (!parentContainer) return;

  // 启用子元素滚动处理（默认已启用）
  const pdfLoader = new PdfLoader(parentContainer, {
    pdfFileName: '包含滚动子元素的PDF',
    width: 595,
    height: 842,
    orientation: 'portrait',
    splitClassName: 'itemClass',
    breakClassName: 'break_page',
    processChildScrollable: true  // 启用子元素滚动处理
  });

  return pdfLoader.outPutPdfFn();
}

// 如果您不希望处理子元素滚动，可以禁用此功能
function disableChildScrollProcessing() {
  const element = document.querySelector('#simple-content') as HTMLElement;
  
  if (!element) return;

  const pdfLoader = new PdfLoader(element, {
    pdfFileName: '简单PDF',
    processChildScrollable: false  // 禁用子元素滚动处理，仅处理根元素
    // 其他参数使用默认值
  });

  return pdfLoader.outPutPdfFn();
}
```

### 复杂滚动场景示例

```typescript
import PdfLoader from 'c-htmlpdf';

// 处理包含多层嵌套滚动元素的复杂布局
function handleComplexScrollableLayout() {
  const complexLayout = document.querySelector('#complex-layout') as HTMLElement;
  
  if (!complexLayout) return;

  /*
   * 假设 HTML 结构如下：
   * <div id="complex-layout">
   *   <div class="header">标题</div>
   *   <div class="scrollable-sidebar" style="overflow-y: auto; height: 300px;">
   *     <ul>很多列表项...</ul>
   *   </div>
   *   <div class="main-content">
   *     <div class="scrollable-table" style="overflow: auto; max-height: 400px;">
   *       <table>大量数据行...</table>
   *     </div>
   *   </div>
   * </div>
   */

  const pdfLoader = new PdfLoader(
    complexLayout,
    '复杂布局PDF',
    595,
    842,
    'p',
    'table-row', // 防止表格行被截断
    'page-break',
    true  // 自动处理所有子元素滚动
  );

  // 新版本会自动：
  // 1. 发现 .scrollable-sidebar 有垂直滚动
  // 2. 发现 .scrollable-table 有滚动
  // 3. 临时展开所有滚动区域
  // 4. 捕获完整内容
  // 5. 恢复原始滚动状态

  return pdfLoader.outPutPdfFn('完整复杂布局');
}
```

### 配置方式对比

```typescript
// ❌ 传统方式：参数位置容易搞错，可读性差
const pdf1 = new PdfLoader(element, 'file', 595, 842, 'p', 'itemClass', 'break_page', true);

// ✅ 对象方式：清晰明了，不容易出错
const pdf2 = new PdfLoader(element, {
  pdfFileName: 'file',
  width: 595,
  height: 842,
  orientation: 'portrait',
  splitClassName: 'itemClass',
  breakClassName: 'break_page',
  processChildScrollable: true
});

// ✅ 只配置必要参数，其他使用默认值
const pdf3 = new PdfLoader(element, {
  pdfFileName: 'simple',
  orientation: 'landscape'
});
```

## 类型定义

### PdfOrientation 类型
```typescript
type PdfOrientation = 'p' | 'l' | 'portrait' | 'landscape';
```

### PdfLoaderOptions 接口
```typescript
interface PdfLoaderOptions {
  /** PDF 文件名，默认 'document' */
  pdfFileName?: string;
  /** PDF 宽度，默认 595 */
  width?: number;
  /** PDF 高度，默认 842 */
  height?: number;
  /** PDF 方向，默认 'p' */
  orientation?: PdfOrientation;
  /** 避免分段截断的类名，默认 'itemClass' */
  splitClassName?: string;
  /** 自定义分页符类名，默认 'break_page' */
  breakClassName?: string;
  /** 是否处理子元素滚动，默认 true */
  processChildScrollable?: boolean;
}
```

### PdfLoader 类
```typescript
class PdfLoader {
  // 🆕 推荐：对象配置方式
  constructor(element: HTMLElement, options?: PdfLoaderOptions);
  
  // 传统方式（向后兼容）
  constructor(
    element: HTMLElement,
    pdfFileName: string,
    width?: number,
    height?: number,
    orientation?: PdfOrientation,
    splitClassName?: string,
    breakClassName?: string,
    processChildScrollable?: boolean
  );

  // 生成 PDF 实例
  genPDf(): Promise<jsPDF>;
  
  // 下载 PDF 文件
  getPDF(): Promise<void>;
  
  // 预览 PDF
  previewPdf(): Promise<void>;
  
  // 输出 PDF 文件
  outPutPdfFn(pdfFileName?: string): Promise<void>;
}
```

## 滚动元素处理机制

### 自动检测逻辑

新版本会递归检查所有子元素，自动识别可滚动元素：

1. **内容溢出检测**: `scrollHeight > clientHeight` 或 `scrollWidth > clientWidth`
2. **样式检测**: `overflow`、`overflowY`、`overflowX` 为 `auto` 或 `scroll`
3. **递归处理**: 遍历所有子元素，包括深层嵌套的滚动容器

### 处理流程

```typescript
// 处理流程示意
const processFlow = {
  1: "扫描元素树，找出所有可滚动元素",
  2: "保存每个滚动元素的原始状态（位置、样式）",
  3: "临时修改样式：overflow: visible, height: auto",
  4: "重置滚动位置到顶部",
  5: "执行 html2canvas 渲染",
  6: "恢复所有元素的原始状态"
};
```

### 支持的滚动类型

- ✅ 垂直滚动 (`overflow-y: auto/scroll`)
- ✅ 水平滚动 (`overflow-x: auto/scroll`) 
- ✅ 双向滚动 (`overflow: auto/scroll`)
- ✅ 嵌套滚动容器
- ✅ 动态高度限制 (`max-height` + `overflow`)
- ✅ 固定尺寸滚动区域

## 注意事项

1. **元素引用**: 确保传入的 `ele` 参数是有效的 HTMLElement，而不是选择器字符串
2. **防截断功能**: 如果使用防截断功能，需要为可能被截断的元素添加指定的类名
3. **分页符功能**: 通过添加 `breakClassName` 类名实现自定义分页
4. **滚动处理**: 
   - 默认启用子元素滚动处理，适用于大多数场景
   - 如果性能敏感或布局简单，可以设置 `processChildScrollable: false`
5. **错误处理**: 所有异步方法都返回 Promise，建议使用 try-catch 或 .catch() 处理错误
6. **样式恢复**: 无论成功还是失败，都会自动恢复所有元素的原始样式和滚动状态

## 兼容性

- 支持现代浏览器环境
- 需要 DOM API 支持
- 依赖 jsPDF 和 html2canvas 库
- 支持 TypeScript 3.0+

## 性能考虑

- 递归扫描会增加少量初始化时间
- 大量滚动元素时建议分批处理
- 复杂布局建议使用防截断类名优化分页效果 