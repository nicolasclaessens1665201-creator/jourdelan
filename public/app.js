async function api(path, opts = {}){
  const res = await fetch('/api' + path, Object.assign({headers:{'Content-Type':'application/json'}}, opts));
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// UI helpers
const $ = sel => document.querySelector(sel);

function showTab(name){
  if (name === 'participants'){
    $('#participants-section').classList.remove('hidden');
    $('#dishes-section').classList.add('hidden');
  } else {
    $('#participants-section').classList.add('hidden');
    $('#dishes-section').classList.remove('hidden');
  }
}

// Participants
async function loadParticipants(){
  const list = await api('/participants');
  const ul = $('#participants-list');
  ul.innerHTML = '';
  // compute totals
  let totalAdults = 0, totalChildren = 0;
  list.forEach(p => {
    const adults = Number.isFinite(p.adults) ? p.adults : 1;
    const children = Number.isFinite(p.children) ? p.children : 0;
    totalAdults += adults;
    totalChildren += children;
    const li = document.createElement('li');
    li.className = 'participant-item';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${p.name} — ${adults} × adultes ; ${children} × enfants de 12 ans et moins`;
    li.appendChild(nameSpan);

    const controls = document.createElement('span');
    controls.className = 'controls';
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Éditer';
    editBtn.addEventListener('click', async () => {
      const result = await showParticipantModal(p);
      if (!result) return;
      try { await api(`/participants/${p.id}`, {method:'PUT', body: JSON.stringify({name: result.name, adults: result.adults, children: result.children})}); await refreshAll(); }
      catch(e){ alert(e.message); }
    });
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Supprimer';
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Supprimer ${p.name} ?`)) return;
      try { await api(`/participants/${p.id}`, {method:'DELETE'}); await refreshAll(); }
      catch(e){ alert(e.message); }
    });
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    li.appendChild(controls);
    ul.appendChild(li);
  });
  // update totals display
  const totalsEl = document.getElementById('totals');
  if (totalsEl){
    const total = totalAdults + totalChildren;
    totalsEl.textContent = `Total personnes: ${total} (adultes : ${totalAdults} — enfants de 12 ans et moins : ${totalChildren})`;
  }
  return list;
}

async function addParticipant(name){
  const adults = parseInt(document.getElementById('participant-adults').value,10) || 0;
  const children = parseInt(document.getElementById('participant-children').value,10) || 0;
  await api('/participants', {method:'POST', body: JSON.stringify({name, adults, children})});
  // reset form
  document.getElementById('participant-adults').value = '1';
  document.getElementById('participant-children').value = '0';
  await refreshAll();
}

