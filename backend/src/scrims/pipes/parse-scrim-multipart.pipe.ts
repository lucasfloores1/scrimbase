import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseScrimMultipartPipe implements PipeTransform {
    transform(value: any) {
        //numbers
        if (typeof value.teamRounds == 'string') value.teamRounds = Number(value.teamRounds)
        if (typeof value.enemyRounds == 'string') value.enemyRounds = Number(value.enemyRounds)

        //JSON fields
        value.teamStats = this.parseJsonField(value.teamStats, 'teamStats');
        value.enemyComposition = this.parseJsonField(value.enemyComposition, 'enemyComposition')

        return value
    }

    private parseJsonField(field: any, name: string) {
        if (field === undefined || field == null) return field;

        if (Array.isArray(field) || typeof field === 'object') return field;

        if (typeof field !== 'string') {
            throw new BadRequestException(`${name} must be a JSON string`)
        }

        try {
            return JSON.parse(field);            
        } catch {
            throw new BadRequestException(`${name} must be valid JSON`);
        }
    }
}