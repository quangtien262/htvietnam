@component('mail::message')
# Invoice Reminder

Dear **{{ $clientName }}**,

@if($daysUntilDue > 0)
This is a friendly reminder that your invoice will be **due in {{ $daysUntilDue }} day(s)**.
@else
Your invoice is now **OVERDUE**. Please make payment immediately to avoid service suspension.
@endif

## Invoice Details

- **Invoice Number:** {{ $invoiceNumber }}
- **Total Amount:** ${{ number_format($total, 2) }}
- **Due Date:** {{ $dueDate }}

@if($daysUntilDue <= 0)
@component('mail::panel')
**Warning:** Unpaid invoices may result in service suspension or termination.
@endcomponent
@endif

@component('mail::button', ['url' => $paymentUrl])
View & Pay Invoice
@endcomponent

## Payment Methods Available

- VNPay (ATM/Credit Card)
- MoMo Wallet
- Bank Transfer
- Account Credit

If you have already made payment, please disregard this email.

Thanks,<br>
{{ config('app.name') }} Billing Team
@endcomponent
