const Parser = require('tree-sitter');
const Java = require('tree-sitter-java');

const parser = new Parser();
parser.setLanguage(Java);

function ast_java(content) {
    return get_imports_of_data(content, parser);
}

function get_imports_of_data(content, parser){
    const tree = parser.parse(content.toString());
    const imports = tree.rootNode.children.filter(child => {
        return child.type == 'import_declaration';
    });
    let importNames = [];
    imports.forEach(imp => {
        let row = imp.child(1).startPosition.row;
        let start = imp.child(1).startPosition.column;
        let end = imp.child(1).endPosition.column;
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

    callback(lines[+row].substring(start, end));
}

module.exports.ast_java = ast_java;