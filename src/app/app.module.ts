import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { AngularSlickgridModule } from "angular-slickgrid";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";

const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        children: [
            {
                path: 'transfers',
                loadChildren: () => import('./transfers/transfers.module').then(m => m.TransfersModule)
            }, {
                path: '',
                redirectTo: 'transfers',
                pathMatch: 'full'
            }
        ]
    }
]

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AngularSlickgridModule.forRoot(),
        RouterModule.forRoot(routes),
        HttpClientModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }