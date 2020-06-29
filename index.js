const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { resolve } = require('path');
const katex = require('./katex.js');

module.exports = class Latex extends Plugin {
  async startPlugin () {
    this.loadStylesheet(resolve(__dirname, 'style.scss'));
    this.hljs = await getModule(  [ 'highlight' ]);
    this.patchLatex();
  }

  pluginWillUnload () {
    uninject('latex-renderer-hljs');
  }

  async patchLatex () {
    if (!this.hljs.getLanguage('latex')) {
      this.hljs.registerLanguage('latex', () => ({}));
    }
    inject('latex-renderer-hljs', this.hljs, 'highlight', (args, res) => {
      if (args[0] === 'latex') {
        const latex = args[1];
        const katexHTML = katex.renderToString(latex, { throwOnError: false })
          .replace('annotation encoding="application/x-tex"', 'annotation data-powercord-codeblock-copy encoding="application/x-tex"');
        return {
          language: 'latex',
          relevance: 0,
          top: {},
          value: katexHTML
        };
      }
      return res;
    });
  }
};