// Dishes
async function loadDishes(){
  const dishes = await api('/dishes');
  const participants = await api('/participants');
  const container = $('#dishes-list');
  container.innerHTML = '';
  dishes.forEach(d => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    const title = document.createElement('h3');
    title.textContent = d.name;
    card.appendChild(title);

    const info = document.createElement('p');
    info.textContent = `Participants: ${d.contributors.length} / ${d.maxPeople}`;
    card.appendChild(info);

    const list = document.createElement('ul');
    d.contributors.forEach((id, idx) => {
      const p = participants.find(x => x.id === id);
      const li = document.createElement('li');
      li.textContent = p ? p.name : '(inconnu)';
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✖';
      removeBtn.title = 'Retirer ce contributeur';
      removeBtn.addEventListener('click', async () => {
        if (!confirm('Retirer ce contributeur ?')) return;
        try { await api(`/dishes/${d.id}/leave`, {method:'POST', body: JSON.stringify({participantId: id})}); await refreshAll(); }
        catch(e){ alert(e.message); }
      });
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
    card.appendChild(list);

    const form = document.createElement('div');
    form.className = 'join-controls';
    const select = document.createElement('select');
    participants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
    form.appendChild(select);

    const joinBtn = document.createElement('button');
    joinBtn.textContent = d.contributors.length >= d.maxPeople ? 'Complet' : 'Me porter';
    joinBtn.disabled = d.contributors.length >= d.maxPeople;
    joinBtn.addEventListener('click', async () => {
      try {
        await api(`/dishes/${d.id}/join`, {method:'POST', body: JSON.stringify({participantId: select.value})});
        await refreshAll();
      } catch (e) { alert(e.message); }
    });
    form.appendChild(joinBtn);

    const editDishBtn = document.createElement('button');
    editDishBtn.textContent = '✏️';
    editDishBtn.title = 'Éditer le plat';
    editDishBtn.addEventListener('click', async () => {
      const result = await showDishModal(d);
      if (!result) return;
      try { await api(`/dishes/${d.id}`, {method:'PUT', body: JSON.stringify({name: result.name, maxPeople: result.maxPeople})}); await refreshAll(); }
      catch(e){ alert(e.message); }
    });
    const delDishBtn = document.createElement('button');
    delDishBtn.textContent = '🗑️';
    delDishBtn.title = 'Supprimer le plat';
    delDishBtn.addEventListener('click', async () => {
      if (!confirm(`Supprimer le plat ${d.name} ?`)) return;
      try { await api(`/dishes/${d.id}`, {method:'DELETE'}); await refreshAll(); }
      catch(e){ alert(e.message); }
    });
    form.appendChild(editDishBtn);
    form.appendChild(delDishBtn);

    card.appendChild(form);
    container.appendChild(card);
  });
  return dishes;
}

async function addDish(name, maxPeople){
  await api('/dishes', {method:'POST', body: JSON.stringify({name, maxPeople})});
  await refreshAll();
}

async function refreshAll(){
  await loadParticipants();
  await loadDishes();
}

// Event wiring
document.addEventListener('DOMContentLoaded', async () => {
  $('#tab-participants').addEventListener('click', () => showTab('participants'));
  $('#tab-dishes').addEventListener('click', () => showTab('dishes'));

  $('#participant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#participant-name').value.trim();
    if (!name) return;
    await addParticipant(name);
    $('#participant-name').value = '';
  });

  $('#dish-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#dish-name').value.trim();
    const max = parseInt($('#dish-max').value, 10) || 1;
    if (!name) return;
    await addDish(name, max);
    $('#dish-name').value = '';
    $('#dish-max').value = '1';
  });

  await refreshAll();
});

// Modal helpers
function openModal(id){
  const el = document.getElementById(id);
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
}

function closeModal(id){
  const el = document.getElementById(id);
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
}

function showParticipantModal(participant){
  return new Promise(resolve => {
    const modal = document.getElementById('participant-modal');
    const input = document.getElementById('pm-name');
    const pmAdults = document.getElementById('pm-adults');
    const pmChildren = document.getElementById('pm-children');
    const save = modal.querySelector('.save');
    const cancel = modal.querySelector('.cancel');
    input.value = participant ? participant.name : '';
    pmAdults.value = participant && Number.isFinite(participant.adults) ? participant.adults : 1;
    pmChildren.value = participant && Number.isFinite(participant.children) ? participant.children : 0;
    openModal('participant-modal');
    function onSave(){
      const val = input.value.trim();
      const adults = parseInt(pmAdults.value,10) || 0;
      const children = parseInt(pmChildren.value,10) || 0;
      if (!val) { alert('Le nom est requis'); return; }
      cleanup();
      resolve({ name: val, adults, children });
    }
    function onCancel(){ cleanup(); resolve(null); }
    function cleanup(){ save.removeEventListener('click', onSave); cancel.removeEventListener('click', onCancel); closeModal('participant-modal'); }
    save.addEventListener('click', onSave);
    cancel.addEventListener('click', onCancel);
  });
}

function showDishModal(dish){
  return new Promise(resolve => {
    const modal = document.getElementById('dish-modal');
    const nameInput = document.getElementById('dm-name');
    const maxInput = document.getElementById('dm-max');
    const save = modal.querySelector('.save');
    const cancel = modal.querySelector('.cancel');
    nameInput.value = dish ? dish.name : '';
    maxInput.value = dish ? dish.maxPeople : 1;
    openModal('dish-modal');
    function onSave(){
      const nm = nameInput.value.trim();
      const mx = parseInt(maxInput.value, 10) || 1;
      if (!nm) { alert('Le nom du plat est requis'); return; }
      if (mx < 1) { alert('Le nombre maximum doit être >= 1'); return; }
      cleanup();
      resolve({ name: nm, maxPeople: mx });
    }
    function onCancel(){ cleanup(); resolve(null); }
    function cleanup(){ save.removeEventListener('click', onSave); cancel.removeEventListener('click', onCancel); closeModal('dish-modal'); }
    save.addEventListener('click', onSave);
    cancel.addEventListener('click', onCancel);
  });
}
