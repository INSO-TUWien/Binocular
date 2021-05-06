export class CodeLine {
  constructor(lineNumber, lineContent, author, authorColor) {
    this.author = author;
    this.lineNumber = lineNumber;
    this.changeCount = 0;
    this.mergeCount = 0;
    this.lineContent = lineContent;
    this.changeHistory = [];
    this.normalizedValue = 0;
    this.hslColor = {
      hue: 0,
      saturation: 0,
      lightness: 0,
      opacity: 1
    };
    this.authorColor = authorColor;
    this.oldAuthorColor = undefined;
  }
}
