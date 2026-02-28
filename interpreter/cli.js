import fs from 'fs';
import readline from 'readline';
import { parse, step } from './src/index.js';

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
        output: process.stdout
    });

    const question = () => new Promise(resolve => rl.question('', resolve));

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
                const vars = state && state.variables ? Object.entries(state.variables)
                        .filter(([k]) => k !== '<return>')
                        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                        .join(', ') : '';
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
    console.error("Error parsing or running code:", e.message);
    process.exit(1);
}
