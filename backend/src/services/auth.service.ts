import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../validations/schemas';

type PublicUser = { id: string; name: string; email: string };

function toPublicUser(user: { id: string; name: string; email: string }): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export class AuthService {
  async register(input: unknown) {
    const data = registerSchema.parse(input);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email, password },
    });

    return { user: toPublicUser(user), token: signToken(user.id) };
  }

  async login(input: unknown) {
    const data = loginSchema.parse(input);
    const email = data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    return { user: toPublicUser(user), token: signToken(user.id) };
  }

  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? toPublicUser(user) : null;
  }
}
