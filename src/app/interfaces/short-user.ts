export interface ShortUser {
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
    username: string;
    age: number;
    region_name: string;
    distance: string;
}
