import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { IdempotencyService } from '../services/idempotency.service';
import { handleError } from '../utils/handle-error';

function parseId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class TaskController {
  private taskService = new TaskService();
  private idempotencyService = new IdempotencyService();

  list = async (req: Request, res: Response) => {
    try {
      const tasks = await this.taskService.getAllActive(req.userId!);
      return res.status(200).json(tasks);
    } catch (error) {
      return handleError(res, error);
    }
  };

  completed = async (req: Request, res: Response) => {
    try {
      const tasks = await this.taskService.getCompletedTasks(req.userId!);
      return res.status(200).json(tasks);
    } catch (error) {
      return handleError(res, error);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const task = await this.taskService.getTaskById(req.userId!, parseId(req.params.id));
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
      const task = await this.taskService.createTask(req.userId!, req.body);
      return res.status(201).json(task);
    } catch (error) {
      return handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const id = parseId(req.params.id);
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'PATCH',
          path: `/api/tasks/${id}`,
          body: req.body,
        },
        async (db) => {
          const task = await this.taskService.updateTask(userId, id, req.body, db);
          return { statusCode: 200, responseBody: JSON.stringify(task) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.taskService.deleteTask(req.userId!, parseId(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.completeTask(req.userId!, parseId(req.params.id));
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
