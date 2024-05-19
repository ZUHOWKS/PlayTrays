

export interface MatchmakingResponse {
    message: string
}

export interface MatchmakingError extends MatchmakingResponse {
    message: string
    error_type: string
}