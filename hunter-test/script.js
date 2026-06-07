(() => {
  "use strict";
  const STATS = { COMBAT:"전투성", INT:"분석력", LEAD:"통솔력", FAITH:"신성력", AMBITION:"야망", SURVIVE:"생존력", MADNESS:"광기", EMPATHY:"공감력" };
  const state = { profile:{}, answers:Array(HMA_QUESTIONS.length).fill(null), current:0, result:null };
  const $ = id => document.getElementById(id);

  // Mobile visitors receive a portrait 9:16 terminal; desktop visitors receive the wide command console.
  const mobileUserAgent = navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  function setDeviceMode() {
    const compactViewport = window.matchMedia("(max-width: 767px)").matches;
    const touchFirstDevice = window.matchMedia("(pointer: coarse) and (hover: none)").matches;
    document.body.dataset.device = mobileUserAgent || touchFirstDevice || compactViewport ? "mobile" : "desktop";
  }
  setDeviceMode();
  window.addEventListener("resize", setDeviceMode);
  const screens = [...document.querySelectorAll(".screen")];
  const show = id => { screens.forEach(s => s.classList.toggle("active", s.id === id)); window.scrollTo(0,0); };

  $("profile-form").addEventListener("submit", e => {
    e.preventDefault(); const name = $("name").value.trim(); const gender = document.querySelector('input[name="gender"]:checked')?.value; const age = Number($("age").value);
    const error = !name ? "조회 대상 이름을 입력하십시오." : !gender ? "성별 정보를 선택하십시오." : (!age || age < 1) ? "유효한 나이를 입력하십시오." : "";
    $("form-error").textContent = error; if (error) return;
    state.profile = { name, gender, age }; state.current = 0; renderQuestion(); show("question-screen");
  });

  function renderQuestion() {
    const q = HMA_QUESTIONS[state.current]; $("question-screen").style.setProperty("--screen-bg", `url('${q.background}')`);
    $("question-count").textContent = `${String(q.id).padStart(2,"0")} / ${HMA_QUESTIONS.length}`; $("progress-bar").style.width = `${q.id / HMA_QUESTIONS.length * 100}%`;
    $("question-title").textContent = q.title; $("question-text").textContent = q.text; $("prev-btn").hidden = state.current === 0;
    $("choices").replaceChildren(...q.choices.map((c,i) => { const b=document.createElement("button"); b.type="button"; b.className=`choice ${state.answers[state.current]===i?"selected":""}`; b.innerHTML=`<strong>${c.label}</strong><span>${c.text}</span>`; b.addEventListener("click",()=>choose(i)); return b; }));
  }
  function choose(i) { state.answers[state.current]=i; document.querySelectorAll(".choice").forEach((x,n)=>x.classList.toggle("selected",n===i)); setTimeout(()=>{ if(state.current < HMA_QUESTIONS.length-1){state.current++;renderQuestion();window.scrollTo({top:0,behavior:"smooth"});}else startLoading(); },180); }
  $("prev-btn").addEventListener("click",()=>{ if(state.current>0){state.current--;renderQuestion();} });

  function calculate() {
    const stats=Object.fromEntries(Object.keys(STATS).map(k=>[k,0])); HMA_QUESTIONS.forEach((q,i)=>Object.entries(q.choices[state.answers[i]].scores).forEach(([k,v])=>stats[k]+=v));
    const total=Object.values(stats).reduce((a,b)=>a+b,0); const sorted=Object.keys(stats).sort((a,b)=>stats[b]-stats[a] || Object.keys(STATS).indexOf(a)-Object.keys(STATS).indexOf(b));
    const hidden=HMA_HIDDEN_RESULTS.find(h=>h.test(stats)); const rank=hidden?"EX급":HMA_RANKS.find(r=>total>=r.min).name; const abilityKey=[sorted[0],sorted[1]].sort((a,b)=>Object.keys(STATS).indexOf(a)-Object.keys(STATS).indexOf(b)).join("+");
    const pool=HMA_ABILITIES[abilityKey]; const ability=hidden?{name:hidden.name,description:hidden.note,icon:"assets/icons/ability_placeholder.webp"}:pool[(total+stats[sorted[0]])%pool.length]; const dept=hidden?{name:hidden.department,icon:"assets/icons/dept_placeholder.webp"}:HMA_DEPARTMENTS[sorted[0]];
    const position=hidden?hidden.position:getPosition(stats,total); const risk=hidden?hidden.risk:getRisk(rank,stats); const note=hidden?hidden.note:getNote(sorted[0],rank,dept.name);
    return {stats,total,sorted,hidden,rank,ability,dept,position,risk,note,registration:`KR-HMA-2026-${String(Math.floor(Math.random()*1000000)).padStart(6,"0")}`};
  }
  function getPosition(s,total){if(s.MADNESS>=13)return"격리 대상";if(total>=36&&s.AMBITION>=10)return"소장";if(total>=32&&s.LEAD>=10)return"국장";if(s.LEAD>=9)return"팀장";if(total>=28)return"선임 요원";if(total>=23)return"정규 헌터";if(total>=18)return"계약직 헌터";if(s.SURVIVE>=10)return"임시 파견직";return"말단 직원"}
  function getRisk(rank,s){if(s.MADNESS>=12)return"극도 위험 / 상시 감시";return ({"EX급":"국가 재난급","S급":"최상위 위험","A급":"고위험","B급":"주의 필요","C급":"보통","D급":"낮음","E급":"관찰 단계","F급":"미미함"})[rank]}
  function getNote(top,rank,dept){const tones={COMBAT:"대상자는 전투 적성이 극단적으로 높아 단독 게이트 진입 허가 검토 대상입니다.",INT:"대상자는 비정상적으로 정밀한 마력 해석 능력을 보유하고 있습니다.",LEAD:"대상자의 지시 아래 생환율이 유의미하게 상승하는 것으로 예측됩니다.",FAITH:"대상자의 파장은 오염 마력에 강한 정화 반응을 일으킵니다.",AMBITION:"대상자는 높은 성장 가능성과 함께 명령 불복종 가능성을 보입니다.",SURVIVE:"대상자는 극한 재난 환경에서도 높은 생환 확률을 유지합니다.",MADNESS:"대상자의 정신 파장은 현행 분류 체계로 온전히 설명할 수 없습니다.",EMPATHY:"대상자는 주변 각성자의 정신 안정과 구조 효율을 크게 향상시킵니다."};return `${tones[top]} ${rank} 권한으로 ${dept} 배치를 권고하나, 정기적인 마력 파장 재검사가 필요합니다.`}
  function classification(age){return age<20?"미등록 예비 각성자":age<30?"신규 등록 각성자":age<45?"정규 등록 각성자":"특별 관리 각성자"}

  function startLoading(){show("loading-screen");const lines=["관리국 보안 채널 접속 중...","각성자 등록 기록 대조 중...","마력 파장 분석 중...","위험도 등급 산출 중...","조회 결과 출력"];$("loading-list").innerHTML=lines.map(x=>`<li>${x}</li>`).join("");let i=0;const timer=setInterval(()=>{ $("loading-list").children[i].classList.add("done"); i++; if(i===lines.length){clearInterval(timer);state.result=calculate();setTimeout(renderResult,450)} },430)}
  function renderResult(){const r=state.result,p=state.profile;show("result-screen");$("rank-image").src=HMA_RANKS.find(x=>x.name===r.rank).icon;$("rank-mark").textContent=r.rank.replace("급","");$("result-heading").textContent=r.ability.name;$("ability-description").textContent=r.ability.description;$("special-alert").hidden=!r.hidden;$("special-alert").textContent=r.hidden?"⚠ EX-CLASS HIDDEN PROFILE DETECTED":"";
    const fields=[["조회 대상",p.name],["성별",p.gender],["나이",`${p.age}세`],["등록번호",r.registration],["분류명",classification(p.age)],["능력 등급",r.rank],["초능력",r.ability.name],["배치 부서",r.dept.name],["직급",r.position],["위험도",r.risk]];$("result-fields").innerHTML=fields.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");$("result-note").textContent=r.note;const max=Math.max(...Object.values(r.stats));$("stat-chart").innerHTML=Object.entries(r.stats).map(([k,v])=>`<div class="stat-row"><span>${STATS[k]}</span><div class="stat-bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("");}
  $("copy-btn").addEventListener("click",async()=>{const r=state.result;const text=`[헌터관리국 각성자 조회 결과]\n조회 대상: ${state.profile.name}\n등급: ${r.rank}\n능력: ${r.ability.name}\n배치 부서: ${r.dept.name}\n직급: ${r.position}\n위험도: ${r.risk}\n\n나도 각성자 조회하기: ${location.href}`;try{await navigator.clipboard.writeText(text);$("copy-status").textContent="조회 결과가 클립보드에 복사되었습니다."}catch{const t=document.createElement("textarea");t.value=text;document.body.append(t);t.select();document.execCommand("copy");t.remove();$("copy-status").textContent="조회 결과가 복사되었습니다."}});
  $("restart-btn").addEventListener("click",()=>{state.answers.fill(null);state.result=null;$("profile-form").reset();$("copy-status").textContent="";show("start-screen")});
})();
