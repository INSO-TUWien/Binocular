const modeDB = {
  js: 'javascript',
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
  java: 'clike',
  py: 'python',
  r: 'r',
  xml: 'xml'
};

export default class ModeSwitcher {
  static modeFromExtension(ext) {
    return modeDB[ext] !== undefined ? modeDB[ext] : '';
  }
}
