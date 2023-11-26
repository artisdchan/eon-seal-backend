export type PaginationAndDataResponse = {
    status: number
    data: any
    metadata: PaginationResponse
}

export type PaginationResponse = {
    page: number
    totalPage: number
    totalCount: number
    perPage: number
}

export function getOffSet(page: number, perPage: number) : number {
    if (!page || !perPage) return 0;
    
    return (Number(page) - 1) * Number(perPage);
}

export function getPageination(perPage: number, totalCount: number, page: number) : PaginationResponse {
    return {
        totalPage: Math.ceil(Number(totalCount) / Number(perPage)),
        totalCount: totalCount,
        perPage: perPage,
        page: page
    }
}