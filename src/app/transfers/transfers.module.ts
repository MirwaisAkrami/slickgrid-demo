import { NgModule } from "@angular/core";
import { AngularSlickgridModule } from "angular-slickgrid";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { TransfersComponent } from "./transfers.component";
import { DropzoneModule } from "ngx-dropzone-wrapper";

const routes: Routes = [
    {
        path: '',
        component: TransfersComponent
    }
]

@NgModule({
    declarations: [TransfersComponent],
    imports: [
        AngularSlickgridModule,
        // DropzoneModule,
        RouterModule.forChild(routes),
        HttpClientModule
    ]
})
export class TransfersModule { }
