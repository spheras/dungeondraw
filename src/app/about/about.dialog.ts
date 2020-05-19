import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData { }

@Component({
    selector: 'about-dialog',
    templateUrl: 'about.dialog.html',
    styleUrls: ['about.dialog.css']
})
export class AboutDialog {

    constructor(
        public dialogRef: MatDialogRef<AboutDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

}