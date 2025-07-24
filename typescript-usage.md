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

```typescript
import PdfLoader from 'c-htmlpdf';

// 获取 DOM 元素
const element = document.querySelector('#pdf-content') as HTMLElement;

if (element) {
  // 创建 PdfLoader 实例
  const pdfLoader = new PdfLoader(element, '我的PDF文件');
  
  // 生成并下载 PDF
  pdfLoader.outPutPdfFn().then(() => {
    console.log('PDF 生成完成');
  }).catch((error) => {
    console.error('PDF 生成失败:', error);
  });
}
```

### 高级配置

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
    'page-break'      // 分页符类名 (可选，默认 'break_page')
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

  const pdfLoader = new PdfLoader(
    tableElement,
    '数据表格',
    595,
    842,
    'p',
    'table-row-item'  // 防止表格行被截断
  );

  return pdfLoader.outPutPdfFn('数据报表');
}
```

### 横向布局

```typescript
import PdfLoader from 'c-htmlpdf';

function createLandscapePdf() {
  const element = document.querySelector('#landscape-content') as HTMLElement;
  
  if (!element) return;

  const pdfLoader = new PdfLoader(
    element,
    '横向PDF',
    842,    // 横向时宽度更大
    595,    // 横向时高度较小
    'landscape'  // 横向布局
  );

  return pdfLoader.outPutPdfFn();
}
```

## 类型定义

### PdfOrientation 类型
```typescript
type PdfOrientation = 'p' | 'l' | 'portrait' | 'landscape';
```

### PdfLoader 类
```typescript
class PdfLoader {
  constructor(
    ele: HTMLElement,                    // 要转换的 DOM 元素
    pdfFileName: string,                 // PDF 文件名
    width?: number,                      // PDF 宽度，默认 595
    height?: number,                     // PDF 高度，默认 842
    orientation?: PdfOrientation,        // PDF 方向，默认 'p'
    splitClassName?: string,             // 防截断类名，默认 'itemClass'
    breakClassName?: string              // 分页符类名，默认 'break_page'
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

## 注意事项

1. 确保传入的 `ele` 参数是有效的 HTMLElement，而不是选择器字符串
2. 如果使用防截断功能，需要为可能被截断的元素添加指定的类名
3. 分页符功能通过添加 `breakClassName` 类名实现
4. 所有异步方法都返回 Promise，建议使用 try-catch 或 .catch() 处理错误

## 兼容性

- 支持现代浏览器环境
- 需要 DOM API 支持
- 依赖 jsPDF 和 html2canvas 库 