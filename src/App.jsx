import { useState, useMemo, useCallback } from "react";

const fmt  = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const fmtD = n => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const fmtP = n => Number(n).toFixed(3).replace(".",",")+"%";

function calcMutuo({importo,anni,tan,speseIstruttoria=1500,spesePeritia=300,assicurazioneAnnua=400}){
  const r=tan/100/12, n=anni*12;
  const rata = r===0 ? importo/n : (importo*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
  const totMutuo=rata*n, interessi=totMutuo-importo;
  const assicTot=assicurazioneAnnua*anni, spese=speseIstruttoria+spesePeritia+assicTot;
  const totale=totMutuo+spese;
  const taeg=(Math.pow((totale-importo)/importo+1,1/anni)-1)*100;
  return {rata,totMutuo,interessi,assicTot,spese,totale,taeg};
}

function calcVariabile({importo,anni,tanIniziale,deltaAumento,anniIniziali,speseIstruttoria=1500,spesePeritia=300,assicurazioneAnnua=400}){
  const r1=tanIniziale/100/12, r2=(tanIniziale+deltaAumento)/100/12;
  const n=anni*12, n1=anniIniziali*12;
  const rata1 = r1===0?importo/n:(importo*r1*Math.pow(1+r1,n))/(Math.pow(1+r1,n)-1);
  let saldo=importo, iTot1=0;
  for(let i=0;i<n1;i++){const qi=saldo*r1,qc=rata1-qi;saldo-=qc;iTot1+=qi;}
  const n2=n-n1;
  const rata2 = r2===0?saldo/n2:(saldo*r2*Math.pow(1+r2,n2))/(Math.pow(1+r2,n2)-1);
  let iTot2=0, saldo2=saldo;
  for(let i=0;i<n2;i++){const qi=saldo2*r2,qc=rata2-qi;saldo2-=qc;iTot2+=qi;}
  const interessi=iTot1+iTot2;
  const spese=speseIstruttoria+spesePeritia+assicurazioneAnnua*anni;
  const totale=importo+interessi+spese;
  const taeg=(Math.pow((totale-importo)/importo+1,1/anni)-1)*100;
  return {rata1,rata2,interessi,spese,totale,taeg};
}

function pianoAmmortamento(importo,anni,tan){
  const r=tan/100/12, n=anni*12;
  const rata=r===0?importo/n:(importo*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
  let saldo=importo; const rows=[];
  for(let i=1;i<=n;i++){
    const qi=saldo*r,qc=rata-qi;saldo=Math.max(0,saldo-qc);
    rows.push({i,rata,qi,qc,saldo});
  }
  return rows;
}

function AdSlot({id,size="leaderboard"}){
  const sizes={leaderboard:{w:"728px",h:"90px"},rect:{w:"336px",h:"280px"}};
  const {w,h}=sizes[size]||sizes.leaderboard;
  return(
    <div style={{display:"flex",justifyContent:"center",margin:"24px 0"}}>
      <div style={{width:w,maxWidth:"100%",height:h,background:"#131920",border:"1px dashed #1e2d3d",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,borderRadius:4}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.15em",color:"#1e3a50",textTransform:"uppercase"}}>
          Spazio Pubblicitario — AdSense
        </span>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"0.5rem",color:"#162635"}}>
          {/* <ins class="adsbygoogle" data-ad-slot="{id}" data-ad-format="auto" /> */}
          Slot ID: {id}
        </span>
      </div>
    </div>
  );
}

function exportPDF({importo,anni,tan,result,resultVar,deltaAumento,anniIniziali,confronto,piano,spese}){
  const {speseIstruttoria,spesePeritia,assicurazioneAnnua}=spese;
  const data=new Date().toLocaleDateString("it-IT");
  const pianoSample=piano.slice(0,24);
  const html=`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"/>
<title>Analisi Mutuo – ${data}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#0d1117;padding:48px;max-width:960px;margin:0 auto;font-size:14px}
h1{font-size:26px;font-weight:600;letter-spacing:-0.02em;color:#0d1117}
h2{font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#0ea5e9;margin:32px 0 12px;padding-bottom:8px;border-bottom:1px solid #e2e8f0}
.mono{font-family:'IBM Plex Mono',monospace}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px}
.card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc}
.label{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:0.1em;color:#94a3b8;text-transform:uppercase;margin-bottom:6px}
.val{font-size:18px;font-weight:600;color:#0d1117}
.val-gold{font-size:22px;font-weight:700;color:#0ea5e9}
table{width:100%;border-collapse:collapse;font-family:'IBM Plex Mono',monospace;font-size:11px}
th{text-align:right;padding:8px 10px;background:#f1f5f9;color:#64748b;font-weight:400;letter-spacing:0.04em;font-size:10px}
th:first-child{text-align:left}
td{text-align:right;padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#334155}
td:first-child{text-align:left;color:#64748b}
.hl td{background:#eff6ff;color:#0ea5e9;font-weight:500}
.bar{height:8px;display:flex;border-radius:4px;overflow:hidden;gap:2px;margin:10px 0}
.note{font-size:10px;color:#94a3b8;margin-top:36px;padding-top:12px;border-top:1px solid #e2e8f0;line-height:1.7}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #0d1117}
.badge{background:#0ea5e9;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:9px;padding:3px 8px;border-radius:3px;letter-spacing:0.08em}
@media print{body{padding:24px}}
</style></head><body>
<div class="header">
  <div>
    <div class="badge" style="margin-bottom:10px">ANALISI MUTUO IPOTECARIO</div>
    <h1>Riepilogo Finanziamento</h1>
    <p class="mono" style="font-size:11px;color:#94a3b8;margin-top:4px">${fmt(importo)} · ${anni} anni · TAN ${fmtP(tan)}</p>
  </div>
  <div style="text-align:right">
    <p class="mono" style="font-size:10px;color:#94a3b8">Generato il ${data}</p>
    <p class="mono" style="font-size:10px;color:#cbd5e1;margin-top:2px">Solo a scopo informativo</p>
  </div>
</div>
<h2>Parametri del Mutuo</h2>
<div class="grid">
  <div class="card"><p class="label">Importo</p><p class="val-gold">${fmt(importo)}</p></div>
  <div class="card"><p class="label">Durata</p><p class="val-gold">${anni} anni</p></div>
  <div class="card"><p class="label">TAN</p><p class="val-gold">${fmtP(tan)}</p></div>
  <div class="card"><p class="label">TAEG stimato</p><p class="val-gold">${fmtP(result.taeg)}</p></div>
</div>
<div class="grid">
  <div class="card"><p class="label">Istruttoria</p><p class="val">${fmt(speseIstruttoria)}</p></div>
  <div class="card"><p class="label">Perizia</p><p class="val">${fmt(spesePeritia)}</p></div>
  <div class="card"><p class="label">Assicuraz./anno</p><p class="val">${fmt(assicurazioneAnnua)}</p></div>
  <div class="card"><p class="label">Assicuraz. totale</p><p class="val">${fmt(result.assicTot)}</p></div>
</div>
<h2>Tasso Fisso — Risultati</h2>
<div class="grid-2">
  <div class="card" style="border-color:#bae6fd">
    <p class="label">Rata mensile</p><p class="val-gold">${fmtD(result.rata)}</p>
    <p class="mono" style="font-size:10px;color:#94a3b8;margin-top:4px">${anni*12} rate totali</p>
  </div>
  <div class="card" style="border-color:#bae6fd">
    <p class="label">Costo complessivo</p><p class="val-gold">${fmt(result.totale)}</p>
    <p class="mono" style="font-size:10px;color:#94a3b8;margin-top:4px">Interessi: ${fmt(result.interessi)}</p>
  </div>
</div>
<div class="bar">
  <div style="flex:${importo};background:#0ea5e9"></div>
  <div style="flex:${result.interessi};background:#f59e0b"></div>
  <div style="flex:${result.spese};background:#e2e8f0"></div>
</div>
<p class="mono" style="font-size:10px;color:#94a3b8">
  ■ Capitale ${Math.round(importo/result.totale*100)}% &nbsp; ■ Interessi ${Math.round(result.interessi/result.totale*100)}% &nbsp; ■ Spese ${Math.round(result.spese/result.totale*100)}%
</p>
<h2>Fisso vs Variabile</h2>
<p class="mono" style="font-size:10px;color:#64748b;margin-bottom:10px">Scenario: ${fmtP(tan)} per ${anniIniziali} anni poi +${fmtP(deltaAumento)}</p>
<div class="grid">
  <div class="card"><p class="label">Rata fase 1</p><p class="val">${fmtD(resultVar.rata1)}</p></div>
  <div class="card"><p class="label">Rata fase 2</p><p class="val" style="color:#ef4444">${fmtD(resultVar.rata2)}</p></div>
  <div class="card"><p class="label">Totale variabile</p><p class="val">${fmt(resultVar.totale)}</p></div>
  <div class="card"><p class="label">Δ vs fisso</p><p class="val" style="color:${resultVar.totale>result.totale?"#ef4444":"#22c55e"}">${fmt(resultVar.totale-result.totale)}</p></div>
</div>
<h2>Confronto per Durata — TAN ${fmtP(tan)}</h2>
<table><thead><tr><th style="text-align:left">Durata</th><th>Rata</th><th>Interessi</th><th>Spese</th><th>Totale</th><th>TAEG</th></tr></thead>
<tbody>${confronto.map(r=>`<tr class="${r.anni===anni?"hl":""}"><td>${r.anni} anni</td><td>${fmtD(r.rata)}</td><td>${fmt(r.interessi)}</td><td>${fmt(r.spese)}</td><td>${fmt(r.totale)}</td><td>${fmtP(r.taeg)}</td></tr>`).join("")}</tbody></table>
<h2 style="margin-top:28px">Piano di Ammortamento — Prime 24 Rate</h2>
<table><thead><tr><th style="text-align:left">Rata n°</th><th>Quota cap.</th><th>Quota int.</th><th>Rata</th><th>Debito residuo</th></tr></thead>
<tbody>${pianoSample.map(r=>`<tr><td>${r.i}</td><td>${fmtD(r.qc)}</td><td>${fmtD(r.qi)}</td><td>${fmtD(r.rata)}</td><td>${fmtD(r.saldo)}</td></tr>`).join("")}</tbody></table>
<p class="note">NOTA LEGALE — Documento generato a scopo puramente informativo. I calcoli si basano sul metodo di ammortamento alla francese (rate costanti). Il TAEG è una stima indicativa che include le spese accessorie inserite. Per un'offerta vincolante, contattare un istituto di credito autorizzato. Questo strumento non costituisce consulenza finanziaria ai sensi del D.Lgs. 58/1998 (TUF).</p>
</body></html>`;
  const w=window.open("","_blank","width=1000,height=750");
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),700);
}

