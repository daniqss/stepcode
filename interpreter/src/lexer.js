export const TokenType = {
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  KEYWORD: 'KEYWORD',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  NEWLINE: 'NEWLINE',
  INDENT: 'INDENT',
  DEDENT: 'DEDENT',
  EOF: 'EOF',
};

const KEYWORDS = new Set([
  'function',
  'end',
  'return',
  'if',
  'then',
  'else',
  'while',
  'do',
  'until',
  'repeat',
  'for',
  'to',
  'downto',
  'break',
  'continue',
]);

const OPERATORS = new Set([
  ':=',
  '=',
  '+',
  '-',
  '*',
  '/',
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  'and',
  'or',
  'not',
]);

const BOOLEANS = new Set(['true', 'false']);

export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.indentStack = [0];

    // Ensure input ends with newline for easier parsing
    if (!this.input.endsWith('\n')) {
      this.input += '\n';
    }
  }

  tokenize() {
    let isAtLineStart = true;

    while (this.position < this.input.length) {
      if (isAtLineStart) {
        let spaces = 0;
        while (this.peek() === ' ' || this.peek() === '\t') {
          if (this.peek() === '\t') spaces += 4;
          else spaces += 1;
          this.advance();
        }

        if (this.peek() === '\n' || this.peek() === '#' || this.isAtEnd()) {
          // Empty line or comment-only line, ignore indentation
          if (this.peek() === '#') this.skipComment();
          if (this.peek() === '\n') {
            this.advance();
            this.line++;
            this.column = 1;
          }
          continue;
        }

        isAtLineStart = false;

        let currentIndent = this.indentStack[this.indentStack.length - 1];
        if (spaces > currentIndent) {
          this.indentStack.push(spaces);
          this.addToken(TokenType.INDENT, '');
        } else if (spaces < currentIndent) {
          while (
            this.indentStack.length > 0 &&
            spaces < this.indentStack[this.indentStack.length - 1]
          ) {
            this.indentStack.pop();
            this.addToken(TokenType.DEDENT, '');
          }
          if (spaces !== this.indentStack[this.indentStack.length - 1]) {
            throw new Error(`IndentationError at line ${this.line}`);
          }
        }
      }

      const char = this.peek();

      if (char === ' ' || char === '\t') {
        this.advance();
        continue;
      }

      if (char === '#') {
        this.skipComment();
        continue;
      }

      if (char === '\n') {
        this.addToken(TokenType.NEWLINE, '\\n');
        this.advance();
        this.line++;
        this.column = 1;
        isAtLineStart = true;
        continue;
      }

      if (this.isDigit(char)) {
        this.number();
        continue;
      }

      if (this.isAlpha(char)) {
        this.identifier();
        continue;
      }

      // Two-character operators
      let twoChar = this.input.substring(this.position, this.position + 2);
      if (OPERATORS.has(twoChar)) {
        this.addToken(TokenType.OPERATOR, twoChar);
        this.advance();
        this.advance();
        continue;
      }

      // Single-character operators
      if (OPERATORS.has(char)) {
        this.addToken(TokenType.OPERATOR, char);
        this.advance();
        continue;
      }

      if ('()[],'.includes(char)) {
        this.addToken(TokenType.PUNCTUATION, char);
        this.advance();
        continue;
      }

      throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }

    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.addToken(TokenType.DEDENT, '');
    }

    this.addToken(TokenType.EOF, '');
    return this.tokens;
  }

  advance() {
    this.position++;
    this.column++;
    return this.input[this.position - 1];
  }

  peek() {
    if (this.isAtEnd()) return '\0';
    return this.input[this.position];
  }

  isAtEnd() {
    return this.position >= this.input.length;
  }

  isDigit(c) {
    return c >= '0' && c <= '9';
  }

  isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  skipComment() {
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.advance();
    }
  }

  number() {
    let start = this.position;
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() === '.' && this.isDigit(this.input[this.position + 1])) {
      this.advance(); // consume '.'
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, Number(this.input.substring(start, this.position)));
  }

  identifier() {
    let start = this.position;
    while (this.isAlphaNumeric(this.peek())) this.advance();

    let text = this.input.substring(start, this.position);

    if (BOOLEANS.has(text)) {
      this.addToken(TokenType.BOOLEAN, text === 'true');
    } else if (KEYWORDS.has(text)) {
      this.addToken(TokenType.KEYWORD, text);
    } else if (OPERATORS.has(text)) {
      // e.g. 'and', 'or', 'not'
      this.addToken(TokenType.OPERATOR, text);
    } else {
      this.addToken(TokenType.IDENTIFIER, text);
    }
  }

  addToken(type, value) {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column,
    });
  }
}
