import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { handleError } from '../utils/handle-error';

function parseId(value: string | string[]): number {
  return Number(Array.isArray(value) ? value[0] : value);
}

export class TaskController {
  private taskService = new TaskService();

  list = async (_req: Request, res: Response) => {
    try {
      const tasks = await this.taskService.getAllActive();
      return res.status(200).json(tasks);
    } catch (error) {
      return handleError(res, error);
    }
  };

  completed = async (_req: Request, res: Response) => {
    try {
      const tasks = await this.taskService.getCompletedTasks();
      return res.status(200).json(tasks);
    } catch (error) {
      return handleError(res, error);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const task = await this.taskService.getTaskById(parseId(req.params.id));
      if (!task) {
        return res.status(404).json({ message: 'La tarea especificada no existe' });
      }
      return res.status(200).json(task);
    } catch (error) {
      return handleError(res, error);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const task = await this.taskService.createTask(req.body);
      return res.status(201).json(task);
    } catch (error) {
      return handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const task = await this.taskService.updateTask(parseId(req.params.id), req.body);
      return res.status(200).json(task);
    } catch (error) {
      return handleError(res, error);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.taskService.deleteTask(parseId(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const taskId = parseId(req.params.id);
      const result = await this.taskService.completeTask(taskId);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
