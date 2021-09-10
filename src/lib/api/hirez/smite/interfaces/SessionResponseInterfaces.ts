export interface CreateSessionResponse {
    ret_msg: string,
    session_id: string,
    timestamp: string
}

export interface ServerStatus {
    entry_datetime: string,
    environment: string,
    limited_access: boolean,
    platform: string,
    ret_msg: string,
    status: string,
    version: string
}
export interface ServerStatusResponse extends Array<ServerStatus> { }

export interface PatchInfoResponse {
    ret_msg: string,
    version_string: string
}