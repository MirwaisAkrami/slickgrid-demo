import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    TRANSACTION_URL = 'api/v1/transactions';
    TRANSFER_URL = 'api/v1/transfers';

    constructor(private http: HttpClient) { }

    backendData = {
        "data": {
            "content": [
                {
                    "id": 4733051309415,
                    "sender": {
                        "createdAt": "2024-07-17T19:55:01.073369Z",
                        "createdBy": "SYSTEM",
                        "updatedAt": "2024-07-17T19:55:01.073369Z",
                        "updatedBy": null,
                        "id": 31569490370235,
                        "panNumber": "2784278480417872",
                        "customerId": 87252947973021,
                        "currencyId": 1,
                        "customer": {
                            "createdAt": "2024-07-17T19:55:01.068369Z",
                            "createdBy": "123232132321",
                            "updatedAt": "2024-07-17T19:55:01.068369Z",
                            "updatedBy": null,
                            "id": 87252947973021,
                            "firstname": 'Jhon',
                            "lastname": 'Doe',
                            "fatherName": 'Bob',
                        }
                    },
                    "recipient": {
                        "createdAt": "2024-07-17T19:55:01.073369Z",
                        "createdBy": "SYSTEM",
                        "updatedAt": "2024-07-17T19:55:01.073369Z",
                        "updatedBy": null,
                        "id": 315694923440235,
                        "panNumber": "2784278480417872",
                        "customerId": 872523237973021,
                        "currencyId": 1,
                        "customer": {
                            "createdAt": "2024-07-17T19:55:01.068369Z",
                            "createdBy": "123232132321",
                            "updatedAt": "2024-07-17T19:55:01.068369Z",
                            "updatedBy": null,
                            "id": 87252947973021,
                            "firstname": 'Sarah',
                            "lastname": 'Dane',
                            "fatherName": 'Mike',
                        }
                    },
                    "amount": 15,
                    "note": "Transaction notes 1"
                },
                {
                    "id": 12222799851981,
                    "sender": {
                        "createdAt": "2024-07-17T19:55:01.073369Z",
                        "createdBy": "SYSTEM",
                        "updatedAt": "2024-07-17T19:55:01.073369Z",
                        "updatedBy": null,
                        "id": 31569456370235,
                        "panNumber": "2784246480417872",
                        "customerId": 87234347973021,
                        "currencyId": 1,
                        "customer": {
                            "createdAt": "2024-07-17T19:55:01.068369Z",
                            "createdBy": "123232132321",
                            "updatedAt": "2024-07-17T19:55:01.068369Z",
                            "updatedBy": null,
                            "id": 872522347973021,
                            "firstname": 'Jhon',
                            "lastname": 'Doe',
                            "fatherName": 'Bob',
                        }
                    },
                    "recipient": {
                        "createdAt": "2024-07-17T19:55:01.073369Z",
                        "createdBy": "SYSTEM",
                        "updatedAt": "2024-07-17T19:55:01.073369Z",
                        "updatedBy": null,
                        "id": 31569490370235,
                        "panNumber": "2784278480417872",
                        "customerId": 87252947973021,
                        "currencyId": 1,
                        "customer": {
                            "createdAt": "2024-07-17T19:55:01.068369Z",
                            "createdBy": "123232132321",
                            "updatedAt": "2024-07-17T19:55:01.068369Z",
                            "updatedBy": null,
                            "id": 87252947973021,
                            "firstname": 'Ahmad',
                            "lastname": 'Mahmood',
                            "fatherName": 'Abdullah',
                        }
                    },
                    "amount": 15,
                    "note": "Transaction note 2"
                }
            ],
            "pageable": {
                "pageNumber": 0,
                "pageSize": 2,
                "sort": {
                    "empty": true,
                    "unsorted": true,
                    "sorted": false
                },
                "offset": 0,
                "unpaged": false,
                "paged": true
            },
            "totalPages": 4,
            "last": false,
            "totalElements": 7,
            "size": 2,
            "number": 0,
            "sort": {
                "empty": true,
                "unsorted": true,
                "sorted": false
            },
            "first": true,
            "numberOfElements": 2,
            "empty": false
        },
        "status": "OK",
        "isSuccess": true,
        "successMessage": "",
        "errors": [],
        "validationErrors": []
    }

    searchTransctions(data: any) {
        console.log('searchTransctions called');
        return this.http.post(`${this.TRANSACTION_URL}/search`, data);
    }

    searchTransfers(data: any) {
        console.log('searchTransfers called', this.backendData);
        return this.http.post(`${this.TRANSFER_URL}/search`, data);
        // return of(this.backendData);
    }
}
