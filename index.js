import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* 2.1版本，新增分页符功能，修复滚动元素渲染问题，优化样式处理策略 */
/* author:kirk */
/*
* 使用说明
* ele:需要导出pdf的容器元素(dom节点 不是id)
* pdfFileName: 导出文件的名字 通过调用outPutPdfFn方法也可传参数改变
* splitClassName: 避免分段截断的类名 当pdf有多页时需要传入此参数 , 避免pdf分页时截断元素  如表格<tr class="itemClass"></tr>
* 调用方式 先 let pdf = new PdfLoader(ele, 'pdf' ,'itemClass');
* 若想改变pdf名称 pdf.outPutPdfFn(fileName);  outPutPdfFn方法返回一个promise 可以使用then方法处理pdf生成后的逻辑
* */
/*
 breakClassName:自定义分页符类名，默认为break_page,添加改类名的标签被自动分页到下一页
 */
class PdfLoader {
    constructor(element, options = {}) {
        // 支持两种调用方式：
        // 1. 传统方式：new PdfLoader(ele, pdfFileName, width, height, ...)
        // 2. 对象方式：new PdfLoader(ele, { pdfFileName: 'name', width: 595, ... })
        
        if (typeof options === 'string') {
            // 传统方式：参数依次传入
            const [pdfFileName, width=595, height=842, orientation='p', splitClassName="itemClass", breakClassName="break_page", processChildScrollable=true] = Array.from(arguments).slice(1);
            this.ele = element;
            this.pdfFileName = pdfFileName;
            this.A4_WIDTH = width;
            this.A4_HEIGHT = height;
            this.orientation = orientation;
            this.splitClassName = splitClassName;
            this.breakClassName = breakClassName;
            this.processChildScrollable = processChildScrollable;
        } else {
            // 对象方式：通过配置对象传入
            this.ele = element;
            this.pdfFileName = options.pdfFileName || 'document';
            this.A4_WIDTH = options.width || 595;
            this.A4_HEIGHT = options.height || 842;
            this.orientation = options.orientation || 'p';
            this.splitClassName = options.splitClassName || 'itemClass';
            this.breakClassName = options.breakClassName || 'break_page';
            this.processChildScrollable = options.processChildScrollable !== undefined ? options.processChildScrollable : true;
        }
        
        this.pageHeight = 0;
        this.pageNum = 1;
    };

    // 递归查找并处理所有可滚动元素
    findAndProcessScrollableElements(element) {
        const scrollableElements = [];
        
        // 检查当前元素是否可滚动
        const computedStyle = window.getComputedStyle(element);
        const hasScrollableContent = element.scrollHeight > element.clientHeight || 
                                   element.scrollWidth > element.clientWidth;
        const hasScrollableStyle = ['hidden','auto', 'scroll'].includes(computedStyle.overflow) ||
                                  ['hidden','auto', 'scroll'].includes(computedStyle.overflowY) ||
                                  ['hidden', 'scroll'].includes(computedStyle.overflowX);
        
        if (hasScrollableContent && hasScrollableStyle) {
            // 保存原始状态
            const originalState = {
                element: element,
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft,
                overflow: element.style.overflow,
                overflowX: element.style.overflowX,
                overflowY: element.style.overflowY
            };
            
            scrollableElements.push(originalState);
            
            // 临时修改样式 - 只修改 overflow 相关属性
            element.style.overflow = 'visible';
            element.style.overflowX = 'visible';
            element.style.overflowY = 'visible';
            element.scrollTop = 0;
            element.scrollLeft = 0;
        }
        
        // 递归处理子元素
        for (let child of element.children) {
            scrollableElements.push(...this.findAndProcessScrollableElements(child));
        }
        
        return scrollableElements;
    }
    
    // 恢复所有元素的原始状态
    restoreElementsState(scrollableElements) {
        scrollableElements.forEach(state => {
            const el = state.element;
            el.style.overflow = state.overflow;
            el.style.overflowX = state.overflowX;
            el.style.overflowY = state.overflowY;
            el.scrollTop = state.scrollTop;
            el.scrollLeft = state.scrollLeft;
        });
    }

