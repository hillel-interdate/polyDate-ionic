import {SingeUserProperty} from './singe-user-property';

export interface User {
    age: number;
    canWriteTo: boolean;
    form: {
        about: SingeUserProperty
        children: SingeUserProperty
        city: SingeUserProperty
        distance: string
        gender: SingeUserProperty
        region_name: SingeUserProperty
        relationshipStatus: SingeUserProperty
        relationshipType: SingeUserProperty
        relationshipTypeDetails?: string
        sexOrientationDetails?: string
        lookingForDetails?: string
        sexOrientation: SingeUserProperty
        smoking: SingeUserProperty
        body: SingeUserProperty
        height: SingeUserProperty
        lookingFor: SingeUserProperty
        origin: SingeUserProperty
        religion: SingeUserProperty
        nutrition: SingeUserProperty
        zodiac: SingeUserProperty
        looking: string
    };
    formReportAbuse: any;
    id: number;
    isAddBlackListed: boolean;
    isAddFavorite: boolean;
    isAddLike: boolean;
    isAddVerify: boolean;
    isNew: boolean;
    isOnline: boolean;
    isPaying: boolean;
    isVerify: boolean;
    noPhoto: string;
    photoStatus: string;
    photos: [{
        cropedImage: string
        face: string
        fullImage: string
        id: number
        isMain: boolean
        isPrivate: boolean
        isValid: boolean
        statusText?: string
    }];
    textCantWrite: string;
    texts: any;
    username: string;
}
