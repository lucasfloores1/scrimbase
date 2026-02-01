import { diskStorage } from "multer"
import { extname } from "path"

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
}