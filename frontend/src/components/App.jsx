import React, { useState, useRef } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0b0f;
      --surface: #111318;
      --surface2: #181b22;
      --border: rgba(255,255,255,0.07);
      --border-bright: rgba(255,255,255,0.14);
      --accent: #6ee7f7;
      --accent2: #a78bfa;
      --accent3: #f0abfc;
      --gold: #fbbf24;
      --danger: #f87171;
      --success: #34d399;
      --text: #e8eaf0;
      --text-dim: #8b8fa8;
      --text-dimmer: #4a4d5e;
      --font-display: 'Syne', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --radius: 16px;
      --radius-sm: 8px;
      --glow-cyan: 0 0 30px rgba(110,231,247,0.15);
      --glow-purple: 0 0 30px rgba(167,139,250,0.15);
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    ::selection { background: rgba(110,231,247,0.25); color: var(--text); }

    .noise-overlay {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.4;
    }

    /* ─── SCROLLBAR ─── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }

    /* ─── ANIMATIONS ─── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(110,231,247,0.1); }
      50%       { box-shadow: 0 0 40px rgba(110,231,247,0.25); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    .fade-up { animation: fadeUp 0.5s ease both; }
    .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }

    /* ─── TABLE ─── */
    table { width: 100%; border-collapse: collapse; }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
      font-size: 13.5px;
      text-align: left;
    }
    th {
      background: rgba(255,255,255,0.04);
      font-family: var(--font-display);
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-dim);
    }
    td { color: var(--text); }
    tr:hover td { background: rgba(255,255,255,0.02); }

    pre {
      background: rgba(110,231,247,0.05);
      border: 1px solid rgba(110,231,247,0.15);
      border-left: 3px solid var(--accent);
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 13px;
      overflow-x: auto;
      color: var(--accent);
    }

    ul { padding-left: 20px; }
    li { margin-bottom: 6px; color: var(--text-dim); font-size: 14.5px; }
    li b { color: var(--text); }

    p { color: var(--text-dim); font-size: 15px; line-height: 1.7; margin-bottom: 8px; }
    p b { color: var(--text); }

    h2 {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 12px;
    }
    h3 {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
      margin-top: 20px;
    }
    h4 {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      color: var(--accent2);
      margin-bottom: 6px;
      margin-top: 14px;
    }
  `}</style>
);

// ─── LATEX → UNICODE RENDERER ────────────────────────────────────────────────

function renderLatex(raw) {
  if (!raw) return "";

  let s = raw;

  // Remove display/inline math wrappers
  s = s.replace(/\$\$|\\\[|\\\]/g, "").replace(/\$|\\\(|\\\)/g, "");

  // Named sets & symbols
  s = s.replace(/\\mathbb\{R\}/g,  "ℝ");
  s = s.replace(/\\mathbb\{Z\}/g,  "ℤ");
  s = s.replace(/\\mathbb\{N\}/g,  "ℕ");
  s = s.replace(/\\mathbb\{Q\}/g,  "ℚ");
  s = s.replace(/\\mathbb\{C\}/g,  "ℂ");

  // Greek letters
  const greek = {
    alpha:"α", beta:"β", gamma:"γ", delta:"δ", epsilon:"ε", zeta:"ζ",
    eta:"η", theta:"θ", iota:"ι", kappa:"κ", lambda:"λ", mu:"μ",
    nu:"ν", xi:"ξ", pi:"π", rho:"ρ", sigma:"σ", tau:"τ",
    upsilon:"υ", phi:"φ", chi:"χ", psi:"ψ", omega:"ω",
    Alpha:"Α", Beta:"Β", Gamma:"Γ", Delta:"Δ", Epsilon:"Ε",
    Theta:"Θ", Lambda:"Λ", Mu:"Μ", Pi:"Π", Sigma:"Σ",
    Tau:"Τ", Phi:"Φ", Psi:"Ψ", Omega:"Ω",
  };
  Object.entries(greek).forEach(([name, sym]) => {
    s = s.replace(new RegExp(`\\\\${name}(?![a-zA-Z])`, "g"), sym);
  });

  // Math operators & relations
  s = s.replace(/\\times/g,    "×");
  s = s.replace(/\\cdot/g,     "·");
  s = s.replace(/\\div/g,      "÷");
  s = s.replace(/\\pm/g,       "±");
  s = s.replace(/\\leq/g,      "≤");
  s = s.replace(/\\geq/g,      "≥");
  s = s.replace(/\\neq/g,      "≠");
  s = s.replace(/\\approx/g,   "≈");
  s = s.replace(/\\equiv/g,    "≡");
  s = s.replace(/\\sim/g,      "∼");
  s = s.replace(/\\in/g,       "∈");
  s = s.replace(/\\notin/g,    "∉");
  s = s.replace(/\\subset/g,   "⊂");
  s = s.replace(/\\subseteq/g, "⊆");
  s = s.replace(/\\cup/g,      "∪");
  s = s.replace(/\\cap/g,      "∩");
  s = s.replace(/\\emptyset/g, "∅");
  s = s.replace(/\\infty/g,    "∞");
  s = s.replace(/\\partial/g,  "∂");
  s = s.replace(/\\nabla/g,    "∇");
  s = s.replace(/\\sum/g,      "∑");
  s = s.replace(/\\prod/g,     "∏");
  s = s.replace(/\\int/g,      "∫");
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  s = s.replace(/\\sqrt\s+(\S+)/g,    "√$1");
  s = s.replace(/\\sqrt/g,     "√");
  s = s.replace(/\\log/g,      "log");
  s = s.replace(/\\ln/g,       "ln");
  s = s.replace(/\\exp/g,      "exp");
  s = s.replace(/\\max/g,      "max");
  s = s.replace(/\\min/g,      "min");
  s = s.replace(/\\arg/g,      "arg");
  s = s.replace(/\\text\{([^}]*)\}/g, "$1");
  s = s.replace(/\\mathrm\{([^}]*)\}/g, "$1");
  s = s.replace(/\\mathbf\{([^}]*)\}/g, "$1");
  s = s.replace(/\\mathit\{([^}]*)\}/g, "$1");
  s = s.replace(/\\boldsymbol\{([^}]*)\}/g, "$1");
  s = s.replace(/\\operatorname\{([^}]*)\}/g, "$1");

  // Arrows
  s = s.replace(/\\rightarrow/g,     "→");
  s = s.replace(/\\leftarrow/g,      "←");
  s = s.replace(/\\Rightarrow/g,     "⇒");
  s = s.replace(/\\Leftarrow/g,      "⇐");
  s = s.replace(/\\leftrightarrow/g, "↔");
  s = s.replace(/\\to/g,             "→");
  s = s.replace(/\\mapsto/g,         "↦");

  // Transpose T superscript — common pattern: K^T or K^\top or {K}^{T}
  s = s.replace(/\^\\top/g, "ᵀ");
  s = s.replace(/\^\{T\}/g, "ᵀ");
  s = s.replace(/\^T\b/g,   "ᵀ");

  // Superscripts: ^{...} → convert digits/+-n to superscript unicode
  const supMap = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","n":"ⁿ","i":"ⁱ"};
  s = s.replace(/\^\{([^}]+)\}/g, (_, inner) => {
    // Try to convert char by char; fall back to ^(inner) for complex ones
    const converted = [...inner].map(c => supMap[c] || null);
    return converted.every(Boolean) ? converted.join("") : `^(${inner})`;
  });
  // Single char superscript
  s = s.replace(/\^([0-9nidkT])/g, (_, c) => supMap[c] || `^${c}`);

  // Subscripts: _{...} → plain with underscore (unicode subscripts limited)
  const subMap = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","k":"ₖ","n":"ₙ","i":"ᵢ","j":"ⱼ"};
  s = s.replace(/_\{([^}]+)\}/g, (_, inner) => {
    const converted = [...inner].map(c => subMap[c] || null);
    return converted.every(Boolean) ? converted.join("") : `_${inner}`;
  });
  s = s.replace(/_([0-9knji])/g, (_, c) => subMap[c] || `_${c}`);

  // Fractions: \frac{a}{b} → a/b
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");

  // Remove remaining braces used for grouping
  s = s.replace(/\{([^{}]*)\}/g, "$1");
  // Second pass for nested
  s = s.replace(/\{([^{}]*)\}/g, "$1");

  // Remaining backslash commands (catch-all)
  s = s.replace(/\\[a-zA-Z]+\s*/g, "");

  // Whitespace cleanup
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

// Formula display component
const Formula = ({ children }) => {
  const rendered = renderLatex(children);
  return (
    <div style={{
      background: "rgba(110,231,247,0.05)",
      border: "1px solid rgba(110,231,247,0.15)",
      borderLeft: "3px solid var(--accent)",
      padding: "12px 18px",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-mono)",
      fontSize: "15px",
      color: "var(--accent)",
      margin: "8px 0",
      overflowX: "auto",
      letterSpacing: "0.02em"
    }}>
      {rendered}
    </div>
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildEmbeddingSimilarity(similarityTable) {
  if (!Array.isArray(similarityTable) || similarityTable.length === 0) return null;
  const sorted = [...similarityTable].sort((a, b) => b.similarity - a.similarity);
  const high = sorted.slice(0, 1).map(p => ({ ...p, reason: "Strong semantic or syntactic relationship" }));
  const low  = sorted.slice(-1).map(p => ({ ...p, reason: "Very low similarity – almost unrelated" })).reverse();
  return { high, low };
}

function getOutOfVocabWords(explainedTokens) {
  if (!Array.isArray(explainedTokens)) return [];
  const groups = [];
  let current = [];
  explainedTokens.forEach(t => {
    if (t.token.startsWith("##")) { current.push(t.token); }
    else { if (current.length > 1) groups.push([...current]); current = [t.token]; }
  });
  if (current.length > 1) groups.push(current);
  return groups;
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────

const Card = ({ children, style, glow }) => (
  <div style={{
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "28px",
    boxShadow: glow ? "var(--glow-cyan)" : "none",
    ...style
  }}>
    {children}
  </div>
);

const Badge = ({ children, color = "cyan" }) => {
  const colors = {
    cyan:   { bg: "rgba(110,231,247,0.1)",  border: "rgba(110,231,247,0.3)",  text: "var(--accent)" },
    purple: { bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.3)",  text: "var(--accent2)" },
    gold:   { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)",   text: "var(--gold)" },
    red:    { bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)",  text: "var(--danger)" },
    green:  { bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)",   text: "var(--success)" },
  };
  const c = colors[color] || colors.cyan;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "100px",
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, fontSize: "11.5px", fontFamily: "var(--font-mono)",
      fontWeight: 500, letterSpacing: "0.04em"
    }}>
      {children}
    </span>
  );
};

const InfoBox = ({ icon, children, color = "cyan" }) => {
  const bgMap = { cyan: "rgba(110,231,247,0.05)", purple: "rgba(167,139,250,0.05)", gold: "rgba(251,191,36,0.05)" };
  const borderMap = { cyan: "rgba(110,231,247,0.2)", purple: "rgba(167,139,250,0.2)", gold: "rgba(251,191,36,0.2)" };
  return (
    <div style={{
      display: "flex", gap: "12px", padding: "14px 16px",
      borderRadius: "var(--radius-sm)",
      background: bgMap[color], border: `1px solid ${borderMap[color]}`,
      marginTop: "12px", marginBottom: "12px"
    }}>
      <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <div style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

const Divider = () => (
  <div style={{ height: "1px", background: "var(--border)", margin: "24px 0" }} />
);

const Spinner = () => (
  <div style={{
    width: "18px", height: "18px",
    border: "2px solid rgba(110,231,247,0.2)",
    borderTop: "2px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  }} />
);

// ─── STEP BUTTON ─────────────────────────────────────────────────────────────

const StepBtn = ({ label, icon, active, onClick, disabled, dimmed }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 18px",
    background: active ? "rgba(110,231,247,0.1)" : "var(--surface2)",
    border: `1px solid ${active ? "rgba(110,231,247,0.4)" : "var(--border)"}`,
    borderRadius: "100px",
    color: dimmed ? "var(--text-dimmer)" : active ? "var(--accent)" : "var(--text-dim)",
    fontFamily: "var(--font-display)",
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    boxShadow: active ? "0 0 16px rgba(110,231,247,0.15)" : "none",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap"
  }}>
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// ─── TOKEN CHIP ──────────────────────────────────────────────────────────────

const TokenChip = ({ token }) => {
  const isSpecial = token === "[CLS]" || token === "[SEP]";
  const isContinue = token.startsWith("##");
  const colors = isSpecial
    ? { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "var(--success)" }
    : isContinue
    ? { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "var(--danger)" }
    : { bg: "rgba(110,231,247,0.08)", border: "rgba(110,231,247,0.2)", text: "var(--accent)" };
  return (
    <div style={{
      padding: "6px 12px", borderRadius: "6px",
      background: colors.bg, border: `1px solid ${colors.border}`,
      color: colors.text, fontFamily: "var(--font-mono)", fontSize: "13px",
      fontWeight: 500, letterSpacing: "0.02em"
    }}>
      {token}
    </div>
  );
};

// ─── ATTENTION MATRIX ────────────────────────────────────────────────────────

const AttentionMatrix = ({ matrix, tokens }) => {
  if (!matrix || !tokens.length) return null;
  return (
    <div style={{ overflowX: "auto", marginTop: "20px" }}>
      <table style={{ minWidth: "max-content" }}>
        <thead>
          <tr>
            <th style={{ background: "var(--surface2)", color: "var(--text-dim)" }}>
              From ↓ / To →
            </th>
            {tokens.map((t, i) => (
              <th key={i} style={{ fontFamily: "var(--font-mono)", fontWeight: 400, letterSpacing: 0 }}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent2)", background: "var(--surface2)" }}>
                {tokens[i]}
              </td>
              {row.map((value, j) => {
                const intensity = Math.min(value, 1);
                return (
                  <td key={j} style={{
                    textAlign: "center",
                    background: `rgba(110,231,247,${intensity * 0.75})`,
                    color: intensity > 0.5 ? "#0a0b0f" : "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 500
                  }}>
                    {value > 0.01 ? value.toFixed(2) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── EMBEDDING GRAPH ─────────────────────────────────────────────────────────

const EmbeddingGraph = ({ embeddingGraph }) => {
  if (!embeddingGraph?.points?.length) return null;
  const width = 560, height = 420, padding = 60;
  const points = embeddingGraph.points;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const scaleX = x => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  const scaleY = y => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
  const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  const closePairs = [];
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++)
      if (dist(points[i], points[j]) < 1.0) closePairs.push([points[i], points[j]]);

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ overflowX: "auto" }}>
        <svg width={width} height={height} style={{
          background: "var(--surface2)", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)"
        }}>
          {[...Array(6)].map((_, i) => {
            const x = padding + i * (width - 2 * padding) / 5;
            const y = padding + i * (height - 2 * padding) / 5;
            return (
              <g key={i}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" />
              </g>
            );
          })}
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.12)" />
          <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="rgba(255,255,255,0.12)" />
          <text x={width - padding + 4} y={height / 2 + 4} fontSize="11" fill="var(--text-dimmer)" fontFamily="var(--font-mono)">PCA-1</text>
          <text x={width / 2 + 6} y={padding - 8} fontSize="11" fill="var(--text-dimmer)" fontFamily="var(--font-mono)">PCA-2</text>
          {closePairs.map((pair, i) => (
            <line key={i}
              x1={scaleX(pair[0].x)} y1={scaleY(pair[0].y)}
              x2={scaleX(pair[1].x)} y2={scaleY(pair[1].y)}
              stroke="rgba(251,191,36,0.4)" strokeDasharray="4" strokeWidth="1.5" />
          ))}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={7} fill="var(--accent)" opacity={0.9} />
              <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={13} fill="var(--accent)" opacity={0.1} />
              <text x={scaleX(p.x) + 10} y={scaleY(p.y) + 4} fontSize="12" fill="var(--text)"
                fontFamily="var(--font-mono)">{p.token}</text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", gap: "20px", marginTop: "10px", flexWrap: "wrap" }}>
        {[
          { color: "var(--accent)", label: "Token in embedding space" },
          { color: "rgba(251,191,36,0.7)", label: "High cosine similarity (dashed line)", dashed: true },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width={24} height={12}>
              {l.dashed
                ? <line x1={0} y1={6} x2={24} y2={6} stroke={l.color} strokeDasharray="4" strokeWidth="1.5" />
                : <circle cx={6} cy={6} r={5} fill={l.color} />}
            </svg>
            <span style={{ fontSize: "12px", color: "var(--text-dimmer)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── STEP VIEWS ───────────────────────────────────────────────────────────────

const TokenizationView = ({ tokens, tokenIds, explainedTokens }) => {
  const outOfVocab = getOutOfVocabWords(explainedTokens);
  return (
    <div className="fade-up">
      <h2>Step 1 — Tokenization</h2>
      <p>
        Before a model can understand text, it must convert it into tokens — small chunks of text it recognizes from its vocabulary. 
        DistilBERT uses <b>WordPiece tokenization</b>: words not in its vocabulary are split into recognizable sub-word pieces.
      </p>
      <InfoBox icon="🌍" color="cyan">
        <b>Real-world analogy:</b> Think of tokenization like how a child learns to read — unknown words are sounded out syllable by syllable (<em>"un-be-liev-able"</em>). 
        BERT does the same: an unknown word like <em>"astrophysics"</em> might become <em>["astro", "##physics"]</em>.
      </InfoBox>

      <div style={{ marginTop: "20px", marginBottom: "8px" }}>
        <h3>Your tokens</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
          {tokens.map((t, i) => <TokenChip key={i} token={t} />)}
        </div>
        <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
          <Badge color="green">🟢 [CLS] / [SEP] — Special tokens</Badge>
          <Badge color="cyan">🔵 Regular token</Badge>
          <Badge color="red">🔴 ## Continuation piece</Badge>
        </div>
        {tokens.length > 0 && (
          <p style={{ marginTop: "10px", fontSize: "13.5px" }}>
            <b>[CLS]</b> is prepended to represent the whole sentence. <b>[SEP]</b> marks the boundary between sentences.
          </p>
        )}
      </div>

      {outOfVocab.length > 0 && (
        <InfoBox icon="⚠️" color="gold">
          <b>Out-of-vocabulary splits detected</b> — DistilBERT has a limited vocabulary (~30K words). 
          Words outside it are split into sub-word pieces:
          <ul style={{ marginTop: "8px" }}>
            {outOfVocab.map((group, i) => {
              const full = group.map(t => t.replace("##", "")).join("");
              return <li key={i}><b>"{full}"</b> → {group.join(" + ")}</li>;
            })}
          </ul>
          <b>Note:</b> DistilBERT's smaller vocabulary (vs. full BERT) means more splits, which can slightly reduce accuracy.
        </InfoBox>
      )}

      <Divider />

      <h3>Token → Vocabulary ID</h3>
      <p>Each token is looked up in the vocabulary dictionary and assigned a unique integer ID.</p>
      <VideoHint />
      <div style={{ overflowX: "auto", marginTop: "12px" }}>
        <table>
          <thead>
            <tr><th>Token</th><th>Vocabulary ID</th></tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{t}</td>
                <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)" }}>{tokenIds[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const EmbeddingsView = ({ tokens, embeddings, embeddingSimilarity, embeddingGraph }) => (
  <div className="fade-up">
    <h2>Step 2 — Embeddings</h2>
    <p>
      Token IDs are just numbers. To give them <em>meaning</em>, the model converts each ID into a high-dimensional vector 
      (768 dimensions in DistilBERT). This vector encodes semantic and syntactic properties of the word.
    </p>
    <InfoBox icon="🌍" color="purple">
      <b>Real-world analogy:</b> Imagine a map where cities are placed by their culture, language, and geography. 
      "Paris" and "Rome" are close; "Paris" and "Tokyo" are far. Embeddings do the same for words — 
      <em>"king"</em> and <em>"queen"</em> will be nearby; <em>"king"</em> and <em>"pizza"</em> will be far apart.
    </InfoBox>

    <h3>Embedding vectors (first 8 dimensions)</h3>
    <p style={{ fontSize: "13px", marginBottom: "8px" }}>
      DistilBERT uses 768-dimensional vectors. Each number captures a different abstract feature of the token's meaning.
    </p>
    <VideoHint />
    <div style={{ overflowX: "auto", marginTop: "12px" }}>
      <table>
        <thead>
          <tr><th>Token</th><th>Vector preview</th></tr>
        </thead>
        <tbody>
          {tokens.map((t, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{t}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
                {embeddings[i] ? `[${embeddings[i].slice(0, 8).map(v => v.toFixed(3)).join(", ")} …]` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {embeddingSimilarity && (
      <>
        <Divider />
        <h3>Cosine similarity between tokens</h3>
        <p>Cosine similarity measures how aligned two vectors are (1 = identical direction, 0 = perpendicular, −1 = opposite).</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
          <Card style={{ padding: "16px" }}>
            <div style={{ color: "var(--success)", fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              ↑ Most Similar Pair
            </div>
            {embeddingSimilarity.high.map((p, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--text)" }}>
                  {p.token_1} ↔ {p.token_2}
                </div>
                <div style={{ color: "var(--success)", fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {p.similarity}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dimmer)", marginTop: "4px" }}>{p.reason}</div>
              </div>
            ))}
          </Card>
          <Card style={{ padding: "16px" }}>
            <div style={{ color: "var(--danger)", fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              ↓ Least Similar Pair
            </div>
            {embeddingSimilarity.low.map((p, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--text)" }}>
                  {p.token_1} ↔ {p.token_2}
                </div>
                <div style={{ color: "var(--danger)", fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {p.similarity}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dimmer)", marginTop: "4px" }}>Weak or no contextual relationship</div>
              </div>
            ))}
          </Card>
        </div>

        <Divider />
        <h3>Similarity Score Guide</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Score Range</th><th>Meaning</th><th>Interpretation</th></tr></thead>
            <tbody>
              {[
                ["0.85 – 1.00", "Almost same meaning", "Nearly identical idea"],
                ["0.70 – 0.85", "Very strong", "Strong semantic / syntactic link"],
                ["0.55 – 0.70", "Moderate", "Often appear together"],
                ["0.40 – 0.55", "Weak", "Loose contextual link"],
                ["0.20 – 0.40", "Very weak", "Barely connected"],
                ["0.00 – 0.20", "Unrelated", "No meaningful relation"],
              ].map(([score, meaning, interp]) => (
                <tr key={score}><td style={{ fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>{score}</td><td>{meaning}</td><td style={{ color: "var(--text-dimmer)" }}>{interp}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}

    <Divider />
    <h3>Embedding Space (2D PCA Projection)</h3>
    <p>
      768 dimensions are projected down to 2D using PCA so we can visualize them. 
      Tokens closer together in this plot have more similar meanings.
    </p>
    <EmbeddingGraph embeddingGraph={embeddingGraph} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const AttentionView = ({ selfAttention, tokens, attentionSteps }) => (
  <div className="fade-up">
    <h2>Step 3 — Self-Attention</h2>
    <p>
      Self-attention is the core mechanism of transformers. It allows every token to look at 
      every other token and decide how much to "attend" to it when building its own meaning.
    </p>
    <InfoBox icon="🌍" color="cyan">
      <b>Real-world analogy:</b> In the sentence <em>"The animal didn't cross the street because it was tired"</em>, 
      what does <em>"it"</em> refer to? A human intuitively knows it's "the animal". 
      Self-attention teaches the model to make exactly this kind of connection — 
      <em>"it"</em> will have high attention toward <em>"animal"</em>.
    </InfoBox>

    <InfoBox icon="🧱" color="purple">
      <b>DistilBERT note:</b> DistilBERT is an <b>encoder-only</b> model. It has no decoder block, 
      so it cannot generate text. It can only <em>understand and encode</em> input — useful for 
      classification, similarity, and comprehension tasks, but not text generation like GPT.
    </InfoBox>

    {/* Attention steps */}
    {attentionSteps.length > 0 && (
      <div style={{ marginTop: "24px" }}>
        {attentionSteps.map((step, idx) => (
          <div key={step.id} style={{
            marginBottom: "20px",
            padding: "20px 24px",
            background: "var(--surface2)",
            borderRadius: "var(--radius-sm)",
            borderLeft: "3px solid var(--accent2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{
                width: "26px", height: "26px", borderRadius: "50%",
                background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent2)", flexShrink: 0
              }}>{idx + 1}</span>
              <h3 style={{ margin: 0 }}>{step.title}</h3>
            </div>

            {step.example_sentence && (
              <div style={{
                padding: "8px 12px", borderRadius: "6px",
                background: "rgba(110,231,247,0.05)", border: "1px solid rgba(110,231,247,0.12)",
                marginBottom: "10px", fontSize: "13.5px", color: "var(--accent)", fontStyle: "italic"
              }}>
                Example: {step.example_sentence}
              </div>
            )}

            {step.description && <p style={{ marginBottom: "8px" }}>{step.description}</p>}

            {step.id === "step0_problem" && step.focus_token && (
              <>
                <p><b>Applied to your sentence:</b></p>
                {Array.isArray(step.focus_examples) && step.focus_examples.length > 0 && (
                  <ul style={{ marginTop: "6px" }}>
                    {step.focus_examples.map((ex, i) => {
                      const w = ex.attention_weight;
                      const dw = w >= 0.0001 ? w.toFixed(4) : w.toFixed(6);
                      return (
                        <li key={i}>
                          <b>"{step.focus_token}"</b> attends to <b>"{ex.target_token}"</b>{" "}
                          (weight: {dw})
                        </li>
                      );
                    })}
                  </ul>
                )}
                {step.focus_explanation && <p style={{ marginTop: "8px" }}>{step.focus_explanation}</p>}
                {step.zero_attention_note && (
                  <InfoBox icon="ℹ️" color="cyan">
                    <b>Zero attention note:</b> {step.zero_attention_note}
                  </InfoBox>
                )}
              </>
            )}

            {/* Formulas */}
            {Array.isArray(step.formula_latex)
              ? step.formula_latex.map((f, i) => <Formula key={i}>{f}</Formula>)
              : step.formula_latex && <Formula>{step.formula_latex}</Formula>}
            {step.formula_latex && <VideoHint />}

            {step.id === "step1_embeddings" && step.why_note && (
              <p style={{ marginTop: "8px" }}><b>Why this formula?</b> {step.why_note}</p>
            )}
            {step.id === "step2_qkv" && step.why_note && (
              <p style={{ marginTop: "8px" }}><b>Why learn W_Q, W_K, W_V?</b> {step.why_note}</p>
            )}
            {step.id === "step2_qkv" && step.shapes && (
              <div style={{ marginTop: "8px" }}>
                <h4>Matrix shapes</h4>
                <ul>
                  <li><b>X</b> shape: {step.shapes.X || "n × d"} — one row per token, d embedding dims</li>
                  <li><b>W_Q, W_K, W_V</b> shape: {step.shapes.W_Q || "d × dₖ"} — learned weight matrices</li>
                  <li><b>Q, K, V</b> shape: {step.shapes.Q || "n × dₖ"} — one transformed vector per token</li>
                </ul>
              </div>
            )}
            {step.id === "step3_scores" && (
              <>
                {Array.isArray(step.shape_walkthrough) && step.shape_walkthrough.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <h4>Why transpose?</h4>
                    <ul>
                      {step.shape_walkthrough.map((l, i) => (
                        <li key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.why_transpose_note && (
                  <p style={{ marginTop: "8px" }}><b>Intuition:</b> {step.why_transpose_note}</p>
                )}
              </>
            )}
            {step.id === "step4_scale" && (
              <div style={{ marginTop: "10px" }}>
                <h4>What is √dₖ?</h4>
                <ul>
                  <li><b>dₖ</b> is the size of each Q/K vector</li>
                  {typeof step.dk_value === "number" && <li>In your run: <b>dₖ = {step.dk_value}</b></li>}
                  {typeof step.sqrt_dk === "number" && <li>So: <b>√dₖ = {step.sqrt_dk.toFixed(3)}</b></li>}
                  <li>We divide by √dₖ to prevent dot-products from becoming too large before softmax</li>
                </ul>
              </div>
            )}
            {step.id === "step6_weighted_sum" && (
              <div style={{ marginTop: "10px" }}>
                <h4>Matrix shapes in this multiplication</h4>
                <ul>
                  <li><b>Attention weights:</b> n × n — each row shows how one word looks at all words</li>
                  <li><b>V (Values):</b> n × dₖ — one value vector per word</li>
                  <li><b>Output:</b> n × dₖ — each word becomes a weighted blend of all value vectors</li>
                </ul>
                {step.why_note && <p style={{ marginTop: "6px" }}><b>Intuition:</b> {step.why_note}</p>}
              </div>
            )}

            {/* Embedding matrix table inside attention step */}
            {step.id === "step1_embeddings" && step.matrix && Array.isArray(step.matrix.preview) && step.matrix.preview.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <h4>Input Embedding matrix X (shape: {step.matrix.shape})</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ minWidth: "max-content" }}>
                    <thead>
                      <tr>
                        <th>Token</th>
                        {step.matrix.preview[0].map((_, ci) => <th key={ci}>dim {ci + 1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {step.matrix.preview.map((row, ri) => (
                        <tr key={ri}>
                          <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                            {(step.matrix.tokens || [])[ri] ?? `token ${ri}`}
                          </td>
                          {row.map((v, ci) => (
                            <td key={ci} style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                              {Number(v).toFixed(3)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    <Divider />
    <h3>Attention Matrix — Who attends to whom?</h3>
    <p>
      Each cell shows how much the row token attends to the column token. 
      Darker = stronger attention. Each row sums to 1 (softmax normalization).
    </p>
    <VideoHint />
    <AttentionMatrix matrix={selfAttention?.attention_matrix} tokens={tokens} />

    <div style={{ marginTop: "20px", padding: "16px 20px", background: "var(--surface2)", borderRadius: "var(--radius-sm)" }}>
      <h4 style={{ marginTop: 0 }}>The attention formula</h4>
      <Formula>{"Attention(Q, K, V) = softmax((Q × Kᵀ) / √dₖ) × V"}</Formula>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
        {[
          ["Q (Query)", "What this token is looking for"],
          ["K (Key)",   "What each token offers as identity"],
          ["V (Value)", "What information gets passed along"],
          ["√dₖ",       "Scaling factor to stabilize gradients"],
        ].map(([term, desc]) => (
          <div key={term} style={{ padding: "8px 10px", background: "var(--surface)", borderRadius: "6px", border: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)", fontSize: "13px" }}>{term}</span>
            <span style={{ fontSize: "12.5px", color: "var(--text-dimmer)", display: "block", marginTop: "2px" }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>

    <p style={{ marginTop: "14px", fontSize: "13px", color: "var(--text-dimmer)" }}>
      • Rows = Query token (who is asking) &nbsp;|&nbsp;
      • Columns = Key token (who is being attended to) &nbsp;|&nbsp;
      • Values in each row sum to 1
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const LayersView = () => (
  <div className="fade-up">
    <h2>Step 4 — Multiple Layers</h2>
    <p>
      One attention layer is powerful, but not enough. Large language models stack the same kind of block 
      many times so each layer can progressively refine its understanding of the sentence.
    </p>
    <InfoBox icon="🌍" color="cyan">
      <b>Real-world analogy:</b> Think of editing a document in stages — first pass for typos, 
      second for grammar, third for flow, fourth for argument strength. Each pass refines at a higher level of abstraction. 
      Transformer layers work the same way — early layers catch syntax, deeper layers understand meaning.
    </InfoBox>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "20px" }}>
      {[
        { icon: "📝", title: "Lower Layers", desc: "Basic patterns — grammar, spelling, word order, part-of-speech" },
        { icon: "🔗", title: "Middle Layers", desc: "Relationships between words, phrases, coreference, entity links" },
        { icon: "🧠", title: "Upper Layers", desc: "Abstract reasoning, sentiment, intent, high-level semantics" },
      ].map(({ icon, title, desc }) => (
        <Card key={title} style={{ padding: "18px" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "6px", fontSize: "14px" }}>{title}</div>
          <div style={{ fontSize: "13px", color: "var(--text-dimmer)" }}>{desc}</div>
        </Card>
      ))}
    </div>

    <Divider />
    <h3>What's inside each block?</h3>
    <VideoHint />
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
      {[
        { icon: "👁", name: "Self-Attention", desc: "Every token looks at every other token and gathers context" },
        { icon: "🔢", name: "Feed-Forward Network", desc: "Applies a 2-layer MLP to each token position independently" },
        { icon: "📐", name: "Layer Normalization", desc: "Keeps activations stable and prevents gradient explosion" },
        { icon: "➕", name: "Residual Connection", desc: "Adds the original input back to the output — preserves information" },
      ].map(({ icon, name, desc }) => (
        <div key={name} style={{
          display: "flex", alignItems: "flex-start", gap: "14px",
          padding: "14px 16px", background: "var(--surface2)",
          borderRadius: "var(--radius-sm)", border: "1px solid var(--border)"
        }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", marginBottom: "3px" }}>{name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-dimmer)" }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>

    <InfoBox icon="📊" color="purple">
      DistilBERT has <b>6 transformer blocks</b> (vs 12 in full BERT). It's 40% smaller and 60% faster, 
      retaining ~97% of BERT's accuracy — making it ideal for learning and prototyping.
    </InfoBox>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const PredictionView = () => (
  <div className="fade-up">
    <h2>Step 5 — Next Token Prediction</h2>
    <p>
      After the input passes through all transformer layers, the model produces a probability distribution 
      over every possible token in its vocabulary for the next position.
    </p>
    <InfoBox icon="⚠️" color="gold">
      <b>DistilBERT cannot generate text.</b> As an encoder-only model, it has no decoder block 
      and cannot predict next tokens. This step is shown to explain how decoder-based models like 
      GPT work — which will be demonstrated when the GPT option becomes available.
    </InfoBox>
    <InfoBox icon="🌍" color="cyan">
      <b>Real-world analogy:</b> Autocomplete on your phone keyboard — the model scores every possible next word 
      and shows you the most likely ones. The model doesn't "decide" — it computes probabilities and samples.
    </InfoBox>

    <h3>Example: "I love eating ___"</h3>
    <p>For illustration, here's how a GPT-style model would rank next tokens:</p>
    <div style={{ overflowX: "auto", marginTop: "12px" }}>
      <table style={{ width: "auto" }}>
        <thead><tr><th>Next Token</th><th>Probability</th><th>Visual</th></tr></thead>
        <tbody>
          {[
            ["pizza", 0.40, "var(--success)"],
            ["sushi", 0.32, "var(--accent)"],
            ["ice", 0.12, "var(--accent2)"],
            ["books", 0.02, "var(--text-dimmer)"],
            ["homework", 0.00001, "var(--text-dimmer)"],
          ].map(([word, prob, color]) => (
            <tr key={word}>
              <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{word}</td>
              <td style={{ fontFamily: "var(--font-mono)", color }}>{prob}</td>
              <td>
                <div style={{
                  height: "8px", borderRadius: "4px",
                  width: `${Math.max(prob * 260, 2)}px`,
                  background: color, transition: "width 0.3s"
                }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Divider />
    <h3>How generation actually works (GPT-style)</h3>
    <VideoHint />
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
      {[
        { step: "1", title: "Greedy decoding", desc: "Always pick the highest probability token. Fast, but can be repetitive." },
        { step: "2", title: "Top-K sampling", desc: "Pick randomly from the K most likely tokens. More varied and natural." },
        { step: "3", title: "Top-P (nucleus) sampling", desc: "Pick from the smallest set of tokens whose combined probability exceeds P." },
        { step: "4", title: "Temperature", desc: "Scale logits before softmax. High temp = more random; low temp = more confident." },
      ].map(({ step, title, desc }) => (
        <div key={step} style={{
          display: "flex", gap: "14px", padding: "14px 16px",
          background: "var(--surface2)", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)"
        }}>
          <span style={{
            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
            background: "rgba(110,231,247,0.1)", border: "1px solid rgba(110,231,247,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", color: "var(--accent)", fontFamily: "var(--font-mono)"
          }}>{step}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13.5px", marginBottom: "3px" }}>{title}</div>
            <div style={{ fontSize: "13px", color: "var(--text-dimmer)" }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
    <p style={{ marginTop: "14px" }}>
      The chosen token is appended to the input, and the entire process repeats — this is called 
      <b> autoregressive generation</b>. Full sentences and paragraphs emerge one token at a time.
    </p>
  </div>
);

// ─── VIDEO HINT ───────────────────────────────────────────────────────────────

const VideoHint = () => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "5px 12px",
    background: "rgba(251,191,36,0.07)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "100px",
    fontSize: "12px",
    color: "var(--gold)",
    fontFamily: "var(--font-mono)",
    marginTop: "12px",
    cursor: "default",
  }}>
    <span>🎓</span>
    <span>Finding this hard? Check the prerequisite videos at the top of the page</span>
  </div>
);

// ─── PREREQUISITES SECTION ───────────────────────────────────────────────────

const PREREQ_RESOURCES = [
  {
    category: "Vectors & Linear Algebra",
    icon: "📐",
    color: "cyan",
    videos: [
      { title: "Vectors — Chapter 1, Essence of Linear Algebra", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", duration: "9 min",  why: "Understand what vectors are — the foundation of embeddings" },
      { title: "Dot Products and Duality",                        channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=LyGKycYT2v0", duration: "10 min", why: "Dot products power the Q·Kᵀ similarity score in attention" },
      { title: "Matrix Multiplication as Composition",            channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=XkY2DOUCWMU", duration: "10 min", why: "Matrix math is behind every Q, K, V projection" },
    ]
  },
  {
    category: "Word Embeddings & Tokenization",
    icon: "🔤",
    color: "purple",
    videos: [
      { title: "Word Embedding and Word2Vec, Clearly Explained",  channel: "StatQuest", url: "https://www.youtube.com/watch?v=viZrOnJclY0", duration: "20 min", why: "Exactly how tokens become vectors — core to this project" },
      { title: "Neural Networks Part 5: ArgMax and SoftMax",      channel: "StatQuest", url: "https://www.youtube.com/watch?v=KpKog-L9veg", duration: "15 min", why: "Softmax turns raw scores into probabilities in attention" },
    ]
  },
  {
    category: "Transformers & Attention",
    icon: "🧠",
    color: "gold",
    videos: [
      { title: "But what is a GPT? Visual intro to Transformers", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=wjZofJX0v4M", duration: "27 min", why: "The best visual intro to the full transformer architecture" },
      { title: "Attention in Transformers, Step by Step",         channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", duration: "26 min", why: "Deep dive into exactly what this project visualises" },
      { title: "Transformer Neural Networks, Clearly Explained",  channel: "StatQuest",   url: "https://www.youtube.com/watch?v=zxQyTK8quyY", duration: "36 min", why: "Encoder-decoder, BERT vs GPT — perfect complement to CoreAi" },
    ]
  },
];

const prereqColorMap = {
  cyan:   { border: "rgba(110,231,247,0.2)",  bg: "rgba(110,231,247,0.05)",  text: "var(--accent)",  badge: "rgba(110,231,247,0.12)" },
  purple: { border: "rgba(167,139,250,0.2)",  bg: "rgba(167,139,250,0.05)",  text: "var(--accent2)", badge: "rgba(167,139,250,0.12)" },
  gold:   { border: "rgba(251,191,36,0.2)",   bg: "rgba(251,191,36,0.05)",   text: "var(--gold)",    badge: "rgba(251,191,36,0.12)" },
};

const PrerequisitesSection = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "32px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          background: open ? "var(--surface)" : "var(--surface2)",
          border: "1px solid var(--border-bright)",
          borderRadius: open ? "var(--radius) var(--radius) 0 0" : "var(--radius)",
          color: "var(--text)", cursor: "pointer",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
          transition: "all 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>🎓</span>
          <span>Prerequisite Videos</span>
          <Badge color="gold">8 videos</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-dimmer)", fontFamily: "var(--font-mono)", fontWeight: 400 }}>
            Confused about the math? Start here
          </span>
          <span style={{
            fontSize: "18px", color: "var(--text-dim)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s", display: "inline-block"
          }}>⌄</span>
        </div>
      </button>

      {open && (
        <div style={{
          border: "1px solid var(--border-bright)", borderTop: "none",
          borderRadius: "0 0 var(--radius) var(--radius)",
          background: "var(--surface)", padding: "24px",
        }}>
          <p style={{ marginBottom: "20px", fontSize: "14px" }}>
            Go through the website step by step — and whenever something feels unclear, 
            whether it's a formula, a matrix, or a concept, come back here and find the 
            right video. These are hand-picked in the exact order you'll need them.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {PREREQ_RESOURCES.map(section => {
              const c = prereqColorMap[section.color];
              return (
                <div key={section.category}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "18px" }}>{section.icon}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: c.text }}>
                      {section.category}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {section.videos.map(v => (
                      <a
                        key={v.url} href={v.url} target="_blank" rel="noreferrer"
                        style={{
                          display: "flex", gap: "14px", alignItems: "flex-start",
                          padding: "14px 16px", background: c.bg,
                          border: `1px solid ${c.border}`,
                          borderRadius: "var(--radius-sm)", textDecoration: "none",
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateX(0)"; }}
                      >
                        <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>▶</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>{v.title}</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "100px", background: c.badge, color: c.text, fontSize: "11px", fontFamily: "var(--font-mono)" }}>{v.channel}</span>
                            <span style={{ padding: "2px 8px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", color: "var(--text-dimmer)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>⏱ {v.duration}</span>
                          </div>
                          <div style={{ fontSize: "12.5px", color: "var(--text-dimmer)" }}>💡 {v.why}</div>
                        </div>
                        <span style={{ fontSize: "16px", color: "var(--text-dimmer)", flexShrink: 0, marginTop: "2px" }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "tokenization", label: "Tokenization",  icon: "✂️" },
  { id: "embeddings",   label: "Embeddings",     icon: "📊" },
  { id: "attention",    label: "Self-Attention",  icon: "👁" },
  { id: "layers",       label: "Layers",          icon: "🏗" },
  { id: "prediction",   label: "Prediction",      icon: "🎯" },
  { id: "all",          label: "View All",         icon: "▶" },
];

function App() {
  const [text, setText]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [model, setModel]     = useState("bert");
  const [activeStep, setActiveStep] = useState(null);
  const resultRef = useRef(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true); setError(null); setResult(null); setActiveStep(null);
      const res = await fetch("http://localhost:8000/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setActiveStep("tokenization");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      console.error(err);
      setError("Could not reach the backend on port 8000. Make sure it's running.");
    } finally { setLoading(false); }
  };

  // Derived data
  const tokenization   = result?.tokenization;
  const tokens         = tokenization?.tokens || [];
  const tokenIds       = tokenization?.token_ids || [];
  const explainedTokens = tokenization?.explained_tokens || [];
  const embeddingPreview = result?.embedding_matrix?.preview || [];
  const embeddingsForTokens = embeddingPreview.map(row => row.vector_sample);
  const embeddingSimilarity = buildEmbeddingSimilarity(result?.similarity_table || []);
  const embeddingGraph = Array.isArray(result?.embedding_graph)
    ? { points: result.embedding_graph }
    : result?.embedding_graph || null;
  const selfAttention   = result?.self_attention || null;
  const attentionSteps  = selfAttention?.detailed_steps || [];

  const renderStep = (stepId) => {
    switch (stepId) {
      case "tokenization": return <TokenizationView tokens={tokens} tokenIds={tokenIds} explainedTokens={explainedTokens} />;
      case "embeddings":   return <EmbeddingsView tokens={tokens} embeddings={embeddingsForTokens} embeddingSimilarity={embeddingSimilarity} embeddingGraph={embeddingGraph} />;
      case "attention":    return <AttentionView selfAttention={selfAttention} tokens={tokens} attentionSteps={attentionSteps} />;
      case "layers":       return <LayersView />;
      case "prediction":   return <PredictionView />;
      case "all":          return (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          <TokenizationView tokens={tokens} tokenIds={tokenIds} explainedTokens={explainedTokens} />
          <Divider />
          <EmbeddingsView tokens={tokens} embeddings={embeddingsForTokens} embeddingSimilarity={embeddingSimilarity} embeddingGraph={embeddingGraph} />
          <Divider />
          <AttentionView selfAttention={selfAttention} tokens={tokens} attentionSteps={attentionSteps} />
          <Divider />
          <LayersView />
          <Divider />
          <PredictionView />
        </div>
      );
      default: return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <div className="noise-overlay" />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ marginBottom: "16px" }}>
            <Badge color="cyan">🤖 Transformer Internals Explorer</Badge>
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(48px, 10vw, 96px)",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: "8px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 60%, var(--accent3) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.08em",
          }}>
            CoreAi
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(16px, 3vw, 24px)",
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: "20px",
            color: "var(--text-dim)",
            letterSpacing: "0.02em",
          }}>
            Inside the Large Language Model
          </h1>
          <p style={{
            maxWidth: "560px", margin: "0 auto 28px",
            fontSize: "17px", color: "var(--text-dim)", lineHeight: 1.7
          }}>
            A Large Language Model is a neural network trained to predict the next token in a sequence. 
            It doesn't "think" — it learns statistical patterns from massive text corpora 
            and computes probabilities. Enter any sentence below to see exactly how 
            your words flow through a real transformer, step by step.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Badge color="purple">🧮 768-dim embeddings</Badge>
            <Badge color="cyan">👁 Multi-head attention</Badge>
            <Badge color="gold">🔢 30K vocabulary</Badge>
          </div>
        </div>

        {/* ── PREREQUISITES ── */}
        <PrerequisitesSection />

        {/* ── INPUT CARD ── */}
        <Card className="fade-up-1" glow style={{ marginBottom: "32px" }}>
          {/* Model selector */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "11px", fontFamily: "var(--font-display)", fontWeight: 700,
              letterSpacing: "0.12em", color: "var(--text-dimmer)", textTransform: "uppercase",
              marginBottom: "10px"
            }}>
              Select Model
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {/* BERT button */}
              <button onClick={() => setModel("bert")} style={{
                flex: 1, padding: "14px 20px",
                background: model === "bert" ? "rgba(110,231,247,0.08)" : "var(--surface2)",
                border: `1.5px solid ${model === "bert" ? "rgba(110,231,247,0.45)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer", color: "var(--text)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
                boxShadow: model === "bert" ? "0 0 20px rgba(110,231,247,0.1)" : "none",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>⚡</span>
                  <span>DistilBERT</span>
                  {model === "bert" && <Badge color="green">Active</Badge>}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-dimmer)", fontWeight: 400, marginTop: "4px" }}>
                  Encoder-only · No text generation · Great for understanding
                </div>
              </button>

              {/* GPT button (disabled) */}
              <button disabled style={{
                flex: 1, padding: "14px 20px",
                background: "var(--surface2)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "not-allowed", color: "var(--text-dimmer)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
                opacity: 0.5
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>🔮</span>
                  <span>GPT-2</span>
                  <Badge color="purple">Coming Soon</Badge>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-dimmer)", fontWeight: 400, marginTop: "4px" }}>
                  Decoder-only · Text generation · Autoregressive
                </div>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ position: "relative" }}>
            <textarea
              rows={3}
              placeholder="Enter a sentence to explore how a transformer processes it…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleProcess(); } }}
              style={{
                width: "100%", padding: "16px 18px",
                background: "var(--surface2)",
                border: "1px solid var(--border-bright)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text)", fontFamily: "var(--font-body)", fontSize: "15px",
                lineHeight: 1.6, resize: "none",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(110,231,247,0.4)"}
              onBlur={e => e.target.style.borderColor = "var(--border-bright)"}
            />
          </div>

          {/* Process button */}
          <button onClick={handleProcess} disabled={loading || !text.trim()} style={{
            marginTop: "14px",
            display: "flex", alignItems: "center", gap: "10px",
            padding: "13px 28px",
            background: loading ? "rgba(110,231,247,0.05)" : "rgba(110,231,247,0.1)",
            border: "1px solid rgba(110,231,247,0.35)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
            cursor: loading || !text.trim() ? "not-allowed" : "pointer",
            opacity: !text.trim() ? 0.5 : 1,
            transition: "all 0.2s",
            animation: !loading && text.trim() ? "pulse-glow 2.5s ease-in-out infinite" : "none"
          }}>
            {loading ? <Spinner /> : <span>→</span>}
            <span>{loading ? "Processing through DistilBERT…" : "Process Sentence"}</span>
          </button>

          {error && (
            <div style={{
              marginTop: "12px", padding: "10px 14px",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "13.5px"
            }}>
              ⚠️ {error}
            </div>
          )}
        </Card>

        {/* ── DISTILBERT NOTE ── */}
        <Card className="fade-up-2" style={{ marginBottom: "48px", padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "24px" }}>💡</span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "6px" }}>
                About DistilBERT
              </div>
              <p style={{ marginBottom: "6px" }}>
                This project uses <b>DistilBERT</b> — a distilled (compressed) version of BERT. It's 
                40% smaller and 60% faster while retaining ~97% of BERT's accuracy. 
                However, its <b>smaller vocabulary</b> and <b>fewer training steps</b> mean 
                semantic similarity results may be less precise than full-scale models.
              </p>
              <p style={{ marginBottom: 0 }}>
                <b>Important:</b> DistilBERT is <b>encoder-only</b> — it has no decoder block. 
                This means it can deeply <em>understand</em> text but <em>cannot generate</em> new text 
                the way GPT can. The prediction step is shown for educational purposes only.
              </p>
            </div>
          </div>
        </Card>

        {/* ── RESULTS ── */}
        {result && (
          <div ref={resultRef}>
            {/* Step navigator */}
            <div style={{
              display: "flex", gap: "8px", flexWrap: "wrap",
              marginBottom: "24px", position: "sticky", top: "16px", zIndex: 10,
              padding: "12px 16px",
              background: "rgba(10,11,15,0.92)",
              backdropFilter: "blur(12px)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)"
            }}>
              {STEPS.map(s => (
                <StepBtn
                  key={s.id}
                  icon={s.icon}
                  label={s.label}
                  active={activeStep === s.id}
                  onClick={() => setActiveStep(s.id)}
                />
              ))}
            </div>

            {/* Step content */}
            <Card key={activeStep}>
              {renderStep(activeStep)}
            </Card>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: "64px", textAlign: "center",
          fontSize: "12px", color: "var(--text-dimmer)",
          fontFamily: "var(--font-mono)"
        }}>
          CoreAi · Built with DistilBERT · FastAPI backend · React frontend
        </div>
      </div>
    </>
  );
}

export default App;