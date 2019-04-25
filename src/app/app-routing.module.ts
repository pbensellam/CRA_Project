import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CRAFormComponent } from './cra-form/cra-form.component';
import { PrintLayoutComponent } from './print-layout/print-layout.component';

const routes: Routes = [
  {path : 'app-cra-form', component: CRAFormComponent},
  {path : '', redirectTo: 'app-route', pathMatch: 'full'},
  {path: '**', redirectTo: 'app-route'},
  { path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'CRA', component: CRAFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
