import { extname } from "path";
import { diskStorage } from "multer";

function safeFileName( originalName: string ): string {
    const base = originalName
        .replace(extname(originalName), '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
    return base || 'scrim';
}

export const scrimMulterOptions = {
    storage: diskStorage({
        destination: './uploads/scrims',
        filename: (req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${safeFileName(file.originalname)}-${unique}${extname(file.originalname)}` );
        },
    }),
};