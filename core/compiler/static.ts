export const ZYRA_FMT_HELPER = `
function __zyra_fmt(v) {
  if (v == null) return v;

  if (Array.isArray(v)) {
    return v.map(__zyra_fmt);
  }

  if (typeof v === "object") {
    
    if ("__e" in v && "__c" in v) {
      const e = v.__e;
      const c = v.__c;

      const payload = { ...v };
      delete payload.__e;
      delete payload.__c;

      const keys = Object.keys(payload);
      if (keys.length === 0) return \`\${e}.\${c}\`;
      if (keys.length === 1) return \`\${e}.\${c}(\${__zyra_fmt(payload[keys[0]])})\`;

      return \`\${e}.\${c}(\${keys.map(k => \`\${k}: \${__zyra_fmt(payload[k])}\`).join(", ")})\`;
    }

    
    if ("__t" in v) {
      const t = v.__t;
      const obj = { ...v };
      delete obj.__t;

      const keys = Object.keys(obj);
      return \`\${t}{\${keys.map(k => \`\${k}: \${__zyra_fmt(obj[k])}\`).join(", ")}}\`;
    }
  }

  return v;
}
`.trim();