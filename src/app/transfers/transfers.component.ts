import { RouterOutlet } from '@angular/router';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularGridInstance } from 'angular-slickgrid';
import { Column, GridOption, GridStateChange, Metrics, Pagination } from 'angular-slickgrid';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { TransactionService } from '../transaction.service';
import { CustomBackendService } from '../custom-backend.service';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {
  title = 'slick-demo';
  grid!: AngularGridInstance;
  darkMode!: any;
  columns: Column[] = [];
  gridOptions!: GridOption;
  dataset!: any[];
  metrics!: Metrics;
  defaultPageSize!: number;
  currentPage = 0;
  totalItems = 0;
  paginationOptions!: Pagination;
  dataView = [];
  processing = true;
  errorStatus: any;
  status = { text: 'processing...', class: 'alert alert-danger' };

  constructor(
    private transactionService: TransactionService,
    private customBackendService: CustomBackendService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.defaultPageSize = this.customBackendService.DEFAULT_PAGE_SIZE
    this.prepareGrid();
    // this.getTransfers(1, this.defaultPageSize);
  }

  getPagedTransfers(query: any) {
    console.log('Testing query', query);
    query.pageSize = query.top;
    return this.transactionService.searchTransfers(query);
  }

  prepareGrid() {
    this.columns = [
      { id: 'id', name: 'Id', field: 'id', sortable: false },
      { id: 'amount', name: 'Amount', field: 'amount', sortable: true },
      { id: 'sender', name: 'From', field: 'sender/panNumber', sortable: true },
      { id: 'recipient', name: 'To', field: 'recipient/panNumber', sortable: true },
      { id: 'note', name: 'Note', field: 'note', sortable: true }
    ];

    this.darkMode = this.isBrowserDarkModeEnabled();

    this.gridOptions = {
      enableAutoResize: true,
      enableSorting: true,
      autoResize: {
        container: '#transfers-container',
        rightPadding: 10
      },
      checkboxSelector: {
        // you can toggle these 2 properties to show the "select all" checkbox in different location
        hideInFilterHeaderRow: false,
        hideInColumnTitleRow: true
      },
      compoundOperatorAltTexts: {
        // where '=' is any of the `OperatorString` type shown above
        text: { 'Custom': { operatorAlt: '%%', descAlt: 'SQL Like' } },
      },
      enableCellNavigation: true,
      enableFiltering: true,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      enablePagination: true,
      pagination: {
        pageNumber: 1,
        pageSizes: [1, 2, 10, 20, 50, 100, 500, 50000],
        pageSize: this.defaultPageSize,
        totalItems: 0
      },
      presets: {
        pagination: { pageNumber: 1, pageSize: this.defaultPageSize }
      },
      backendServiceApi: {
        service: new CustomBackendService(),
        onError: (error: Error) => {
          console.log('error occurred: ', error);
          this.errorStatus = error.message;
          this.displaySpinner(false, true);
        },
        preProcess: () => {
          this.errorStatus = '';
          this.displaySpinner(true);
        },
        process: (query) => this.getPagedTransfers(query),
        postProcess: (data) => {
          console.log('Post Process data: ', data);
          this.metrics = data.metrics;
          this.displaySpinner(false);
          this.getTransfersCallback(data);
        }
      }
    }
  }


  displaySpinner(isProcessing: boolean, isError?: boolean) {
    this.processing = isProcessing;
    if (isError) {
      this.status = { text: 'ERROR!!!', class: 'alert alert-danger' };
    } else {
      this.status = (isProcessing)
        ? { text: 'loading', class: 'alert alert-warning' }
        : { text: 'finished', class: 'alert alert-success' };
    }
    this.cd.detectChanges();
  }

  getTransfersCallback(response: any) {
    console.log('Data: ', response);
    if (!response.isSuccess) {
      return
    }

    this.metrics.totalItemCount = response.data.totalElements;
    this.paginationOptions = { ...this.gridOptions.pagination, totalItems: response.data.totalElements } as Pagination;
    this.dataset = response.data.content;
    console.log('Grid Options: ', this.gridOptions);
    // console.log('Grid: ', this.grid.paginationService?.changeItemPerPage(10, true));

  }

  isBrowserDarkModeEnabled() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  angularGridReady(event: AngularGridInstance) {
    console.log('Grid is ready: ', event);
    this.grid = event;
    this.grid.eventPubSubService?.subscribe('onBeforePaginationChange', (e) => {
      console.log('Newest event [onBeforePaginationChange]: ', e);
    });

    this.grid.eventPubSubService?.subscribe('onPagingInfoChanged', (e) => {
      console.log('Newest event [onPagingInfoChanged]: ', e);
    });

  }

  gridStateChanged(gridStateChanges: GridStateChange) {
    // console.log('Client sample, Grid State changed:: ', gridStateChanges);
    console.log('Client sample, Grid State changed:: ', gridStateChanges);
  }

  handleOnBeforePaginationChange(e: Event) {
    console.log(e);
    // e.preventDefault();
    // return false;
    return true;
  }

  onPagingInfoChanged(e: any) {
    console.log(e);
  }
}
