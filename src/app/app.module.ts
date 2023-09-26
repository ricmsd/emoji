import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';

import { AppComponent } from './app.component';
import { EmojiService } from 'src/service/emoji.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BadgeModule, 
    TableModule,
    TreeSelectModule,
    ButtonModule,
    ToastModule,
    SelectButtonModule,
    SliderModule,
    CheckboxModule,
    MenuModule
  ],
  providers: [EmojiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
