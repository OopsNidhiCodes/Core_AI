// ===================== STYLES =====================

const thStyle = {
  border: "1px solid #333",
  padding: "10px",
  backgroundColor: "#f2f2f2",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #333",
  padding: "10px",
  verticalAlign: "top"
};

// ===================== HELPERS =====================

function getOutOfVocabWords(explainedTokens) {
  if (!Array.isArray(explainedTokens)) return [];

  const groups = [];
  let current = [];

  explainedTokens.forEach(t => {
    if (t.token.startsWith("##")) {
      current.push(t.token);
    } else {
      if (current.length > 1) groups.push([...current]);
      current = [t.token];
    }
  });

  if (current.length > 1) groups.push(current);
  return groups;
}

// ===================== COMPONENT =====================

export default function TokenView({
  tokens,
  explainedTokens,
  tokenIds,
  embeddings,
  embeddingSimilarity,
  embeddingGraph,
  selfAttention,
  generationCapability,
  model
}) {
  // -------- Defensive normalization --------
  tokens = Array.isArray(tokens) ? tokens : [];
  explainedTokens = Array.isArray(explainedTokens) ? explainedTokens : [];
  tokenIds = Array.isArray(tokenIds) ? tokenIds : [];
  embeddings = Array.isArray(embeddings) ? embeddings : [];

  const outOfVocabWords =
    model === "bert" ? getOutOfVocabWords(explainedTokens) : [];

  return (
    <div>

      {/* ================= TOKENS ================= */}
      <h3>Tokens</h3>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {tokens.map((token, i) => (
          <div
            key={i}
            style={{
              padding: "6px 10px",
              border: "1px solid #333",
              borderRadius: "6px",
              backgroundColor:
                token === "[CLS]" || token === "[SEP]"
                  ? "#e8ffe8"
                  : token.startsWith("##")
                    ? "#ffe6e6"
                    : "#e6f2ff"
            }}
          >
            {token}
          </div>
        ))}
      </div>

      {tokens.length > 0 && (
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          <b>[CLS]</b> represents the whole sentence.{" "}
          <b>[SEP]</b> marks sentence boundaries.
        </p>
      )}

      {/* ================= OOV ================= */}
      {outOfVocabWords.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Why were some words split?</h4>
          <ul>
            {outOfVocabWords.map((group, i) => {
              const fullWord = group.map(t => t.replace("##", "")).join("");
              return (
                <li key={i}>
                  <b>{fullWord}</b> is not in BERT’s vocabulary, so it was split
                  into <b>{group.join(" + ")}</b>
                </li>
              );
            })}
          </ul>
          <p style={{ fontSize: "13px" }}>
            <b>##</b> indicates a continuation of the previous token.
          </p>
        </div>
      )}

      {/* ================= TOKEN → ID ================= */}
      {tokenIds.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4>Vocabulary Lookup (Token → ID)</h4>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={thStyle}>Token</th>
                <th style={thStyle}>Token ID</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{token}</td>
                  <td style={tdStyle}>{tokenIds[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= EMBEDDINGS ================= */}
      {embeddings.length > 0 && (
        <div style={{ marginTop: "28px" }}>
          <h4>Token Embeddings (first 8 dimensions)</h4>
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "8px" }}>
            Each token is turned into a long vector of numbers. We only show the
            first few dimensions here, but the full vector can have hundreds of
            values. These extra dimensions let the model capture many different
            shades of meaning and context for the same token.
          </p>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={thStyle}>Token</th>
                <th style={thStyle}>Embedding values</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{token}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                    {embeddings[i]
                      ? `[${embeddings[i]
                        .slice(0, 8)
                        .map(v => v.toFixed(3))
                        .join(", ")} …]`
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SIMILARITY ================= */}
      {embeddingSimilarity && (
        <div style={{ marginTop: "32px" }}>
          <h3>How the model compares word relationships</h3>

          <h4 style={{ color: "green" }}>High similarity</h4>
          {(embeddingSimilarity.high || []).map((p, i) => (
            <p key={i}>
              <b>{p.token_1} ↔ {p.token_2}</b> ({p.similarity}) → {p.reason}
            </p>
          ))}

          <h4 style={{ color: "orange", marginTop: "16px" }}>Low similarity</h4>
          {(embeddingSimilarity.low || []).map((p, i) => (
            <p key={i}>
              <b>{p.token_1} ↔ {p.token_2}</b> ({p.similarity}) → weak or no
              contextual relationship
            </p>
          ))}
        </div>
      )}

      {/* ================= SIMILARITY GUIDE ================= */}
      <div style={{ marginTop: "32px" }}>
        <h3>How to read similarity scores</h3>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Meaning</th>
              <th style={thStyle}>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={tdStyle}>0.85 – 1.00</td><td style={tdStyle}>Almost same meaning</td><td style={tdStyle}>Nearly identical idea</td></tr>
            <tr><td style={tdStyle}>0.70 – 0.85</td><td style={tdStyle}>Very strong</td><td style={tdStyle}>Strong semantic / syntactic link</td></tr>
            <tr><td style={tdStyle}>0.55 – 0.70</td><td style={tdStyle}>Moderate</td><td style={tdStyle}>Often appear together</td></tr>
            <tr><td style={tdStyle}>0.40 – 0.55</td><td style={tdStyle}>Weak</td><td style={tdStyle}>Loose contextual link</td></tr>
            <tr><td style={tdStyle}>0.20 – 0.40</td><td style={tdStyle}>Very weak</td><td style={tdStyle}>Barely connected</td></tr>
            <tr><td style={tdStyle}>0.00 – 0.20</td><td style={tdStyle}>Unrelated</td><td style={tdStyle}>No meaningful relation</td></tr>
          </tbody>
        </table>
      </div>

      {/* ================= EMBEDDING GRAPH ================= */}
      {embeddingGraph?.points?.length > 0 && (() => {
        const width = 520;
        const height = 420;
        const padding = 50;

        const points = embeddingGraph.points;

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const scaleX = x =>
          padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);

        const scaleY = y =>
          height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

        // find close pairs (distance threshold)
        const distance = (a, b) =>
          Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        const closePairs = [];
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            if (distance(points[i], points[j]) < 1.0) {
              closePairs.push([points[i], points[j]]);
            }
          }
        }

        return (
          <div style={{ marginTop: "40px" }}>
            <h3>Embedding space (2D PCA projection)</h3>

            <svg width={width} height={height} style={{ border: "1px solid #aaa" }}>

              {/* GRID */}
              {[...Array(5)].map((_, i) => {
                const x = padding + i * (width - 2 * padding) / 4;
                const y = padding + i * (height - 2 * padding) / 4;
                return (
                  <g key={i}>
                    <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#eee" />
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#eee" />
                  </g>
                );
              })}

              {/* AXES */}
              <line
                x1={padding}
                y1={height / 2}
                x2={width - padding}
                y2={height / 2}
                stroke="#999"
              />
              <line
                x1={width / 2}
                y1={padding}
                x2={width / 2}
                y2={height - padding}
                stroke="#999"
              />

              {/* AXIS LABELS */}
              <text x={width - padding} y={height / 2 - 6} fontSize="12">PCA-1</text>
              <text x={width / 2 + 6} y={padding + 12} fontSize="12">PCA-2</text>

              {/* SIMILARITY LINES */}
              {closePairs.map((pair, i) => (
                <line
                  key={i}
                  x1={scaleX(pair[0].x)}
                  y1={scaleY(pair[0].y)}
                  x2={scaleX(pair[1].x)}
                  y2={scaleY(pair[1].y)}
                  stroke="orange"
                  strokeDasharray="4"
                />
              ))}

              {/* POINTS */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={scaleX(p.x)}
                    cy={scaleY(p.y)}
                    r={6}
                    fill="#007bff"
                  />
                  <text
                    x={scaleX(p.x) + 8}
                    y={scaleY(p.y)}
                    fontSize="12"
                  >
                    {p.token}
                  </text>
                </g>
              ))}

            </svg>

            <p style={{ fontSize: "13px", color: "#555" }}>
              • Axes represent PCA dimensions<br />
              • Grid helps judge distance<br />
              • Dotted lines show tokens that are close in embedding space<br />
              • Tokens closer together have higher semantic similarity
            </p>
          </div>
        );
      })()}
      {selfAttention?.attention_matrix && tokens.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Self-Attention Matrix (Who looks at whom?)</h3>

          <p style={{ fontSize: "14px", color: "#555" }}>
            Each row shows how much a token attends to other tokens in the sentence.
            Darker cells mean stronger attention.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", marginTop: "15px" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, backgroundColor: "#ddd" }}>
                    From ↓ / To →
                  </th>
                  {tokens.map((t, i) => (
                    <th key={i} style={thStyle}>{t}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {selfAttention.attention_matrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                      {tokens[i]}
                    </td>

                    {row.map((value, j) => {
                      const intensity = Math.min(value, 1);
                      return (
                        <td
                          key={j}
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                            backgroundColor: `rgba(0, 123, 255, ${intensity})`,
                            color: intensity > 0.5 ? "white" : "black"
                          }}
                        >
                          {value > 0.01 ? value.toFixed(2) : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
            <h4>How is this matrix computed?</h4>

            <p style={{ fontFamily: "monospace" }}>
              Attention(Q, K, V) = softmax((Q × Kᵀ) / √dₖ) × V
            </p>

            <p style={{ fontSize: "14px" }}>
              Step 1: Each token is converted into three vectors:
              <b> Query (Q)</b>, <b>Key (K)</b>, and <b>Value (V)</b>.
            </p>

            <p style={{ fontSize: "14px" }}>
              Step 2: We compute similarity between Query and all Keys using
              a dot product (Q × Kᵀ).
            </p>

            <p style={{ fontSize: "14px" }}>
              Step 3: We divide by √dₖ to stabilize large values.
            </p>

            <p style={{ fontSize: "14px" }}>
              Step 4: We apply <b>softmax</b> so each row sums to 1.
              This gives us the attention matrix above.
            </p>

            <p style={{ fontSize: "14px" }}>
              Step 5: These attention weights are multiplied by V to create
              contextualized embeddings.
            </p>
          </div>

          <p style={{ fontSize: "13px", marginTop: "12px", color: "#666" }}>
            • Rows = Query token (who is paying attention) <br />
            • Columns = Key token (who is being attended to) <br />
            • Values sum to 1 across each row (softmax normalization)
          </p>
        </div>
      )}



    </div>
  );
}
