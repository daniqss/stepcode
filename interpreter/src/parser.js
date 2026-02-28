import { TokenType } from './lexer.js';

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const statements = [];

    while (this.match(TokenType.NEWLINE)) {
      // Skip leading newlines
    }

    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
      while (this.match(TokenType.NEWLINE)) {
        // Skip extra newlines
      }
    }
    return { type: 'Program', body: statements };
  }

  parseStatement() {
    const line = this.peek().line;
    let stmt;
    if (this.matchKeyword('function')) {
      stmt = this.parseFunctionDeclaration();
    } else if (this.matchKeyword('if')) {
      stmt = this.parseIfStatement();
    } else if (this.matchKeyword('while')) {
      stmt = this.parseWhileStatement();
    } else if (this.matchKeyword('until')) {
      stmt = this.parseUntilStatement();
    } else if (this.matchKeyword('repeat')) {
      stmt = this.parseRepeatStatement();
    } else if (this.matchKeyword('for')) {
      stmt = this.parseForStatement();
    } else if (this.matchKeyword('return')) {
      stmt = this.parseReturnStatement();
    } else if (this.matchKeyword('break')) {
      this.consumeStatementEnd();
      stmt = { type: 'BreakStatement' };
    } else if (this.matchKeyword('continue')) {
      this.consumeStatementEnd();
      stmt = { type: 'ContinueStatement' };
    } else {
      stmt = this.parseExpressionOrAssignment();
    }
    stmt.line = line;
    return stmt;
  }

  parseFunctionDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
    this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after function name");
    const params = [];
    if (!this.checkPunctuation(')')) {
      do {
        params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
      } while (this.matchPunctuation(','));
    }
    this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after parameters");
    this.consumeStatementEnd();

    const body = this.parseBlock();

    this.consumeKeyword('end', "Expected 'end' at end of function");
    this.consumeKeyword('function', "Expected 'function' after 'end'");
    this.consumeStatementEnd();

    return { type: 'FunctionDeclaration', name, params, body };
  }

  parseIfStatement() {
    const condition = this.parseExpression();
    this.consumeKeyword('then', "Expected 'then' after if condition");
    this.consumeStatementEnd();

    const body = this.parseBlock();
    const elseIfs = [];
    let elseBody = null;

    while (this.matchKeyword('else')) {
      if (this.matchKeyword('if')) {
        const elifCondition = this.parseExpression();
        this.consumeKeyword('then', "Expected 'then' after else if condition");
        this.consumeStatementEnd();
        const elifBody = this.parseBlock();
        elseIfs.push({ condition: elifCondition, body: elifBody });
      } else {
        this.consumeStatementEnd();
        elseBody = this.parseBlock();
        break;
      }
    }

    this.consumeKeyword('end', "Expected 'end' at end of if");
    this.consumeKeyword('if', "Expected 'if' after 'end'");
    this.consumeStatementEnd();

    return { type: 'IfStatement', condition, body, elseIfs, elseBody };
  }

  parseWhileStatement() {
    const condition = this.parseExpression();
    this.consumeKeyword('do', "Expected 'do' after while condition");
    this.consumeStatementEnd();

    const body = this.parseBlock();

    const endToken = this.consumeKeyword('end', "Expected 'end' at end of while");
    this.consumeKeyword('while', "Expected 'while' after 'end'");
    this.consumeStatementEnd();

    return { type: 'WhileStatement', condition, body, endLine: endToken.line };
  }

  parseUntilStatement() {
    const condition = this.parseExpression();
    this.consumeKeyword('do', "Expected 'do' after until condition");
    this.consumeStatementEnd();

    const body = this.parseBlock();

    const endToken = this.consumeKeyword('end', "Expected 'end' at end of until");
    this.consumeKeyword('until', "Expected 'until' after 'end'");
    this.consumeStatementEnd();

    return { type: 'UntilStatement', condition, body, endLine: endToken.line };
  }

  parseRepeatStatement() {
    this.consumeStatementEnd();
    const body = this.parseBlock();

    if (this.matchKeyword('until')) {
      const untilToken = this.previous();
      const condition = this.parseExpression();
      this.consumeStatementEnd();
      return { type: 'RepeatUntilStatement', body, condition, endLine: untilToken.line };
    } else if (this.matchKeyword('while')) {
      const whileToken = this.previous();
      const condition = this.parseExpression();
      this.consumeStatementEnd();
      return { type: 'RepeatWhileStatement', body, condition, endLine: whileToken.line };
    } else {
      throw this.error(this.peek(), "Expected 'until' or 'while' after repeat block");
    }
  }

  parseForStatement() {
    const identifier = this.consume(
      TokenType.IDENTIFIER,
      'Expected variable name in for loop',
    ).value;
    this.consumeOperator('=', "Expected '=' after variable name");
    const start = this.parseExpression();

    let isDownto;
    if (this.matchKeyword('to')) {
      isDownto = false;
    } else if (this.matchKeyword('downto')) {
      isDownto = true;
    } else {
      throw this.error(this.peek(), "Expected 'to' or 'downto' in for loop");
    }

    const end = this.parseExpression();
    this.consumeKeyword('do', "Expected 'do' after for bounds");
    this.consumeStatementEnd();

    const body = this.parseBlock();

    const endToken = this.consumeKeyword('end', "Expected 'end' at end of for");
    this.consumeKeyword('for', "Expected 'for' after 'end'");
    this.consumeStatementEnd();

    if (isDownto) {
      return { type: 'ForDowntoStatement', identifier, start, end, body, endLine: endToken.line };
    } else {
      return { type: 'ForToStatement', identifier, start, end, body, endLine: endToken.line };
    }
  }

  parseReturnStatement() {
    if (this.check(TokenType.NEWLINE) || this.check(TokenType.EOF)) {
      this.consumeStatementEnd();
      return { type: 'ReturnStatement', value: null };
    }
    const value = this.parseExpression();
    this.consumeStatementEnd();
    return { type: 'ReturnStatement', value };
  }

  parseExpressionOrAssignment() {
    const expr = this.parseExpression();

    if (this.matchOperator(':=') || this.matchOperator('=')) {
      const value = this.parseExpression();
      this.consumeStatementEnd();

      if (expr.type === 'Identifier') {
        return { type: 'AssignmentStatement', identifier: expr.name, value };
      } else if (expr.type === 'ArrayAccess') {
        return {
          type: 'ArrayAssignmentStatement',
          identifier: expr.identifier,
          index: expr.index,
          value,
        };
      } else {
        throw this.error(this.previous(), 'Invalid assignment target');
      }
    }

    this.consumeStatementEnd();
    return { type: 'ExpressionStatement', expression: expr };
  }

  parseBlock() {
    this.consume(TokenType.INDENT, 'Expected indentation for block');
    const statements = [];

    while (this.match(TokenType.NEWLINE)) {
      // Skip empty lines at the beginning of the block
    }

    while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
      while (this.match(TokenType.NEWLINE)) {
        // Skip empty lines between statements
      }
    }
    this.consume(TokenType.DEDENT, 'Expected dedentation after block');
    return statements;
  }

  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let expr = this.parseAnd();
    while (this.matchOperator('or')) {
      const right = this.parseAnd();
      expr = { type: 'BinaryExpression', operator: 'or', left: expr, right };
    }
    return expr;
  }

  parseAnd() {
    let expr = this.parseEquality();
    while (this.matchOperator('and')) {
      const right = this.parseEquality();
      expr = { type: 'BinaryExpression', operator: 'and', left: expr, right };
    }
    return expr;
  }

  parseEquality() {
    let expr = this.parseComparison();
    while (this.matchOperator('==') || this.matchOperator('!=')) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      expr = { type: 'BinaryExpression', operator, left: expr, right };
    }
    return expr;
  }

  parseComparison() {
    let expr = this.parseTerm();
    while (
      this.matchOperator('<') ||
      this.matchOperator('<=') ||
      this.matchOperator('>') ||
      this.matchOperator('>=')
    ) {
      const operator = this.previous().value;
      const right = this.parseTerm();
      expr = { type: 'BinaryExpression', operator, left: expr, right };
    }
    return expr;
  }

  parseTerm() {
    let expr = this.parseFactor();
    while (this.matchOperator('+') || this.matchOperator('-')) {
      const operator = this.previous().value;
      const right = this.parseFactor();
      expr = { type: 'BinaryExpression', operator, left: expr, right };
    }
    return expr;
  }

  parseFactor() {
    let expr = this.parseUnary();
    while (this.matchOperator('*') || this.matchOperator('/')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      expr = { type: 'BinaryExpression', operator, left: expr, right };
    }
    return expr;
  }

  parseUnary() {
    if (this.matchOperator('not') || this.matchOperator('-')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      return { type: 'UnaryExpression', operator, argument: right };
    }
    return this.parseCallOrAccess();
  }

  parseCallOrAccess() {
    let expr = this.parsePrimary();

    while (true) {
      if (this.matchPunctuation('(')) {
        const args = [];
        if (!this.checkPunctuation(')')) {
          do {
            args.push(this.parseExpression());
          } while (this.matchPunctuation(','));
        }
        this.consumePunctuation(')', "Expected ')' after arguments");
        expr = { type: 'CallExpression', callee: expr, arguments: args };
      } else if (this.matchPunctuation('[')) {
        const index = this.parseExpression();
        this.consumePunctuation(']', "Expected ']' after array index");

        if (expr.type !== 'Identifier') {
          throw this.error(
            this.previous(),
            'Can only access array elements on identifiers currently',
          );
        }

        expr = { type: 'ArrayAccess', identifier: expr.name, index };
      } else {
        break;
      }
    }
    return expr;
  }

  parsePrimary() {
    if (this.match(TokenType.BOOLEAN)) {
      return { type: 'BooleanLiteral', value: this.previous().value };
    }
    if (this.match(TokenType.NUMBER)) {
      return { type: 'NumberLiteral', value: this.previous().value };
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: this.previous().value };
    }
    if (this.matchPunctuation('(')) {
      const expr = this.parseExpression();
      this.consumePunctuation(')', "Expected ')' after expression");
      return expr;
    }
    if (this.matchPunctuation('[')) {
      const elements = [];
      if (!this.checkPunctuation(']')) {
        do {
          elements.push(this.parseExpression());
        } while (this.matchPunctuation(','));
      }
      this.consumePunctuation(']', "Expected ']' after array elements");
      return { type: 'ArrayLiteral', elements };
    }

    // Special check for len which could be a keyword conceptually but is parsed as a function call.
    if (this.matchKeyword('len')) {
      return { type: 'Identifier', name: 'len' };
    }

    throw this.error(this.peek(), 'Expected expression');
  }

  // Helper functions

  match(type) {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  matchKeyword(keyword) {
    if (this.check(TokenType.KEYWORD) && this.peek().value === keyword) {
      this.advance();
      return true;
    }
    return false;
  }

  matchOperator(operator) {
    if (this.check(TokenType.OPERATOR) && this.peek().value === operator) {
      this.advance();
      return true;
    }
    return false;
  }

  matchPunctuation(punc) {
    if (this.check(TokenType.PUNCTUATION) && this.peek().value === punc) {
      this.advance();
      return true;
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  checkPunctuation(punc) {
    if (this.isAtEnd()) return false;
    return this.peek().type === TokenType.PUNCTUATION && this.peek().value === punc;
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  consumeKeyword(keyword, message) {
    if (this.matchKeyword(keyword)) return this.previous();
    throw this.error(this.peek(), message);
  }

  consumeOperator(operator, message) {
    if (this.matchOperator(operator)) return this.previous();
    throw this.error(this.peek(), message);
  }

  consumePunctuation(punc, message) {
    if (this.matchPunctuation(punc)) return this.previous();
    throw this.error(this.peek(), message);
  }

  consumeStatementEnd() {
    if (this.isAtEnd()) return;
    if (this.match(TokenType.NEWLINE)) return;
    if (this.check(TokenType.EOF)) return;
    throw this.error(this.peek(), 'Expected end of statement (newline or EOF)');
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(token, message) {
    return new Error(`[line ${token.line}] Error at '${token.value}': ${message}`);
  }
}
