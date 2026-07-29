import { create, all } from 'mathjs';

// Create a mathjs instance with default configuration
const math = create(all);

// Helper to convert degrees to radians
const degToRad = (deg: number): number => (deg * Math.PI) / 180;

// Helper to convert radians to degrees
const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Preprocesses the expression to translate calculator-specific symbols
 * into standard mathjs-compatible syntax.
 */
export function preprocessExpression(expr: string): string {
  let processed = expr;

  // Replace display symbols with mathjs operators
  processed = processed.replace(/×/g, '*');
  processed = processed.replace(/÷/g, '/');
  processed = processed.replace(/π/g, 'pi');

  // Handle x² pattern
  processed = processed.replace(/²/g, '^2');

  // Handle implicit multiplication before an opening paren or before pi/e tokens
  // e.g. "2pi" -> "2*pi", "3(4+1)" -> "3*(4+1)", "2sin(30)" stays (function call, handled by mathjs)
  processed = processed.replace(/(\d)(pi\b)/gi, '$1*$2');
  processed = processed.replace(/(\d)\(/g, '$1*(');
  processed = processed.replace(/(\))(\d)/g, '$1*$2');
  processed = processed.replace(/(\))(pi\b)/gi, '$1*$2');

  // Note: mathjs natively supports "mod" as an infix operator (e.g. "7 mod 3", or
  // chained "7 mod 3 mod 2"), so no manual conversion to a function call is needed —
  // the raw "mod" keyword is passed straight through to math.evaluate().

  return processed;
}

/**
 * Evaluates a mathematical expression with support for DEG/RAD modes and variables.
 */
export function evaluateExpression(
  expr: string,
  angleMode: 'DEG' | 'RAD',
  variables: Record<string, number>
): { result: number | string; error?: string } {
  try {
    if (!expr || expr.trim() === '') {
      return { result: '' };
    }

    let processed = preprocessExpression(expr);

    // Create a custom evaluation scope with variables
    const scope: Record<string, any> = { ...variables };

    // If in DEG mode, we override trig functions in the scope to handle degrees
    if (angleMode === 'DEG') {
      scope.sin = (x: number) => Math.sin(degToRad(x));
      scope.cos = (x: number) => Math.cos(degToRad(x));
      scope.tan = (x: number) => {
        // Handle tan(90) etc.
        const rad = degToRad(x);
        if (Math.abs(Math.cos(rad)) < 1e-14) {
          throw new Error('Tanımsız (Tan 90/270)');
        }
        return Math.tan(rad);
      };
      scope.asin = (x: number) => radToDeg(Math.asin(x));
      scope.acos = (x: number) => radToDeg(Math.acos(x));
      scope.atan = (x: number) => radToDeg(Math.atan(x));
      scope.atan2 = (y: number, x: number) => radToDeg(Math.atan2(y, x));
    } else {
      // RAD mode uses standard mathjs trig functions
      scope.sin = (x: number) => Math.sin(x);
      scope.cos = (x: number) => Math.cos(x);
      scope.tan = (x: number) => Math.tan(x);
      scope.asin = (x: number) => Math.asin(x);
      scope.acos = (x: number) => Math.acos(x);
      scope.atan = (x: number) => Math.atan(x);
      scope.atan2 = (y: number, x: number) => Math.atan2(y, x);
    }

    // Add standard log functions
    scope.ln = (x: number) => Math.log(x);
    scope.log = (x: number) => Math.log10(x); // Standard calculator log is base 10
    scope.log10 = (x: number) => Math.log10(x);
    scope.sqrt = (x: number) => Math.sqrt(x);
    scope.abs = (x: number) => Math.abs(x);
    scope.exp = (x: number) => Math.exp(x);

    // Evaluate using mathjs with our custom scope
    const evalResult = math.evaluate(processed, scope);

    if (typeof evalResult === 'function') {
      return { result: '', error: 'Hata: Eksik parametre' };
    }

    if (evalResult && typeof evalResult === 'object' && 'entries' in evalResult) {
      // If it returned a matrix or multi-entry result
      return { result: String(evalResult) };
    }

    if (isNaN(evalResult)) {
      return { result: 'Tanımsız', error: 'Hata: Tanımsız sonuç' };
    }

    if (!isFinite(evalResult)) {
      return { result: 'Sonsuz', error: 'Hata: Sonsuz değer' };
    }

    // Round to avoid floating point precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004)
    // For very large magnitudes, skip rounding entirely to avoid overflowing to Infinity.
    const rounded = Math.abs(evalResult) > 1e15 ? evalResult : Math.round(evalResult * 1e12) / 1e12;

    if (!isFinite(rounded)) {
      return { result: 'Sonsuz', error: 'Hata: Sonsuz değer' };
    }

    return { result: rounded };
  } catch (err: any) {
    let errMsg = 'Hata: Geçersiz ifade';
    if (err.message) {
      if (err.message.includes('Undefined symbol')) {
        const match = err.message.match(/Undefined symbol (\w+)/);
        errMsg = match ? `Hata: Tanımsız sembol '${match[1]}'` : 'Hata: Tanımsız sembol';
      } else if (err.message.includes('Unexpected end of expression')) {
        errMsg = 'Hata: Eksik parantez veya işlem';
      } else if (err.message.includes('Tanımsız')) {
        errMsg = err.message;
      }
    }
    return { result: 'Hata', error: errMsg };
  }
}

