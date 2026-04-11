import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-system-notifications',
  standalone: false,
  templateUrl: './system-notifications.component.html',
  styleUrls: ['./system-notifications.component.scss']
})
export class SystemNotificationsComponent {
  form: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      targetRole: ['All', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    this.http.post(`${environment.apiUrl}/notifications/broadcast`,
      this.form.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Notification sent successfully!';
        this.form.reset({ targetRole: 'All' });
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}
