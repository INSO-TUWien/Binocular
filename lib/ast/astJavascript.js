const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');

const parser = new Parser();
parser.setLanguage(JavaScript);

function ast_javascript(content) {
    return get_imports_of_data(content,parser);
}

function get_imports_of_data(content,parser){
    const tree = parser.parse(content.toString());
    const imports = tree.rootNode.children.filter(child => {
        return child.type == 'import_statement';
    });
    let importNames = [];
    let importChildren = [];

    imports.forEach(imp => {
        imp.children.filter(child => child.type == 'string').forEach(item => {
            importChildren.push(item);
        });
    });

    importChildren.forEach(imp => {
        let row = imp.startPosition.row;
        let start = imp.startPosition.column+1; //skip apostroph
        let end = imp.endPosition.column-1; //skip apostroph
        get_value_by_row_and_column_data(content,row,start,end,function (line){
            importNames.push(line);
        })
    });
    return importNames;
}

function get_value_by_row_and_column_data(content, row, start, end, callback) {
    var lines = content.split("\n");

    if (+row > lines.length) {
        throw new Error('File end reached without finding line');
    }

    callback( lines[+row].substring(start, end));
}

module.exports.ast_javascript = ast_javascript;