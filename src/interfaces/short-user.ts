export interface ShortUser {
    id?: number;
    hide?: boolean;
    canWriteTo: boolean;
    isPaying: boolean;
    isOnline: boolean;
    isNew: boolean;
    isVerify: boolean;
    isAddLike: boolean;
    isAddFavorite: boolean;
    isAddBlackListed: boolean;
    isVip: boolean;
    photo: string;
    url?: string; // url = copy of photo
    username: string;
    age: number;
    country_name: string;
    region_name: string;
    area_name: string;
    distance: string;
}