const DURATE=[10,15,20,25,30];
const PRESET_TAN=[2.5,3.0,3.5,4.0,4.5,5.0];
const TABS=[["singolo","Calcolo"],["confronto","Confronto durate"],["fissovariabile","Fisso vs Variabile"],["piano","Ammortamento"]];

const C = {
  bg:"#0d1117", surface:"#131920", border:"#1e2d3d", borderLight:"#1a2840",
  text:"#e2e8f0", muted:"#4a6580", accent:"#0ea5e9", accentDim:"#0ea5e910",
  green:"#22c55e", red:"#ef4444", amber:"#f59e0b",
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
  mono:"'IBM Plex Mono', monospace",
};

function Label({children}){
  return <p style={{fontFamily:C.mono,fontSize:"0.62rem",letterSpacing:"0.12em",color:C.muted,textTransform:"uppercase",marginBottom:6}}>{children}</p>;
}

function Card({children,style={},accent=false}){
  return(
    <div style={{background:C.surface,border:`1px solid ${accent?C.accent+"44":C.border}`,borderRadius:6,padding:22,...style}}>
      {children}
    </div>
  );
}

function Pill({active,onClick,children}){
  return(
    <span onClick={onClick} style={{display:"inline-block",padding:"3px 11px",border:`1px solid ${active?C.accent:C.border}`,
      background:active?C.accentDim:"transparent",color:active?C.accent:C.muted,
      fontFamily:C.mono,fontSize:"0.68rem",cursor:"pointer",borderRadius:4,transition:"all 0.18s"}}>
      {children}
    </span>
  );
}

