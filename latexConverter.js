function buildFunctionFromTex(texString) {
  // basic normalization
  let expr = texString.trim();

  // strip outer f(x)= if they type it
  expr = expr.replace(/^f\s*\(\s*x\s*\)\s*=/i, "");

  // replace TeX-style things with JS/Math
  expr = expr.replace(/\^/g, "**"); // x^2 -> x**2
  expr = expr.replace(/\\sin/g, "Math.sin");
  expr = expr.replace(/\|([^|]+)\|/g, "Math.abs($1)");

  expr = expr.replace(/\\cos/g, "Math.cos");
  expr = expr.replace(/\\tan/g, "Math.tan");
  expr = expr.replace(/\\sqrt/g, "Math.sqrt");
  expr = expr.replace(/\\pi/g, "Math.PI");
  expr = expr.replace(/\\exp/g, "Math.exp");
  expr = expr.replace(/\\ln/g, "Math.log");

  // very simple \frac{a}{b} -> (a)/(b)
  expr = expr.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, "($1)/($2)");

  try {
    const fn = new Function("x", `return ${expr};`);
    fn(0);
    return { fn, error: null };
  } catch (e) {
    console.error("Bad function:", e);
    return { fn: null, error: e };
  }
}
