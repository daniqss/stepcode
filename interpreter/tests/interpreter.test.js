/*
 * stepcode: specialized tool for generating static books with interactive pseudocode.
 * Copyright (C) 2026  stepcode authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { Lexer } from '../static/lexer.js';
import { Parser } from '../static/parser.js';
import { step } from '../static/interpreter.js';

function parse(input) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer.tokenize());
  return parser.parse();
}

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
  assert.strictEqual(
    finalState.variables.hasOwnProperty('i'),
    false,
    'Variable i should not persist',
  );
});

test('Interpreter: for downto loop', () => {
  const ast = parse(`
sum := 0
for i = 4 downto 1 do
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

  assert.strictEqual(finalState.variables.sum, 10); // 4 + 3 + 2 + 1
  assert.strictEqual(finalState.variables.hasOwnProperty('i'), false);
});

test('Interpreter: for loop break', () => {
  const ast = parse(`
sum := 0
for i = 1 to 10 do
    sum := sum + i
    if i == 3 then
        break
    end if
end for
`);

  let state = step(ast, null);
  let finalState = state;
  while (true) {
    if (state.currentLine === null && state.nextLine === null) break;
    finalState = state;
    state = step(ast, state);
  }

  assert.strictEqual(finalState.variables.sum, 6); // 1 + 2 + 3
  assert.strictEqual(finalState.variables.hasOwnProperty('i'), false);
});

test('Interpreter: for loop scoping (preserves outer variable)', () => {
  const ast = parse(`
i := 100
sum := 0
for i = 1 to 3 do
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

  assert.strictEqual(finalState.variables.sum, 6);
  assert.strictEqual(finalState.variables.i, 100);
});
