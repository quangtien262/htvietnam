@component('mail::message')
# Service Suspended

Dear **{{ $clientName }}**,

We regret to inform you that your service has been **suspended**.

## Service Details

- **Domain:** {{ $serviceDomain }}
- **Product:** {{ $productName }}
- **Reason:** {{ $reason }}

@component('mail::panel')
**Total Amount Due:** ${{ number_format($totalDue, 2) }}
@endcomponent

## Unpaid Invoices

@foreach($unpaidInvoices as $invoice)
- Invoice #{{ $invoice->invoice_number }} - ${{ number_format($invoice->total, 2) }} (Due: {{ $invoice->due_date->format('Y-m-d') }})
@endforeach

## Next Steps

1. Pay all outstanding invoices
2. Service will be automatically reactivated upon payment
3. Contact support if you need payment arrangement

@component('mail::button', ['url' => route('client.invoices')])
View Unpaid Invoices
@endcomponent

**Important:** If payment is not received within 7 days, the service may be terminated and data will be permanently deleted.

Thanks,<br>
{{ config('app.name') }} Team
@endcomponent
