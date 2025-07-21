import express from 'express';
import Note from '../models/Notes.js';
import { authMiddleware } from '../utils/auth.js';
import { isEmpty } from '../utils/isEmpty.js';

const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// GET /api/notes - Get all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id });
    res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET /api/notes - Get note for the logged-in user
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (isEmpty(note))
      return res
        .status(404)
        .json({ message: `No note found for id (${req.params.id}).` });
    if (note.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are now allowed to see that note.' });

    res.json(note);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (isEmpty(note))
      return res
        .status(404)
        .json({ message: `No note found for id (${req.params.id}).` });
    if (note.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are now allowed to update that note.' });

    note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      {
        new: true
      }
    );
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (isEmpty(note))
      return res
        .status(404)
        .json({ message: `No note found for id (${req.params.id}).` });
    if (note.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are now allowed to delete that note.' });

    note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    res.json({ message: 'Note deleted!' }, note);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
