class FunctionCallSuspend extends Error {
    constructor(funcDef, localVars) {
        super("Suspend");
        this.funcDef = funcDef;
        this.localVars = localVars;
    }
}

function getVariable(stack, name) {
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].scope && stack[i].scope.hasOwnProperty(name)) {
            return stack[i].scope[name];
        }
    }
    return undefined;
}

function setVariable(stack, name, value) {
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].scope && stack[i].scope.hasOwnProperty(name)) {
            stack[i].scope[name] = value;
            return;
        }
    }
    if (stack.length > 0) {
        stack[stack.length - 1].scope[name] = value;
    }
}

function flattenVariables(stack) {
    const vars = {};
    for (const frame of stack) {
        if (frame.scope) {
            Object.assign(vars, frame.scope);
        }
    }
    return vars;
}

export function evaluateExpression(expr, stack, functions, evalState) {
    if (!expr) return null;

    switch (expr.type) {
        case 'NumberLiteral':
        case 'BooleanLiteral':
            return expr.value;
        case 'Identifier': {
            const val = getVariable(stack, expr.name);
            if (val !== undefined) {
                return val;
            }
            throw new Error(`Undefined variable: ${expr.name}`);
        }
        case 'BinaryExpression': {
            if (expr.operator === 'and') {
                const leftAnd = evaluateExpression(expr.left, stack, functions, evalState);
                if (!leftAnd) return false;
                return evaluateExpression(expr.right, stack, functions, evalState);
            }
            if (expr.operator === 'or') {
                const leftOr = evaluateExpression(expr.left, stack, functions, evalState);
                if (leftOr) return true;
                return evaluateExpression(expr.right, stack, functions, evalState);
            }

            const left = evaluateExpression(expr.left, stack, functions, evalState);
            const right = evaluateExpression(expr.right, stack, functions, evalState);
            switch (expr.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '==': return left === right;
                case '!=': return left !== right;
                case '<': return left < right;
                case '<=': return left <= right;
                case '>': return left > right;
                case '>=': return left >= right;
                default: throw new Error(`Unknown operator: ${expr.operator}`);
            }
        }
        case 'UnaryExpression': {
            const arg = evaluateExpression(expr.argument, stack, functions, evalState);
            switch (expr.operator) {
                case '-': return -arg;
                case 'not': return !arg;
                default: throw new Error(`Unknown operator: ${expr.operator}`);
            }
        }
        case 'ArrayLiteral':
            return expr.elements.map(e => evaluateExpression(e, stack, functions, evalState));
        case 'ArrayAccess': {
            const array = getVariable(stack, expr.identifier);
            if (!array || !Array.isArray(array)) {
                throw new Error(`Variable ${expr.identifier} is not an array`);
            }
            const index = evaluateExpression(expr.index, stack, functions, evalState);
            return array[index - 1];
        }
        case 'CallExpression': {
            if (expr.callee.type === 'Identifier' && expr.callee.name === 'len') {
                const arg = evaluateExpression(expr.arguments[0], stack, functions, evalState);
                return arg.length;
            }
            if (expr.callee.type === 'Identifier' && functions && functions[expr.callee.name]) {
                if (evalState) {
                    const currentCallIndex = evalState.callCount++;
                    if (currentCallIndex < evalState.results.length) {
                        return evalState.results[currentCallIndex];
                    }
                }
                
                const funcDef = functions[expr.callee.name];
                const localVars = {};
                funcDef.params.forEach((param, i) => {
                    localVars[param] = evaluateExpression(expr.arguments[i], stack, functions, evalState);
                });
                
                if (evalState) {
                    throw new FunctionCallSuspend(funcDef, localVars);
                } else {
                    throw new Error("Synchronous function calls are no longer supported. Provide evalState.");
                }
            }
            throw new Error(`Unknown function: ${expr.callee.name || expr.callee}`);
        }
        default:
            throw new Error(`Unknown expression type: ${expr.type}`);
    }
}

