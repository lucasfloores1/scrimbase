import { diskStorage } from "multer"
import { extname } from "path"
import { BadRequestException } from "@nestjs/common";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFileName( originalName : string ) : string {
    const base = originalName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/-+/g, '-')
    .slice(0, 50)

    return base || 'strat'
}

export const stratMulterOptions = {
    storage : diskStorage({
        destination : './uploads/strats',
        filename : ( req , file , cb ) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${safeFileName(file.originalname)}-${unique}${extname(file.originalname)}`)
        }
    }),
    limits: {
    fileSize: 8 * 1024 * 1024,
    },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (!ALLOWED_MIMES.has(file.mimetype)) {
        return cb(
            new BadRequestException(
            `Invalid file type: ${file.mimetype}. Allowed: image/jpeg, image/png, image/webp`
            ),
            false
        );
        }
        cb(null, true);
    },
}