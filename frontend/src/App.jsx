import { useState, useRef } from "react";

const BLUE = "#3B5BFC";
const BLUE_DARK = "#2742d4";
const BLUE_LIGHT = "#EEF1FF";

function calcBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function calcDailySteps(age, weight, targetWeight, weeks) {
  const totalCalories = (weight - targetWeight) * 7700;
  const dailyCalories = totalCalories / (weeks * 7);
  const kcalPerStep = 0.04 * (weight / 70);
  const steps = Math.round(dailyCalories / kcalPerStep);
  const base = age >= 60 ? 6000 : age >= 50 ? 7000 : age >= 40 ? 8000 : 9000;
  return Math.min(Math.max(steps + base, base), 20000);
}

function stepsToKm(steps) { return ((steps * 0.75) / 1000).toFixed(1); }
function stepsToCalories(steps, weight) { return Math.round(steps * 0.04 * (weight / 70)); }

function StepDots({ total, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "20px 24px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : 0 }}>
          <div style={{
            width: i === current ? 28 : 10, height: 10, borderRadius: 99,
            background: i <= current ? BLUE : "#D1D8FF", transition: "all 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {i < current && <span style={{ color: "white", fontSize: 7 }}>✓</span>}
          </div>
          {i < total - 1 && <div style={{ flex: 1, height: 2, background: i < current ? BLUE : "#E0E6FF", marginLeft: 4 }} />}
        </div>
      ))}
    </div>
  );
}

function AgeCard({ range, selected, onClick, emoji }) {
  return (
    <div onClick={onClick} style={{
      borderRadius: 18, overflow: "hidden", cursor: "pointer",
      border: selected ? "2px solid " + BLUE : "2px solid #eee",
      background: selected ? BLUE_LIGHT : "#F7F8FF",
      transition: "all 0.2s", transform: selected ? "scale(1.02)" : "scale(1)",
    }}>
      <div style={{ height: 100, background: selected ? "#DDE3FF" : "#EDEEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
        {emoji}
      </div>
      <div style={{ background: BLUE, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 17, fontFamily: "Sora, sans-serif" }}>{range}</span>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14 }}>›</span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", unit, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#555", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: "2px solid #E0E6FF", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", padding: "13px 14px", fontSize: 16, background: "transparent", color: "#1a1a2e" }} />
        {unit && <span style={{ padding: "0 14px", color: "#888", fontWeight: 600, fontSize: 13 }}>{unit}</span>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "16px", borderRadius: 14,
      border: variant === "secondary" ? "2px solid " + BLUE : "none",
      cursor: disabled ? "default" : "pointer", fontWeight: 700, fontSize: 16,
      background: disabled ? "#ccc" : variant === "primary" ? BLUE : "white",
      color: disabled ? "#aaa" : variant === "primary" ? "white" : BLUE,
      transition: "all 0.2s", boxShadow: disabled ? "none" : "0 4px 14px rgba(59,91,252,0.25)",
    }}>{children}</button>
  );
}

