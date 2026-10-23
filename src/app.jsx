import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  Link as LinkIcon,
  LoaderCircle,
  LogOut,
  Music2,
  Palette,
  Plus,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { isSupabaseReady, supabase } from "./supabase";

const traits = [
  "T3chy",
  "RBLX",
  "Minecraft",
  "Pixel Artist",
  "Code Crafter",
  "Music Explorer",
];
const sections = [
  { id: "about", label: "About me" },
  { id: "socials", label: "Social links" },
  { id: "cards", label: "My cards" },
];
const cardTypes = ["Song", "Artwork", "Project", "Social", "Link"];
const blank = {
  username: "",
  page_title: "",
  name: "",
  nickname: "",
  bio: "",
  avatar_url: "",
  location: "",
  headline: "",
  quote: "",
  gender: "",
  pronouns: "",
  traits: [],
  status: "",
  status_expires_at: null,
  theme_bg: "#f8f6f0",
  theme_text: "#20211f",
  enabled_sections: ["about", "socials", "cards"],
  links: [],
  cards: [],
};
const handle = () => new URLSearchParams(window.location.search).get("u");

export default function App() {
  const [session, setSession] = useState(null),
    [profile, setProfile] = useState(null),
    [view, setView] = useState(handle() ? "public" : "home"),
    [authOpen, setAuthOpen] = useState(false),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState("");
  async function load(column, value) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq(column, value)
      .single();
    if (data) {
      const [{ data: links }, { data: cards }] = await Promise.all([
        supabase.from("links").select("*").eq("profile_id", data.id),
        supabase.from("profile_cards").select("*").eq("profile_id", data.id),
      ]);
      setProfile({ ...data, links: links || [], cards: cards || [] });
    }
  }
  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }
    const h = handle();
    if (h) load("username", h).finally(() => setLoading(false));
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!h && s) load("id", s.user.id);
      if (!h) setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s && !handle()) load("id", s.user.id);
      if (!s && !handle()) setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const edit = () => (session ? setView("editor") : setAuthOpen(true));
  const yours = () => {
    if (session) {
      load("id", session.user.id);
      setView("profile");
    }
  };
  const home = () => {
    window.history.pushState({}, "", window.location.pathname);
    setView("home");
    if (session) load("id", session.user.id);
  };
  if (loading)
    return (
      <div className="loading">
        <LoaderCircle size={22} className="spin" /> Loading your playground…
      </div>
    );
  return (
    <>
      <Header
        session={session}
        home={home}
        edit={edit}
        yours={yours}
        logout={() => supabase.auth.signOut()}
      />
      {view === "editor" && session ? (
        <Editor
          profile={
            profile || { ...blank, username: session.user.email?.split("@")[0] }
          }
          saved={(p) => {
            setProfile(p);
            setView("profile");
            setMessage("Your T3chPlayground is live.");
          }}
        />
      ) : view === "profile" || view === "public" ? (
        <Profile
          profile={profile}
          own={Boolean(session && profile?.id === session.user.id)}
          edit={edit}
        />
      ) : (
        <Home edit={edit} />
      )}{" "}
      {message && (
        <div className="toast">
          <Check size={17} />
          {message}
        </div>
      )}
      {authOpen && (
        <Auth
          close={() => setAuthOpen(false)}
          done={() => {
            setAuthOpen(false);
            setView("editor");
          }}
        />
      )}
    </>
  );
}
function Header({ session, home, edit, yours, logout }) {
  const [query, setQuery] = useState("");
  function search(e) {
    e.preventDefault();
    const username = query.trim().replace(/^@/, "");
    if (username)
      window.location.href = `${window.location.pathname}?u=${encodeURIComponent(username)}`;
  }
  return (
    <header>
      <button className="wordmark" onClick={home}>
        <span>◎</span> T3chPlayground
      </button>
      <form className="profile-search" onSubmit={search}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username"
          aria-label="Search profiles"
        />
        <button aria-label="Search">
          <ChevronRight size={16} />
        </button>
      </form>
      <nav>
        <a href="#how">How it works</a>
        {session ? (
          <>
            <button className="your-page" onClick={yours}>
              Your Page
            </button>
            <button className="nav-button" onClick={edit}>
              Edit profile
            </button>
            <button className="avatar-button" title="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button className="nav-button" onClick={edit}>
            Create yours <ArrowUpRight size={15} />
          </button>
        )}
      </nav>
    </header>
  );
}
function Home({ edit }) {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">
          <Sparkles size={15} /> MAKE THE INTERNET YOURS
        </p>
        <h1>
          Your little
          <br />
          <em>playground</em> online.
        </h1>
        <p className="lede">
          A personal space for your work, your current obsessions, and every
          wonderful thing in between.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={edit}>
            Create your profile <ChevronRight size={18} />
          </button>
          <a className="text-button" href="#how">
            See how it works <span>↓</span>
          </a>
        </div>
        <div className="collage">
          <article className="mini-card yellow">
            <span>now playing</span>
            <Music2 />
            <b>Satellite</b>
            <small>Harry Styles</small>
          </article>
          <article className="mini-card coral">
            <span>hello, I’m</span>
            <b>maya.</b>
            <small>designer & daydreamer</small>
            <i>✦</i>
          </article>
          <article className="mini-card blue">
            <span>current project</span>
            <b>type foundry</b>
            <div className="lines">
              <i />
              <i />
              <i />
            </div>
          </article>
        </div>
      </section>
      <section className="steps" id="how">
        <p className="eyebrow">SIMPLE, BY DESIGN</p>
        <h2>A page that grows with you.</h2>
        <div className="step-grid">
          <Step
            n="01"
            title="Make it yours"
            text="Choose your colours, details, and the cards that tell your story."
          />
          <Step
            n="02"
            title="Add your good stuff"
            text="Share projects, art, songs, files, favourite links, and more."
          />
          <Step
            n="03"
            title="Share your space"
            text="One beautiful link, ready for your bio, portfolio, or friends."
          />
        </div>
      </section>
      <section className="cta">
        <p>YOUR SPACE IS WAITING</p>
        <h2>
          There’s only one you.
          <br />
          Make a page for them.
        </h2>
        <button className="primary light" onClick={edit}>
          Start creating <ChevronRight size={18} />
        </button>
      </section>
      <Footer />
    </main>
  );
}
function Step({ n, title, text }) {
  return (
    <article className="step">
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function Footer() {
  return (
    <footer>
      <span>◎ T3chPlayground</span>
      <span>Made for sharing what matters.</span>
    </footer>
  );
}
function Auth({ close, done }) {
  const [mode, setMode] = useState("signup"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    const a =
      mode === "signup"
        ? supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : supabase.auth.signInWithPassword({ email, password });
    const { error, data } = await a;
    setBusy(false);
    if (error) return setNotice(error.message);
    if (mode === "signup" && !data.session)
      setNotice("Check your email to confirm your account, then sign in.");
    else done();
  }
  return (
    <div className="overlay">
      <form className="auth-modal" onSubmit={submit}>
        <button type="button" className="close" onClick={close}>
          <X size={19} />
        </button>
        <div className="modal-mark">◎</div>
        <h2>{mode === "signup" ? "Make your space." : "Welcome back."}</h2>
        <p>
          {mode === "signup"
            ? "A few details and your page is yours."
            : "Sign in to tend to your corner."}
        </p>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength="8"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>
        {notice && <p className="notice">{notice}</p>}
        <button className="primary full" disabled={busy}>
          {busy
            ? "One moment…"
            : mode === "signup"
              ? "Create my profile"
              : "Sign in"}{" "}
          <ChevronRight size={17} />
        </button>
        <p className="switch">
          {mode === "signup" ? "Already have a profile?" : "New around here?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
}
function Field({ label, value, onChange, placeholder, area = false }) {
  const Tag = area ? "textarea" : "input";
  return (
    <label className="field">
      <span>{label}</span>
      <Tag
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function Repeat({ title, sub, items, add, remove, children }) {
  return (
    <section>
      <h2>{title}</h2>
      <p className="section-sub">{sub}</p>
      {items.map((x, i) => (
        <div className="repeater" key={i}>
          {children(x, i)}
          <button type="button" className="remove" onClick={() => remove(i)}>
            <X size={15} /> Remove
          </button>
        </div>
      ))}
      <button type="button" className="add" onClick={add}>
        <Plus size={16} /> Add {title === "Social links" ? "a link" : "a card"}
      </button>
    </section>
  );
}
function Editor({ profile, saved }) {
  const [form, setForm] = useState({
      ...blank,
      ...profile,
      links: profile.links || [],
      cards: profile.cards || [],
    }),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [uploading, setUploading] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const item = (group, i, k, v) =>
    update(
      group,
      form[group].map((x, n) => (n === i ? { ...x, [k]: v } : x)),
    );
  const remove = (group, i) =>
    update(
      group,
      form[group].filter((_, n) => n !== i),
    );
  const trait = (t) =>
    update(
      "traits",
      form.traits.includes(t)
        ? form.traits.filter((x) => x !== t)
        : [...form.traits, t],
    );
  const section = (id) =>
    update(
      "enabled_sections",
      form.enabled_sections.includes(id)
        ? form.enabled_sections.filter((x) => x !== id)
        : [...form.enabled_sections, id],
    );
  async function avatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setError("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024)
      return setError("Choose an image under 5 MB.");
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() || "jpg",
      path = `${user.id}/avatar-${Date.now()}.${ext}`,
      { error: up } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type });
    if (up) setError(up.message);
    else
      update(
        "avatar_url",
        supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl,
      );
    setUploading(false);
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim().match(/^[a-z0-9_-]{3,30}$/i))
      return setError(
        "Choose a username with 3–30 letters, numbers, dashes, or underscores.",
      );
    setSaving(true);
    const { links, cards, ...main } = form,
      {
        data: { user },
      } = await supabase.auth.getUser(),
      { data: p, error: pe } = await supabase
        .from("profiles")
        .upsert({ ...main, id: user.id, updated_at: new Date().toISOString() })
        .select()
        .single();
    if (pe) {
      setError(pe.message);
      setSaving(false);
      return;
    }
    const { error: cardDeleteError } = await supabase
      .from("profile_cards")
      .delete()
      .eq("profile_id", p.id);
    if (cardDeleteError) {
      setError(
        "Run the custom-profile Supabase migration first: " +
          cardDeleteError.message,
      );
      setSaving(false);
      return;
    }
    await supabase.from("links").delete().eq("profile_id", p.id);
    const gl = links.filter((x) => x.label && x.url),
      gc = cards.filter((x) => x.title);
    if (gl.length)
      await supabase
        .from("links")
        .insert(
          gl.map((x, position) => ({ ...x, profile_id: p.id, position })),
        );
    if (gc.length)
      await supabase
        .from("profile_cards")
        .insert(
          gc.map((x, position) => ({ ...x, profile_id: p.id, position })),
        );
    const [{ data: nextLinks }, { data: nextCards }] = await Promise.all([
      supabase.from("links").select("*").eq("profile_id", p.id),
      supabase.from("profile_cards").select("*").eq("profile_id", p.id),
    ]);
    setSaving(false);
    saved({ ...p, links: nextLinks || [], cards: nextCards || [] });
  }
  return (
    <main className="editor-wrap">
      <div className="editor-heading">
        <p className="eyebrow">YOUR T3CHPLAYGROUND</p>
        <h1>Build your corner.</h1>
        <p>Keep it true to you. Change any of this whenever you like.</p>
      </div>
      <form className="editor" onSubmit={save}>
        <section>
          <h2>The essentials</h2>
          <div className="avatar-upload">
            <div className="profile-avatar">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" />
              ) : (
                (form.name || "?").slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <b>Profile picture</b>
              <p>JPG, PNG, GIF, or WebP — up to 5 MB.</p>
              <label className="upload-button">
                <Upload size={15} />
                {uploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" onChange={avatar} />
              </label>
            </div>
          </div>
          <div className="form-grid">
            <Field
              label="Your name"
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="The name people know you by"
            />
            <Field
              label="Preferred name / nickname"
              value={form.nickname}
              onChange={(v) => update("nickname", v)}
              placeholder="What should we call you?"
            />
            <Field
              label="Username (makes your share link)"
              value={form.username}
              onChange={(v) => update("username", v.toLowerCase())}
              placeholder="your-name"
            />
            <Field
              label="A little headline"
              value={form.headline}
              onChange={(v) => update("headline", v)}
              placeholder="Designer, tinkerer, etc."
            />
            <Field
              label="Page name (browser tab title)"
              value={form.page_title}
              onChange={(v) => update("page_title", v)}
              placeholder="My T3chPlayground"
            />
          </div>
          <Field
            label="Bio"
            area
            value={form.bio}
            onChange={(v) => update("bio", v)}
            placeholder="A few words about you, your work, or what makes you tick."
          />
          <div className="form-grid">
            <Field
              label="Based in"
              value={form.location}
              onChange={(v) => update("location", v)}
              placeholder="A city, a timezone, anywhere"
            />
            <Field
              label="Quote"
              value={form.quote}
              onChange={(v) => update("quote", v)}
              placeholder="A line to live by"
            />
            <Field
              label="Gender"
              value={form.gender}
              onChange={(v) => update("gender", v)}
              placeholder="Optional"
            />
            <Field
              label="Pronouns"
              value={form.pronouns}
              onChange={(v) => update("pronouns", v)}
              placeholder="e.g. she/her"
            />
          </div>
        </section>
        <section>
          <h2>Right now</h2>
          <p className="section-sub">
            Your status automatically disappears 24 hours after you save it.
          </p>
          <Field
            label="Status"
            value={form.status}
            onChange={(v) => {
              update("status", v);
              update(
                "status_expires_at",
                v ? new Date(Date.now() + 86400000).toISOString() : null,
              );
            }}
            placeholder="What are you up to?"
          />
          {form.status_expires_at && form.status && (
            <p className="status-note">
              <Clock3 size={14} /> This status expires{" "}
              {new Date(form.status_expires_at).toLocaleString()}.
            </p>
          )}
        </section>
        <section>
          <h2>Traits</h2>
          <p className="section-sub">Pick the things that feel like you.</p>
          <div className="trait-picker">
            {traits.map((t) => (
              <button
                type="button"
                className={form.traits.includes(t) ? "selected" : ""}
                onClick={() => trait(t)}
                key={t}
              >
                {form.traits.includes(t) && <Check size={13} />} {t}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>Theme</h2>
          <p className="section-sub">Give your public page its own mood.</p>
          <div className="theme-controls">
            <label>
              Background
              <input
                type="color"
                value={form.theme_bg}
                onChange={(e) => update("theme_bg", e.target.value)}
              />
              <code>{form.theme_bg}</code>
            </label>
            <label>
              Text
              <input
                type="color"
                value={form.theme_text}
                onChange={(e) => update("theme_text", e.target.value)}
              />
              <code>{form.theme_text}</code>
            </label>
            <div
              className="theme-preview"
              style={{ background: form.theme_bg, color: form.theme_text }}
            >
              <Palette size={18} />
              <span>Your vibe</span>
            </div>
          </div>
        </section>
        <section>
          <h2>Page builder</h2>
          <p className="section-sub">
            Choose which parts appear on your public profile.
          </p>
          <div className="section-picker">
            {sections.map((s) => (
              <label key={s.id}>
                <input
                  type="checkbox"
                  checked={form.enabled_sections.includes(s.id)}
                  onChange={() => section(s.id)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </section>
        <Repeat
          title="Social links"
          sub="The places you call home."
          add={() =>
            update("links", [
              ...form.links,
              { label: "", url: "", kind: "website" },
            ])
          }
          items={form.links}
          remove={(i) => remove("links", i)}
        >
          {(x, i) => (
            <div className="repeat-fields">
              <Field
                label="Label"
                value={x.label}
                onChange={(v) => item("links", i, "label", v)}
                placeholder="My portfolio"
              />
              <Field
                label="URL"
                value={x.url}
                onChange={(v) => item("links", i, "url", v)}
                placeholder="https://"
              />
            </div>
          )}
        </Repeat>
        <Repeat
          title="My cards"
          sub="Songs, art, projects, files, links — put your good stuff here."
          add={() =>
            update("cards", [
              ...form.cards,
              {
                type: "Project",
                title: "",
                description: "",
                url: "",
                file_url: "",
              },
            ])
          }
          items={form.cards}
          remove={(i) => remove("cards", i)}
        >
          {(x, i) => (
            <>
              <label className="field">
                <span>Card type</span>
                <select
                  value={x.type}
                  onChange={(e) => item("cards", i, "type", e.target.value)}
                >
                  {cardTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <Field
                label="Title"
                value={x.title}
                onChange={(v) => item("cards", i, "title", v)}
                placeholder="Give it a name"
              />
              <Field
                label="Description"
                value={x.description}
                onChange={(v) => item("cards", i, "description", v)}
                placeholder="Tell people about it"
              />
              <Field
                label="Link URL (optional)"
                value={x.url}
                onChange={(v) => item("cards", i, "url", v)}
                placeholder="https://"
              />
              <Field
                label="Direct file URL (optional)"
                value={x.file_url}
                onChange={(v) => item("cards", i, "file_url", v)}
                placeholder="https://"
              />
            </>
          )}
        </Repeat>
        {error && <p className="error">{error}</p>}
        <button className="primary save" disabled={saving || uploading}>
          {saving ? "Saving…" : "Publish my T3chPlayground"}{" "}
          <ArrowUpRight size={17} />
        </button>
      </form>
    </main>
  );
}
function Profile({ profile, own, edit }) {
  useEffect(() => {
    const background = profile?.theme_bg || "#f8f6f0";
    const text = profile?.theme_text || "#20211f";
    document.documentElement.style.setProperty("--site-bg", background);
    document.documentElement.style.setProperty("--site-text", text);
    document.title = profile
      ? `${profile.page_title || profile.name || profile.username} | T3chPlayground`
      : "T3chPlayground";
    return () => {
      document.documentElement.style.removeProperty("--site-bg");
      document.documentElement.style.removeProperty("--site-text");
    };
  }, [profile]);

  if (!profile)
    return (
      <main className="empty">
        <h1>We couldn’t find that playground.</h1>
        <p>Check the profile link, or create your own.</p>
      </main>
    );
  const initial = (profile.name || profile.username || "?")
      .slice(0, 2)
      .toUpperCase(),
    active =
      profile.status &&
      (!profile.status_expires_at ||
        new Date(profile.status_expires_at) > new Date()),
    enabled = (id) => profile.enabled_sections?.includes(id) ?? true,
    share = `${window.location.origin}${window.location.pathname}?u=${profile.username}`;
  return (
    <main
      className="profile-page"
      style={{
        "--profile-bg": profile.theme_bg || "#f8f6f0",
        "--profile-text": profile.theme_text || "#20211f",
      }}
    >
      <section className="profile-hero">
        <div className="profile-top">
          <div className="profile-identity">
            <div className="profile-avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                initial
              )}
            </div>
            <div>
              <h1>{profile.name || profile.username}</h1>
              {profile.nickname && (
                <p className="nickname">also known as {profile.nickname}</p>
              )}
            </div>
          </div>
        </div>
        {active && (
          <p className="live-status">
            <span /> {profile.status}
          </p>
        )}
        <p className="headline">{profile.headline}</p>
        {enabled("about") && (
          <>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            {profile.quote && <blockquote>“{profile.quote}”</blockquote>}
            <div className="meta">
              {profile.location && <span>⌖ {profile.location}</span>}
              {profile.pronouns && <span>{profile.pronouns}</span>}
              {profile.gender && <span>{profile.gender}</span>}
              <span>@{profile.username}</span>
            </div>
            {profile.traits?.length > 0 && (
              <div className="traits">
                {profile.traits.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </>
        )}
        {own && (
          <button
            className="share-link"
            onClick={() =>
              navigator.clipboard
                .writeText(share)
                .then(() => alert("Profile link copied!"))
            }
          >
            <Share2 size={15} /> Copy profile link
          </button>
        )}
        {enabled("socials") && profile.links?.length > 0 && (
          <div className="profile-links">
            {profile.links
              .sort((a, b) => a.position - b.position)
              .map((l) => (
                <a href={l.url} target="_blank" rel="noreferrer" key={l.id}>
                  <LinkIcon size={15} />
                  {l.label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
          </div>
        )}
      </section>
      {enabled("cards") && profile.cards?.length > 0 && (
        <section className="profile-section">
          <p className="eyebrow">MY COLLECTION</p>
          <h2>Things I want to share</h2>
          <div className="project-grid">
            {profile.cards
              .sort((a, b) => a.position - b.position)
              .map((c) => (
                <article className="project-card" key={c.id}>
                  <small>{c.type}</small>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer">
                      Open link <ExternalLink size={14} />
                    </a>
                  )}
                  {c.file_url && (
                    <a href={c.file_url} target="_blank" rel="noreferrer">
                      Open file <ExternalLink size={14} />
                    </a>
                  )}
                </article>
              ))}
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
