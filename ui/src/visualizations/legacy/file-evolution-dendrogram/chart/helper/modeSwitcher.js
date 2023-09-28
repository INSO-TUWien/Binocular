const modeDB = {
  js: 'jsx',
  ts: 'jsx',
  json: 'jsx',
  jsx: 'jsx',
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  php: 'php',
  css: 'css',
  scss: 'css',
  c: 'cpp',
  cpp: 'cpp',
  cs: 'cpp',
  java: 'java',
  py: 'python',
  xml: 'xml',
  yml: 'yaml',
};

export default class ModeSwitcher {
  static modeFromExtension(ext) {
    return modeDB[ext] !== undefined ? modeDB[ext] : 'jsx';
  }
}
