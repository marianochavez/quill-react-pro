import Quill from 'quill';
// const Parchment = Quill.import('parchment');
const BaseSyntax = Quill.import('modules/syntax');
const CodeBlock = Quill.import('formats/code-block');
import CopyIcon from '../../assets/icons/copy.svg';
import { htmlDecode } from '../../utils';

class QSyntax extends BaseSyntax {
  constructor(quill, options) {
    super(quill, options);
    this.listener();
  }

  // 参考 BaseSyntax的initListener重构
  listener() {
    this.quill.on(Quill.events.SCROLL_BLOT_MOUNT, (blot) => {
      // if (!(blot instanceof CodeBlockContainer)) return;
      if (blot.domNode.getAttribute('class') !== 'ql-code-block-container') return;
      const container = this.quill.root.ownerDocument.createElement('div');
      const copy = this.quill.root.ownerDocument.createElement('span');
      const copyLabel = '<span>Copy</span>';
      copy.innerHTML = `${CopyIcon}${copyLabel}`;
      copy.className = 'ql-code-copy';
      copy.addEventListener('click', () => {
        const text = blot.domNode.innerHTML;
        window.navigator.clipboard.writeText(QSyntax.filterCode(text.split(copyLabel)[1]));
        copy.querySelector('span').innerHTML = 'Copied';
        setTimeout(() => {
          copy.querySelector('span').innerHTML = 'Copy';
        }, 2000);
      });

      const select = this.quill.root.ownerDocument.createElement('select');
      
      // Filter languages to only show available ones, plus loaded ones
      const availableLanguages = this.options.languages.filter(({ key }) => {
        // Allow 'plain' always, and check if language is registered in hljs
        return key === 'plain' || this.options.hljs.getLanguage(key);
      });
      
      availableLanguages.forEach(({ key, label }) => {
        const option = select.ownerDocument.createElement('option');
        option.textContent = label;
        option.setAttribute('value', key);
        select.appendChild(option);
      });
      
      select.addEventListener('change', async () => {
        const selectedLanguage = select.value;
        
        // If language is not loaded and we have a dynamic loader, try to load it
        if (selectedLanguage !== 'plain' && !this.options.hljs.getLanguage(selectedLanguage)) {
          if (window.loadHighlightLanguage) {
            try {
              await window.loadHighlightLanguage(selectedLanguage);
              // After loading, add it to the dropdown if it wasn't there
              const existingOption = select.querySelector(`option[value="${selectedLanguage}"]`);
              if (!existingOption) {
                const option = select.ownerDocument.createElement('option');
                const languageConfig = this.options.languages.find(l => l.key === selectedLanguage);
                option.textContent = languageConfig ? languageConfig.label : selectedLanguage;
                option.setAttribute('value', selectedLanguage);
                option.selected = true;
                select.appendChild(option);
              }
            } catch (error) {
              console.warn(`Failed to load language ${selectedLanguage}:`, error);
              // Revert to previous selection or plain
              select.value = 'plain';
              return;
            }
          } else {
            console.warn(`Language ${selectedLanguage} is not available and no dynamic loader found`);
            select.value = 'plain';
            return;
          }
        }
        
        blot.format(CodeBlock.blotName, select.value);
        this.quill.root.focus(); // Prevent scrolling
        this.highlight(blot, true);
      });
      
      container.append(select, copy);
      // if (blot.uiNode == null) {
      blot.attachUI(container); // blot.uiNode是有的，在BaseSyntax中已被创建，这里需要覆盖
      if (blot.prev && blot.prev.domNode) {
        const currentLanguage = CodeBlock.formats(blot.prev.domNode);
        // Only set if the language is available in the dropdown
        const optionExists = select.querySelector(`option[value="${currentLanguage}"]`);
        if (optionExists) {
          select.value = currentLanguage;
        }
      } // 编辑器中 content 再次渲染需要自动选上语言
      // }
    });
  }

  static filterCode(html) {
    return html
      .match(/(?<=<div[^<>]+?>)(.+?)(?=<\/div>)/g)
      .map((line) => htmlDecode(line.replace(/<[^<>]+>/g, '')))
      .join('\n');
  }
}

export default QSyntax;
