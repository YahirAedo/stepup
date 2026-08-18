import { ProgressRepository } from '../repositories/progress.repository';

export class ProgressService {
  private progressRepo = new ProgressRepository();

  async getHistory(userId: string) {
    return this.progressRepo.findAll(userId);
  }
}
