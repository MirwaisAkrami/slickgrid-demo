import { Injectable } from "@angular/core";


import type {
    // enums/interfaces
    BackendService,
    Column,
    ColumnFilter,
    ColumnFilters,
    ColumnSort,
    CurrentFilter,
    CurrentPagination,
    CurrentSorter,
    FilterChangedArgs,
    GridOption,
    MultiColumnSort,
    Pagination,
    PaginationChangedArgs,
    PaginationCursorChangedArgs,
    SortDirectionString,
    BackendServiceOption,
    OperatorString,
    SearchTerm,
    SharedService,
    SingleColumnSort,
    SlickGrid,
} from '@slickgrid-universal/common';
import {
    CaseType,
    FieldType,
    mapOperatorByFieldType,
    OperatorType,
    parseUtcDate,
    SortDirection,
} from '@slickgrid-universal/common';
import { getHtmlStringOutput, stripTags, titleCase } from '@slickgrid-universal/utils';
import { BackendQueryBuilderService } from "./custom-backend-querybuilder.service";

@Injectable({
    providedIn: 'root'
})
export class CustomBackendService implements BackendService {

    DEFAULT_ITEMS_PER_PAGE = 25;
    DEFAULT_PAGE_SIZE = 2;

    protected _currentFilters: CurrentFilter[] = [];
    protected _currentPagination: CurrentPagination | null = null;
    protected _currentSorters: CurrentSorter[] = [];
    protected _columnDefinitions: Column[] = [];
    protected _grid: SlickGrid | undefined;
    protected _backendService!: BackendQueryBuilderService;
    pagination: Pagination | undefined;
    defaultOptions = {
        pageIndex: 0,
        top: this.DEFAULT_PAGE_SIZE,
        filters: []
    };

    protected get _gridOptions(): GridOption {
        return this._grid?.getOptions() ?? {} as GridOption;
    }

    get backendService(): BackendQueryBuilderService {
        return this._backendService;
    }

    options?: BackendServiceOption | undefined;

    get columnDefinitions(): Column[] {
        return this._columnDefinitions;
    }

    constructor() {
        this._backendService = new BackendQueryBuilderService();
    }

    buildQuery(serviceOptions?: BackendServiceOption) {
        return this._backendService.buildQuery();
    }

    postProcess(processResult: unknown) {
        console.log('Process result: [PostProcess]: ', processResult);
        // this._gridOptions.datase
    }


    clearFilters() {
        this._currentFilters = [];
        this.updateFilters([]);
    }


    clearSorters() {
        this._currentSorters = [];
        this.updateSorters([]);
    }

    init(serviceOptions?: BackendServiceOption | any, pagination?: Pagination, grid?: SlickGrid, sharedService?: SharedService) {
        this._grid = grid;
        const mergedOptions = { ...this.defaultOptions, ...serviceOptions };

        // unless user specifically set "enablePagination" to False, we'll add "top" property for the pagination in every other cases
        if (this._gridOptions && !this._gridOptions.enablePagination) {
            // save current pagination as Page 1 and page size as "top"
            this._backendService.options = { ...mergedOptions, top: undefined };
            this._currentPagination = null;
        } else {
            const topOption = (pagination && pagination.pageSize) ? pagination.pageSize : this.defaultOptions.top;
            this._backendService.options = { ...mergedOptions, top: topOption };
            this._currentPagination = {
                pageNumber: 1,
                pageSize: this._backendService.options.top || this.defaultOptions.top || this.DEFAULT_PAGE_SIZE
            };
        }

        this.options = this._backendService.options;
        this.pagination = pagination;

        if (grid?.getColumns) {
            const tmpColumnDefinitions = sharedService?.allColumns ?? grid.getColumns() ?? [];
            this._columnDefinitions = tmpColumnDefinitions.filter((column: Column) => !column.excludeFromQuery);
        }

        this._backendService.columnDefinitions = this._columnDefinitions;
        this._backendService.datasetIdPropName = this._gridOptions.datasetIdPropertyName || 'id';
        console.log('init called');
    }


    // getDatasetName() {
    //     console.log('getDatasetName called');
    //     return "item";
    // }

    removeColumnFilter(fieldName: string): void {
        this._backendService.removeColumnFilter(fieldName);
    }

    backend(): ColumnFilters | CurrentFilter[] {
        return this._currentFilters;
    }