/**
 * Formats internal mathjs expressions back to user-friendly calculator display notation.
 */
export function formatDisplayExpression(expr: string): string {
  let formatted = expr;
  formatted = formatted.replace(/\*/g, '×');
  formatted = formatted.replace(/\//g, '÷');
  formatted = formatted.replace(/pi/gi, 'π');
  formatted = formatted.replace(/sqrt\(/g, '√(');
  formatted = formatted.replace(/\^2/g, '²');
  return formatted;
}

/**
 * Symbolically differentiates an expression with respect to a variable.
 * Returns the derivative as a string.
 */
export function derivative(expr: string, variable: string = 'x'): string {
  try {
    const processed = preprocessExpression(expr);
    const d = math.derivative(processed, variable);
    return d.toString();
  } catch (err) {
    return '';
  }
}

/**
 * Compiles a mathematical function for fast repeated evaluation.
 * Returns a function that takes a scope object and returns a number.
 */
export function compileFunction(expr: string): (scope: Record<string, number>) => number {
  const processed = preprocessExpression(expr);
  const compiled = math.compile(processed);
  
  return (scope: Record<string, number>) => {
    const evalScope = { ...scope };
    // Ensure standard math functions are available in the scope
    evalScope.sin = Math.sin;
    evalScope.cos = Math.cos;
    evalScope.tan = Math.tan;
    evalScope.asin = Math.asin;
    evalScope.acos = Math.acos;
    evalScope.atan = Math.atan;
    evalScope.sqrt = Math.sqrt;
    evalScope.log = Math.log10;
    evalScope.ln = Math.log;
    evalScope.abs = Math.abs;
    evalScope.exp = Math.exp;
    evalScope.pi = Math.PI;
    evalScope.e = Math.E;
    
    const val = compiled.evaluate(evalScope);
    if (typeof val !== 'number') {
      return Number(val);
    }
    return val;
  };
}

/**
 * Simpson's rule numeric integration for definite integrals.
 * Computes the integral of fn(x) from a to b.
 */
export function numericIntegral(
  fn: (x: number) => number,
  a: number,
  b: number,
  steps: number = 1000
): number {
  // Ensure steps is even for Simpson's rule
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = (b - a) / n;
  
  let sum = fn(a) + fn(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    if (i % 2 === 0) {
      sum += 2 * fn(x);
    } else {
      sum += 4 * fn(x);
    }
  }
  
  return (h / 3) * sum;
}