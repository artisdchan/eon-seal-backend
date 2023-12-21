export type UpReactorRequest = {
    priceType: string
}

export type ReactorListResponse = {
    reactorName: string
    reactorLevel: number
    priceEon: number
    priceCp: number
    reactorDetails: ReactorDetailResponse[]
}

export type ReactorDetailResponse = {
    itemName: string
    itemBag: string
    itemPictureUrl: string
}
