export type EONHubResponse = {
    status: number
    data: any
    message: string | undefined
}

export type MinusEonPointRequest = {
    email: string
    eonPoint: number
}