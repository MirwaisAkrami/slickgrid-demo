import { CaseType, type Column } from '@slickgrid-universal/common';
import { titleCase } from '@slickgrid-universal/utils';
import { BackendOption } from './interfaces/backend-option';

export class BackendQueryBuilderService {
  _columnFilters: any;
  _defaultSortBy: string;
  _filterCount = 0;
  _backendOptions: Partial<BackendOption>;

  protected _columnDefinitions: Column[] = [];
  public set columnDefinitions(columnDefinitions: Column[]) {
    this._columnDefinitions = columnDefinitions;
  }

  protected _datasetIdPropName = 'id';
  public set datasetIdPropName(datasetIdPropName: string) {
    this._datasetIdPropName = datasetIdPropName;
  }

  constructor() {
    this._backendOptions = {
      filters: []
    };
    this._defaultSortBy = '';
    this._columnFilters = {};
  }

  /*
    * Build the OData query string from all the options provided
    * @return string OData query
    */
  buildQuery(): any {
    if (!this._backendOptions) {
      throw new Error('Backend Service requires certain options like "top" for it to work');
    }
    
    return {
      top: this._backendOptions.top,
      pageIndex: this._backendOptions.pageIndex,
      filters: this._backendOptions.filters
    };
  }


  // buildQuery(): string {
  //   if (!this._backendOptions) {
  //     throw new Error('Backend Service requires certain options like "top" for it to work');
  //   }
  //   this._backendOptions.filterQueue = [];
  //   const queryTmpArray = [];

  //   // When enableCount is set, add it to the OData query
  //   if (this._backendOptions && this._backendOptions.enableCount === true) {
  //     const countQuery = (this._backendOptions.version && this._backendOptions.version >= 4) ? '$count=true' : '$inlinecount=allpages';
  //     queryTmpArray.push(countQuery);
  //   }

  //   if (this._backendOptions.top) {
  //     queryTmpArray.push(`$top=${this._backendOptions.top}`);
  //   }
  //   if (this._backendOptions.skip) {
  //     queryTmpArray.push(`$skip=${this._backendOptions.skip}`);
  //   }
  //   if (this._backendOptions.orderBy) {
  //     let argument = '';
  //     if (Array.isArray(this._backendOptions.orderBy)) {
  //       argument = this._backendOptions.orderBy.join(','); // csv, that will form a query, for example: $orderby=RoleName asc, Id desc
  //     } else {
  //       argument = this._backendOptions.orderBy;
  //     }
  //     queryTmpArray.push(`$orderby=${argument}`);
  //   }
  //   if (this._backendOptions.filterBy || this._backendOptions.filter) {
  //     const filterBy = this._backendOptions.filter || this._backendOptions.filterBy;
  //     if (filterBy) {
  //       this._filterCount = 1;
  //       this._backendOptions.filterQueue = [];
  //       let filterStr = filterBy;
  //       if (Array.isArray(filterBy)) {
  //         this._filterCount = filterBy.length;
  //         filterStr = filterBy.join(` ${this._backendOptions.filterBySeparator || 'and'} `);
  //       }

  //       if (typeof filterStr === 'string') {
  //         if (!(filterStr[0] === '(' && filterStr.slice(-1) === ')')) {
  //           this.addToFilterQueueWhenNotExists(`(${filterStr})`);
  //         } else {
  //           this.addToFilterQueueWhenNotExists(filterStr);
  //         }
  //       }
  //     }
  //   }
  //   if (this._backendOptions.filterQueue.length > 0) {
  //     const query = this._backendOptions.filterQueue.join(` ${this._backendOptions.filterBySeparator || 'and'} `);
  //     this._backendOptions.filter = query; // overwrite with
  //     queryTmpArray.push(`$filter=${query}`);
  //   }

  //   if (this._backendOptions.enableSelect || this._backendOptions.enableExpand) {
  //     const fields = this._columnDefinitions.flatMap(x => x.fields ?? [x.field]);
  //     fields.unshift(this._datasetIdPropName);
  //     const selectExpand = this.buildSelectExpand([...new Set(fields)]);
  //     if (this._backendOptions.enableSelect) {
  //       const select = selectExpand.selectParts.join(',');
  //       queryTmpArray.push(`$select=${select}`);
  //     }
  //     if (this._backendOptions.enableExpand) {
  //       const expand = selectExpand.expandParts.join(',');
  //       queryTmpArray.push(`$expand=${expand}`);
  //     }
  //   }

