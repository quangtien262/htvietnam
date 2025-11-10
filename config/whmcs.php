<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WHMCS Module Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for WHMCS-style billing and hosting management system
    |
    */

    // Default invoice settings
    'invoice' => [
        'due_days' => 7, // Default days until invoice is due
        'auto_send_reminder' => true,
        'reminder_days' => [3, 7, 14], // Days before due date to send reminders
        'late_fee_enabled' => false,
        'late_fee_percentage' => 0, // Percentage of total invoice
    ],

    // Provisioning settings
    'provisioning' => [
        'auto_provision_on_payment' => true, // Auto provision when invoice is paid
        'auto_suspend_days' => 7, // Auto suspend service after X days overdue
        'auto_terminate_days' => 30, // Auto terminate service after X days overdue
        'send_welcome_email' => true,
        'send_suspension_email' => true,
    ],

    // Server selection algorithm
    'server_selection' => [
        'method' => 'load_balanced', // load_balanced, round_robin, random, specific
        'priority_factors' => [
            'disk_usage' => 0.4,
            'account_count' => 0.4,
            'bandwidth_usage' => 0.2,
        ],
    ],

    // Default resource limits
    'defaults' => [
        'disk_space' => 10240, // MB (10GB)
        'bandwidth' => 100000, // MB (100GB)
        'email_accounts' => 100,
        'databases' => 10,
        'subdomains' => 10,
    ],

    // cPanel/WHM API configuration
    'cpanel' => [
        'default_port' => 2087,
        'timeout' => 30, // seconds
        'verify_ssl' => env('WHMCS_CPANEL_VERIFY_SSL', true),
    ],

    // Plesk API configuration
    'plesk' => [
        'default_port' => 8443,
        'timeout' => 30,
        'verify_ssl' => env('WHMCS_PLESK_VERIFY_SSL', true),
    ],

    // Payment gateways
    'payment_gateways' => [
        'vnpay' => [
            'enabled' => env('VNPAY_ENABLED', false),
            'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
            'tmn_code' => env('VNPAY_TMN_CODE', ''),
            'hash_secret' => env('VNPAY_HASH_SECRET', ''),
            'return_url' => env('VNPAY_RETURN_URL', '/api/payment/vnpay/callback'),
        ],
        'momo' => [
            'enabled' => env('MOMO_ENABLED', false),
            'endpoint' => env('MOMO_ENDPOINT', 'https://test-payment.momo.vn'),
            'partner_code' => env('MOMO_PARTNER_CODE', ''),
            'access_key' => env('MOMO_ACCESS_KEY', ''),
            'secret_key' => env('MOMO_SECRET_KEY', ''),
            'return_url' => env('MOMO_RETURN_URL', '/api/payment/momo/return'),
            'notify_url' => env('MOMO_NOTIFY_URL', '/api/payment/momo/ipn'),
        ],
    ],

    // Payment methods
    'payment_methods' => [
        'bank_transfer' => [
            'enabled' => true,
            'name' => 'Chuyển khoản ngân hàng',
        ],
        'vnpay' => [
            'enabled' => env('VNPAY_ENABLED', false),
            'name' => 'VNPay',
        ],
        'momo' => [
            'enabled' => env('MOMO_ENABLED', false),
            'name' => 'MoMo',
        ],
        'cash' => [
            'enabled' => true,
            'name' => 'Tiền mặt',
        ],
        'credit' => [
            'enabled' => true,
            'name' => 'Credit Balance',
        ],
    ],

    // Bank transfer info
    'bank_transfer' => [
        'bank_name' => env('BANK_NAME', 'Vietcombank'),
        'account_number' => env('BANK_ACCOUNT_NUMBER', '0123456789'),
        'account_name' => env('BANK_ACCOUNT_NAME', 'CONG TY TNHH ABC'),
        'branch' => env('BANK_BRANCH', 'Chi nhánh Hà Nội'),
        'swift_code' => env('BANK_SWIFT_CODE', ''),
    ],

    // Domain registrar
    'domain' => [
        'registrar' => env('WHMCS_DOMAIN_REGISTRAR', 'internal'),
        'auto_register_on_payment' => true,
        'auto_renew' => false,
        'default_nameservers' => [
            'ns1' => env('WHMCS_NS1', 'ns1.example.com'),
            'ns2' => env('WHMCS_NS2', 'ns2.example.com'),
        ],
    ],

    // Email templates
    'emails' => [
        'welcome_email' => [
            'enabled' => true,
            'subject' => 'Chào mừng đến với {company_name}!',
        ],
        'suspension_notice' => [
            'enabled' => true,
            'subject' => 'Dịch vụ của bạn đã bị tạm ngưng',
        ],
        'payment_reminder' => [
            'enabled' => true,
            'subject' => 'Nhắc nhở thanh toán hóa đơn #{invoice_number}',
        ],
    ],

    // Logging
    'logging' => [
        'log_api_calls' => env('WHMCS_LOG_API', false),
        'log_provisioning' => true,
        'log_billing' => true,
    ],
];
