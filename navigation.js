/**
 * navigation.js — Campus Indoor Directory System
 * Ground Floor: SVG architectural plan with wall lines & room highlighting.
 * Other Floors: CSS Grid layout.
 * No zoom / pan / drag.
 */
(function () {
    'use strict';

    /* ── FLOOR CONFIG ── */
    const FLOORS = [
        { key: 'basement', label: 'Basement' },
        { key: 'ground', label: 'Ground Floor' },
        { key: 'first', label: '1st Floor' },
        { key: 'second', label: '2nd Floor' },
        { key: 'third', label: '3rd Floor' },
    ];

    /* ── ROOM REGISTRY ── */
    const ROOMS = [
        // Basement
        { id: 'b-canteen', name: 'Canteen', floor: 'basement' },
        { id: 'b-lobby', name: 'Lobby', floor: 'basement' },
        { id: 'b-workshop', name: 'Workshop', floor: 'basement' },
        // Ground
        { id: 'g-104', name: 'Classroom 104', floor: 'ground' },
        { id: 'g-stair', name: 'Staircase', floor: 'ground' },
        { id: 'g-lobby', name: 'Lobby', floor: 'ground' },
        { id: 'g-workshop', name: 'Workshop', floor: 'ground' },
        { id: 'g-staff', name: 'Staff Room Arts', floor: 'ground' },
        { id: 'g-106', name: 'Classroom 106', floor: 'ground' },
        { id: 'g-courtyard', name: 'Courtyard', floor: 'ground' },
        { id: 'g-102', name: 'Classroom 102', floor: 'ground' },
        { id: 'g-toilet', name: 'Toilet', floor: 'ground' },
        { id: 'g-lobby2', name: 'Lobby (Right)', floor: 'ground' },
        { id: 'g-lobby3', name: 'Lobby', floor: 'ground' },
        { id: 'g-library', name: 'Library', floor: 'ground' },
        // First
        { id: 'f-204', name: 'Classroom 204', floor: 'first' },
        { id: 'f-t1', name: 'Toilet (Left)', floor: 'first' },
        { id: 'f-boys', name: 'Boys Room', floor: 'first' },
        { id: 'f-lobby', name: 'Lobby', floor: 'first' },
        { id: 'f-girls', name: 'Girls Room', floor: 'first' },
        { id: 'f-t2', name: 'Toilet (Right)', floor: 'first' },
        { id: 'f-cc3', name: 'Computer Center 3', floor: 'first' },
        { id: 'f-205', name: 'Staffroom 205', floor: 'first' },
        { id: 'f-206', name: 'Classroom 206', floor: 'first' },
        { id: 'f-cy', name: 'Courtyard', floor: 'first' },
        { id: 'f-lb2', name: 'Lobby (Right)', floor: 'first' },
        { id: 'f-cc1', name: 'Computer Center 1', floor: 'first' },
        { id: 'f-lb3', name: 'Lobby (Lower)', floor: 'first' },
        { id: 'f-cc2', name: 'Computer Center 2', floor: 'first' },
        { id: 'f-porch', name: 'Porch', floor: 'first' },
        // Second
        { id: 's-staff', name: 'Staff Room', floor: 'second' },
        { id: 's-hod', name: 'HOD Room', floor: 'second' },
        { id: 's-gt', name: 'Girls Toilet', floor: 'second' },
        { id: 's-bt', name: 'Boys Toilet', floor: 'second' },
        { id: 's-lobby', name: 'Lobby', floor: 'second' },
        { id: 's-sem', name: 'Seminar Hall', floor: 'second' },
        { id: 's-exam', name: 'Exam Cell', floor: 'second' },
        { id: 's-mgmt', name: 'Management Room', floor: 'second' },
        { id: 's-sec', name: 'Secretary Room', floor: 'second' },
        { id: 's-lb2', name: 'Lobby (Right)', floor: 'second' },
        { id: 's-board', name: 'Board Room', floor: 'second' },
        { id: 's-prin', name: 'Principal Room', floor: 'second' },
        { id: 's-wait', name: 'Waiting Area', floor: 'second' },
        { id: 's-toil', name: 'Toilet', floor: 'second' },
        { id: 's-place', name: 'Placement Cell', floor: 'second' },
        { id: 's-cent', name: 'Central Office', floor: 'second' },
        // Third
        { id: 't-404', name: 'Drawing Hall 404', floor: 'third' },
        { id: 't-lab', name: 'Laboratory', floor: 'third' },
        { id: 't-lobby', name: 'Lobby', floor: 'third' },
        { id: 't-405', name: 'Classroom 405', floor: 'third' },
        { id: 't-406', name: 'Classroom 406', floor: 'third' },
        { id: 't-401', name: 'Classroom 401', floor: 'third' },
        { id: 't-cy', name: 'Courtyard', floor: 'third' },
        { id: 't-lb2', name: 'Lobby (Right)', floor: 'third' },
        { id: 't-bpray', name: "Boy's Prayer Room", floor: 'third' },
        { id: 't-btoil', name: 'Boys Toilet', floor: 'third' },
        { id: 't-gpray', name: 'Girls Prayer Room', floor: 'third' },
        { id: 't-409', name: 'Classroom 409', floor: 'third' },
        { id: 't-gtoil', name: 'Girls Toilet', floor: 'third' },
        { id: 't-staff', name: 'StaffRoom', floor: 'third' },
    ];

    /* ── STATE ── */
    let activeFloor = 'ground';
    let activeEl = null;   // highlighted element (SVG <g> or div)
    let activeSuggIdx = -1;
    let searchInput, suggBox;

    /* ════════════════════════════════════
       CSS INJECTION
    ════════════════════════════════════ */
    function injectStyles() {
        if (document.getElementById('nd-styles')) return;
        const s = document.createElement('style');
        s.id = 'nd-styles';
        s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

#navigation-module {
    display:flex; flex-direction:column; height:100%; min-height:0;
    font-family:'Inter',Arial,sans-serif; background:#F5F7F7; color:#333333; overflow:hidden;
}
.nd-header {
    background:linear-gradient(135deg,#0F6D6D 0%,#0C5C5C 100%);
    padding:10px 20px; flex-shrink:0;
    display:flex; align-items:center; gap:12px;
    border-bottom:3px solid #2FA4A4;
}
.nd-header-icon { font-size:1.5rem; flex-shrink:0; }
.nd-header-text { display:flex; flex-direction:column; gap:1px; }
.nd-header-text h1 {
    margin:0; font-size:1rem; font-weight:700; color:#fff;
    letter-spacing:.3px; line-height:1.2;
}
.nd-header-text h2 {
    margin:0; font-size:.7rem; font-weight:500;
    color:rgba(255,255,255,0.72); letter-spacing:.5px;
    text-transform:uppercase; line-height:1.2;
}
.nd-search-wrap {
    padding:10px 20px; background:#fff;
    border-bottom:1px solid #E4E7EB; flex-shrink:0;
    position:relative; z-index:200;
}
.nd-search-row {
    display:flex; align-items:center; background:#F5F7F7;
    border:1.5px solid #E4E7EB; border-radius:10px;
    padding:0 6px 0 14px; gap:8px; max-width:620px;
    transition:border-color .2s,box-shadow .2s;
}
.nd-search-row:focus-within { border-color:#0F6D6D; box-shadow:0 0 0 3px rgba(15,109,109,.12); background:#fff; }
.nd-search-icon { font-size:.95rem; color:#6B7280; }
#nd-search-input {
    flex:1; background:transparent; border:none; outline:none;
    color:#333333; font-family:inherit; font-size:.875rem; padding:10px 0;
}
#nd-search-input::placeholder { color:#6B7280; }
.nd-search-btn {
    background:#0F6D6D; color:#fff; border:none; border-radius:7px;
    padding:6px 14px; font-size:.78rem; font-weight:600;
    cursor:pointer; font-family:inherit; transition:background .18s;
}
.nd-search-btn:hover { background:#0C5C5C; }
.nd-reset-btn {
    background:#F5F7F7; color:#6B7280; border:1.5px solid #E4E7EB;
    border-radius:7px; padding:6px 12px; font-size:.78rem; font-weight:600;
    cursor:pointer; font-family:inherit; margin-left:4px;
}
.nd-reset-btn:hover { background:#E4E7EB; }
/* suggestions */
.nd-sugg { display:none; position:absolute; top:calc(100% - 2px); left:20px; right:20px;
    max-width:622px; background:#fff; border:1.5px solid #0F6D6D; border-top:none;
    border-radius:0 0 10px 10px; margin:0; padding:4px 0; list-style:none;
    max-height:240px; overflow-y:auto; box-shadow:0 12px 32px rgba(15,109,109,.12); z-index:300; }
.nd-sugg.open { display:block; }
.nd-sugg li { display:flex; align-items:center; justify-content:space-between;
    padding:8px 14px; cursor:pointer; font-size:.83rem; color:#333333; transition:background .12s; }
.nd-sugg li:hover,.nd-sugg li.sa { background:#F0F9F9; }
.nd-sugg-name strong { color:#0F6D6D; }
.nd-sugg-floor { font-size:.68rem; background:#E0F2F2; color:#0F6D6D;
    padding:2px 8px; border-radius:20px; margin-left:10px; font-weight:500; }
/* tabs */
.nd-tabs { display:flex; background:#fff; border-bottom:2px solid #E4E7EB; overflow-x:auto; flex-shrink:0; scrollbar-width:none; }
.nd-tabs::-webkit-scrollbar { display:none; }
.nd-tab {
    flex-shrink:0; background:transparent; border:none; border-bottom:3px solid transparent;
    color:#6B7280; font-family:inherit; font-size:.8rem; font-weight:500;
    padding:10px 20px; cursor:pointer; margin-bottom:-2px;
    transition:color .18s,border-color .18s,background .18s; white-space:nowrap;
}
.nd-tab:hover { color:#333333; background:#F0F9F9; }
.nd-tab.active { color:#0F6D6D; border-bottom-color:#0F6D6D; font-weight:700; background:#E0F2F2; }
/* map area */
.nd-map-area { flex:1; overflow:auto; padding:16px; background:#F5F7F7; min-height:0; }
/* floor cards (grid-based floors) */
.nd-fc { display:none; background:#fff; border-radius:14px;
    box-shadow:0 4px 24px rgba(15,109,109,.10); border:1.5px solid #E4E7EB;
    overflow:hidden; min-width:680px; max-width:960px; margin:0 auto; }
.nd-fc.active { display:block; }
.nd-ftitle {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 18px; background:linear-gradient(90deg,#0F6D6D,#0C5C5C); color:#fff;
}
.nd-ftname { font-size:.88rem; font-weight:700; letter-spacing:.5px; }
.nd-legend { display:flex; gap:12px; align-items:center; }
.nd-leg { display:flex; align-items:center; gap:5px; font-size:.66rem; color:rgba(255,255,255,0.80); }
.nd-ld { width:10px; height:10px; border-radius:2px; }
.nd-ld-r { background:#fff; border:1px solid #E4E7EB; }
.nd-ld-u { background:#E0F2F2; border:1px solid #2FA4A4; }
.nd-ld-o { background:#DCFCE7; border:1px solid #86EFAC; }
.nd-ld-s { background:#FEF3C7; border:1px solid #FCD34D; }
.nd-fb { padding:14px; }
/* room boxes */
.nd-room {
    border:1.5px solid #E4E7EB; background:#fff; border-radius:5px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:6px 4px; cursor:pointer; min-height:48px;
    transition:background .18s,border-color .18s,box-shadow .15s;
}
.nd-room:hover { background:#E0F2F2; border-color:#2FA4A4; box-shadow:0 2px 8px rgba(15,109,109,.12); }
.nd-room.highlighted { background:#E0F2F2!important; border-color:#0F6D6D!important; border-width:2px!important; box-shadow:0 0 0 3px rgba(15,109,109,.18)!important; }
.nd-rn { font-size:.63rem; font-weight:700; color:#0F6D6D; margin-bottom:1px; }
.nd-rl { font-size:.7rem; font-weight:600; color:#333333; line-height:1.25; word-break:break-word; }
.nd-room.util { background:#E0F2F2; border-color:#2FA4A4; }
.nd-room.util .nd-rl { color:#0C5C5C; }
.nd-room.stair { background:#FEF9C3; border-color:#FCD34D; border-style:dashed; }
.nd-room.stair .nd-rl { color:#92400E; }
.nd-room.open { background:#DCFCE7; border-color:#86EFAC; border-style:dashed; }
.nd-room.open .nd-rl { color:#166534; }
.nd-cor { background:#F5F7F7; border:1px dashed #E4E7EB; border-radius:3px;
    display:flex; align-items:center; justify-content:center; }
.nd-cor-l { font-size:.58rem; color:#6B7280; text-transform:uppercase; letter-spacing:1px; }
/* ── Floor grid templates ── */
.nd-bas { display:grid; grid-template-columns:2.5fr 1fr 2.5fr; gap:8px; }
.nd-grd { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1.4fr;
    grid-template-rows:86px 12px 78px 78px 78px 12px 76px; gap:8px; }
.nd-fst { display:grid; grid-template-columns:1.4fr .8fr .8fr .65fr .8fr .8fr 1.4fr;
    grid-template-rows:78px 12px 78px 78px 12px 86px 56px; gap:8px; }
.nd-sec { display:grid; grid-template-columns:1.1fr .9fr .8fr .7fr .8fr 1.2fr 1.3fr;
    grid-template-rows:86px 12px 78px 78px 12px 68px 86px 86px 76px; gap:8px; }
.nd-trd { display:grid; grid-template-columns:1.4fr 1fr 1.4fr 1fr 1fr 1.4fr;
    grid-template-rows:86px 12px 78px 78px 12px 86px; gap:8px; }
/* info bar */
.nd-info { display:flex; align-items:center; gap:8px; padding:9px 18px;
    background:#F0F9F9; border-top:1px solid #E4E7EB;
    font-size:.78rem; color:#6B7280; flex-shrink:0; min-height:38px; }
.nd-info.has { background:#E0F2F2; border-top-color:#2FA4A4; color:#0C5C5C; }
.nd-info-text { font-weight:500; }
.nd-info-badge { margin-left:auto; font-size:.68rem; background:#2FA4A4;
    color:#fff; padding:2px 10px; border-radius:20px; font-weight:600; }

/* ── SVG GROUND FLOOR STYLES ── */
.nd-svg-wrap {
    max-width:1000px; margin:0 auto; background:#fff;
    border-radius:16px; box-shadow:0 6px 32px rgba(15,109,109,.10);
    border:1px solid #E4E7EB; overflow:hidden;
}
.nd-svg-title {
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;
    padding:12px 20px; background:linear-gradient(90deg,#0F6D6D,#0C5C5C); color:#fff;
}
.nd-svg-title > span { font-size:.9rem; font-weight:700; letter-spacing:.6px; }
/* Legend inside SVG title bar */
.nd-svg-legend { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.nd-svg-leg { display:flex; align-items:center; gap:5px; font-size:.68rem; color:#CBD5E0; }
.nd-svg-ld { width:12px; height:12px; border-radius:3px; flex-shrink:0; }

.floor-svg { width:100%; display:block; cursor:default; background:#fff; }

/* Room groups */
.room-group { cursor:pointer; }
.room-area {
    transition: fill 0.3s ease, opacity 0.3s ease, stroke 0.3s ease;
}
.room-group:hover .room-area {
    fill: #E0F2F2 !important;
    stroke: #2FA4A4 !important;
    stroke-width: 2 !important;
}
.room-lbl { font-family:'Inter','Roboto',sans-serif; pointer-events:none; }
.room-num { font-family:'Inter','Roboto',sans-serif; font-weight:700; pointer-events:none; }

/* SEARCH ACTIVE: fade out non-highlighted rooms */
.floor-svg.search-on .room-group .room-area {
    opacity: 0.18;
}
.floor-svg.search-on .room-group .room-lbl,
.floor-svg.search-on .room-group .room-num {
    opacity: 0.2;
    transition: opacity 0.3s ease;
}
.floor-svg.search-on .room-group.hl .room-area {
    opacity: 1 !important;
    fill: #E0F2F2 !important;
    stroke: #0F6D6D !important;
    stroke-width: 2.5 !important;
}
.floor-svg.search-on .room-group.hl .room-lbl,
.floor-svg.search-on .room-group.hl .room-num {
    opacity: 1 !important;
}

@media(max-width:780px) {
    .nd-header { padding:8px 12px; gap:8px; }
    .nd-header-text h1 { font-size:.88rem; }
    .nd-header-text h2 { font-size:.62rem; }
    .nd-search-wrap { padding:8px 10px; }
    .nd-map-area { padding:8px; }
    .nd-fc,.nd-svg-wrap { min-width:520px; }
    .nd-room .nd-rl { font-size:.62rem; }
}
        `;
        document.head.appendChild(s);
    }

    /* ════════════════════════════════════
       MODULE HTML SHELL
    ════════════════════════════════════ */
    function buildShell() {
        const tabs = FLOORS.map(f =>
            `<button class="nd-tab" data-floor="${f.key}">${f.label}</button>`
        ).join('');
        return `
<div class="nd-header">
  <div class="nd-header-icon">🏢</div>
  <div class="nd-header-text">
    <h1>Campus Navigator</h1>
    <h2>Campus Indoor Directory</h2>
  </div>
</div>
<div class="nd-search-wrap">
  <div class="nd-search-row">
    <span class="nd-search-icon">🔍</span>
    <input id="nd-search-input" type="text" placeholder="Search room name or number…" autocomplete="off">
    <button class="nd-search-btn" id="nd-go">Find</button>
    <button class="nd-reset-btn" id="nd-reset">Reset</button>
  </div>
  <ul id="nd-sugg" class="nd-sugg"></ul>
</div>
<div class="nd-tabs">${tabs}</div>
<div class="nd-map-area" id="nd-map">
  ${buildBasement()} ${buildGround()} ${buildFirst()} ${buildSecond()} ${buildThird()}
</div>
<div class="nd-info" id="nd-info">
  <span>📍</span>
  <span class="nd-info-text" id="nd-info-text">Click any room or use the search bar to find it</span>
</div>`;
    }

    /* ════════════════════════════════════
       GROUND FLOOR — CSS GRID
    ════════════════════════════════════ */
    function buildGround() {
        const corRow = (r) => [1, 2, 3, 4, 5].map(c => Cor(c, r)).join('');
        return `<div id="nd-floor-ground" class="nd-fc" style="display:none">
  <div class="nd-ftitle"><span class="nd-ftname">🏫 GROUND FLOOR</span>${leg()}</div>
  <div class="nd-fb">
    <div class="nd-grd">
      <div ${C('1', '1')} class="nd-room" id="g-104" data-room="g-104"><span class="nd-rn">104</span><span class="nd-rl">Class Room</span></div>
      <div ${C('2', '1')} class="nd-room stair" id="g-stair" data-room="g-stair"><span class="nd-rl">🪜 Staircase</span></div>
      <div ${C('3', '1')} class="nd-room stair" id="g-lobby" data-room="g-lobby"><span class="nd-rl">Lobby</span></div>
      <div ${C('4/6', '1')} class="nd-room" id="g-workshop" data-room="g-workshop"><span class="nd-rl">⚙️ Workshop</span></div>
      ${corRow(2)}
      <div ${C('1', '3')} class="nd-room" id="g-staff" data-room="g-staff"><span class="nd-rl">Staff Room Arts</span></div>
      <div style="grid-column:2/5;grid-row:3/6" class="nd-room open" id="g-courtyard" data-room="g-courtyard"><span class="nd-rl">Courtyard</span></div>
      <div ${C('5', '3')} class="nd-room" id="g-102" data-room="g-102"><span class="nd-rn">102</span><span class="nd-rl">Class Room</span></div>
      <div ${C('1', '4')} class="nd-room" id="g-106" data-room="g-106"><span class="nd-rn">106</span><span class="nd-rl">Class Room</span></div>
      <div ${C('5', '4')} class="nd-room util" id="g-toilet" data-room="g-toilet"><span class="nd-rl">🚻 Toilet</span></div>
      <div ${C('1', '5')} class="nd-room stair" id="g-lobby2" data-room="g-lobby2"><span class="nd-rl">Lobby (Right)</span></div>
      <div ${C('5', '5')} class="nd-room stair" id="g-lobby3" data-room="g-lobby3"><span class="nd-rl">Lobby</span></div>
      ${corRow(6)}
      <div ${C('1/6', '7')} class="nd-room" id="g-library" data-room="g-library"><span class="nd-rl">📚 Library</span></div>
    </div>
  </div>
</div>`;
    }

    /* ════════════════════════════════════
       OTHER FLOORS — CSS GRID
    ════════════════════════════════════ */
    function R(id, num, name, cls = '') {
        return `<div class="nd-room ${cls}" id="${id}" data-room="${id}" title="${name}">
                  ${num ? `<span class="nd-rn">${num}</span>` : ''}
                  <span class="nd-rl">${name}</span></div>`;
    }
    function C(c, r) { return `style="grid-column:${c};grid-row:${r}"`; }
    function Cor(c, r, lbl = '') {
        return `<div class="nd-cor" style="grid-column:${c};grid-row:${r}">
                  <span class="nd-cor-l">${lbl}</span></div>`;
    }
    function leg() {
        return `<div class="nd-legend">
          <div class="nd-leg"><div class="nd-ld nd-ld-r"></div>Room</div>
          <div class="nd-leg"><div class="nd-ld nd-ld-u"></div>Utility</div>
          <div class="nd-leg"><div class="nd-ld nd-ld-o"></div>Open</div>
          <div class="nd-leg"><div class="nd-ld nd-ld-s"></div>Stair</div>
        </div>`;
    }

    function buildBasement() {
        return `<div id="nd-floor-basement" class="nd-fc" style="display:none">
  <div class="nd-ftitle"><span class="nd-ftname">🏚️ BASEMENT FLOOR</span>${leg()}</div>
  <div class="nd-fb">
    <div class="nd-bas" style="min-height:110px">
      ${R('b-canteen', '', 'Canteen')}
      ${R('b-lobby', '', 'Lobby / Staircase', 'stair')}
      ${R('b-workshop', '', 'Workshop')}
    </div>
  </div>
</div>`;
    }

    function buildFirst() {
        const corRow = (r) => [1, 2, 3, 4, 5, 6, 7].map(c => Cor(c, r)).join('');
        return `<div id="nd-floor-first" class="nd-fc" style="display:none">
  <div class="nd-ftitle"><span class="nd-ftname">🏫 1ST FLOOR</span>${leg()}</div>
  <div class="nd-fb">
    <div class="nd-fst">
      <div ${C('1', '1')} class="nd-room" id="f-204" data-room="f-204"><span class="nd-rn">204</span><span class="nd-rl">Class Room</span></div>
      <div ${C('2', '1')} class="nd-room util" id="f-t1" data-room="f-t1"><span class="nd-rl">Toilet</span></div>
      <div ${C('3', '1')} class="nd-room util" id="f-boys" data-room="f-boys"><span class="nd-rl">Boys Room</span></div>
      <div ${C('4', '1')} class="nd-room stair" id="f-lobby" data-room="f-lobby"><span class="nd-rl">Lobby</span></div>
      <div ${C('5', '1')} class="nd-room util" id="f-girls" data-room="f-girls"><span class="nd-rl">Girls Room</span></div>
      <div ${C('6', '1')} class="nd-room util" id="f-t2" data-room="f-t2"><span class="nd-rl">Toilet</span></div>
      <div ${C('7', '1')} class="nd-room" id="f-cc3" data-room="f-cc3"><span class="nd-rn">CC3</span><span class="nd-rl">Computer Center 3</span></div>
      ${corRow(2)}
      <div ${C('1', '3')} class="nd-room" id="f-205" data-room="f-205"><span class="nd-rn">205</span><span class="nd-rl">Staff Room</span></div>
      <div ${C('2/7', '3')} class="nd-room open" id="f-cy" data-room="f-cy"><span class="nd-rl">Courtyard</span></div>
      <div ${C('7', '3')} class="nd-room stair" id="f-lb2" data-room="f-lb2"><span class="nd-rl">Lobby</span></div>
      <div ${C('1', '4')} class="nd-room" id="f-206" data-room="f-206"><span class="nd-rn">206</span><span class="nd-rl">Class Room</span></div>
      ${corRow(5)}
      <div ${C('1/3', '6')} class="nd-room" id="f-cc1" data-room="f-cc1"><span class="nd-rn">207</span><span class="nd-rl">Computer Center 1</span></div>
      <div ${C('3/6', '6')} class="nd-room stair" id="f-lb3" data-room="f-lb3"><span class="nd-rl">Lobby</span></div>
      <div ${C('6/8', '6')} class="nd-room" id="f-cc2" data-room="f-cc2"><span class="nd-rn">210</span><span class="nd-rl">Computer Center 2</span></div>
      <div ${C('3/6', '7')} class="nd-room stair" id="f-porch" data-room="f-porch"><span class="nd-rl">Porch</span></div>
    </div>
  </div>
</div>`;
    }

    function buildSecond() {
        const corRow = (r) => [1, 2, 3, 4, 5, 6, 7].map(c => Cor(c, r)).join('');
        return `<div id="nd-floor-second" class="nd-fc" style="display:none">
  <div class="nd-ftitle"><span class="nd-ftname">🏫 2ND FLOOR</span>${leg()}</div>
  <div class="nd-fb">
    <div class="nd-sec">
      <div ${C('1', '1')} class="nd-room" id="s-staff" data-room="s-staff"><span class="nd-rl">Staff Room</span></div>
      <div ${C('2', '1')} class="nd-room" id="s-hod" data-room="s-hod"><span class="nd-rl">HOD Room</span></div>
      <div ${C('3', '1')} class="nd-room util" id="s-gt" data-room="s-gt"><span class="nd-rl">Girls Toilet</span></div>
      <div ${C('4', '1')} class="nd-room stair" id="s-lobby" data-room="s-lobby"><span class="nd-rl">Lobby</span></div>
      <div ${C('5', '1')} class="nd-room util" id="s-bt" data-room="s-bt"><span class="nd-rl">Boys Toilet</span></div>
      <div ${C('6/8', '1')} class="nd-room" id="s-sem" data-room="s-sem"><span class="nd-rl">Seminar Hall</span></div>
      ${corRow(2)}
      <div ${C('1/3', '3')} class="nd-room" id="s-mgmt" data-room="s-mgmt"><span class="nd-rl">Management Room</span></div>
      <div ${C('3/6', '3')} style="grid-row:3/5" class="nd-room open" id="s-cy" data-room="s-cy"><span class="nd-rl">Courtyard</span></div>
      <div ${C('6/8', '3')} class="nd-room" id="s-exam" data-room="s-exam"><span class="nd-rl">Exam Cell</span></div>
      <div ${C('1/3', '4')} class="nd-room" id="s-sec" data-room="s-sec"><span class="nd-rl">Secretary Room</span></div>
      <div ${C('6/8', '4')} class="nd-room stair" id="s-lb2" data-room="s-lb2"><span class="nd-rl">Lobby</span></div>
      ${corRow(5)}
      <div ${C('1/3', '6')} class="nd-room" id="s-board" data-room="s-board"><span class="nd-rl">Board Room</span></div>
      <div ${C('1/3', '7')} class="nd-room" id="s-prin" data-room="s-prin"><span class="nd-rl">Principal Room</span></div>
      <div ${C('3', '7')} class="nd-room" id="s-wait" data-room="s-wait"><span class="nd-rl">Waiting Area</span></div>
      <div ${C('4/6', '7')} class="nd-room stair" id="s-stair2" data-room="s-stair2"><span class="nd-rl">Staircase</span></div>
      <div ${C('6', '7')} class="nd-room" id="s-place" data-room="s-place"><span class="nd-rl">Placement Cell</span></div>
      <div ${C('7', '7')} class="nd-room" id="s-cent" data-room="s-cent"><span class="nd-rl">Central Office</span></div>
      <div ${C('1/3', '8')} class="nd-room util" id="s-toil" data-room="s-toil"><span class="nd-rl">Toilet</span></div>
    </div>
  </div>
</div>`;
    }

    function buildThird() {
        const corRow = (r, cols = [1, 2, 3, 4, 5, 6]) => cols.map(c => Cor(c, r)).join('');
        return `<div id="nd-floor-third" class="nd-fc" style="display:none">
  <div class="nd-ftitle"><span class="nd-ftname">🏫 3RD FLOOR</span>${leg()}</div>
  <div class="nd-fb">
    <div class="nd-trd">
      <div ${C('1', '1')} class="nd-room" id="t-404" data-room="t-404"><span class="nd-rn">404</span><span class="nd-rl">Drawing Hall</span></div>
      <div style="grid-column:2/5;grid-row:1" class="nd-room stair" id="t-lobby" data-room="t-lobby"><span class="nd-rl">Lobby</span></div>
      <div style="grid-column:3;grid-row:2/5" class="nd-room open" id="t-cy" data-room="t-cy"><span class="nd-rl">Courtyard</span></div>
      <div ${C('5/7', '1')} class="nd-room" id="t-lab" data-room="t-lab"><span class="nd-rl">Laboratory</span></div>
      ${corRow(2, [1, 2, 4, 5, 6])}
      <div ${C('1', '3')} class="nd-room" id="t-405" data-room="t-405"><span class="nd-rn">405</span><span class="nd-rl">Class Room</span></div>
      <div ${C('5/7', '3')} class="nd-room" id="t-401" data-room="t-401"><span class="nd-rn">401</span><span class="nd-rl">Class Room</span></div>
      <div ${C('1', '4')} class="nd-room" id="t-406" data-room="t-406"><span class="nd-rn">406</span><span class="nd-rl">Class Room</span></div>
      <div ${C('5/7', '4')} class="nd-room stair" id="t-lb2" data-room="t-lb2"><span class="nd-rl">Lobby</span></div>
      ${corRow(5)}
      <div ${C('1', '6')} class="nd-room util" id="t-bpray" data-room="t-bpray"><span class="nd-rl">Boy's Prayer Room</span></div>
      <div ${C('2', '6')} class="nd-room util" id="t-btoil" data-room="t-btoil"><span class="nd-rl">Boys Toilet</span></div>
      <div ${C('3', '6')} class="nd-room util" id="t-gpray" data-room="t-gpray"><span class="nd-rl">Girls Prayer Room</span></div>
      <div ${C('4', '6')} class="nd-room" id="t-409" data-room="t-409"><span class="nd-rn">409</span><span class="nd-rl">Class Room</span></div>
      <div ${C('5', '6')} class="nd-room util" id="t-gtoil" data-room="t-gtoil"><span class="nd-rl">Girls Toilet</span></div>
      <div ${C('6', '6')} class="nd-room" id="t-staff" data-room="t-staff"><span class="nd-rl">StaffRoom</span></div>
    </div>
  </div>
</div>`;
    }

    /* ════════════════════════════════════
       FLOOR SWITCHING
    ════════════════════════════════════ */
    function switchFloor(key) {
        activeFloor = key;
        document.querySelectorAll('.nd-tab').forEach(t =>
            t.classList.toggle('active', t.dataset.floor === key));

        // Show correct floor card
        ['basement', 'ground', 'first', 'second', 'third'].forEach(k => {
            const el = document.getElementById('nd-floor-' + k);
            if (el) el.style.display = (k === key) ? 'block' : 'none';
        });
    }

    /* ════════════════════════════════════
       HIGHLIGHT / DIM
    ════════════════════════════════════ */
    function clearHighlight() {
        if (activeEl) {
            if (activeEl._svg) {
                activeEl.classList.remove('hl');
                const svg = document.getElementById('nd-svg-ground');
                if (svg) svg.classList.remove('search-on');
            } else {
                activeEl.classList.remove('highlighted');
            }
            activeEl = null;
        }
        const bar = document.getElementById('nd-info');
        const txt = document.getElementById('nd-info-text');
        if (bar) bar.className = 'nd-info';
        if (txt) txt.textContent = 'Click any room or use the search bar to find it';
    }

    function highlightRoom(id, roomObj) {
        clearHighlight();
        const bar = document.getElementById('nd-info');
        const txt = document.getElementById('nd-info-text');
        const fl = (FLOORS.find(f => f.key === roomObj.floor) || {}).label || roomObj.floor;

        if (roomObj.svg) {
            const svg = document.getElementById('nd-svg-ground');
            const grp = document.getElementById(id);
            if (!svg || !grp) return;
            svg.classList.add('search-on');
            grp.classList.add('hl');
            grp._svg = true;
            activeEl = grp;
            activeEl._svg = true;
        } else {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.add('highlighted');
            activeEl = el;
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (bar && txt) {
            bar.className = 'nd-info has';
            txt.innerHTML = `<strong>${roomObj.name}</strong> — ${fl}`;
            const old = bar.querySelector('.nd-info-badge');
            if (old) old.remove();
            const b = document.createElement('span');
            b.className = 'nd-info-badge';
            b.textContent = fl;
            bar.appendChild(b);
        }
    }

    /* ════════════════════════════════════
       SEARCH
    ════════════════════════════════════ */
    function onInput() {
        const q = searchInput.value.trim().toLowerCase();
        suggBox.innerHTML = '';
        activeSuggIdx = -1;
        if (!q) { suggBox.classList.remove('open'); return; }
        const hits = ROOMS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 8);
        if (!hits.length) { suggBox.classList.remove('open'); return; }
        const fm = Object.fromEntries(FLOORS.map(f => [f.key, f.label]));
        hits.forEach(r => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="nd-sugg-name">${hl(r.name, q)}</span>
                            <span class="nd-sugg-floor">${fm[r.floor] || r.floor}</span>`;
            li.addEventListener('mousedown', e => { e.preventDefault(); pick(r); });
            suggBox.appendChild(li);
        });
        suggBox.classList.add('open');
    }

    function hl(name, q) {
        const i = name.toLowerCase().indexOf(q);
        if (i < 0) return name;
        return name.slice(0, i) + `<strong>${name.slice(i, i + q.length)}</strong>` + name.slice(i + q.length);
    }

    function onKeydown(e) {
        const items = suggBox.querySelectorAll('li');
        if (!suggBox.classList.contains('open') || !items.length) {
            if (e.key === 'Enter') doSearch(searchInput.value.trim());
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); activeSuggIdx = Math.min(activeSuggIdx + 1, items.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); activeSuggIdx = Math.max(activeSuggIdx - 1, 0); }
        else if (e.key === 'Escape') { suggBox.classList.remove('open'); return; }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeSuggIdx >= 0) items[activeSuggIdx].dispatchEvent(new MouseEvent('mousedown'));
            else doSearch(searchInput.value.trim()); return;
        }
        else return;
        items.forEach((li, i) => li.classList.toggle('sa', i === activeSuggIdx));
    }

    function pick(room) {
        searchInput.value = room.name;
        suggBox.classList.remove('open');
        navTo(room);
    }

    function doSearch(query) {
        suggBox.classList.remove('open');
        if (!query) return;
        const q = query.toLowerCase();
        const found = ROOMS.find(r => r.name.toLowerCase() === q)
            || ROOMS.find(r => r.name.toLowerCase().includes(q));
        if (!found) {
            searchInput.style.borderColor = '#FC8181';
            setTimeout(() => searchInput.style.borderColor = '', 700);
            return;
        }
        navTo(found);
    }

    function navTo(room) {
        if (room.floor !== activeFloor) switchFloor(room.floor);
        requestAnimationFrame(() => highlightRoom(room.id, room));
    }

    /* ════════════════════════════════════
       CLICK WIRING
    ════════════════════════════════════ */
    function wireClicks() {
        // CSS grid rooms
        document.querySelectorAll('.nd-room[data-room]').forEach(el => {
            el.addEventListener('click', () => {
                const r = ROOMS.find(x => x.id === el.dataset.room);
                if (r) highlightRoom(r.id, r);
            });
        });
        // SVG room groups
        document.querySelectorAll('#nd-svg-ground .room-group').forEach(g => {
            g.addEventListener('click', () => {
                const r = ROOMS.find(x => x.id === g.dataset.room);
                if (r) highlightRoom(r.id, r);
            });
        });
    }

    /* ════════════════════════════════════
       INIT
    ════════════════════════════════════ */
    function init() {
        const mod = document.getElementById('navigation-module');
        if (!mod || mod.querySelector('.nd-header')) return;
        injectStyles();
        mod.innerHTML = buildShell();

        searchInput = document.getElementById('nd-search-input');
        suggBox = document.getElementById('nd-sugg');

        document.querySelectorAll('.nd-tab').forEach(btn =>
            btn.addEventListener('click', () => { switchFloor(btn.dataset.floor); clearHighlight(); }));

        searchInput.addEventListener('input', onInput);
        searchInput.addEventListener('keydown', onKeydown);
        document.getElementById('nd-go').addEventListener('click', () => doSearch(searchInput.value.trim()));
        document.getElementById('nd-reset').addEventListener('click', () => {
            clearHighlight(); searchInput.value = ''; suggBox.classList.remove('open');
        });
        document.addEventListener('click', e => {
            if (!e.target.closest('#nd-search-input') && !e.target.closest('.nd-sugg'))
                suggBox.classList.remove('open');
        });

        wireClicks();
        switchFloor('ground');
    }

    /* ════════════════════════════════════
       BOOT
    ════════════════════════════════════ */
    function boot() {
        init();
        new MutationObserver(() => {
            const m = document.getElementById('navigation-module');
            if (m && m.classList.contains('active') && !m.querySelector('.nd-header')) init();
        }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', boot)
        : boot();
})();