  //   // join all the odata functions by a '&'
  //   console.log('queryTmpArray: ', queryTmpArray);
    
  //   return queryTmpArray.join('&');
  // }

  getFilterCount(): number {
    return this._filterCount;
  }

  get columnFilters(): any[] {
    return this._columnFilters;
  }

  get options(): Partial<BackendOption> {
    return this._backendOptions;
  }

  set options(options: Partial<BackendOption>) {
    this._backendOptions = options;
  }

  removeColumnFilter(fieldName: string): void {
    if (this._columnFilters && this._columnFilters.hasOwnProperty(fieldName)) {
      delete this._columnFilters[fieldName];
    }
  }

  saveColumnFilter(fieldName: string, value: any, searchTerms?: any[]): void {
    this._columnFilters[fieldName] = {
      search: searchTerms,
      value
    };
  }

  /**
   * Change any OData options that will be used to build the query
   * @param object options
   */
  updateOptions(options: Partial<BackendOption>): void {
    for (const property of Object.keys(options)) {
      if (options.hasOwnProperty(property)) {
        this._backendOptions[property as keyof BackendOption] = options[property as keyof BackendOption]; // replace of the property
      }

      // we need to keep the defaultSortBy for references whenever the user removes his Sorting
      // then we would revert to the defaultSortBy and the only way is to keep a hard copy here
      if (property === 'orderBy' || property === 'sortBy') {
        let sortBy = options[property as keyof BackendOption];

        // make sure first char of each orderBy field is capitalize
        if (this._backendOptions.caseType === CaseType.pascalCase) {
          if (Array.isArray(sortBy)) {
            sortBy.forEach((field, index, inputArray) => {
              inputArray[index] = titleCase(field);
            });
          } else {
            sortBy = titleCase(options[property as keyof BackendOption]);
          }
        }
        this._backendOptions.orderBy = sortBy;
        this._defaultSortBy = sortBy;
      }
    }
  }

  // //
  // // protected functions
  // // -------------------

  // protected addToFilterQueueWhenNotExists(filterStr: string): void {
  //   if (this._backendOptions.filterQueue && this._backendOptions.filterQueue.indexOf(filterStr) === -1) {
  //     this._backendOptions.filterQueue.push(filterStr);
  //   }
  // }

  //
  // private functions
  // -------------------

  // private buildSelectExpand(selectFields: string[]): { selectParts: string[]; expandParts: string[]; } {
  //   const navigations: { [navigation: string]: string[]; } = {};
  //   const selectItems = new Set<string>();

  //   for (const field of selectFields) {
  //     const splits = field.split('/');
  //     if (splits.length === 1) {
  //       selectItems.add(field);
  //     } else {
  //       const navigation = splits[0];
  //       const properties = splits.splice(1).join('/');

  //       if (!navigations[navigation]) {
  //         navigations[navigation] = [];
  //       }

  //       navigations[navigation].push(properties);

  //       if (this._backendOptions.enableExpand && !(this._backendOptions.version && this._backendOptions.version >= 4)) {
  //         selectItems.add(navigation);
  //       }
  //     }
  //   }

  //   return {
  //     selectParts: [...selectItems],
  //     expandParts: this._backendOptions.enableExpand ? this.buildExpand(navigations) : []
  //   };
  // }

  // private buildExpand(navigations: { [navigation: string]: string[]; }): string[] {
  //   const expandParts = [];
  //   for (const navigation of Object.keys(navigations)) {
  //     if (this._backendOptions.enableSelect && this._backendOptions.version && this._backendOptions.version >= 4) {
  //       const subSelectExpand = this.buildSelectExpand(navigations[navigation]);
  //       let subSelect = subSelectExpand.selectParts.join(',');
  //       if (subSelect.length > 0) {
  //         subSelect = '$select=' + subSelect;
  //       }
  //       if (this._backendOptions.enableExpand && subSelectExpand.expandParts.length > 0) {
  //         subSelect += (subSelect.length > 0 ? ';' : '') + '$expand=' + subSelectExpand.expandParts.join(',');
  //       }
  //       if (subSelect.length > 0) {
  //         subSelect = '(' + subSelect + ')';
  //       }
  //       expandParts.push(navigation + subSelect);
  //     } else {
  //       expandParts.push(navigation);
  //     }
  //   }

  //   return expandParts;
  // }
}