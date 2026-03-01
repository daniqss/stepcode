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

import fs from 'fs';
import readline from 'readline';
import { Lexer } from './static/lexer.js';
import { Parser } from './static/parser.js';
import { step } from './static/interpreter.js';

function parse(input) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer.tokenize());
  return parser.parse();
}

const file = process.argv[2];

if (!file) {
  console.error('Usage: node cli.js <file.pseudocode>');
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const code = fs.readFileSync(file, 'utf-8');
const lines = code.split('\n');

try {
  const ast = parse(code);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = () => new Promise((resolve) => rl.question('', resolve));

  let state = step(ast, null); // Get initial state

  async function run() {
    while (true) {
      console.clear();

      const isReturning = state && state.variables && state.variables['<return>'] !== undefined;

      for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;

        if (state && state.nextLine === lineNum && !isReturning) {
          const vars = Object.entries(state.variables)
            .filter(([k]) => k !== '<return>')
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(', ');
          console.log(`>>>			${vars ? `[ ${vars} ]` : ''}`);
        }

        console.log(lines[i]);

        if (state && state.nextLine === lineNum && isReturning) {
          const vars = Object.entries(state.variables)
            .filter(([k]) => k !== '<return>')
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(', ');

          const returnVal = JSON.stringify(state.variables['<return>']);
          console.log(`>>> [ RETURN: ${returnVal} ]	${vars ? `[ ${vars} ]` : ''}`);
        }
      }

      if (!state || state.nextLine === null) {
        const vars =
          state && state.variables
            ? Object.entries(state.variables)
                .filter(([k]) => k !== '<return>')
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join(', ')
            : '';
        console.log(`>>>\t\t\t${vars ? `[ ${vars} ]` : ''}`);
        break;
      }

      await question();
      state = step(ast, state);
    }

    rl.close();
  }

  run();
} catch (e) {
  console.error('Error parsing or running code:', e.message);
  process.exit(1);
}
