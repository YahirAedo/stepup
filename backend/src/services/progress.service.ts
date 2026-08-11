import { ProgressRepository } from '../repositories/progress.repository';

export class ProgressService {
  private progressRepo = new ProgressRepository();

  async getHistory() {
    return this.progressRepo.findAll();
  }
}
