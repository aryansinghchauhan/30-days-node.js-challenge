const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError, BadRequestError } = require('../errors/AppError');

// ─── In-memory data store ────────────────────────────────────────────────────
// In Week 2, this gets replaced with a real database
let notes = [
  {
    id: 1,
    title: 'Buy groceries',
    content: 'Milk, eggs, bread, vegetables, fruits',
    tags: ['personal', 'shopping'],
    isPinned: true,
    isArchived: false,
    color: 'yellow',
    createdAt: new Date('2026-05-01').toISOString(),
    updatedAt: new Date('2026-05-01').toISOString(),
  },
  {
    id: 2,
    title: 'Backend roadmap',
    content: 'Complete 30 day backend development roadmap',
    tags: ['learning', 'coding'],
    isPinned: true,
    isArchived: false,
    color: 'blue',
    createdAt: new Date('2026-05-10').toISOString(),
    updatedAt: new Date('2026-05-10').toISOString(),
  },
  {
    id: 3,
    title: 'Old meeting notes',
    content: 'Q1 planning session notes from January',
    tags: ['work', 'meetings'],
    isPinned: false,
    isArchived: true,
    color: 'white',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 4,
    title: 'Book recommendations',
    content: 'You Dont Know JS, Clean Code, The Pragmatic Programmer',
    tags: ['learning', 'books'],
    isPinned: false,
    isArchived: false,
    color: 'green',
    createdAt: new Date('2026-05-20').toISOString(),
    updatedAt: new Date('2026-05-20').toISOString(),
  },
  {
    id: 5,
    title: 'Workout plan',
    content: 'Mon: chest, Tue: back, Wed: rest, Thu: legs, Fri: shoulders',
    tags: ['personal', 'health'],
    isPinned: false,
    isArchived: false,
    color: 'pink',
    createdAt: new Date('2026-05-22').toISOString(),
    updatedAt: new Date('2026-05-22').toISOString(),
  },
];

let nextId = 6;

// ─── Helper ──────────────────────────────────────────────────────────────────
function findNote(id) {
  return notes.find(n => n.id === id);
}

function findNoteIndex(id) {
  return notes.findIndex(n => n.id === id);
}

// ─── GET /notes ──────────────────────────────────────────────────────────────
exports.getAll = asyncHandler(async (req, res) => {
  let result = [...notes];

  const {
    search, tag, isPinned, isArchived,
    color, sort, order, page, limit,
  } = req.query;

  // Filter: search in title OR content
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(n =>
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term)
    );
  }

  // Filter: by tag
  if (tag) {
    result = result.filter(n => n.tags.includes(tag));
  }

  // Filter: pinned status
  if (isPinned !== undefined) {
    result = result.filter(n => n.isPinned === (isPinned === 'true'));
  }

  // Filter: archived status
  if (isArchived !== undefined) {
    result = result.filter(n => n.isArchived === (isArchived === 'true'));
  }

  // Filter: by color
  if (color) {
    result = result.filter(n => n.color === color);
  }

  // Sort
  result.sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    // String comparison for title
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ?  1 : -1;
    return 0;
  });

  // Pagination
  const total      = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start      = (page - 1) * limit;
  const data       = result.slice(start, start + limit);

  res.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// ─── GET /notes/:id ───────────────────────────────────────────────────────────
exports.getOne = asyncHandler(async (req, res) => {
  const note = findNote(req.params.id);
  if (!note) throw new NotFoundError('Note');
  res.json({ data: note });
});

// ─── POST /notes ──────────────────────────────────────────────────────────────
exports.create = asyncHandler(async (req, res) => {
  // Check for duplicate title
  const exists = notes.find(
    n => n.title.toLowerCase() === req.body.title.toLowerCase()
  );
  if (exists) {
    throw new ConflictError(`A note with title "${req.body.title}" already exists`);
  }

  const now  = new Date().toISOString();
  const note = {
    id: nextId++,
    ...req.body,
    createdAt: now,
    updatedAt: now,
  };

  notes.push(note);

  res
    .status(201)
    .set('Location', `/${req.baseUrl}/notes/${note.id}`)
    .json({ data: note });
});

