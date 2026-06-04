const fs = require('fs');
let content = fs.readFileSync('src/Components/LoginPage.jsx', 'utf8');

content = content.replace(
  '<form id="loginForm" className="auth-form">',
  '{errorMsg && (<div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "14px", marginBottom: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}><i className="fas fa-exclamation-circle"></i> {errorMsg}</div>)}\n            <form id="loginForm" className="auth-form" onSubmit={handleLogin}>'
);

content = content.replace(
  '<button type="submit" className="btn btn-primary btn-lg" style={{"width": "100%", "padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": "pointer"}}>',
  '<button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{"width": "100%", "padding": "1rem 1.25rem", "border": "none", "borderRadius": "14px", "background": "var(--gradient-primary)", "color": "#fff", "fontWeight": "900", "cursor": loading ? "not-allowed" : "pointer", "opacity": loading ? 0.7 : 1}}>'
);

content = content.replace(
  '<i className="fas fa-right-to-bracket"></i> Se connecter\n              </button>',
  '{loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion...</> : <><i className="fas fa-right-to-bracket"></i> Se connecter</>}\n              </button>'
);

fs.writeFileSync('src/Components/LoginPage.jsx', content);
console.log('Fixed LoginPage.jsx');