function NumInput({label,value,onChange,min,max,step,unit,presets}){
  return(
    <Card>
      <Label>{label}</Label>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <input type="number" value={value} onChange={e=>onChange(Number(e.target.value))}
          step={step} min={min} max={max}
          style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,color:C.text,
            fontFamily:C.mono,fontSize:"1.15rem",width:"100%",padding:"4px 0",outline:"none",transition:"border 0.2s"}}
          onFocus={e=>e.target.style.borderBottomColor=C.accent}
          onBlur={e=>e.target.style.borderBottomColor=C.border}
        />
        <span style={{fontFamily:C.mono,fontSize:"0.75rem",color:C.muted,flexShrink:0}}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",WebkitAppearance:"none",appearance:"none",height:2,
          background:`linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${((value-min)/(max-min))*100}%, ${C.border} ${((value-min)/(max-min))*100}%, ${C.border} 100%)`,
          outline:"none",cursor:"pointer",borderRadius:2}}/>
      {presets&&(
        <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
          {presets.map(p=><Pill key={p} active={value===p} onClick={()=>onChange(p)}>{p}{unit}</Pill>)}
        </div>
      )}
    </Card>
  );
}

function StatBlock({label,value,color=C.text,sub}){
  return(
    <Card>
      <Label>{label}</Label>
      <p style={{fontFamily:C.mono,fontSize:"1.05rem",fontWeight:500,color,marginTop:2}}>{value}</p>
      {sub&&<p style={{fontFamily:C.mono,fontSize:"0.62rem",color:C.muted,marginTop:4}}>{sub}</p>}
    </Card>
  );
}

