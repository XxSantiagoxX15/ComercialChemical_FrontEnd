import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';
import { DataService } from '../../core/services/data.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  // 🔥 injects (te faltaban)
  private loading = inject(LoadingService);
  private dataService = inject(DataService);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.show();

    this.dataService.loadData().subscribe({
      next: () => {
        this.loading.hide();
      },
      error: () => {
        this.loading.hide();
      }
    });
  }
}