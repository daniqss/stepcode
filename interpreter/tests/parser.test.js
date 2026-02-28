import { test } from 'node:test';
import * as assert from 'node:assert';
import { Lexer } from '../src/lexer.js';
import { Parser } from '../src/parser.js';

test('Lexer: basic tokenization', () => {
    const input = `n := 4
m := true
x := [1, 2, 4, 5]
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    assert.strictEqual(tokens.length, 21);
});

test('Lexer: indentation', () => {
    const input = `if true then
    n := 1
end if
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    
    const types = tokens.map(t => t.type);
    assert.ok(types.includes('INDENT'));
    assert.ok(types.includes('DEDENT'));
});

test('Parser: assignment', () => {
    const input = `n := 4`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    
    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'AssignmentStatement');
    assert.strictEqual(ast.body[0].identifier, 'n');
    assert.strictEqual(ast.body[0].value.value, 4);
});

test('Parser: if statement', () => {
    const input = `if x > 0 then
    x := x - 1
else if x < 0 then
    x := x + 1
else
    x := 0
end if
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'IfStatement');
    assert.strictEqual(ast.body[0].elseIfs.length, 1);
    assert.ok(ast.body[0].elseBody);
});

test('Parser: while statement', () => {
    const input = `while x > 0 do
    x := x - 1
end while
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'WhileStatement');
});

test('Parser: repeat until statement', () => {
    const input = `repeat
    x := x - 1
until x == 0
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'RepeatUntilStatement');
});

test('Parser: for to statement', () => {
    const input = `for i = 1 to 10 do
    x := x + i
end for
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'ForToStatement');
    assert.strictEqual(ast.body[0].identifier, 'i');
});

test('Parser: function declaration', () => {
    const input = `function add(a, b)
    return a + b
end function
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'FunctionDeclaration');
    assert.strictEqual(ast.body[0].name, 'add');
    assert.strictEqual(ast.body[0].params.length, 2);
});

test('Parser: Array assignment and access', () => {
    const input = `x[1] := x[1] + 1`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    assert.strictEqual(ast.body.length, 1);
    assert.strictEqual(ast.body[0].type, 'ArrayAssignmentStatement');
    assert.strictEqual(ast.body[0].identifier, 'x');
    assert.strictEqual(ast.body[0].value.type, 'BinaryExpression');
});