    async genPDf() {
        return new Promise((resolve, reject) => {
            let ele = this.ele;
            
            // 查找并处理所有可滚动的子元素（如果启用了该功能）
            let scrollableElements = [];
            try {
                if (this.processChildScrollable) {
                    scrollableElements = this.findAndProcessScrollableElements(ele);
                }
            } catch (error) {
                reject(new Error('Failed to process scrollable elements: ' + error.message));
                return;
            }
            
            // 等待样式应用
            setTimeout(() => {
                try {
                    let eleW = ele.offsetWidth // 获得该容器的宽
                    let eleH = ele.scrollHeight // 获得该容器的完整高度（包括滚动区域）
                    let eleOffsetTop = ele.offsetTop // 获得该容器到文档顶部的距离
                    let eleOffsetLeft = ele.offsetLeft // 获得该容器到文档最左的距离
                    let canvas = document.createElement("canvas")
                    let abs = 0
                    let win_in = document.documentElement.clientWidth || document.body.clientWidth // 获得当前可视窗口的宽度（不包含滚动条）
                    let win_out = window.innerWidth // 获得当前窗口的宽度（包含滚动条）
                    if (win_out > win_in) {
                        abs = (win_out - win_in) / 2 // 获得滚动条宽度的一半
                    }
                    canvas.width = eleW * 2 // 将画布宽&&高放大两倍
                    canvas.height = eleH * 2
                    let context = canvas.getContext("2d")
                    context.scale(2, 2) // 增强图片清晰度
                    context.translate(- eleOffsetLeft - abs, - eleOffsetTop)
                
                html2canvas(ele, {
                    useCORS: true, // 允许canvas画布内可以跨域请求外部链接图片, 允许跨域请求。
                    allowTaint: true, // 允许跨域图片
                    scale: 2, // 提高清晰度
                    scrollX: 0, // 确保从左上角开始
                    scrollY: 0,
                    width: eleW, // 明确指定宽度
                    height: eleH, // 明确指定高度（包括滚动区域）
                    windowWidth: eleW,
                    windowHeight: eleH
                }).then(async canvas => {
                    // 恢复所有滚动元素的原始状态
                    this.restoreElementsState(scrollableElements);
                    
                    let contentWidth = canvas.width
                    let contentHeight = canvas.height
                    // 一页pdf显示html页面生成的canvas高度;
                    this.pageHeight = (contentWidth / this.A4_WIDTH) * this.A4_HEIGHT
                    // 这样写的目的在于保持宽高比例一致 this.pageHeight/canvas.width = a4纸高度/a4纸宽度// 宽度和canvas.width保持一致
                    // 未生成pdf的html页面高度
                    let leftHeight = contentHeight
                    // 页面偏移
                    let position = 0
                    // a4纸的尺寸[595,842],单位像素，html页面生成的canvas在pdf中图片的宽高
                    let imgWidth = this.A4_WIDTH -10 // -10为了页面有右边距
                    let imgHeight = (this.A4_WIDTH / contentWidth) * contentHeight
                    let pageData = canvas.toDataURL("image/jpeg", 1.0)
                    let pdf = jsPDF(this.orientation, "pt", "a4");
                    // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                    // 当内容未超过pdf一页显示的范围，无需分页
                    if (leftHeight < this.pageHeight) { // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
                        pdf.addImage(pageData, "JPEG", 5, 0, imgWidth, imgHeight)
                        // pdf.addImage(pageData, 'JPEG', 20, 40, imgWidth, imgHeight);
                    } else { // 分页
                        while (leftHeight > 0) {
                            pdf.addImage(pageData, "JPEG", 5, position, imgWidth, imgHeight)
                            leftHeight -= this.pageHeight
                            position -= this.A4_HEIGHT
                            // 避免添加空白页
                            if (leftHeight > 0) {
                                pdf.addPage()
                            }
                        }
                    }
                    this.ele.style.height = '';
                    resolve(pdf);
                }).catch(err => {
                    // 发生错误时也要恢复所有滚动元素的原始状态
                    this.restoreElementsState(scrollableElements);
                    reject(err);
                });
                } catch (error) {
                    // 处理 setTimeout 内部的同步错误
                    this.restoreElementsState(scrollableElements);
                    reject(error);
                }
            }, 100); // 给足够时间让样式变更生效
        })

    };
    async getPDF() {
        return new Promise((resolve, reject) => {
            let pdfFileName = this.pdfFileName
            this.genPDf().then((pdf) => {
                pdf.save(pdfFileName + ".pdf", {returnPromise: true}).then(() => { // 去除添加的空div 防止页面混乱
                    let doms = document.querySelectorAll('.emptyDiv')
                    for (let i = 0; i < doms.length; i++) {
                        doms[i].remove();
                    }
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
    async previewPdf() {
        return new Promise((resolve, reject) => { // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
            let target = this.ele;
            this.pageHeight = target.scrollWidth / this.A4_WIDTH * this.A4_HEIGHT;
            this.ele.style.height = 'initial';
            this.pageNum = 1; // pdf页数
            this.domEach(this.ele)
            // 异步函数，导出成功后处理交互
            this.genPDf().then((pdf) => {
                const iframe = document.createElement('iframe');
                let target = this.ele;
                this.pageHeight = target.scrollWidth / this.A4_WIDTH * this.A4_HEIGHT;
                this.ele.style.height = 'initial';
                this.pageNum = 1; // pdf页数
                this.domEach(this.ele)
                iframe.src = pdf.output('bloburi');
                // 创建一个新的style元素
                const style = document.createElement('style');
                style.type = 'text/css';
                style.media = 'print';  // 确保这些样式仅应用于打印

                // CSS规则：指定打印时使用横向布局
                const css = '@page { size: landscape; }';

                // 添加CSS规则到style元素
                style.appendChild(document.createTextNode(css)); // 针对其他浏览器
                iframe.style.width = '100%';
                iframe.style.height = '100%'; // 可以根据需要调整大小
                iframe.style.display = 'none'

                document.body.appendChild(iframe);
                iframe.focus();
                // 对于现代浏览器
                iframe.contentDocument.head.appendChild(style);
                iframe.contentWindow.print();
                // 检查打印预览是否关闭
                let checkPrintPreviewClosed = setInterval(function() {
                    // 注意：这里的条件检测依赖于具体浏览器的实现，可能需要调整
                    if (document.hidden) {
                        // 当文档再次变为可见时，认为打印预览已关闭
                        clearInterval(checkPrintPreviewClosed);
                        // 移除iframe
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 500);
                resolve();
            }).catch(err => {
                reject(err);
            })
        })

    }
    // 输出pdf
    async outPutPdfFn(pdfFileName) {
        return new Promise((resolve, reject) => { // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
            let target = this.ele;
            this.pageHeight = target.scrollWidth / this.A4_WIDTH * this.A4_HEIGHT;
            this.ele.style.height = 'initial';
            pdfFileName ? this.pdfFileName = pdfFileName : null;
            this.pageNum = 1; // pdf页数
            this.domEach(this.ele)
            // 异步函数，导出成功后处理交互
            this.getPDF().then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        })
    };
    domEach(dom) {
        let childNodes = dom.childNodes
        childNodes.forEach((childDom, index) => {
            if (this.hasClass(childDom, this.splitClassName)) {
                let node = childDom;
                let eleBounding = this.ele.getBoundingClientRect();
                let bound = node.getBoundingClientRect();
                let offset2Ele = bound.top - eleBounding.top
                let currentPage = Math.ceil((bound.bottom - eleBounding.top) / this.pageHeight); // 当前元素应该在哪一页
                if (this.pageNum < currentPage) {
                    this.pageNum ++
                    let divParent = childDom.parentNode; // 获取该div的父节点
                    let newNode = document.createElement('div');
                    newNode.className = 'emptyDiv';
                    newNode.style.background = 'white';
                    newNode.style.height = (this.pageHeight * (this.pageNum - 1) - offset2Ele + 30) + 'px'; // +30为了在换下一页时有顶部的边距
                    newNode.style.width = '100%';
                    let next = childDom.nextSibling;
                    // 获取div的下一个兄弟节点
                    // 判断兄弟节点是否存在
                    if (next) { // 存在则将新节点插入到div的下一个兄弟节点之前，即div之后
                        divParent.insertBefore(newNode, node);
                    } else { // 不存在则直接添加到最后,appendChild默认添加到divParent的最后
                        divParent.appendChild(newNode);
                    }
                }
            }
            if (this.hasClass(childDom, this.breakClassName)) {
                this.pageNum ++
                console.log('break_page');
                let eleBounding = this.ele.getBoundingClientRect();
                let bound = childDom.getBoundingClientRect();
                let offset2Ele = bound.top - eleBounding.top
                // 剩余高度
                let alreadyHeight = offset2Ele % this.pageHeight
                let remainingHeight = this.pageHeight - alreadyHeight + 20
                childDom.style.height = remainingHeight + 'px'
            }
            if (childDom.childNodes.length) {
                this.domEach(childDom)
            }
        })
    }
    hasClass(element, cls) {
        return(`` + element.className + ``).indexOf(`` + cls + ``) > -1;
    }
}

export default PdfLoader;
