import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CRAFormComponent } from './cra-form/cra-form.component';

const routes: Routes = [
  {path : 'app-cra-form', component: CRAFormComponent},
  {path : '', redirectTo: 'app-route', pathMatch: 'full'},
  {path: '**', redirectTo: 'app-route'}
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
