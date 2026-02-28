import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { step } from './interpreter.js';

export function parse(input) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer.tokenize());
  return parser.parse();
}

document.querySelectorAll('pre').forEach((pre) => {
  const code = pre.textContent.trim();

  let ast;
  try {
    ast = parse(code);
  } catch {
    return;
  }

  const lines = code.split('\n');
  let state = null;
  let running = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'pseudo-runner';
  pre.replaceWith(wrapper);

  const display = document.createElement('pre');
  wrapper.appendChild(display);

  const btn = document.createElement('button');
  btn.textContent = '▶ Ejecutar';
  wrapper.appendChild(btn);

  function formatVars(variables) {
    const vars = Object.entries(variables)
      .filter(([k]) => k !== '<return>')
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');
    return vars ? `[ ${vars} ]` : '';
  }

  function render() {
    const isReturning = state?.variables?.['<return>'] !== undefined;
    const rows = [];

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const isCurrent = state?.nextLine === lineNum;

      if (isCurrent && !isReturning) {
        const vars = formatVars(state.variables);
        rows.push(`<span class="indicator">&gt;&gt;&gt;\t\t\t${vars}</span>`);
      }

      rows.push(`<span>${lines[i]}</span>`);

      if (isCurrent && isReturning) {
        const returnVal = JSON.stringify(state.variables['<return>']);
        const vars = formatVars(state.variables);
        rows.push(`<span class="indicator">&gt;&gt;&gt; [ RETURN: ${returnVal} ]\t${vars}</span>`);
      }
    }

    if (!state) {
      // Do nothing
    } else if (state.nextLine === null) {
      const vars = formatVars(state.variables);
      rows.push(`<span class="indicator">&gt;&gt;&gt;\t\t\t${vars}</span>`);
      btn.textContent = '↺ Reiniciar';
      running = false;
    }

    display.innerHTML = rows.join('\n');
  }

  btn.addEventListener('click', () => {
    if (!running || !state || state.nextLine === null) {
      state = step(ast, null);
      running = true;
      btn.textContent = '⏭ Siguiente';
    } else {
      state = step(ast, state);
    }
    render();
  });

  render();
});
