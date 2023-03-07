const modeDB = {
  js: 'javascript',
  ts: 'javascript',
  json: 'javascript',
  jsx: 'jsx',
  html: 'htmlmixed',
  htm: 'htmlmixed',
  xhtml: 'htmlmixed',
  php: 'php',
  css: 'htmlmixed',
  scss: 'htmlmixed',
  c: 'clike',
  cpp: 'clike',
  cs: 'clike',
  java: 'text/x-java',
  py: 'python',
  xml: 'xml',
  yml: 'yaml',
};

export default class ModeSwitcher {
  static modeFromExtension(ext) {
    return modeDB[ext] !== undefined ? modeDB[ext] : '';
  }
}
