import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Certificate {
  id: string;
  courseId: string;
  studentId: string;
  verificationCode: string;
  certificateUrl: string;
  createdAt: string;
}

@Component({
  selector: 'app-certificates',
  standalone: false,
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Certificate[]>(`${environment.apiUrl}/certificates/my`)
      .subscribe({
        next: data => { this.certificates = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
  }

  download(cert: Certificate) {
    window.open(cert.certificateUrl, '_blank');
  }

  shareLinkedIn(cert: Certificate) {
    const url = encodeURIComponent(cert.certificateUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }
}
