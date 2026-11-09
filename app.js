(() => {
  const cfg = window.ADWorld_CONFIG || {};
  const clientReady = !!(window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const db = clientReady ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = (s) => document.querySelector(s);
  let mode = "login";
  let currentUser = null;

  $("#year").textContent = new Date().getFullYear();
  const countrySelect = $("#country");
  try {
    const display = new Intl.DisplayNames(["en"], {type:"region"});
    const regions = [];
    for (let a=65; a<=90; a++) for (let b=65; b<=90; b++) {
      const code = String.fromCharCode(a,b);
      const name = display.of(code);
      if (name && name !== code && !name.startsWith("Unknown")) regions.push([name,code]);
    }
    [...new Map(regions.map(x=>[x[0],x])).values()].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([name,code]) => {
      const opt = document.createElement("option"); opt.value = name; opt.textContent = name; countrySelect.appendChild(opt);
    });
  } catch (_) {}

  function message(el, text, error=false) { el.textContent = text; el.classList.toggle("error", error); }
  function setSignedIn(user) {
    currentUser = user || null;
    $("#user-label").textContent = user ? user.email : "Not signed in";
    $("#auth-open").classList.toggle("hidden", !!user);
    $("#logout").classList.toggle("hidden", !user);
    $("#form-message").textContent = user ? "Ready to save your campaign draft." : "Sign in to save a campaign.";
    if (user) loadCampaigns();
    else $("#campaign-list").innerHTML = '<p class="muted">Sign in to view your saved campaigns.</p>';
  }
  if (!clientReady) message($("#form-message"), "Supabase configuration is missing. Check config.js.", true);

  $("#auth-open").addEventListener("click", () => $("#auth-dialog").showModal());
  $("#show-login").addEventListener("click", () => setMode("login"));
  $("#show-signup").addEventListener("click", () => setMode("signup"));
  function setMode(next) {
    mode = next;
    $("#show-login").classList.toggle("active", mode==="login");
    $("#show-signup").classList.toggle("active", mode==="signup");
    $("#auth-title").textContent = mode==="login" ? "Welcome back" : "Create your AdWorld account";
    $("#auth-submit").textContent = mode==="login" ? "Sign in" : "Create account";
  }
  $("#auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!db) return message($("#auth-message"), "Supabase is not configured.", true);
    const data = new FormData(e.currentTarget), email = data.get("email"), password = data.get("password");
    $("#auth-submit").disabled = true;
    try {
      const result = mode==="login"
        ? await db.auth.signInWithPassword({email,password})
        : await db.auth.signUp({email,password});
      if (result.error) throw result.error;
      if (mode==="signup" && !result.data.session) {
        message($("#auth-message"), "Account created. Check your email to confirm your address.");
      } else {
        message($("#auth-message"), "You are signed in.");
        $("#auth-dialog").close();
        setSignedIn(result.data.user);
      }
    } catch (err) { message($("#auth-message"), err.message || "Authentication failed.", true); }
    finally { $("#auth-submit").disabled = false; }
  });
  $("#logout").addEventListener("click", async () => { if (db) await db.auth.signOut(); setSignedIn(null); });
  $("#refresh").addEventListener("click", loadCampaigns);

  $("#campaign-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!db || !currentUser) {
      message($("#form-message"), "Please sign in before saving a campaign.", true);
      $("#auth-dialog").showModal(); return;
    }
    const f = new FormData(e.currentTarget);
    const days = Number(f.get("duration_days"));
    if (!Number.isInteger(days) || days < 1 || days > 365) return message($("#form-message"), "Duration must be between 1 and 365 days.", true);
    const campaign = {
      user_id: currentUser.id,
      name: f.get("name"),
      destination_url: f.get("destination_url") || null,
      objective: f.get("objective"),
      country: f.get("country"),
      age_range: f.get("age_range"),
      gender: f.get("gender"),
      interests: f.get("interests") || null,
      duration_days: days,
      budget: f.get("budget") ? Number(f.get("budget")) : null,
      currency: f.get("currency"),
      description: f.get("description") || null,
      status: "draft"
    };
    const btn = e.submitter; btn.disabled = true;
    try {
      const {error} = await db.from("campaigns").insert(campaign);
      if (error) throw error;
      message($("#form-message"), "Campaign draft saved.");
      e.currentTarget.reset(); e.currentTarget.elements.duration_days.value = 1;
      await loadCampaigns();
    } catch (err) { message($("#form-message"), err.message || "Could not save campaign. Run schema.sql first.", true); }
    finally { btn.disabled = false; }
  });

  async function loadCampaigns() {
    if (!db || !currentUser) return;
    const holder = $("#campaign-list");
    holder.innerHTML = '<p class="muted">Loading campaigns…</p>';
    const {data,error} = await db.from("campaigns").select("*").order("created_at",{ascending:false});
    if (error) { holder.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`; return; }
    if (!data || !data.length) { holder.innerHTML = '<p class="muted">No campaigns yet. Create your first draft above.</p>'; return; }
    holder.innerHTML = data.map(c => `<article class="campaign-item"><div><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.objective || "")} · ${escapeHtml(c.country || "Worldwide")} · ${c.duration_days} day(s)</p></div><span class="status">${escapeHtml(c.status)}</span></article>`).join("");
  }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  if (db) {
    db.auth.getSession().then(({data}) => setSignedIn(data.session?.user || null));
    db.auth.onAuthStateChange((_event, session) => setSignedIn(session?.user || null));
  }
})();