export default function App(){
  const [importo,setImporto]=useState(200000);
  const [anni,setAnni]=useState(20);
  const [tan,setTan]=useState(3.5);
  const [speseIstruttoria,setSpeseIstruttoria]=useState(1500);
  const [spesePeritia,setSpesePeritia]=useState(300);
  const [assicurazioneAnnua,setAssicurazioneAnnua]=useState(400);
  const [deltaAumento,setDeltaAumento]=useState(1.5);
  const [anniIniziali,setAnniIniziali]=useState(5);
  const [showFullPiano,setShowFullPiano]=useState(false);
  const [activeTab,setActiveTab]=useState("singolo");
  const spese={speseIstruttoria,spesePeritia,assicurazioneAnnua};

  const result   =useMemo(()=>calcMutuo({importo,anni,tan,...spese}),[importo,anni,tan,speseIstruttoria,spesePeritia,assicurazioneAnnua]);
  const resultVar=useMemo(()=>calcVariabile({importo,anni,tanIniziale:tan,deltaAumento,anniIniziali,...spese}),[importo,anni,tan,deltaAumento,anniIniziali,speseIstruttoria,spesePeritia,assicurazioneAnnua]);
  const confronto=useMemo(()=>DURATE.map(d=>({anni:d,...calcMutuo({importo,anni:d,tan,...spese})})),[importo,tan,speseIstruttoria,spesePeritia,assicurazioneAnnua]);
  const piano    =useMemo(()=>pianoAmmortamento(importo,anni,tan),[importo,anni,tan]);
  const pianoVisible=showFullPiano?piano:[...piano.slice(0,12),null,...piano.slice(-6)];
  const varDiff=resultVar.totale-result.totale;
  const varBetter=varDiff<0;

  const handlePDF=useCallback(()=>{
    exportPDF({importo,anni,tan,result,resultVar,deltaAumento,anniIniziali,confronto,piano,spese});
  },[importo,anni,tan,result,resultVar,deltaAumento,anniIniziali,confronto,piano,spese]);

  const Btn=({children,onClick,variant="ghost"})=>(
    <button onClick={onClick} style={{background:variant==="primary"?C.accent:"transparent",
      border:`1px solid ${variant==="primary"?C.accent:C.border}`,
      color:variant==="primary"?"#fff":C.muted,fontFamily:C.mono,fontSize:"0.68rem",letterSpacing:"0.1em",
      padding:"8px 18px",cursor:"pointer",borderRadius:5,transition:"all 0.18s",textTransform:"uppercase"}}>
      {children}
    </button>
  );

  return(
    <div style={{fontFamily:C.font,minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=range]{-webkit-appearance:none;appearance:none;height:2px;outline:none;cursor:pointer;border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${C.accent};cursor:pointer;box-shadow:0 0 0 3px ${C.accentDim}}
        table{width:100%;border-collapse:collapse}
        th{text-align:right;padding:9px 12px;color:${C.muted};font-family:${C.mono};font-weight:400;font-size:0.67rem;letter-spacing:0.08em;border-bottom:1px solid ${C.border};white-space:nowrap}
        th:first-child{text-align:left}
        td{text-align:right;padding:8px 12px;border-bottom:1px solid ${C.borderLight};color:#8ba3bb;font-family:${C.mono};font-size:0.73rem;white-space:nowrap}
        td:first-child{text-align:left;color:${C.muted}}
        tr:hover td{background:#131f2e}
        .hl-row td{color:${C.accent}!important;background:${C.accentDim}}
        .scroll-x{overflow-x:auto}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
      `}</style>

      <div style={{maxWidth:960,margin:"0 auto",padding:"36px 18px"}}>

        {/* ── HEADER ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
          marginBottom:32,paddingBottom:24,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,
              background:"#0ea5e910",border:"1px solid #0ea5e930",borderRadius:4,padding:"3px 10px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/>
              <span style={{fontFamily:C.mono,fontSize:"0.6rem",letterSpacing:"0.15em",color:C.accent,textTransform:"uppercase"}}>
                Strumento di Analisi
              </span>
            </div>
            <h1 style={{fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:700,letterSpacing:"-0.025em",color:C.text,lineHeight:1.15}}>
              Calcolatore<br/>
              <span style={{color:C.accent}}>Mutuo Ipotecario</span>
            </h1>
            <p style={{fontFamily:C.mono,fontSize:"0.68rem",color:C.muted,marginTop:8,letterSpacing:"0.04em"}}>
              Rata · Costo totale · Spese accessorie · Fisso vs Variabile
            </p>
          </div>
          <button onClick={handlePDF}
            style={{display:"flex",alignItems:"center",gap:8,background:C.accent,border:"none",
              color:"#fff",fontFamily:C.mono,fontSize:"0.68rem",letterSpacing:"0.1em",
              padding:"10px 20px",cursor:"pointer",borderRadius:6,fontWeight:500,textTransform:"uppercase",
              boxShadow:"0 0 20px #0ea5e930",transition:"all 0.2s"}}>
            ↓ Esporta PDF
          </button>
        </div>

        <AdSlot id="top-leaderboard" size="leaderboard"/>

        {/* ── INPUTS ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10,marginBottom:10}}>
          <NumInput label="Importo finanziato" value={importo} onChange={setImporto}
            min={10000} max={1000000} step={5000} unit="€"/>
          <NumInput label="Tasso Annuo Nominale (TAN)" value={tan} onChange={setTan}
            min={0.5} max={10} step={0.05} unit="%" presets={PRESET_TAN}/>
          <Card>
            <Label>Durata</Label>
            <p style={{fontFamily:C.mono,fontSize:"2rem",fontWeight:600,color:C.accent,lineHeight:1,marginBottom:12}}>
              {anni}<span style={{fontSize:"1rem",color:C.muted,fontWeight:400}}> anni</span>
            </p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {DURATE.map(d=><Pill key={d} active={anni===d} onClick={()=>setAnni(d)}>{d}a</Pill>)}
            </div>
          </Card>
        </div>

        {/* Spese */}
        <details style={{marginBottom:24}}>
          <summary style={{cursor:"pointer",fontFamily:C.mono,fontSize:"0.67rem",letterSpacing:"0.1em",
            color:C.muted,textTransform:"uppercase",padding:"10px 0",borderBottom:`1px solid ${C.border}`,
            listStyle:"none",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:C.accent}}>▸</span> Spese accessorie &amp; assicurazione
          </summary>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:8,marginTop:10}}>
            {[[speseIstruttoria,setSpeseIstruttoria,"Istruttoria"],
              [spesePeritia,setSpesePeritia,"Perizia"],
              [assicurazioneAnnua,setAssicurazioneAnnua,"Assicurazione / anno"]
            ].map(([v,s,l])=>(
              <Card key={l} style={{padding:18}}>
                <Label>{l}</Label>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                  <input type="number" value={v} onChange={e=>s(Number(e.target.value))} step={50} min={0}
                    style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,
                      color:C.text,fontFamily:C.mono,fontSize:"1rem",width:"100%",padding:"3px 0",outline:"none"}}
                    onFocus={e=>e.target.style.borderBottomColor=C.accent}
                    onBlur={e=>e.target.style.borderBottomColor=C.border}/>
                  <span style={{fontFamily:C.mono,fontSize:"0.72rem",color:C.muted}}>€</span>
                </div>
              </Card>
            ))}
          </div>
        </details>

        {/* ── TABS ── */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:24,gap:0,overflowX:"auto"}}>
          {TABS.map(([k,v])=>(
            <button key={k} onClick={()=>setActiveTab(k)}
              style={{background:"none",border:"none",borderBottom:`2px solid ${activeTab===k?C.accent:"transparent"}`,
                marginBottom:"-1px",cursor:"pointer",padding:"10px 20px",
                fontFamily:C.font,fontSize:"0.88rem",fontWeight:activeTab===k?600:400,
                color:activeTab===k?C.accent:C.muted,whiteSpace:"nowrap",transition:"all 0.18s"}}>
              {v}
            </button>
          ))}
        </div>

        {/* ════ TAB 1 — CALCOLO ════ */}
        {activeTab==="singolo"&&(
          <div>
            <Card accent style={{marginBottom:10}}>
              <Label>Rata Mensile</Label>
              <p style={{fontFamily:C.mono,fontSize:"3rem",fontWeight:700,color:C.accent,lineHeight:1,letterSpacing:"-0.02em"}}>
                {fmtD(result.rata)}
              </p>
              <p style={{fontFamily:C.mono,fontSize:"0.68rem",color:C.muted,marginTop:10}}>
                {anni*12} rate &nbsp;·&nbsp; TAN {fmtP(tan)} &nbsp;·&nbsp; TAEG stimato ≈ {fmtP(result.taeg)}
              </p>
            </Card>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:10}}>
              <StatBlock label="Capitale restituito" value={fmt(importo)} color={C.text}/>
              <StatBlock label="Interessi totali" value={fmt(result.interessi)} color={C.amber}/>
              <StatBlock label="Spese accessorie" value={fmt(result.spese)} color={C.muted}/>
              <StatBlock label="Totale complessivo" value={fmt(result.totale)} color={C.accent}/>
            </div>

            <Card>
              <Label>Composizione costo totale</Label>
              <div style={{height:8,borderRadius:4,overflow:"hidden",display:"flex",gap:2,marginTop:10,marginBottom:12}}>
                {[[importo,C.accent],[result.interessi,C.amber],[result.spese,"#334155"]].map(([v,c],i)=>(
                  <div key={i} style={{flex:v,background:c,transition:"flex 0.4s"}}/>
                ))}
              </div>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {[["Capitale",importo,C.accent],["Interessi",result.interessi,C.amber],["Spese",result.spese,"#64748b"]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:7,height:7,background:c,borderRadius:"50%"}}/>
                    <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.muted}}>{l}</span>
                    <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.text,fontWeight:500}}>{Math.round(v/result.totale*100)}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <AdSlot id="calcolo-rect" size="rect"/>
          </div>
        )}

        {/* ════ TAB 2 — CONFRONTO DURATE ════ */}
        {activeTab==="confronto"&&(
          <div>
            <p style={{fontFamily:C.mono,fontSize:"0.67rem",color:C.muted,marginBottom:14}}>
              TAN {fmtP(tan)} · {fmt(importo)} — clicca una riga per selezionare la durata
            </p>
            <Card style={{padding:0,overflow:"hidden"}} className="scroll-x">
              <div className="scroll-x">
                <table>
                  <thead><tr>
                    <th style={{textAlign:"left",paddingLeft:20}}>Durata</th>
                    <th>Rata</th><th>Interessi tot.</th><th>Spese</th><th>Totale</th><th style={{paddingRight:20}}>TAEG</th>
                  </tr></thead>
                  <tbody>{confronto.map(r=>(
                    <tr key={r.anni} className={r.anni===anni?"hl-row":""} onClick={()=>setAnni(r.anni)} style={{cursor:"pointer"}}>
                      <td style={{paddingLeft:20,fontWeight:r.anni===anni?600:400}}>{r.anni} anni</td>
                      <td>{fmtD(r.rata)}</td><td>{fmt(r.interessi)}</td><td>{fmt(r.spese)}</td><td>{fmt(r.totale)}</td>
                      <td style={{paddingRight:20}}>{fmtP(r.taeg)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
            <Card style={{marginTop:10}}>
              <Label>Rata mensile per durata</Label>
              <div style={{marginTop:12}}>
                {confronto.map(r=>{
                  const maxR=confronto[0].rata;
                  return(
                    <div key={r.anni} onClick={()=>setAnni(r.anni)} style={{cursor:"pointer",marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:C.mono,fontSize:"0.67rem",color:r.anni===anni?C.accent:C.muted}}>{r.anni} anni</span>
                        <span style={{fontFamily:C.mono,fontSize:"0.67rem",color:r.anni===anni?C.accent:C.text,fontWeight:r.anni===anni?600:400}}>{fmtD(r.rata)}</span>
                      </div>
                      <div style={{height:4,background:C.border,borderRadius:2}}>
                        <div style={{height:"100%",width:`${r.rata/maxR*100}%`,background:r.anni===anni?C.accent:C.borderLight,borderRadius:2,transition:"width 0.35s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <AdSlot id="confronto-leader" size="leaderboard"/>
          </div>
        )}

        {/* ════ TAB 3 — FISSO VS VARIABILE ════ */}
        {activeTab==="fissovariabile"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:16}}>
              <NumInput label="Aumento tasso in fase 2" value={deltaAumento} onChange={setDeltaAumento}
                min={0.1} max={5} step={0.1} unit="%" presets={[0.5,1.0,1.5,2.0,3.0]}/>
              <NumInput label="Anni a tasso iniziale" value={anniIniziali} onChange={setAnniIniziali}
                min={1} max={anni-1} step={1} unit="anni" presets={[2,3,5,7,10]}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <Card style={{borderColor:"#22c55e33"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#22c55e10",
                  border:"1px solid #22c55e30",borderRadius:3,padding:"2px 8px",marginBottom:10}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:C.green}}/>
                  <span style={{fontFamily:C.mono,fontSize:"0.58rem",color:C.green,letterSpacing:"0.1em"}}>TASSO FISSO</span>
                </div>
                <p style={{fontFamily:C.mono,fontSize:"2rem",fontWeight:700,color:C.text,letterSpacing:"-0.02em"}}>{fmtD(result.rata)}</p>
                <p style={{fontFamily:C.mono,fontSize:"0.62rem",color:C.muted,marginTop:4}}>rata costante · {anni*12} mesi</p>
                <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:5}}>
                  {[["Totale",fmt(result.totale)],["Interessi",fmt(result.interessi)],["TAEG",fmtP(result.taeg)]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.muted}}>{l}</span>
                      <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.text,fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{borderColor:varBetter?"#22c55e33":"#ef444433"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:varBetter?"#22c55e10":"#ef444410",
                  border:`1px solid ${varBetter?"#22c55e30":"#ef444430"}`,borderRadius:3,padding:"2px 8px",marginBottom:10}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:varBetter?C.green:C.red}}/>
                  <span style={{fontFamily:C.mono,fontSize:"0.58rem",color:varBetter?C.green:C.red,letterSpacing:"0.1em"}}>TASSO VARIABILE</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div>
                    <p style={{fontFamily:C.mono,fontSize:"0.58rem",color:C.muted}}>Fase 1 · {anniIniziali}a · {fmtP(tan)}</p>
                    <p style={{fontFamily:C.mono,fontSize:"1.3rem",fontWeight:600,color:C.text}}>{fmtD(resultVar.rata1)}</p>
                  </div>
                  <div>
                    <p style={{fontFamily:C.mono,fontSize:"0.58rem",color:C.muted}}>Fase 2 · {anni-anniIniziali}a · {fmtP(tan+deltaAumento)}</p>
                    <p style={{fontFamily:C.mono,fontSize:"1.3rem",fontWeight:600,color:C.red}}>{fmtD(resultVar.rata2)}</p>
                  </div>
                </div>
                <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>
                  {[["Totale",fmt(resultVar.totale)],["Interessi",fmt(resultVar.interessi)],["TAEG",fmtP(resultVar.taeg)]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.muted}}>{l}</span>
                      <span style={{fontFamily:C.mono,fontSize:"0.65rem",color:C.text,fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card accent={!varBetter}>
              <Label>Differenza complessiva</Label>
              <p style={{fontFamily:C.mono,fontSize:"1.8rem",fontWeight:700,color:varBetter?C.green:C.red,
                letterSpacing:"-0.02em",marginTop:6}}>
                {varBetter?"−":"+"} {fmt(Math.abs(varDiff))}
              </p>
              <p style={{fontFamily:C.mono,fontSize:"0.7rem",color:C.muted,marginTop:6}}>
                {varBetter
                  ?`Con questo scenario il variabile è più conveniente di ${fmt(Math.abs(varDiff))}`
                  :`Con questo scenario il variabile costa ${fmt(Math.abs(varDiff))} in più del fisso`}
              </p>
              <p style={{fontFamily:C.mono,fontSize:"0.6rem",color:C.border,marginTop:8}}>
                * Simulazione con singola variazione. I tassi variabili reali oscillano nel tempo.
              </p>
            </Card>
            <AdSlot id="fv-rect" size="rect"/>
          </div>
        )}

        {/* ════ TAB 4 — AMMORTAMENTO ════ */}
        {activeTab==="piano"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontFamily:C.mono,fontSize:"0.67rem",color:C.muted}}>
                Metodo francese · {anni*12} rate totali
              </p>
              <button onClick={()=>setShowFullPiano(!showFullPiano)}
                style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontFamily:C.mono,
                  fontSize:"0.65rem",padding:"6px 14px",cursor:"pointer",borderRadius:5,letterSpacing:"0.08em"}}>
                {showFullPiano?`Comprimi`:`Mostra tutte ${anni*12} rate`}
              </button>
            </div>
            <Card style={{padding:0,overflow:"hidden"}}>
              <div className="scroll-x">
                <table>
                  <thead><tr>
                    <th style={{textAlign:"left",paddingLeft:20}}>Rata n°</th>
                    <th>Quota capitale</th><th>Quota interessi</th><th>Rata</th>
                    <th style={{paddingRight:20}}>Debito residuo</th>
                  </tr></thead>
                  <tbody>
                    {pianoVisible.map((r,idx)=>
                      r===null?(
                        <tr key="gap"><td colSpan={5} style={{textAlign:"center",padding:"16px",color:C.border,letterSpacing:"0.3em"}}>· · ·</td></tr>
                      ):(
                        <tr key={r.i}>
                          <td style={{paddingLeft:20}}>{r.i}</td>
                          <td>{fmtD(r.qc)}</td><td>{fmtD(r.qi)}</td><td>{fmtD(r.rata)}</td>
                          <td style={{paddingRight:20}}>{fmtD(r.saldo)}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card style={{marginTop:10}}>
              <Label>Evoluzione debito residuo</Label>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:56,marginTop:12}}>
                {Array.from({length:anni},(_,i)=>{
                  const row=piano[Math.min((i+1)*12-1,piano.length-1)];
                  const h=row?(row.saldo/importo)*100:0;
                  return(
                    <div key={i} title={`Anno ${i+1}: ${fmt(row?.saldo||0)}`}
                      style={{flex:1,height:`${h}%`,background:`color-mix(in srgb, ${C.accent} ${h}%, ${C.green} ${100-h}%)`,
                        borderRadius:"2px 2px 0 0",opacity:0.7,transition:"height 0.4s",cursor:"default"}}/>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontFamily:C.mono,fontSize:"0.6rem",color:C.border}}>Anno 1</span>
                <span style={{fontFamily:C.mono,fontSize:"0.6rem",color:C.border}}>Anno {anni}</span>
              </div>
            </Card>
            <AdSlot id="piano-leader" size="leaderboard"/>
          </div>
        )}

        {/* FOOTER */}
        <p style={{marginTop:36,fontFamily:C.mono,fontSize:"0.58rem",color:C.border,
          borderTop:`1px solid ${C.borderLight}`,paddingTop:18,lineHeight:1.9,letterSpacing:"0.04em"}}>
          NOTA LEGALE — Strumento a scopo puramente informativo. Calcoli basati sul metodo di ammortamento 
          alla francese. Il TAEG è una stima indicativa. Non costituisce consulenza finanziaria ai sensi 
          del D.Lgs. 58/1998 (TUF). Per un'offerta vincolante rivolgersi a un istituto di credito autorizzato.
        </p>
        <p style={{marginTop:12,fontFamily:C.mono,fontSize:"0.58rem",textAlign:"center"}}>
  Altri strumenti gratuiti:{" "}
  <a href="https://calcolatore-forfettario-eight.vercel.app" target="_blank" rel="noopener" style={{color:"inherit",textDecoration:"underline",margin:"0 6px"}}>Calcolatore Regime Forfettario</a>
  <a href="https://margine-negozio.vercel.app" target="_blank" rel="noopener" style={{color:"inherit",textDecoration:"underline",margin:"0 6px"}}>Calcolatore Margini Negozio</a>
  <a href="https://costo-dipendente.vercel.app" target="_blank" rel="noopener" style={{color:"inherit",textDecoration:"underline",margin:"0 6px"}}>Calcolatore Costo Dipendente</a>
</p>
      </div>
    </div>
  );
}