import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { handleError } from '../utils/handle-error';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const user = await this.authService.getById(req.userId!);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return handleError(res, error);
    }
  };
}
