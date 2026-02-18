const $ = (id) => document.getElementById(id);

const token = localStorage.getItem("token");
if (!token) window.location.href = "/";

function authHeaders(extra = {}) {
  const t = localStorage.getItem("token");
  return { ...extra, ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

function setStatus(text) {
  $("status").textContent = text;
}

function setCreateMsg(text, kind) {
  const el = $("createMsg");
  el.textContent = text;
  el.className = `msg ${kind || ""}`;
}

function setImportMsg(text, kind) {
  const el = $("importMsg");
  el.textContent = text;
  el.className = `msg ${kind || ""}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildQuery() {
  const p = new URLSearchParams();
  if ($("search").value) p.set("search", $("search").value);
  if ($("category").value) p.set("category", $("category").value);
  if ($("min_age").value) p.set("min_age", $("min_age").value);
  if ($("players").value) p.set("players", $("players").value);
  if ($("in_stock").value) p.set("in_stock", $("in_stock").value);
  return p.toString() ? `?${p}` : "";
}

function renderRows(games) {
  const tbody = $("tbody");
  tbody.innerHTML = "";

  for (const g of games) {
    const stock = Number(g.stock ?? 0);
    const tags = Array.isArray(g.tags) ? g.tags : [];

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.id}</td>
      <td>${escapeHtml(g.name)}</td>
      <td>${escapeHtml(g.category ?? "")}</td>
      <td>${g.min_age ?? ""}</td>
      <td>${g.players ?? ""}</td>
      <td>${stock}</td>
      <td>${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</td>
      <td>${g.created_at ? new Date(g.created_at).toLocaleString() : ""}</td>
      <td><button class="btn" data-del="${g.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  }

  $("count").textContent = `${games.length} juego(s)`;
}

async function loadGames() {
  setStatus("Cargando...");
  try {
    const res = await fetch(`/api/games${buildQuery()}`, { headers: authHeaders() });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (!res.ok) throw data;

    renderRows(data);
    setStatus("OK");
  } catch {
    setStatus("Error");
  }
}

async function createGame() {
  setCreateMsg("Creando...", "warn");

  const payload = {
    name: $("name").value.trim(),
    category: $("new_category").value.trim() || null,
    min_age: $("new_min_age").value ? Number($("new_min_age").value) : null,
    players: $("new_players").value ? Number($("new_players").value) : null,
    stock: Number($("new_stock").value || 0),
    tags: $("new_tags").value
      ? $("new_tags").value.split(",").map(s => s.trim()).filter(Boolean)
      : [],
  };

  try {
    const res = await fetch("/api/games", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (!res.ok) throw data;

    setCreateMsg(`Creado: ${data.name}`, "ok");

    $("name").value = "";
    $("new_category").value = "";
    $("new_min_age").value = "";
    $("new_players").value = "";
    $("new_stock").value = "0";
    $("new_tags").value = "";

    await loadGames();
  } catch {
    setCreateMsg("Error", "err");
  }
}

async function importXml() {
  setImportMsg("Subiendo...", "warn");

  const file = $("xmlFile").files[0];
  if (!file) {
    setImportMsg("Selecciona XML", "err");
    return;
  }

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("/api/games/import-xml", {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (!res.ok) throw data;

    setImportMsg("Importado", "ok");
    await loadGames();
  } catch {
    setImportMsg("Error", "err");
  }
}
async function deleteGame(id) {
  try {
    setStatus("Eliminando...");

    const res = await fetch(`/api/games/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    if (!res.ok) {
      setStatus(`Error: ${res.status} ${data?.message || ""}`.trim());
      console.error("DELETE /api/games:", data);
      return;
    }

    setStatus("OK");
    await loadGames();
  } catch (e) {
    setStatus("Error de red");
    console.error(e);
  }
}


document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  if (!confirm("¿Eliminar juego?")) return;
  deleteGame(btn.getAttribute("data-del"));
});

$("applyBtn").addEventListener("click", loadGames);
$("clearBtn").addEventListener("click", () => {
  $("search").value = "";
  $("category").value = "";
  $("min_age").value = "";
  $("players").value = "";
  $("in_stock").value = "";
  loadGames();
});
$("refreshBtn").addEventListener("click", loadGames);
$("createBtn").addEventListener("click", createGame);
$("importXmlBtn").addEventListener("click", importXml);

$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

loadGames();
