const $ = (id) => document.getElementById(id);

function setMsg(text, kind){
  const el = $("msg");
  el.textContent = text || "";
  el.className = "msg " + (kind || "");
}

async function callAuth(endpoint){
  const email = $("email").value.trim();
  const password = $("password").value;

  if(!email || !password){
    setMsg("Email y password son obligatorios.", "err");
    return;
  }

  setMsg("Procesando...", "");

  const res = await fetch("/api/auth/" + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));

  if(!res.ok){
    setMsg(data?.message || "Error", "err");
    return;
  }

  if(data?.token){
    localStorage.setItem("token", data.token);
    setMsg("OK. Entrando al inventario...", "ok");
    window.location.href = "/app";
    return;
  }

  setMsg("OK.", "ok");
}

$("loginBtn").addEventListener("click", () => callAuth("login"));
$("registerBtn").addEventListener("click", () => callAuth("register"));
$("password").addEventListener("keydown", (e) => { if(e.key === "Enter") callAuth("login"); });
