import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.STORAGE_LOCAL_DIR || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subfolder: string = 'uploads'): Promise<string> {
    const folder = path.join(this.uploadDir, subfolder);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(folder, filename);

    fs.writeFileSync(filepath, file.buffer);

    return `/files/${subfolder}/${filename}`;
  }

  async deleteFile(filepath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filepath.replace('/files/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getFileUrl(filepath: string): string {
    return filepath;
  }
}
