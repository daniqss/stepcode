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
  let history = [];

  const wrapper = document.createElement('div');
  wrapper.className = 'pseudo-runner';
  pre.replaceWith(wrapper);

  const display = document.createElement('pre');
  wrapper.appendChild(display);

  const controls = document.createElement('div');
  controls.className = 'pseudo-runner-controls';
  wrapper.appendChild(controls);

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⏮ Previous';
  prevBtn.style.display = 'none';
  controls.appendChild(prevBtn);

  const btn = document.createElement('button');
  btn.textContent = '▶ Run';
  controls.appendChild(btn);

  function formatVars(variables) {
    const vars = Object.entries(variables || {})
      .filter(([k]) => k !== '<return>')
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');
    return vars ? `[ ${vars} ]` : '[]';
  }

  function render() {
    const isReturning = state?.variables?.['<return>'] !== undefined;
    const rows = [];

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const isCurrent = state?.nextLine === lineNum;

      if (isCurrent && !isReturning) {
        const vars = formatVars(state.variables);
        rows.push(`<span class="indicator">&gt;&gt;&gt; ${vars}</span>`);
      }

      rows.push(`<span>${lines[i]}</span>`);

      if (isCurrent && isReturning) {
        const returnVal = JSON.stringify(state.variables['<return>']);
        const vars = formatVars(state.variables);
        rows.push(`<span class="indicator">&gt;&gt;&gt; [ RETURN: ${returnVal} ] ${vars}</span>`);
      }
    }

    if (!state) {
      btn.textContent = '▶ Run';
      running = false;
    } else if (state.nextLine === null) {
      const vars = formatVars(state.variables);
      rows.push(`<span class="indicator">&gt;&gt;&gt; ${vars}</span>`);
      btn.textContent = '↺ Restart';
      running = false;
    } else {
      btn.textContent = '⏭ Next';
      running = true;
    }

    prevBtn.style.display = history.length > 0 ? 'flex' : 'none';

    display.innerHTML = rows.join('\n');
  }

  btn.addEventListener('click', () => {
    if (!running || !state || state.nextLine === null) {
      state = step(ast, null);
      history = [];
    } else {
      history.push(state);
      state = step(ast, state);
    }
    render();
  });

  prevBtn.addEventListener('click', () => {
    if (history.length > 0) {
      state = history.pop();
      render();
    }
  });

  render();
});
