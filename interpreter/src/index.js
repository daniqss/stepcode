import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { step } from './interpreter.js';

export function parse(input) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer.tokenize());
  return parser.parse();
}

export { step };
