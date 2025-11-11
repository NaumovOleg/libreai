import { GraphWorkflow } from './workflow';

const workflow = new GraphWorkflow();

workflow.exec({
  request: 'Delete method "getBookById" .',
  fileTree: [
    '.env',
    '.gitignore',
    'app.ts',
    'config/.gitkeep',
    'package.json',
    'src/controllers/bookController.ts',
    'src/controllers/bookRoutes.ts',
    'src/controllers/eventController.ts',
    'src/controllers/eventRoutes.ts',
    'src/controllers/userController.ts',
    'src/db/mongodb.ts',
    'src/middlewares/authMiddleware.ts',
    'src/scan.py',
    'src/schemas/book.schema_copy.ts',
    'src/schemas/event.schema.ts',
    'src/schemas/user.schema.ts',
    'src/services/bookService.ts',
    'src/services/eventService.ts',
    'src/services/test.json',
    'src/services/test.ts',
    'src/services/userService.ts',
    'src/services/wwww.ts',
    'test.vsix',
    'test/.gitkeep',
  ],
  language: 'typescript',
});
