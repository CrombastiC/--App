import { Multer } from 'multer';

declare global {
  namespace Express {
    interface MulterFile extends Multer.File {}
  }
}

export {};
