import {Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SelectModalPage} from "./pages/select-modal/select-modal.page";
import {isNullOrUndefined} from "util";
import {isNotNullOrUndefined} from "codelyzer/util/isNotNullOrUndefined";

@Injectable({
    providedIn: 'root'
})
export class FormService {


    constructor(
        private modalCtrl: ModalController,
    ) {
    }

    async openSelect2(form, fieldTitle, usersChooses) {

        const field = form[fieldTitle];
        const isMultipleField = Array.isArray(field.value);
        const searchField = field.choices.length > 20;

        const modal = await this.modalCtrl.create({
            component: SelectModalPage,
            componentProps: {
                choices: field.choices,
                title: field.label,
                choseNow: field.value,
                search: searchField,
                multiple: isMultipleField
            }
        });
        modal.present();

        return  modal.onDidDismiss().then(data => {
            if (isNotNullOrUndefined(data.data)) {

                if (isMultipleField) {
                    const value = [];
                    let label = '';
                    for (const key of data.data) {
                        value.push(key.value);
                        label += label === '' ? key.label : ', ' + key.label;
                    }
                    form[fieldTitle].value = value;
                    usersChooses[fieldTitle] = label;
                } else {
                    form[fieldTitle].value = data.data.value;
                    usersChooses[fieldTitle] = data.data.label;
                    return data;
                }
            } else{
            }
        });

    }


    getValueLabel(form, field, usersChooses) {
        let label = '';

        if (Array.isArray(form[field].value)) {
            for (const value in form[field].value) {
                if (field === 'lookingFor') {
                }
                const field2 = form[field].choices.find(x => x.value == form[field].value[value]);
                if (field2) {
                    label += label === '' ? field2.label : ', ' + field2.label;
                }
            }

        } else {
            const field2 = form[field].choices.find(x => x.value == form[field].value);
            if (field2) {
                label += label === '' ? field2.label : ', ' + field2.label;
            }
        }

        usersChooses[field] = label;
        return label;
    }

}
