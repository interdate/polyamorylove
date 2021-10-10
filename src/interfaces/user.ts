import {SingeUserProperty} from './singe-user-property';
import {Photo} from "./photo";

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
    hebrewUsername: boolean;
    isAddBlackListed: boolean;
    isAddFavorite: boolean;
    isAddLike: boolean;
    isAddVerify: boolean;
    isNew: boolean;
    isOnline: boolean;
    isPaying: boolean;
    isVip: boolean;
    isVerify: boolean;
    noPhoto: string;
    photoStatus: string;
    photos: Photo[];
    textCantWrite: string;
    texts: any;
    username: string;
}