export function step(ast, state) {
    if (!state) {
        return {
            currentLine: null,
            nextLine: ast.body.length > 0 ? ast.body[0].line : null,
            variables: {},
            functions: {},
            stack: [{ node: ast, index: 0, scope: {} }]
        };
    }

    let { variables, stack, functions = {} } = state;

    if (stack.length === 0) {
        return { currentLine: null, nextLine: null, variables, functions, stack };
    }

    functions = { ...functions };
    stack = JSON.parse(JSON.stringify(stack));

    while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        const { node, index } = frame;

        if (node.type === 'Program' || node.type === 'Block') {
            const statements = node.type === 'Program' ? node.body : node.body;
            
            if (index >= statements.length) {
                if (frame.isLoop && frame.endLine && !frame.isLoopEndYielded) {
                    frame.isLoopEndYielded = true;
                    const popped = stack.pop();
                    return createNextState(functions, stack, null);
                }

                const popped = stack.pop();
                if (popped.isFunction && stack.length > 0) {
                    const parentFrame = stack[stack.length - 1];
                    if (!parentFrame.evalState) parentFrame.evalState = { callCount: 0, results: [] };
                    parentFrame.evalState.results.push(null);
                }
                continue;
            }

            const stmt = statements[index];
            frame.index++;

            if (!frame.evalState) frame.evalState = { callCount: 0, results: [] };
            frame.evalState.callCount = 0;

            try {
                switch (stmt.type) {
                    case 'AssignmentStatement': {
                        const val = evaluateExpression(stmt.value, stack, functions, frame.evalState);
                        setVariable(stack, stmt.identifier, val);
                        frame.evalState = null;
                        return createNextState(functions, stack, stmt);
                    }
                    case 'ArrayAssignmentStatement': {
                        const array = getVariable(stack, stmt.identifier) || [];
                        const idx = evaluateExpression(stmt.index, stack, functions, frame.evalState);
                        const val = evaluateExpression(stmt.value, stack, functions, frame.evalState);
                        array[idx - 1] = val;
                        setVariable(stack, stmt.identifier, array);
                        frame.evalState = null;
                        return createNextState(functions, stack, stmt);
                    }
                    case 'IfStatement': {
                        const cond = evaluateExpression(stmt.condition, stack, functions, frame.evalState);
                        frame.evalState = null;
                        if (cond) {
                            stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, scope: {} });
                        } else {
                            let executedElif = false;
                            for (const elif of stmt.elseIfs) {
                                if (evaluateExpression(elif.condition, stack, functions, frame.evalState)) {
                                    stack.push({ node: { type: 'Block', body: elif.body }, index: 0, scope: {} });
                                    executedElif = true;
                                    break;
                                }
                            }
                            if (!executedElif && stmt.elseBody) {
                                stack.push({ node: { type: 'Block', body: stmt.elseBody }, index: 0, scope: {} });
                            }
                        }
                        return createNextState(functions, stack, stmt);
                    }
                    case 'WhileStatement': {
                        const cond = evaluateExpression(stmt.condition, stack, functions, frame.evalState);
                        frame.evalState = null;
                        if (cond) {
                            frame.index--;
                            stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                        }
                        return createNextState(functions, stack, stmt);
                    }
                    case 'UntilStatement': {
                        const cond = evaluateExpression(stmt.condition, stack, functions, frame.evalState);
                        frame.evalState = null;
                        if (!cond) {
                            frame.index--;
                            stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                        }
                        return createNextState(functions, stack, stmt);
                    }
                    case 'RepeatUntilStatement': {
                        if (!frame.repeatChecked) {
                            frame.repeatChecked = true;
                            frame.index--;
                            stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                            return createNextState(functions, stack, stmt);
                        } else {
                            const cond = evaluateExpression(stmt.condition, stack, functions, frame.evalState);
                            frame.evalState = null;
                            if (cond) {
                                frame.repeatChecked = false;
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.repeatChecked = true;
                                frame.index--;
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            }
                        }
                    }
                    case 'RepeatWhileStatement': {
                        if (!frame.repeatChecked) {
                            frame.repeatChecked = true;
                            frame.index--;
                            stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                            return createNextState(functions, stack, stmt);
                        } else {
                            const cond = evaluateExpression(stmt.condition, stack, functions, frame.evalState);
                            frame.evalState = null;
                            if (!cond) {
                                frame.repeatChecked = false;
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.repeatChecked = true;
                                frame.index--;
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            }
                        }
                    }
                    case 'ForToStatement': {
                        if (frame.forInitialized === undefined) {
                            const startVal = evaluateExpression(stmt.start, stack, functions, frame.evalState);
                            const endVal = evaluateExpression(stmt.end, stack, functions, frame.evalState);
                            
                            frame.forInitialized = true;
                            frame.forEndVal = endVal;
                            setVariable(stack, stmt.identifier, startVal);
                            
                            frame.evalState = null;
                            if (startVal <= endVal) {
                                frame.index--; 
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.forInitialized = undefined;
                                return createNextState(functions, stack, stmt);
                            }
                        } else {
                            const cur = getVariable(stack, stmt.identifier);
                            const nextVal = cur + 1;
                            
                            if (nextVal <= frame.forEndVal) {
                                setVariable(stack, stmt.identifier, nextVal);
                                frame.index--; 
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.forInitialized = undefined;
                                return createNextState(functions, stack, stmt);
                            }
                        }
                    }
                    case 'ForDowntoStatement': {
                        if (frame.forInitialized === undefined) {
                            const startVal = evaluateExpression(stmt.start, stack, functions, frame.evalState);
                            const endVal = evaluateExpression(stmt.end, stack, functions, frame.evalState);
                            
                            frame.forInitialized = true;
                            frame.forEndVal = endVal;
                            setVariable(stack, stmt.identifier, startVal);
                            
                            frame.evalState = null;
                            if (startVal >= endVal) {
                                frame.index--; 
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.forInitialized = undefined;
                                return createNextState(functions, stack, stmt);
                            }
                        } else {
                            const cur = getVariable(stack, stmt.identifier);
                            const nextVal = cur - 1;
                            
                            if (nextVal >= frame.forEndVal) {
                                setVariable(stack, stmt.identifier, nextVal);
                                frame.index--; 
                                stack.push({ node: { type: 'Block', body: stmt.body }, index: 0, isLoop: true, scope: {}, endLine: stmt.endLine });
                                return createNextState(functions, stack, stmt);
                            } else {
                                frame.forInitialized = undefined;
                                return createNextState(functions, stack, stmt);
                            }
                        }
                    }
                    case 'ExpressionStatement': {
                        evaluateExpression(stmt.expression, stack, functions, frame.evalState);
                        frame.evalState = null;
                        return createNextState(functions, stack, stmt);
                    }
                    case 'BreakStatement': {
                        while (stack.length > 0) {
                            const popped = stack.pop();
                            if (popped.isLoop) {
                                if (stack.length > 0) {
                                    const parent = stack[stack.length - 1];
                                    parent.index++;
                                    parent.forInitialized = undefined;
                                    parent.evalState = null;
                                }
                                break;
                            }
                        }
                        return createNextState(functions, stack, stmt);
                    }
                    case 'ContinueStatement': {
                        while (stack.length > 0) {
                            const popped = stack.pop();
                            if (popped.isLoop) break;
                        }
                        return createNextState(functions, stack, stmt);
                    }
                    case 'FunctionDeclaration': {
                        functions[stmt.name] = stmt;
                        return createNextState(functions, stack, stmt);
                    }
                    case 'ReturnStatement': {
                        if (!frame.returningValComputed) {
                            const retVal = evaluateExpression(stmt.value, stack, functions, frame.evalState);
                            frame.evalState = null;
                            frame.returningValComputed = true;
                            frame.retVal = retVal;
                            
                            frame.index--; // Undo increment so we pause on this statement
                            setVariable(stack, '<return>', retVal); // Store it in the local scope so the CLI prints it
                            
                            return createNextState(functions, stack, stmt); 
                        } else {
                            const retVal = frame.retVal;
                            
                            let poppedFuncFrame = false;
                            while (stack.length > 0) {
                                const popped = stack.pop();
                                if (popped.isFunction) {
                                    poppedFuncFrame = true;
                                    break;
                                }
                            }
                            
                            if (poppedFuncFrame && stack.length > 0) {
                                const parentFrame = stack[stack.length - 1];
                                if (!parentFrame.evalState) parentFrame.evalState = { callCount: 0, results: [] };
                                parentFrame.evalState.results.push(retVal);
                                continue;
                            } else {
                                return { currentLine: stmt.line, nextLine: null, variables: flattenVariables(stack), functions, stack: [] };
                            }
                        }
                    }
                    default:
                        throw new Error(`Unsupported statement type: ${stmt.type}`);
                }
            } catch (e) {
                if (e instanceof FunctionCallSuspend) {
                    frame.index--; // Undo increment so we resume on this statement
                    stack.push({ node: { type: 'Block', body: e.funcDef.body }, index: 0, scope: e.localVars, isFunction: true });
                    return createNextState(functions, stack, stmt);
                }
                throw e;
            }
        }
    }

    return { currentLine: null, nextLine: null, variables: flattenVariables(stack), functions, stack: [] };
}

function createNextState(functions, stack, currentStmt) {
    let nextLine = null;
    
    for (let i = stack.length - 1; i >= 0; i--) {
        const frame = stack[i];
        const statements = frame.node.type === 'Program' ? frame.node.body : frame.node.body;
        if (frame.index < statements.length) {
            nextLine = statements[frame.index].line;
            break;
        } else if (frame.isLoop && frame.endLine && !frame.isLoopEndYielded) {
            nextLine = frame.endLine;
            break;
        } else if (frame.node.type !== 'Program' && frame.node.type !== 'Block') {
             nextLine = frame.node.line;
             break;
        }
    }

    return {
        currentLine: currentStmt ? currentStmt.line : null,
        nextLine: nextLine,
        variables: flattenVariables(stack),
        functions,
        stack
    };
}
