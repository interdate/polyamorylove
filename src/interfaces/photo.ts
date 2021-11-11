export interface Photo {
    allowToSee?: Boolean;
    cropedImage?: string;
    id: number;
    isValid: boolean;
    isMain: boolean;
    isPrivate: boolean;
    url: string;
    face: string;
}
