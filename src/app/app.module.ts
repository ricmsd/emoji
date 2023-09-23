import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TreeTableModule } from 'primeng/treetable';
import { BadgeModule } from 'primeng/badge';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

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
    TreeTableModule,
    BadgeModule, 
    CheckboxModule,
    TableModule,
    TreeSelectModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [EmojiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
