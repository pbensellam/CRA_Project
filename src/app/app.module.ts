import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditCRAComponent } from './edit-cra/edit-cra.component';
import { CRAFormComponent } from './cra-form/cra-form.component';
import { HeaderComponent } from './header/header.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { CraService } from './Service/cra.service';
import { MailService } from './Service/mail.service';
import { HomeComponent } from './home/home.component';
import { RhSettingComponent } from './rh-setting/rh-setting.component';

const appRoutes: Routes = [
  {path : 'app-cra-form', component: CRAFormComponent},
  {path : 'app-home', component: HomeComponent},
  {path : 'app-rh-setting', component : RhSettingComponent},
  {path : '', redirectTo: 'app-home', pathMatch: 'full'},
  {path: '**', redirectTo: 'app-home'}
];

@NgModule({
  declarations: [
    AppComponent,
    EditCRAComponent,
    CRAFormComponent,
    HeaderComponent,
    HomeComponent,
    RhSettingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [CraService,MailService],
  bootstrap: [AppComponent]
})
export class AppModule { }
