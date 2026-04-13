import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Certificate {
  id: string;
  courseId: string;
  verificationCode: string;
  createdAt: string;
  pdfUrl?: string;
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
    const userProfileRaw =
      localStorage.getItem('userProfile') || localStorage.getItem('currentUser');

    if (!userProfileRaw) {
      this.isLoading = false;
      return;
    }

    let userId = '';
    try {
      userId = JSON.parse(userProfileRaw).id || '';
    } catch {
      this.isLoading = false;
      return;
    }

    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.http.get<Certificate[]>(`${environment.apiUrl}/certificates/student/${userId}`)
      .subscribe({
        next: data => {
          this.certificates = data ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  download(cert: Certificate) {
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, '_blank');
    }
  }

  shareLinkedIn(cert: Certificate) {
    const text = `I earned a DOTLearn certificate! Verification Code: ${cert.verificationCode}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  }
}
