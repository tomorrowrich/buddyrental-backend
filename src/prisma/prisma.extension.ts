import { Prisma } from '@prisma/client';
import { hash } from 'argon2';

export const userPassword = Prisma.defineExtension({
  name: 'userPassword',
  query: {
    user: {
      async create({ args, query }) {
        if (!args.data.password.startsWith('$argon2')) {
          args.data.password = await hash(args.data.password);
        }
        return query(args);
      },
      async createMany({ args, query }) {
        if (Array.isArray(args.data)) {
          for (const user of args.data) {
            if (user.password && !user.password.startsWith('$argon2')) {
              user.password = await hash(user.password);
            }
          }
        } else {
          if (args.data.password && !args.data.password.startsWith('$argon2')) {
            args.data.password = await hash(args.data.password);
          }
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.password) {
          if (typeof args.data.password == 'string') {
            args.data.password = await hash(args.data.password);
          } else if (typeof args.data.password.set == 'string') {
            args.data.password.set = await hash(args.data.password.set);
          }
        }
        return query(args);
      },
      async updateMany({ args, query }) {
        if (args.data.password) {
          if (typeof args.data.password == 'string') {
            args.data.password = await hash(args.data.password);
          } else if (typeof args.data.password.set == 'string') {
            args.data.password.set = await hash(args.data.password.set);
          }
        }
        return query(args);
      },
      async createManyAndReturn({ args, query }) {
        if (Array.isArray(args.data)) {
          for (const user of args.data) {
            if (user.password && !user.password.startsWith('$argon2')) {
              user.password = await hash(user.password);
            }
          }
        } else {
          if (args.data.password && !args.data.password.startsWith('$argon2')) {
            args.data.password = await hash(args.data.password);
          }
        }
        return query(args);
      },
      async updateManyAndReturn({ args, query }) {
        if (args.data.password) {
          if (typeof args.data.password == 'string') {
            args.data.password = await hash(args.data.password);
          } else if (typeof args.data.password.set == 'string') {
            args.data.password.set = await hash(args.data.password.set);
          }
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (
          args.create.password &&
          !args.create.password.startsWith('$argon2')
        ) {
          args.create.password = await hash(args.create.password);
        }
        if (args.update?.password) {
          if (typeof args.update.password == 'string') {
            args.update.password = await hash(args.update.password);
          } else if (typeof args.update.password.set == 'string') {
            args.update.password.set = await hash(args.update.password.set);
          }
        }
        return query(args);
      },
    },
  },
});
