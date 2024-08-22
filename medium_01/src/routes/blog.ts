import { Hono } from 'hono';
import { Prisma, PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt';

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string; 
        JWT_SECRET: string; 
    }
}>(); 

blogRouter.use("/*", (c,next) => {
    // extract the user id and pass it down to route handler 
    next(); 
})
blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Added logging for better debugging
    }).$extends(withAccelerate());
    
   const blog = await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content, 
            authorId: 1
        }
    })
    return c.json({
        id: blog.id
    });
  });
  
blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Added logging for better debugging
    }).$extends(withAccelerate());
    
   const blog = await prisma.blog.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content, 
        }
    })
    return c.json({
        id: blog.id
    });
});
  
blogRouter.get('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Added logging for better debugging
    }).$extends(withAccelerate());
    try{ 
        const blog = await prisma.blog.findFirst({
            where: {
                id: body.id
            },
        })
        return c.json({
            blog
        });
    } catch(e){
        c.status(411); 
        return c.json({
            message: "Error while fetching the blog"
        })
    }
   
});

blogRouter.get('/bulk', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
      log: ['query', 'info', 'warn', 'error'], // Added logging for better debugging
    }).$extends(withAccelerate());  
    const blogs = await prisma.blog.findMany(); 

    return c.json({
        blogs
    })
});
  