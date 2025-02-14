import { Injectable } from '@angular/core';
import {SelectModalPage} from './select-modal/select-modal.page';
import {ModalController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FormService {




  constructor(
      private modalCtrl: ModalController,
  ) {}

  async openSelect2(form, fieldTitle, usersChooses) {

    const field = form[fieldTitle];
    const isMultipleField = Array.isArray(field.value);
    const searchField = field.choices.length > 20;

    console.log(field);
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

    modal.onDidDismiss().then(data => {
      console.log(data);
      if (typeof data.data == 'object') {

        if (isMultipleField) {
          const value = [];
          let label = '';

          for (const key of data.data) {
            if(typeof key == 'object') {
              value.push(key.value);
              label += label === '' ? key.label : ', ' + key.label;
            }
          }

          form[fieldTitle].value = value;
          usersChooses[fieldTitle] = label;
        } else {
          form[fieldTitle].value = data.data.value;
          usersChooses[fieldTitle] = data.data.label;
          console.log(usersChooses);
        }
      }else {
        if (data.data === '') {
          form[fieldTitle].value = '';
          usersChooses[fieldTitle] = '';
        }
      }
    });

  }


  getValueLabel(form, field, usersChooses) {
    let label = '';

    if (Array.isArray(form[field].value)) {
      for (const value in form[field].value) {
        if (field === 'lookingFor') {
          console.log(value);
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
