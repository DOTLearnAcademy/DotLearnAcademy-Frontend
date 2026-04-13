import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  courseId: string = '';
  isLoading: boolean = true;
  isProcessing: boolean = false;
  courseDetails: any = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.courseId = params['courseId'];
      if (!this.courseId) {
        this.router.navigate(['/home']);
        return;
      }
      this.loadCourseDetails();
    });
  }

  loadCourseDetails() {
    this.http.get<any>(`${environment.apiUrl}/courses/${this.courseId}`)
      .subscribe({
        next: (data) => {
          this.courseDetails = data;
          this.isLoading = false;
          // Load Razorpay script dynamically
          this.loadRazorpayScript();
        },
        error: () => {
          this.errorMessage = 'Failed to load course details.';
          this.isLoading = false;
        }
      });
  }

  loadRazorpayScript() {
    if ((window as any).Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  payNow() {
    if (!this.courseDetails) return;
    this.isProcessing = true;
    this.errorMessage = '';

    // 1. Create Order on Backend
    this.http.post<any>(`${environment.apiUrl}/payments/checkout`, { courseId: this.courseId })
      .subscribe({
        next: (checkoutRes) => {
          this.openRazorpayModal(checkoutRes);
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = err.error?.error || 'Could not initiate checkout. Please try again.';
        }
      });
  }

  openRazorpayModal(checkoutRes: any) {
    const options = {
      key: checkoutRes.razorpayKeyId,
      amount: checkoutRes.amount * 100, // paise
      currency: checkoutRes.currency,
      name: 'DOTLearn Academy',
      description: `Purchase: ${this.courseDetails.title}`,
      order_id: checkoutRes.orderId,
      handler: (response: any) => {
        this.verifyPayment(checkoutRes.orderId, response.razorpay_payment_id, response.razorpay_signature);
      },
      prefill: {
        name: 'Student Name', // Could be fetched from profile
        email: 'student@example.com' // Could be fetched from profile
      },
      theme: {
        color: '#4f46e5'
      },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.isProcessing = false;
      this.errorMessage = 'Payment failed. ' + response.error.description;
    });
    rzp.open();
  }

  verifyPayment(orderId: string, paymentId: string, signature: string) {
    this.http.post(`${environment.apiUrl}/payments/verify`, {
      orderId,
      paymentId,
      signature
    }).subscribe({
      next: () => {
        this.isProcessing = false;
        this.router.navigate(['/student/my-learning']); // Redirect to learning dashboard
      },
      error: () => {
        this.isProcessing = false;
        this.errorMessage = 'Payment verification failed. If money was deducted, please contact support.';
      }
    });
  }

  cancel() {
    this.router.navigate(['/courses', this.courseId]);
  }
}
