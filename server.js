const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { participants: [], dishes: [] };
  }
}

function writeData(data) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/participants', (req, res) => {
  const data = readData();
  const participants = (data.participants || []).map(p => ({ adults: 1, children: 0, ...p }));
  res.json(participants);
});

app.post('/api/participants', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const data = readData();
  const clean = name.trim();
  // Prevent duplicate names (case-insensitive)
  if ((data.participants || []).some(p => p.name.toLowerCase() === clean.toLowerCase())) {
    return res.status(400).json({ error: 'Participant already exists' });
  }
  const id = Date.now().toString();
  const adults = parseInt(req.body.adults, 10);
  const children = parseInt(req.body.children, 10);
  const p = { id, name: clean, adults: Number.isFinite(adults) ? adults : 1, children: Number.isFinite(children) ? children : 0 };
  data.participants.push(p);
  writeData(data);
  res.status(201).json(p);
});

// Edit participant
app.put('/api/participants/:id', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const data = readData();
  const participant = (data.participants || []).find(p => p.id === id);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });
  const clean = name.trim();
  if ((data.participants || []).some(p => p.id !== id && p.name.toLowerCase() === clean.toLowerCase())) {
    return res.status(400).json({ error: 'Another participant with that name exists' });
  }
  const adults = parseInt(req.body.adults, 10);
  const children = parseInt(req.body.children, 10);
  participant.name = clean;
  participant.adults = Number.isFinite(adults) ? adults : (participant.adults || 1);
  participant.children = Number.isFinite(children) ? children : (participant.children || 0);
  writeData(data);
  res.json(participant);
});

// Delete participant (remove from dishes contributors)
app.delete('/api/participants/:id', (req, res) => {
  const id = req.params.id;
  const data = readData();
  const before = (data.participants || []).length;
  data.participants = (data.participants || []).filter(p => p.id !== id);
  // Remove from contributors
  (data.dishes || []).forEach(d => {
    d.contributors = (d.contributors || []).filter(cid => cid !== id);
  });
  writeData(data);
  if (data.participants.length === before) return res.status(404).json({ error: 'Participant not found' });
  res.json({ success: true });
});

app.get('/api/dishes', (req, res) => {
  const data = readData();
  res.json(data.dishes || []);
});

app.post('/api/dishes', (req, res) => {
  const { name, maxPeople } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const max = parseInt(maxPeople, 10) || 1;
  const data = readData();
  const id = Date.now().toString();
  const dish = { id, name: name.trim(), maxPeople: max, contributors: [] };
  data.dishes.push(dish);
  writeData(data);
  res.status(201).json(dish);
});

// Edit dish
app.put('/api/dishes/:id', (req, res) => {
  const id = req.params.id;
  const { name, maxPeople } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const max = parseInt(maxPeople, 10) || 1;
  const data = readData();
  const dish = (data.dishes || []).find(d => d.id === id);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  dish.name = name.trim();
  dish.maxPeople = max;
  // If contributors exceed new max, trim oldest contributors
  if ((dish.contributors || []).length > max) {
    dish.contributors = dish.contributors.slice(0, max);
  }
  writeData(data);
  res.json(dish);
});

// Delete dish
app.delete('/api/dishes/:id', (req, res) => {
  const id = req.params.id;
  const data = readData();
  const before = (data.dishes || []).length;
  data.dishes = (data.dishes || []).filter(d => d.id !== id);
  writeData(data);
  if (data.dishes.length === before) return res.status(404).json({ error: 'Dish not found' });
  res.json({ success: true });
});

app.post('/api/dishes/:id/join', (req, res) => {
  const dishId = req.params.id;
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ error: 'participantId required' });
  const data = readData();
  const dish = (data.dishes || []).find(d => d.id === dishId);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  if (!data.participants.find(p => p.id === participantId)) return res.status(404).json({ error: 'Participant not found' });
  if (dish.contributors.includes(participantId)) return res.status(400).json({ error: 'Already joined' });
  if (dish.contributors.length >= dish.maxPeople) return res.status(400).json({ error: 'Dish is already full' });
  dish.contributors.push(participantId);
  writeData(data);
  res.json(dish);
});

app.post('/api/dishes/:id/leave', (req, res) => {
  const dishId = req.params.id;
  const { participantId } = req.body;
  const data = readData();
  const dish = (data.dishes || []).find(d => d.id === dishId);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  dish.contributors = dish.contributors.filter(id => id !== participantId);
  writeData(data);
  res.json(dish);
});

// Serve static frontend
app.use('/', express.static(path.join(__dirname, 'public')));

// Serve standalone pages at root level
app.get('/inscription.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'inscription.html'));
});
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Potluck app listening on http://localhost:${PORT}`);
});