// ─── PATCH /notes/:id ────────────────────────────────────────────────────────
exports.update = asyncHandler(async (req, res) => {
  const index = findNoteIndex(req.params.id);
  if (index === -1) throw new NotFoundError('Note');

  // If title is being changed, check it doesn't conflict with another note
  if (req.body.title) {
    const conflict = notes.find(
      n => n.id !== req.params.id &&
           n.title.toLowerCase() === req.body.title.toLowerCase()
    );
    if (conflict) {
      throw new ConflictError(`A note with title "${req.body.title}" already exists`);
    }
  }

  notes[index] = {
    ...notes[index],
    ...req.body,
    id:        notes[index].id,        // id never changes
    createdAt: notes[index].createdAt, // createdAt never changes
    updatedAt: new Date().toISOString(),
  };

  res.json({ data: notes[index] });
});

// ─── DELETE /notes/:id ────────────────────────────────────────────────────────
exports.remove = asyncHandler(async (req, res) => {
  const index = findNoteIndex(req.params.id);
  if (index === -1) throw new NotFoundError('Note');

  notes.splice(index, 1);
  res.status(204).end();
});

// ─── POST /notes/:id/pin ──────────────────────────────────────────────────────
exports.togglePin = asyncHandler(async (req, res) => {
  const index = findNoteIndex(req.params.id);
  if (index === -1) throw new NotFoundError('Note');

  notes[index].isPinned  = !notes[index].isPinned;
  notes[index].updatedAt = new Date().toISOString();

  res.json({
    data:    notes[index],
    message: notes[index].isPinned ? 'Note pinned' : 'Note unpinned',
  });
});

// ─── POST /notes/:id/archive ─────────────────────────────────────────────────
exports.toggleArchive = asyncHandler(async (req, res) => {
  const index = findNoteIndex(req.params.id);
  if (index === -1) throw new NotFoundError('Note');

  notes[index].isArchived = !notes[index].isArchived;
  notes[index].updatedAt  = new Date().toISOString();

  // Unpin when archiving — archived notes shouldn't be pinned
  if (notes[index].isArchived) {
    notes[index].isPinned = false;
  }

  res.json({
    data:    notes[index],
    message: notes[index].isArchived ? 'Note archived' : 'Note unarchived',
  });
});

// ─── DELETE /notes/bulk ───────────────────────────────────────────────────────
exports.bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError('ids must be a non-empty array of note ids');
  }

  // Validate all are numbers
  if (!ids.every(id => Number.isInteger(id) && id > 0)) {
    throw new BadRequestError('all ids must be positive integers');
  }

  // Find which ones exist
  const existingIds = ids.filter(id => notes.some(n => n.id === id));

  if (existingIds.length === 0) {
    throw new NotFoundError('None of the specified notes');
  }

  // Delete them
  notes = notes.filter(n => !existingIds.includes(n.id));

  res.json({
    message: `Deleted ${existingIds.length} note(s)`,
    deletedIds:    existingIds,
    notFoundIds:   ids.filter(id => !existingIds.includes(id)),
  });
});

// ─── GET /notes/stats ────────────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const total    = notes.length;
  const pinned   = notes.filter(n => n.isPinned).length;
  const archived = notes.filter(n => n.isArchived).length;
  const active   = notes.filter(n => !n.isArchived).length;

  // Count by color
  const byColor = notes.reduce((acc, note) => {
    acc[note.color] = (acc[note.color] || 0) + 1;
    return acc;
  }, {});

  // Count by tag
  const byTag = notes.reduce((acc, note) => {
    note.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  // Most used tags (top 5)
  const topTags = Object.entries(byTag)
    .sort(([, a], [, b]) => b - a)   // sort by count descending
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  res.json({
    data: {
      total,
      active,
      pinned,
      archived,
      byColor,
      topTags,
    }
  });
});