function MealAnalyzer() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true); setError(null);
    try {
      const resp = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 })
      });
      setResult(await resp.json());
    } catch (e) {
      setError("Impossible d analyser l image. Reessaie avec une photo plus claire.");
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 7 ? "#22c55e" : s >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1a1a2e", margin: "0 0 4px" }}>Analyse ton repas</h2>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>Prends ou importe une photo pour obtenir les valeurs nutritionnelles.</p>
      <div onClick={() => fileRef.current.click()} style={{
        border: "2px dashed " + (image ? BLUE : "#C5CDFF"), borderRadius: 16, cursor: "pointer",
        background: BLUE_LIGHT, minHeight: 180, display: "flex", alignItems: "center",
        justifyContent: "center", overflow: "hidden", marginBottom: 16
      }}>
        {image
          ? <img src={image} alt="repas" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          : <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
              <p style={{ fontWeight: 600, color: BLUE, margin: 0 }}>Appuie pour ajouter une photo</p>
              <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>JPG, PNG acceptes</p>
            </div>
        }
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      {image && !result && <Btn onClick={analyze} disabled={loading}>{loading ? "Analyse en cours..." : "Analyser ce repas"}</Btn>}
      {error && <div style={{ background: "#FFF0F0", borderRadius: 12, padding: 14, color: "#c0392b", fontSize: 14, margin: "12px 0" }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ background: "white", borderRadius: 18, padding: 18, boxShadow: "0 4px 24px rgba(59,91,252,0.1)", border: "1.5px solid " + BLUE_LIGHT }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{result.nom_repas}</h3>
              <div style={{ background: scoreColor(result.score_sante), color: "white", borderRadius: 99, padding: "4px 12px", fontWeight: 700, fontSize: 13 }}>{result.score_sante}/10</div>
            </div>
            <div style={{ background: BLUE_LIGHT, borderRadius: 14, padding: 14, textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: BLUE }}>{result.calories}</div>
              <div style={{ fontSize: 13, color: "#666" }}>calories</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Proteines", val: result.proteines_g, color: BLUE },
                { label: "Glucides", val: result.glucides_g, color: "#f59e0b" },
                { label: "Lipides", val: result.lipides_g, color: "#ef4444" }
              ].map(m => (
                <div key={m.label} style={{ background: "#F7F8FF", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: m.color }}>{m.val}g</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#166534", fontWeight: 500 }}>{result.avis_sante}</p>
            </div>
            <div style={{ background: BLUE_LIGHT, borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: BLUE_DARK, fontWeight: 500 }}>{result.conseil}</p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn variant="secondary" onClick={() => { setImage(null); setResult(null); setImageBase64(null); }}>
              Analyser un autre repas
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ profile, onReset }) {
  const [tab, setTab] = useState("objectif");
  const steps = calcDailySteps(profile.age, profile.weight, profile.targetWeight, profile.weeks);
  const km = stepsToKm(steps);
  const calories = stepsToCalories(steps, profile.weight);
  const bmi = calcBMI(profile.weight, profile.height);

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6FF" }}>
      <div style={{ background: "linear-gradient(135deg, #3B5BFC 0%, #6366F1 100%)", padding: "20px 20px 30px", borderRadius: "0 0 28px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Bonjour</p>
            <h2 style={{ margin: "2px 0 0", color: "white", fontWeight: 800, fontSize: 22 }}>{profile.prenom} {profile.nom}</h2>
          </div>
          <div onClick={onReset} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}>⚙️</div>
        </div>
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
          {[["Poids actuel", profile.weight + " kg"], ["Objectif", profile.targetWeight + " kg"], ["IMC", bmi], ["Duree", profile.weeks + " sem."]].map(([label, val]) => (
            <div key={label}>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{label}</p>
              <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 16 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", margin: "18px 20px 0", background: "white", borderRadius: 12, padding: 4, gap: 4 }}>
        {[["objectif", "Objectif"], ["repas", "Repas"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none",
            background: tab === key ? BLUE : "transparent",
            color: tab === key ? "white" : "#777",
            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
          }}>{label}</button>
        ))}
      </div>
      <div style={{ padding: "16px 20px 80px" }}>
        {tab === "objectif" && (
          <>
            <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 24px rgba(59,91,252,0.08)", marginBottom: 14 }}>
              <p style={{ margin: "0 0 14px", fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>Ton objectif quotidien</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "👟", val: steps.toLocaleString("fr"), label: "pas / jour", color: BLUE },
                  { icon: "📍", val: km + " km", label: "distance", color: "#22c55e" },
                  { icon: "🔥", val: String(calories), label: "kcal", color: "#f59e0b" }
                ].map(c => (
                  <div key={c.label} style={{ background: BLUE_LIGHT, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 24 }}>{c.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: c.color, margin: "4px 0 2px" }}>{c.val}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #3B5BFC 0%, #6366F1 100%)", borderRadius: 20, padding: 20, color: "white" }}>
              <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 10px" }}>Conseils pour {profile.ageGroup} ans</p>
              {(profile.age >= 60
                ? ["Marche a un rythme confortable", "Privilegie les surfaces douces", "Hydrate-toi regulierement", "Fais des pauses si besoin"]
                : profile.age >= 50
                ? ["Varie les terrains", "Marche 30 min minimum sans pause", "Associe stretching et marche", "Surveille ta frequence cardiaque"]
                : profile.age >= 40
                ? ["Vise 10 000 pas par jour", "Integre des montees pour bruler plus", "Marche rapide 2x par semaine", "Suivi hebdomadaire du poids"]
                : ["Intercale des seances de marche rapide", "Combine marche et musculation legere", "Suis tes pas avec un tracker", "Reste actif en dehors des seances"]
              ).map((tip, i) => <p key={i} style={{ margin: "0 0 6px", fontSize: 13, opacity: 0.9 }}>✓ {tip}</p>)}
            </div>
          </>
        )}
        {tab === "repas" && <MealAnalyzer />}
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ nom: "", prenom: "", ageGroup: "", height: "", weight: "", targetWeight: "", weeks: "8" });
  const [finalProfile, setFinalProfile] = useState(null);

  const ageGroups = [
    { range: "30-39", min: 30, emoji: "🏃" },
    { range: "40-49", min: 40, emoji: "🚶" },
    { range: "50-59", min: 50, emoji: "🧘" },
    { range: "60+",   min: 60, emoji: "🌿" },
  ];

  const canProceed = [
    profile.nom && profile.prenom,
    profile.ageGroup,
    profile.height && profile.weight && profile.targetWeight && profile.weeks,
  ];

  function finish() {
    const group = ageGroups.find(g => g.range === profile.ageGroup);
    setFinalProfile({
      ...profile,
      age: group.min + 5,
      height: Number(profile.height),
      weight: Number(profile.weight),
      targetWeight: Number(profile.targetWeight),
      weeks: Number(profile.weeks)
    });
  }

  if (finalProfile) return <Dashboard profile={finalProfile} onReset={() => { setFinalProfile(null); setStep(0); }} />;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      <StepDots total={3} current={step} />
      <div style={{ flex: 1, padding: "20px 24px 32px", overflowY: "auto" }}>
        {step === 0 && (
          <>
            <h1 style={{ fontWeight: 900, fontSize: 28, color: "#1a1a2e", margin: "0 0 6px" }}>Creons ton profil</h1>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Ces informations personaliseront ton programme.</p>
            <Field label="Prenom" value={profile.prenom} onChange={v => setProfile(p => ({ ...p, prenom: v }))} placeholder="Ex: Marie" />
            <Field label="Nom" value={profile.nom} onChange={v => setProfile(p => ({ ...p, nom: v }))} placeholder="Ex: Dupont" />
          </>
        )}
        {step === 1 && (
          <>
            <h1 style={{ fontWeight: 900, fontSize: 28, color: "#1a1a2e", margin: "0 0 6px" }}>Entrainements de marche</h1>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Concus pour ton groupe d age</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ageGroups.map(g => (
                <AgeCard key={g.range} range={g.range} emoji={g.emoji}
                  selected={profile.ageGroup === g.range}
                  onClick={() => setProfile(p => ({ ...p, ageGroup: g.range }))} />
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 style={{ fontWeight: 900, fontSize: 28, color: "#1a1a2e", margin: "0 0 6px" }}>Ton objectif</h1>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Ces donnees calculent ton plan ideal.</p>
            <Field label="Taille" value={profile.height} onChange={v => setProfile(p => ({ ...p, height: v }))} type="number" unit="cm" placeholder="170" />
            <Field label="Poids actuel" value={profile.weight} onChange={v => setProfile(p => ({ ...p, weight: v }))} type="number" unit="kg" placeholder="80" />
            <Field label="Poids souhaite" value={profile.targetWeight} onChange={v => setProfile(p => ({ ...p, targetWeight: v }))} type="number" unit="kg" placeholder="72" />
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#555", marginBottom: 8 }}>Duree du programme</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {["4", "8", "12"].map(w => (
                <button key={w} onClick={() => setProfile(p => ({ ...p, weeks: w }))} style={{
                  padding: "12px 0", borderRadius: 12,
                  border: "2px solid " + (profile.weeks === w ? BLUE : "#E0E6FF"),
                  background: profile.weeks === w ? BLUE_LIGHT : "white",
                  color: profile.weeks === w ? BLUE : "#555",
                  fontWeight: 700, fontSize: 14, cursor: "pointer"
                }}>{w} sem.</button>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        {step > 0 && <div style={{ marginBottom: 10 }}><Btn variant="secondary" onClick={() => setStep(s => s - 1)}>Retour</Btn></div>}
        {step < 2
          ? <Btn onClick={() => setStep(s => s + 1)} disabled={!canProceed[step]}>Continuer</Btn>
          : <Btn onClick={finish} disabled={!canProceed[2]}>Voir mon programme</Btn>}
        {step === 2 && <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 12 }}>En continuant, j accepte le traitement de mes donnees personnelles.</p>}
      </div>
    </div>
  );
}
