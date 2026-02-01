import { CreateScrimDto } from "../dto/create-scrim.dto";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ScrimType } from "../enums/scrim-type.enum";

type CreateScrimWithOutcome = CreateScrimDto & { outcome: ScrimOutcome };

@Injectable()
export class ComputeScrimResultPipe implements PipeTransform {
    
    transform(value: CreateScrimDto): CreateScrimWithOutcome {

        const totalRounds = value.teamRounds + value.enemyRounds;

        if (totalRounds > 24) {
            throw new BadRequestException('Total rounds cannot exceed 24');
        }

        const isDraw = value.teamRounds === value.enemyRounds;

        if (value.type !== ScrimType.SCRIM && isDraw) {
            throw new BadRequestException('Only SCRIM type scrims can end in a draw');
        }

        if (value.type !== ScrimType.SCRIM) {
            const maxRounds = Math.max(value.teamRounds, value.enemyRounds);
            const diff = Math.abs(value.teamRounds - value.enemyRounds);

            if (maxRounds < 13) {
                throw new BadRequestException('Premier and Tournament matches must have at least one team reach 13 rounds');
            }

            if (diff < 2) {
                throw new BadRequestException('Premier and Tournament matches must be won by at least a 2 round difference');
            }
        }
            const outcome = isDraw ? ScrimOutcome.DRAW : value.teamRounds > value.enemyRounds ? ScrimOutcome.WIN : ScrimOutcome.LOSS;

            return { ...value, outcome };
    }
}
