import { FieldType } from './field-type';
import { IField } from '../interfaces/item/ifield.interface';
import { IContentItem } from '../interfaces/item/icontent-item.interface';
import { IAsset, IMultipleChoiceOption } from './field-interfaces';
import { AssetModel, MultipleChoiceOption } from './field-models';
import { Parse5Attribute, Parse5Node } from './internal-models';
import { RichTextResolver } from './rich-text-resolver.class';

export class TextField implements IField {

    /**
    * Text stored in the field
    */
    public text: string;

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.text;

    /**
    * Represents text field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    */
    constructor(
        public name: string,
        public value: any
    ) {
        this.text = this.value;
    };
}

export class MultipleChoiceField implements IField {

    /**
    * Multiple choice options
    */
    public options: MultipleChoiceOption[] = [];

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.multiple_choice;

    /**
    * Represents multiple choice field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    */
    constructor(
        public name: string,
        public value: any
    ) {
        if (this.value) {
            if (Array.isArray(this.value)) {
                this.value.forEach(option => {
                    var optionTemp = option as IMultipleChoiceOption;
                    this.options.push(new MultipleChoiceOption(
                        optionTemp.name,
                        optionTemp.codename
                    ));
                });
            }
        }
    };
}


export class DateTimeField implements IField {

    /**
    * Date time value
    */
    public datetime: Date;

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.datetime;

    /**
    * Represents date time field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    */
    constructor(
        public name: string,
        public value: any
    ) {
        this.datetime = new Date(value);
    };
}

export class RichTextField implements IField {

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.rich_text;

    /**
     * Resolved html in field - store here once the html was resolved to avoid resolving it multiple times
     */
    private resolvedHtml: string;

    /**
    * List of modular content items used in this rich text field
    */
    public items: IContentItem[] = [];

    /**
    * Represents rich text field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    * @param {boolean} enableAdvancedLogging - Indicates if advanced issues are logged in console
    * @param {<IContentItem>(item: IContentItem) => string} richTextResolverDefinedByQuery - If set, this resolved will be used to resolve modular content instead of the ones defined in model classes
    */
    constructor(
        public name: string,
        public value: any,
        public modularItems: IContentItem[],
        public enableAdvancedLogging: boolean,
        public richTextResolverDefinedByQuery?: <IContentItem>(item: IContentItem) => string
    ) {
        this.items = modularItems;
    };

    getHtml(): string {
        // check if html was already resolved
        if (this.resolvedHtml) {
            return this.resolvedHtml;
        }

        var richTextHelper = new RichTextResolver(this.value, this.modularItems, this.enableAdvancedLogging, this.richTextResolverDefinedByQuery)
        this.resolvedHtml = richTextHelper.resolveHtml();

        return this.resolvedHtml;
    }
}

export class NumberField implements IField {

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.number;

    /**
    * Number value of this field
    */
    public number: number;

    /**
    * Represents number field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    */
    constructor(
        public name: string,
        public value: any
    ) {
        this.number = value;
    };
}

export class AssetsField implements IField {

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.asset;

    /**
    * List of assets used in this field
    */
    public assets: AssetModel[] = [];

    /**
    * Represents asset field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    */
    constructor(
        public name: string,
        public value: any
    ) {
        if (this.value) {
            if (Array.isArray(this.value)) {
                this.value.forEach(asset => {
                    var assetTemp = asset as IAsset;
                    this.assets.push(new AssetModel(
                        assetTemp.name,
                        assetTemp.type,
                        assetTemp.size,
                        assetTemp.description,
                        assetTemp.url
                    ));
                });
            }
        }
    };
}

export class UrlSlugField implements IField {

    /**
    * Type of the field
    */
    public type: FieldType = FieldType.url_slug;

    /**
    * Resolved Url of the item
    */
    public url: string;

    /**
    * Represents URL slug field of Kentico Cloud item
    * @constructor
    * @param {string} name - Name of the field
    * @param {string} value - Value of the field
    * @param {string} contentItemType - Type of the content item
    * @param {(contentItem: IContentItem, urlSlug: string) => string} urlSlugResolver - Callback used to resolve URL slug of the item with type
    * @param {boolean} enableAdvancedLogging - Indicates if advanced issues are logged in console
    */
    constructor(
        public name: string,
        public value: string,
        public contentItem: IContentItem,
        public urlSlugResolver: (contentItem: IContentItem, urlSlug: string) => string,
        public enableAdvancedLogging: boolean
    ) {
        this.url = this.getUrl();
    };

    private getUrl(): string {
        if (!this.urlSlugResolver && this.enableAdvancedLogging) {
            console.log(`You have to implement 'urlSlugResolver' in your Model class or your query in order to get url of this item`);
            return;
        }

        var url = this.urlSlugResolver(this.contentItem, this.value);

        if (!url && this.enableAdvancedLogging) {
            console.log(`'urlSlugResolver' is configured, but url resolved for '${this.contentItem.system.type}' type was resolved to empty string`);
        }

        return url;
    }
}
