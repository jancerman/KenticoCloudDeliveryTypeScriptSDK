import { ContentItem, TextField, NumberField, AssetsField, RichTextField, DateTimeField } from '../../../lib';

export class Character extends ContentItem {
  public name: TextField;
  public someNumber: NumberField;
  public someDateTime: DateTimeField;
  public someRichText: RichTextField;

  constructor() {
    super({
      resolver: ((fieldName: string) => {
        if (fieldName === 'somenumber') {
          return 'someNumber';
        }
        else if (fieldName === 'somedate') {
          return 'someDateTime';
        }
        else if (fieldName === 'somerichtext') {
          return 'someRichText';
        }}),
        richTextResolver: (item: Character) => {
          return `<h3>${item.name.text}</h3>`;
        }
      })
    }
}

