(() => {
  "use strict";
  const STATS = { COMBAT:"전투성", INT:"분석력", LEAD:"통솔력", FAITH:"신성력", AMBITION:"야망", SURVIVE:"생존력", MADNESS:"광기", EMPATHY:"공감력" };
  const state = { profile:{}, answers:Array(HMA_QUESTIONS.length).fill(null), current:0, result:null, isTransitioning:false, isLoading:false, transitionTimer:null, loadingTimer:null };
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
    state.profile = { name, gender, age }; state.answers.fill(null); state.current = 0; state.isTransitioning = false; state.isLoading = false; renderQuestion(); show("question-screen");
  });

  function renderQuestion() {
    const q = HMA_QUESTIONS[state.current]; $("question-screen").style.setProperty("--screen-bg", `url('${q.background}')`);
    $("question-count").textContent = `${String(q.id).padStart(2,"0")} / ${HMA_QUESTIONS.length}`; $("progress-bar").style.width = `${q.id / HMA_QUESTIONS.length * 100}%`;
    $("question-title").textContent = q.title; $("question-text").textContent = q.text; $("prev-btn").hidden = state.current === 0;
    $("choices").replaceChildren(...q.choices.map((c,i) => { const b=document.createElement("button"); b.type="button"; b.className=`choice ${state.answers[state.current]===i?"selected":""}`; b.innerHTML=`<strong>${c.label}</strong><span>${c.text}</span>`; b.addEventListener("click",()=>choose(i)); return b; }));
  }
  function choose(i) {
    if(state.isTransitioning || state.isLoading)return;
    const questionIndex=state.current; const question=HMA_QUESTIONS[questionIndex];
    if(!question?.choices[i])return;
    state.isTransitioning=true; state.answers[questionIndex]=i;
    document.querySelectorAll(".choice").forEach((button,index)=>{button.classList.toggle("selected",index===i);button.disabled=true;});
    clearTimeout(state.transitionTimer);
    state.transitionTimer=setTimeout(()=>{
      state.isTransitioning=false;
      if(questionIndex < HMA_QUESTIONS.length-1){state.current=questionIndex+1;renderQuestion();window.scrollTo({top:0,behavior:"smooth"});}else startLoading();
    },180);
  }
  $("prev-btn").addEventListener("click",()=>{ if(state.isLoading)return; clearTimeout(state.transitionTimer); state.isTransitioning=false; if(state.current>0){state.current--;renderQuestion();} });

  function firstIncompleteAnswer() {
    return HMA_QUESTIONS.findIndex((question,index)=>!Number.isInteger(state.answers[index]) || !question.choices[state.answers[index]]);
  }
  function resumeIncompleteQuestion(index) {
    state.isLoading=false; state.isTransitioning=false; state.current=index; renderQuestion(); show("question-screen");
  }
  function calculate() {
    const incomplete=firstIncompleteAnswer();
    if(incomplete!==-1){resumeIncompleteQuestion(incomplete);return null;}
    const stats=Object.fromEntries(Object.keys(STATS).map(k=>[k,0])); HMA_QUESTIONS.forEach((q,i)=>Object.entries(q.choices[state.answers[i]].scores).forEach(([k,v])=>stats[k]+=v));
    const total=Object.values(stats).reduce((a,b)=>a+b,0); const sorted=Object.keys(stats).sort((a,b)=>stats[b]-stats[a] || Object.keys(STATS).indexOf(a)-Object.keys(STATS).indexOf(b));
    // Rank measures value consistency, not the raw sum. Balanced, ordinary profiles stay near the lower ranks; repeated commitment to the same values raises the score.
    const mean=total/Object.keys(stats).length; const spread=Math.sqrt(Object.values(stats).reduce((sum,value)=>sum+(value-mean)**2,0)/Object.keys(stats).length);
    const dominance=Math.max(0,stats[sorted[0]]-mean)+Math.max(0,stats[sorted[1]]-mean)*.6;
    const concentration=(stats[sorted[0]]+stats[sorted[1]])/total;
    const consistencyScore=Math.min(40,Math.round(spread*1.25+dominance*.55+concentration*18));
    const hidden=HMA_HIDDEN_RESULTS.find(h=>h.test(stats,consistencyScore)); const rank=hidden?"EX급":HMA_RANKS.find(r=>consistencyScore>=r.min).name; const abilityKey=[sorted[0],sorted[1]].sort((a,b)=>Object.keys(STATS).indexOf(a)-Object.keys(STATS).indexOf(b)).join("+");
    const ability=buildAbility(stats,rank,abilityKey,hidden); const dept=hidden?{name:hidden.department}:HMA_DEPARTMENTS[sorted[0]];
    const position=hidden?hidden.position:getPosition(stats,consistencyScore); const risk=hidden?hidden.risk:getRisk(rank,stats); const note=hidden?hidden.note:getNote(sorted[0],rank,dept.name,consistencyScore);
    return {stats,total,consistencyScore,sorted,hidden,rank,ability,dept,position,risk,note,registration:`KR-HMA-2026-${String(Math.floor(Math.random()*1000000)).padStart(6,"0")}`};
  }

  // The complete stat distribution is the seed: identical distributions always receive the same trait.
  function distributionHash(stats,rank) {
    return `${Object.keys(STATS).map(key=>`${key}:${stats[key]}`).join("|")}|${rank}`.split("").reduce((hash,char)=>((hash*31)+char.charCodeAt(0))>>>0,2166136261);
  }
  function buildAbility(stats,rank,abilityKey,hidden) {
    const tier=HMA_ABILITY_TIERS[rank];
    if(hidden)return {name:hidden.name,description:`${hidden.note} ${tier.effect}`,scope:HMA_HIDDEN_ABILITY_SCOPES[hidden.name]||tier.scope,tier:tier.title};
    const pool=HMA_ABILITIES[abilityKey]; const base=pool[distributionHash(stats,rank)%pool.length];
    return {name:`${tier.prefix}: ${base.name}`,description:`${base.description} ${tier.effect}`,scope:tier.scope,tier:tier.title};
  }

  function getPosition(s,total){if(s.MADNESS>=13)return"격리 대상";if(total>=36&&s.AMBITION>=10)return"소장";if(total>=32&&s.LEAD>=10)return"국장";if(s.LEAD>=9)return"팀장";if(total>=28)return"선임 요원";if(total>=23)return"정규 헌터";if(total>=18)return"계약직 헌터";if(s.SURVIVE>=10)return"임시 파견직";return"말단 직원"}
  function getRisk(rank,s){if(s.MADNESS>=12)return"극도 위험 / 상시 감시";return ({"EX급":"국가 재난급","S급":"최상위 위험","A급":"고위험","B급":"주의 필요","C급":"보통","D급":"낮음","E급":"관찰 단계","F급":"미미함"})[rank]}
  function getNote(top,rank,dept,consistencyScore){const tones={COMBAT:"대상자는 전투 적성이 극단적으로 높아 단독 게이트 진입 허가 검토 대상입니다.",INT:"대상자는 비정상적으로 정밀한 마력 해석 능력을 보유하고 있습니다.",LEAD:"대상자의 지시 아래 생환율이 유의미하게 상승하는 것으로 예측됩니다.",FAITH:"대상자의 파장은 오염 마력에 강한 정화 반응을 일으킵니다.",AMBITION:"대상자는 높은 성장 가능성과 함께 명령 불복종 가능성을 보입니다.",SURVIVE:"대상자는 극한 재난 환경에서도 높은 생환 확률을 유지합니다.",MADNESS:"대상자의 정신 파장은 현행 분류 체계로 온전히 설명할 수 없습니다.",EMPATHY:"대상자는 주변 각성자의 정신 안정과 구조 효율을 크게 향상시킵니다."};return `${tones[top]} 가치관 일관도 ${consistencyScore}/40이 관측되어 ${rank} 권한으로 ${dept} 배치를 권고합니다. 등급은 선악이 아니라 반복된 선택에서 확인된 마력 파장의 선명도를 의미합니다.`}
  function classification(age){return age<20?"미등록 예비 각성자":age<30?"신규 등록 각성자":age<45?"정규 등록 각성자":"특별 관리 각성자"}

  function startLoading() {
    if(state.isLoading)return;
    const incomplete=firstIncompleteAnswer();
    if(incomplete!==-1){resumeIncompleteQuestion(incomplete);return;}
    state.isLoading=true; show("loading-screen");
    const lines=["관리국 보안 채널 접속 중...","각성자 등록 기록 대조 중...","마력 파장 분석 중...","위험도 등급 산출 중...","조회 결과 출력"];
    $("loading-list").innerHTML=lines.map(text=>`<li>${text}</li>`).join(""); let index=0;
    clearInterval(state.loadingTimer);
    state.loadingTimer=setInterval(()=>{
      const item=$("loading-list").children[index]; if(!item){clearInterval(state.loadingTimer);state.isLoading=false;return;}
      item.classList.add("done"); index++;
      if(index===lines.length){clearInterval(state.loadingTimer);state.result=calculate();if(state.result)setTimeout(renderResult,450);}
    },430);
  }

  function renderResult(){state.isLoading=false;const r=state.result,p=state.profile;show("result-screen");$("rank-emblem").dataset.rank=r.rank.replace("급","");$("rank-mark").textContent=r.rank.replace("급","");$("result-heading").textContent=r.ability.name;$("ability-description").textContent=r.ability.description;$("special-alert").hidden=!r.hidden;$("special-alert").textContent=r.hidden?"⚠ EX-CLASS HIDDEN PROFILE DETECTED":"";
    const fields=[["조회 대상",p.name],["성별",p.gender],["나이",`${p.age}세`],["등록번호",r.registration],["분류명",classification(p.age)],["성향 일관도",`${r.consistencyScore} / 40`],["능력 등급",r.rank],["초능력",r.ability.name],["특성 위계",r.ability.tier],["효과 범위",r.ability.scope],["배치 부서",r.dept.name],["직급",r.position],["위험도",r.risk]];$("result-fields").innerHTML=fields.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");$("result-note").textContent=r.note;const max=Math.max(...Object.values(r.stats));$("stat-chart").innerHTML=Object.entries(r.stats).map(([k,v])=>`<div class="stat-row"><span>${STATS[k]}</span><div class="stat-bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("");}
  $("copy-btn").addEventListener("click",async()=>{const r=state.result;const text=`[헌터관리국 각성자 조회 결과]\n조회 대상: ${state.profile.name}\n등급: ${r.rank}\n능력: ${r.ability.name}\n효과 범위: ${r.ability.scope}\n배치 부서: ${r.dept.name}\n직급: ${r.position}\n위험도: ${r.risk}\n\n나도 각성자 조회하기: ${location.href}`;try{await navigator.clipboard.writeText(text);$("copy-status").textContent="조회 결과가 클립보드에 복사되었습니다."}catch{const t=document.createElement("textarea");t.value=text;document.body.append(t);t.select();document.execCommand("copy");t.remove();$("copy-status").textContent="조회 결과가 복사되었습니다."}});
  $("restart-btn").addEventListener("click",()=>{clearTimeout(state.transitionTimer);clearInterval(state.loadingTimer);state.answers.fill(null);state.result=null;state.current=0;state.isTransitioning=false;state.isLoading=false;$("profile-form").reset();$("copy-status").textContent="";show("start-screen")});
})();
