@component('mail::message')
# Welcome to {{ config('app.name') }}!

Dear **{{ $clientName }}**,

Your hosting service is now **active** and ready to use! 🎉

## Service Details

- **Domain:** {{ $serviceDomain }}
- **Product:** {{ $productName }}
- **Server IP:** {{ $serverIp }}

## Access Information

- **cPanel URL:** https://{{ $cpanelUrl }}:2083
- **Username:** {{ $username }}
- **Password:** {{ $password }}

@component('mail::panel')
**Important:** Please change your password after first login for security.
@endcomponent

## What's Next?

1. Login to your cPanel
2. Upload your website files
3. Configure email accounts
4. Install SSL certificate (free Let's Encrypt available)

@component('mail::button', ['url' => 'https://' . $cpanelUrl . ':2083'])
Access cPanel
@endcomponent

If you need any assistance, our support team is here to help!

Thanks,<br>
{{ config('app.name') }} Team
@endcomponent
