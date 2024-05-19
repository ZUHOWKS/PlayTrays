import type {MatchmakingResponse} from "@/modules/utils/matchmaking/MatchmakingResponse";

export default class PTMatchmaking {
    response: MatchmakingResponse = {message: ''};
    canStart: boolean = false;
    isInQueue: boolean = false;
}