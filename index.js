const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { resolve } = require('path');
const katex = require('./katex.js');

module.exports = class Latex extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.hljs = await getModule(  [ 'highlight' ]);
    // this.patchLatex();
  }

  pluginWillUnload () {
    uninject('latex-embed');
  }

  async patchLatex () {
    if (!this.hljs.getLanguage('latex')) {
      this.hljs.registerLanguage('latex', () => ({}));
    }
    const parser = await getModule([ 'parse', 'parseTopic' ]);
    inject('latex-inline', parser.defaultRules.codeBlock, 'react', (args, res) => {
      if (args && args[0].lang === 'latex') {
        this.injectLatex(args, res);
      }
      return res;
    });
  }

  injectLatex (args, codeblock) {
    const { render } = codeblock.props;

    codeblock.props.render = (codeblock) => {
      const res = render(codeblock);
      try {
        const d = res.props.children.props.dangerouslySetInnerHTML;
        const latex = d.__html.replace(/&amp;/g, '<').replace(/&amp;/g, '>').replace(/&amp;/g, '&');
        d.__html = katex.renderToString(latex, { throwOnError: false });
      } catch (error) {}
      return res;
    };
  }
};
