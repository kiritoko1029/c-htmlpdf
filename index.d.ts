declare module 'c-htmlpdf' {
  // jsPDF 类型定义 - 如果项目中没有安装 @types/jspdf，使用基础类型
  interface jsPDF {
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
    addPage(): void;
    save(fileName: string, options?: { returnPromise?: boolean }): Promise<void> | void;
    output(type: 'bloburi' | 'blob' | 'datauristring'): string | Blob;
  }

  /**
   * PDF 方向类型
   */
  type PdfOrientation = 'p' | 'l' | 'portrait' | 'landscape';

  /**
   * PdfLoader 类 - 将 HTML DOM 元素转换为 PDF
   * 
   * @author kirk
   * @version 2.0
   * 
   * 使用说明:
   * - ele: 需要导出 PDF 的容器元素 (DOM 节点，不是 ID)
   * - pdfFileName: 导出文件的名称，通过调用 outPutPdfFn 方法也可传参数改变
   * - width: PDF 宽度，默认为 595
   * - height: PDF 高度，默认为 842  
   * - orientation: PDF 方向，默认为 'p'，可选值为 'p'、'l'、'portrait'、'landscape'
   * - splitClassName: 避免分段截断的类名，当 PDF 有多页时需要传入此参数，避免 PDF 分页时截断元素
   * - breakClassName: 自定义分页符类名，默认为 'break_page'，添加该类名的标签被自动分页到下一页
   * 
   * @example
   * ```javascript
   * import PdfLoader from 'c-htmlpdf';
   * 
   * let dom = document.querySelector("#pdfDom");
   * let pdf = new PdfLoader(dom, "测试", 595, 842, 'p', "itemClass", 'break_page');
   * pdf.outPutPdfFn("测试");
   * ```
   */
  class PdfLoader {
    /**
     * 需要导出 PDF 的 DOM 元素
     */
    readonly ele: HTMLElement;
    
    /**
     * PDF 文件名
     */
    pdfFileName: string;
    
    /**
     * 避免分段截断的类名
     */
    readonly splitClassName: string;
    
    /**
     * 自定义分页符类名
     */
    readonly breakClassName: string;
    
    /**
     * PDF 宽度
     */
    readonly A4_WIDTH: number;
    
    /**
     * PDF 高度  
     */
    readonly A4_HEIGHT: number;
    
    /**
     * 页面高度
     */
    pageHeight: number;
    
    /**
     * 页码
     */
    pageNum: number;
    
    /**
     * PDF 方向
     */
    readonly orientation: PdfOrientation;

    /**
     * 构造函数
     * 
     * @param ele 需要导出 PDF 的容器元素 (DOM 节点，不是 ID)
     * @param pdfFileName 导出文件的名称
     * @param width PDF 宽度，默认 595
     * @param height PDF 高度，默认 842
     * @param orientation PDF 方向，默认 'p'
     * @param splitClassName 避免分段截断的类名，默认 "itemClass"
     * @param breakClassName 自定义分页符类名，默认 "break_page"
     */
    constructor(
      ele: HTMLElement,
      pdfFileName: string,
      width?: number,
      height?: number,
      orientation?: PdfOrientation,
      splitClassName?: string,
      breakClassName?: string
    );

    /**
     * 生成 PDF 对象
     * 
     * @returns Promise<jsPDF> 返回 jsPDF 实例的 Promise
     */
    genPDf(): Promise<jsPDF>;

    /**
     * 获取并下载 PDF 文件
     * 
     * @returns Promise<void>
     */
    getPDF(): Promise<void>;

    /**
     * 预览 PDF
     * 在浏览器中打开打印预览窗口
     * 
     * @returns Promise<void>
     */
    previewPdf(): Promise<void>;

    /**
     * 输出 PDF 文件
     * 
     * @param pdfFileName 可选的文件名，如果提供将覆盖构造函数中的文件名
     * @returns Promise<void> 返回 Promise，可以使用 then 方法处理 PDF 生成后的逻辑
     * 
     * @example
     * ```javascript
     * pdf.outPutPdfFn("新文件名").then(() => {
     *   console.log("PDF 生成完成");
     * });
     * ```
     */
    outPutPdfFn(pdfFileName?: string): Promise<void>;

    /**
     * 遍历 DOM 元素进行分页处理
     * 
     * @param dom 要处理的 DOM 元素
     */
    private domEach(dom: HTMLElement): void;

    /**
     * 检查元素是否包含指定类名
     * 
     * @param element HTML 元素
     * @param cls 类名
     * @returns boolean 是否包含该类名
     */
    private hasClass(element: HTMLElement, cls: string): boolean;
  }

  export default PdfLoader;
}

/**
 * 如果作为全局变量使用
 */
declare global {
  /**
   * PdfLoader 全局类型定义
   */
  class PdfLoader {
    constructor(
      ele: HTMLElement,
      pdfFileName: string,
      width?: number,
      height?: number,
      orientation?: 'p' | 'l' | 'portrait' | 'landscape',
      splitClassName?: string,
      breakClassName?: string
    );

    genPDf(): Promise<any>;
    getPDF(): Promise<void>;
    previewPdf(): Promise<void>;
    outPutPdfFn(pdfFileName?: string): Promise<void>;
  }
}

export {}; 