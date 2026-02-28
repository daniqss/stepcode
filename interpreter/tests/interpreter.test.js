import { test } from 'node:test';
import * as assert from 'node:assert';
import { parse, step } from '../src/index.js';

test('Interpreter: basic assignment and arithmetic', () => {
    const ast = parse(`
n := 4
m := n + 2
x := m * 2
`);
    
    let state = step(ast, null); // init
    state = step(ast, state); // n := 4
    assert.strictEqual(state.variables.n, 4);
    
    state = step(ast, state); // m := n + 2
    assert.strictEqual(state.variables.m, 6);
    
    state = step(ast, state); // x := m * 2
    assert.strictEqual(state.variables.x, 12);
    
    state = step(ast, state); // done
    assert.strictEqual(state.currentLine, null);
});

test('Interpreter: arrays', () => {
    const ast = parse(`
x := [1, 2, 4, 5]
x[1] := x[1] + 1
l := len(x)
`);

    let state = step(ast, null);
    let finalState = state;
    while (true) {
        if (state.currentLine === null && state.nextLine === null) break;
        finalState = state;
        state = step(ast, state);
    }
    
    assert.deepStrictEqual(finalState.variables.x, [2, 2, 4, 5]);
    assert.strictEqual(finalState.variables.l, 4);
});

test('Interpreter: if statement', () => {
    const ast = parse(`
n := 0
if true then
    n := 1
else
    n := 2
end if
`);

    let state = step(ast, null);
    let finalState = state;
    while (true) {
        if (state.currentLine === null && state.nextLine === null) break;
        finalState = state;
        state = step(ast, state);
    }
    
    assert.strictEqual(finalState.variables.n, 1);
});

test('Interpreter: while loop', () => {
    const ast = parse(`
n := 3
sum := 0
while n > 0 do
    sum := sum + n
    n := n - 1
end while
`);

    let state = step(ast, null);
    let finalState = state;
    while (true) {
        if (state.currentLine === null && state.nextLine === null) break;
        finalState = state;
        state = step(ast, state);
    }
    
    assert.strictEqual(finalState.variables.n, 0);
    assert.strictEqual(finalState.variables.sum, 6); // 3 + 2 + 1
});

test('Interpreter: for to loop', () => {
    const ast = parse(`
sum := 0
for i = 1 to 4 do
    sum := sum + i
end for
`);

    let state = step(ast, null);
    let finalState = state;
    while (true) {
        if (state.currentLine === null && state.nextLine === null) break;
        finalState = state;
        state = step(ast, state);
    }
    
    assert.strictEqual(finalState.variables.sum, 10); // 1 + 2 + 3 + 4
    assert.strictEqual(finalState.variables.i, 4); // Ends at 4
});
