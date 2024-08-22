import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string; 
        JWT_SECRET: string; 
    }
}>();

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
    }).$extends(withAccelerate());
    
    try {
      const user = await prisma.user.create({
        data: {
          username: body.username,
          password: body.password,
        },
      })
      const jwt = await sign ({
        id: user.id
      }, c.env.JWT_SECRET)
      console.log('New user created:', user); // Log success
      return c.text(jwt);
    } catch (e) {
      c.status(403);
      console.error('Error during user signup:', e); 
      return c.text('ERROR');
    } 
  });
  
  userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Added logging for better debugging
    }).$extends(withAccelerate());
    
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: body.username,
          password: body.password,
        },
      })
      if(!user){
        c.status(403); 
        return c.text('Invalid')
      }
      const jwt = await sign ({
        id: user.id
      }, c.env.JWT_SECRET)
      return c.text(jwt);
    } catch (e) {
      c.status(403);
      console.error('Error during user signin:', e); 
      return c.text('User invalid');
    } 
  });
  