const languageMappings: { [key: string]: string } = {
  js: 'tsx',
  ts: 'tsx',
  json: 'tsx',
  jsx: 'tsx',
  tsx: 'tsx',
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
  md: 'markdown',
};

export default class LanguageDetection {
  static languageFromExtension(ext: string): string {
    return languageMappings[ext] !== undefined ? languageMappings[ext] : 'jsx';
  }
}
