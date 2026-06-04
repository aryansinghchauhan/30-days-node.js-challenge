const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/noteController');
const validate   = require('../middleware/validate');
const {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
  idParamSchema,
} = require('../schemas/noteSchema');

// ── Collection routes ────────────────────────────────────────────
router.get(
  '/',
  validate({ query: getNotesQuerySchema }),
  controller.getAll
);

router.post(
  '/',
  validate({ body: createNoteSchema }),
  controller.create
);

// Bulk delete — must come BEFORE /:id routes
router.delete(
  '/bulk',
  controller.bulkDelete
);

// Stats — must come BEFORE /:id routes
router.get(
  '/stats',
  controller.getStats
);

// ── Single resource routes ───────────────────────────────────────
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  controller.getOne
);

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateNoteSchema }),
  controller.update
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  controller.remove
);

// ── Action routes ────────────────────────────────────────────────
router.post(
  '/:id/pin',
  validate({ params: idParamSchema }),
  controller.togglePin
);

router.post(
  '/:id/archive',
  validate({ params: idParamSchema }),
  controller.toggleArchive
);

module.exports = router;