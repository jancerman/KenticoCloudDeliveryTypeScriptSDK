// config
import { DeliveryClientConfig } from '../config/delivery-client.config';

// rxjs
import { Observable } from 'rxjs/Rx'; // import from 'rxjs/rx' instead of 'rxjs/Observable' to include 'throw' method
import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/observable/throw';

// models
import { DeliveryItemListingResponse, DeliveryItemResponse } from '../models/item/responses';
import { ICloudResponseSingle, ICloudResponseMultiple } from '../interfaces/item/cloud-responses';
import { Pagination } from '../models/common/pagination.class';
import { IContentItem } from '../interfaces/item/icontent-item.interface';
import { ICloudMultipleTypeResponse, ICloudSingleTypeResponse } from '../interfaces/type/cloud-responses';
import { IQueryParameter } from '../interfaces/common/iquery-parameter.interface';
import { DeliveryTypeListingResponse, DeliveryTypeResponse } from '../models/type/responses';
import { IItemQueryConfig } from '../interfaces/item/iitem-query.config';
import { IHeader } from '../interfaces/common/iheader.interface';
import { Header } from '../models/common/header.class';

// services
import { ItemMapService } from '../services/item-map.service';
import { TypeMapService } from '../services/type-map.service';

export abstract class QueryService {

    /**
    * Base Url to Kentico Delivery API
    */
    private baseDeliveryApiUrl: string = 'https://deliver.kenticocloud.com';

    /**
    * Preview url to Kentico Delivery API
    */
    private previewDeliveryApiUrl: string = 'https://preview-deliver.kenticocloud.com';

    protected itemMapService: ItemMapService;
    protected typeMapService: TypeMapService;

    constructor(
        protected config: DeliveryClientConfig
    ) {
        this.itemMapService = new ItemMapService(config);
        this.typeMapService = new TypeMapService(config);
    }

    private isPreviewModeEnabled(queryConfig: IItemQueryConfig): boolean {
        if (queryConfig.usePreviewMode != null) {
            return queryConfig.usePreviewMode;
        }

        return this.config.enablePreviewMode === true;
    }

    private getDeliveryUrl(queryConfig: IItemQueryConfig): string {
        if (this.isPreviewModeEnabled(queryConfig)) {

            if (!this.config.previewApiKey) {
                throw Error(`You have to configure 'previewApiKey' to use 'preview' mode`);
            }

            return this.previewDeliveryApiUrl;
        }
        return this.baseDeliveryApiUrl;
    }

    private getBaseUrl(queryConfig: IItemQueryConfig): string {
        return this.getDeliveryUrl(queryConfig) + '/' + this.config.projectId;
    }

    private addOptionsToUrl(url: string, options?: IQueryParameter[]): string {
        if (options) {
            options.forEach(filter => {
                if (url.indexOf('?') > -1) {
                    url = url + '&' + filter.GetParam() + '=' + filter.GetParamValue();
                }
                else {
                    url = url + '?' + filter.GetParam() + '=' + filter.GetParamValue();
                }
            });
        }
        return url;
    }

    private handleError(error: Response | any): any {
        if (this.config.enableAdvancedLogging) {
            console.error(error);
        }
        return error;
    }

    protected getSingleTypeResponse(json: any): DeliveryTypeResponse {
        var cloudResponse = json as ICloudSingleTypeResponse;

        // map type
        var type = this.typeMapService.mapSingleType(cloudResponse);

        return new DeliveryTypeResponse(type);
    }

    protected getMultipleTypeResponse(json: any, options?: IQueryParameter[]): DeliveryTypeListingResponse {
        var cloudResponse = json as ICloudMultipleTypeResponse;

        // map types
        var types = this.typeMapService.mapMultipleTypes(cloudResponse);

        // pagination
        var pagination = new Pagination(
            cloudResponse.pagination.skip,
            cloudResponse.pagination.limit,
            cloudResponse.pagination.count,
            cloudResponse.pagination.next_page
        );

        return new DeliveryTypeListingResponse(types, pagination);
    }

    protected getHeadersInternal(queryConfig: IItemQueryConfig): IHeader[] {
        var headers: IHeader[] = [];

        if (this.isPreviewModeEnabled(queryConfig)) {
            // authorization header required for preview mode
            headers.push(new Header('authorization', `bearer ${this.config.previewApiKey}`));
        }
        return headers;
    }

    protected getHeadersJson(queryConfig: IItemQueryConfig): any{
        var headerJson: any = {};
        var headers = this.getHeadersInternal(queryConfig);
        headers.forEach(header => {
            headerJson[header.header] = header.value;
        });

        return headerJson;
    }

    protected getUrl(action: string, queryConfig: IItemQueryConfig, options?: IQueryParameter[]): string {
        return this.addOptionsToUrl(this.getBaseUrl(queryConfig) + action, options);
    }

    protected getSingleResponse<TItem extends IContentItem>(json: any, queryConfig: IItemQueryConfig): DeliveryItemResponse<TItem> {
        var cloudResponse = json as ICloudResponseSingle;

        // map item
        var item = this.itemMapService.mapSingleItem<TItem>(cloudResponse, queryConfig);

        return new DeliveryItemResponse(item);
    }

    protected getMultipleResponse<TItem extends IContentItem>(json: any, queryConfig: IItemQueryConfig): DeliveryItemListingResponse<TItem> {
        var cloudResponse = json as ICloudResponseMultiple;

        // map items
        var items = this.itemMapService.mapMultipleItems<TItem>(cloudResponse, queryConfig);

        // pagination
        var pagination = new Pagination(
            cloudResponse.pagination.skip,
            cloudResponse.pagination.limit,
            cloudResponse.pagination.count,
            cloudResponse.pagination.next_page
        );

        return new DeliveryItemListingResponse(items, pagination);
    }

    protected getSingleItem<TItem extends IContentItem>(url: string, queryConfig: IItemQueryConfig): Observable<DeliveryItemResponse<TItem>> {
        return ajax.getJSON(url, this.getHeadersJson(queryConfig))
            .map(json => {
                return this.getSingleResponse<TItem>(json, queryConfig)
            })
            .catch(err => {
                return Observable.throw(this.handleError(err));
            });
    }

    protected getMultipleItems<TItem extends IContentItem>(url: string, queryConfig: IItemQueryConfig): Observable<DeliveryItemListingResponse<TItem>> {
        return ajax.getJSON(url, this.getHeadersJson(queryConfig))
            .map(json => {
                return this.getMultipleResponse(json, queryConfig)
            })
            .catch(err => {
                return Observable.throw(this.handleError(err));
            });
    }

    protected getSingleType(url: string): Observable<DeliveryTypeResponse> {
        return ajax.getJSON(url)
            .map(json => {
                return this.getSingleTypeResponse(json)
            })
            .catch(err => {
                return Observable.throw(this.handleError(err));
            });
    }

    protected getMultipleTypes(url: string): Observable<DeliveryTypeListingResponse> {
        return ajax.getJSON(url)
            .map(json => {
                return this.getMultipleTypeResponse(json)
            })
            .catch(err => {
                return Observable.throw(this.handleError(err));
            });
    }
}