import express from 'express';
import { authMiddleware } from '../utils/auth';
import { isEmpty } from '../utils/isEmpty';
import Project from '../models/Project';
import Task from '../models/Task';

const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// GET /api/project - Get all projects for the logged-in user
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const project = await Project.find({ owner: req.user._id });
    res.json(project);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET /api/project - Get project for the logged-in user
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (isEmpty(project))
      return res
        .status(404)
        .json({ message: `No project found for id (${req.params.id}).` });
    if (project.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are now allowed to see that project.' });

    res.json(project);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST /api/project - Create a new project
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT /api/project/:id - Update a project
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    let project = await Project.findById(req.params.id);
    if (isEmpty(project))
      return res
        .status(404)
        .json({ message: `No project found for id (${req.params.id}).` });
    if (project.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are now allowed to update that project.' });

    project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      {
        new: true
      }
    );
    if (!project) {
      return res
        .status(404)
        .json({ message: 'No project found with this id!' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE /api/project/:id - Delete a project
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    let project = await Project.findById(req.params.id);

    if (isEmpty(project))
      return res
        .status(404)
        .json({ message: `No project found for id (${req.params.id}).` });
    if (project.owner.toString() !== req.user._id)
      return res
        .status(403)
        .json({ message: 'You are not allowed to delete that project.' });

    project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: 'No project found with this id!' });
    }
    res.json({ message: 'Project deleted' }, project);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET /api/tasks/:projectId/tasks - Get all tasks for the logged-in user
router.get(
  '/:id/tasks',
  async (req: express.Request, res: express.Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project || isEmpty(project) || !project.owner)
        return res
          .status(404)
          .json({ message: `No project found for id (${req.params.id}).` });
      if (project.owner.toString() !== req.user._id)
        return res
          .status(403)
          .json({ message: 'You are not allowed to access that project.' });

      const tasks = await Task.find({ project: project._id });
      if (!tasks || tasks.length === 0)
        return res.status(400).json({ message: 'No tasks found' });

      res.json(tasks);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

// POST /api/tasks/:projectId/tasks - Get all tasks for the logged-in user
router.post(
  '/:id/tasks',
  async (req: express.Request, res: express.Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project || isEmpty(project) || !project.owner)
        return res
          .status(404)
          .json({ message: `No project found for id (${req.params.id}).` });
      if (project.owner.toString() !== req.user._id)
        return res
          .status(403)
          .json({ message: 'You are not allowed to access that project.' });

      const task = await Task.create({ ...req.body, project: project._id });
      if (!task)
        return res.status(400).json({ message: 'Unable to post new tasks' });

      res.status(201).json(task);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

export default router;