    getCurrentPagination(): CurrentPagination | null {
        return this._currentPagination;
    }

    getCurrentSorters(): CurrentSorter[] {
        console.log('getCurrentSorters called');
        return this._currentSorters;
    }

    resetPaginationOptions() {
        this._backendService.updateOptions({
            pageIndex: 0
        });
    }


    saveColumnFilter(fieldName: string, value: string, terms?: SearchTerm[]): void {
        this._backendService.saveColumnFilter(fieldName, value, terms);
    }

    updateFilters(columnFilters: ColumnFilters | CurrentFilter[]) {
        console.log('columnFilters called');
    }

    updatePagination(newPage: number, pageSize: number): void {
        this._currentPagination = {
            pageNumber: newPage,
            pageSize,
        };

        // unless user specifically set "enablePagination" to False, we'll update pagination options in every other cases
        if (this._gridOptions && (this._gridOptions.enablePagination || !this._gridOptions.hasOwnProperty('enablePagination'))) {
            this._backendService.updateOptions({
                top: pageSize,
                pageIndex: newPage - 1
            });
        }
    }

    updateSorters(sortColumns?: Array<SingleColumnSort>, presetSorters?: CurrentSorter[]) {
        console.log('updateSorters called');
    }

    updateOptions(serviceOptions?: Partial<BackendServiceOption>) {
        console.log('Update options: ', serviceOptions);
        
        this.options = { ...this.options, ...serviceOptions };
        this._backendService.options = this.options;
    }

    processOnFilterChanged(event: Event | KeyboardEvent | undefined, args: FilterChangedArgs) {
        const gridOptions: GridOption = this._gridOptions;
        const backendApi = gridOptions.backendServiceApi;

        if (backendApi === undefined) {
            throw new Error('Something went wrong in the GridOdataService, "backendServiceApi" is not initialized');
        }

        // keep current filters & always save it as an array (columnFilters can be an object when it is dealt by SlickGrid Filter)
        this._currentFilters = this.castFilterToColumnFilters(args.columnFilters);

        if (!args || !args.grid) {
            throw new Error('Something went wrong when trying create the GridOdataService, it seems that "args" is not populated correctly');
        }

        // loop through all columns to inspect filters & set the query
        this.updateFilters(args.columnFilters);

        this.resetPaginationOptions();
        return this._backendService.buildQuery();
    }

    processOnPaginationChanged(_event: Event | undefined, args: PaginationChangedArgs): string {
        console.log('Page Changed: ', args);
        
        const top = +(args.pageSize || ((this.pagination) ? this.pagination.pageSize : this.DEFAULT_PAGE_SIZE));
        this.updatePagination(args.newPage, top);

        // build the OData query which we will use in the WebAPI callback
        return this._backendService.buildQuery();
    }


    processOnSortChanged(event: Event | undefined, args: SingleColumnSort | MultiColumnSort) {
        console.log('processOnSortChanged called');

        return "";
    }

    mapDataOperator(operator: string): string {
        let map = '';
        switch (operator) {
            case '<':
                map = 'lt';
                break;
            case '<=':
                map = 'le';
                break;
            case '>':
                map = 'gt';
                break;
            case '>=':
                map = 'ge';
                break;
            case '<>':
            case '!=':
                map = 'ne';
                break;
            case '=':
            case '==':
            default:
                map = 'eq';
                break;
        }

        return map;
    }

    protected castFilterToColumnFilters(columnFilters: ColumnFilters | CurrentFilter[]): CurrentFilter[] {
        // keep current filters & always save it as an array (columnFilters can be an object when it is dealt by SlickGrid Filter)
        const filtersArray: ColumnFilter[] = (typeof columnFilters === 'object') ? Object.keys(columnFilters).map(key => (columnFilters as any)[key]) : columnFilters;

        if (!Array.isArray(filtersArray)) {
            return [];
        }

        return filtersArray.map((filter) => {
            const tmpFilter: CurrentFilter = { columnId: filter.columnId || '' };
            if (filter.operator) {
                tmpFilter.operator = filter.operator;
            }
            if (filter.targetSelector) {
                tmpFilter.targetSelector = filter.targetSelector;
            }
            if (Array.isArray(filter.searchTerms)) {
                tmpFilter.searchTerms = filter.searchTerms;
            }
            return tmpFilter;
        });
    }
}
