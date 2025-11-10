@component('mail::message')
# Payment Received - Thank You!

Dear **{{ $clientName }}**,

Thank you! We have successfully received your payment. 💚

## Payment Details

- **Transaction ID:** {{ $transactionId }}
- **Amount Paid:** ${{ number_format($amount, 2) }}
- **Payment Method:** {{ ucfirst(str_replace('_', ' ', $paymentMethod)) }}
- **Date:** {{ $date }}
- **Invoice:** #{{ $invoiceNumber }}

@component('mail::panel')
Your payment has been applied to your account and any suspended services have been reactivated.
@endcomponent

@component('mail::button', ['url' => route('client.invoices')])
View Receipt
@endcomponent

If you have any questions about this payment, please contact our billing department.

Thanks,<br>
{{ config('app.name') }} Billing Team
@endcomponent
