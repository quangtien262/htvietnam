<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdminUser;
use App\Models\User;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductGroup;
use App\Models\Whmcs\Service;
use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\InvoiceItem;
use App\Models\Whmcs\Ticket;
use App\Models\Whmcs\TicketReply;
use App\Models\Whmcs\Server;
use App\Models\Whmcs\ApiKey;
use App\Models\Whmcs\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class WhmcsCompleteTestDataSeeder extends Seeder
{
    /**
     * Run the complete WHMCS test data seeder
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting WHMCS Complete Test Data Seeding...');

        // 1. Create test users (clients)
        $clients = $this->createTestClients();
        $this->command->info('✅ Created ' . count($clients) . ' test clients');

        // 2. Create admin user if not exists
        $admin = $this->createAdminUser();
        $this->command->info('✅ Admin user ready');

        // 3. Create product groups and products
        [$groups, $products] = $this->createProductsAndGroups();
        $this->command->info('✅ Created ' . count($groups) . ' product groups and ' . count($products) . ' products');

        // 4. Create servers
        $servers = $this->createServers();
        $this->command->info('✅ Created ' . count($servers) . ' servers');

        // 5. Create services for clients
        $services = $this->createServices($clients, $products, $servers);
        $this->command->info('✅ Created ' . count($services) . ' services');

        // 6. Create invoices and transactions
        [$invoices, $transactions] = $this->createInvoicesAndTransactions($clients, $products, $services);
        $this->command->info('✅ Created ' . count($invoices) . ' invoices and ' . count($transactions) . ' transactions');

        // 7. Create support tickets
        $tickets = $this->createTickets($clients, $admin);
        $this->command->info('✅ Created ' . count($tickets) . ' support tickets');

        // 8. Create API keys
        $apiKeys = $this->createApiKeys($clients, $admin);
        $this->command->info('✅ Created ' . count($apiKeys) . ' API keys');

        $this->command->info('');
        $this->command->info('🎉 WHMCS Complete Test Data Seeding Finished!');
        $this->command->info('📊 Summary:');
        $this->command->info('   - Clients: ' . count($clients));
        $this->command->info('   - Products: ' . count($products));
        $this->command->info('   - Servers: ' . count($servers));
        $this->command->info('   - Services: ' . count($services));
        $this->command->info('   - Invoices: ' . count($invoices));
        $this->command->info('   - Transactions: ' . count($transactions));
        $this->command->info('   - Tickets: ' . count($tickets));
        $this->command->info('   - API Keys: ' . count($apiKeys));
        $this->command->info('');
        $this->command->info('🔑 Test Login:');
        $this->command->info('   Admin: admin@test.com / password');
        $this->command->info('   Client 1: client1@test.com / password');
        $this->command->info('   Client 2: client2@test.com / password');
        $this->command->info('   Client 3: client3@test.com / password');
    }

    /**
     * Create test clients
     */
    private function createTestClients(): array
    {
        $clients = [];

        $clientsData = [
            [
                'name' => 'Nguyễn Văn A',
                'email' => 'client1@test.com',
                'phone' => '0901234567',
                'company' => 'Công ty TNHH ABC',
                'address' => '123 Đường Lê Lợi, Quận 1',
                'city' => 'TP. Hồ Chí Minh',
                'country' => 'VN',
            ],
            [
                'name' => 'Trần Thị B',
                'email' => 'client2@test.com',
                'phone' => '0912345678',
                'company' => 'Công ty CP XYZ',
                'address' => '456 Đường Trần Hưng Đạo, Quận 5',
                'city' => 'TP. Hồ Chí Minh',
                'country' => 'VN',
            ],
            [
                'name' => 'Lê Văn C',
                'email' => 'client3@test.com',
                'phone' => '0923456789',
                'company' => null,
                'address' => '789 Đường Nguyễn Huệ, Hoàn Kiếm',
                'city' => 'Hà Nội',
                'country' => 'VN',
            ],
            [
                'name' => 'Phạm Thị D',
                'email' => 'client4@test.com',
                'phone' => '0934567890',
                'company' => 'Startup Digital',
                'address' => '321 Đường Hai Bà Trưng, Quận 3',
                'city' => 'TP. Hồ Chí Minh',
                'country' => 'VN',
            ],
            [
                'name' => 'Hoàng Văn E',
                'email' => 'client5@test.com',
                'phone' => '0945678901',
                'company' => null,
                'address' => '654 Đường Lý Thường Kiệt, Tân Bình',
                'city' => 'TP. Hồ Chí Minh',
                'country' => 'VN',
            ],
        ];

        foreach ($clientsData as $data) {
            $client = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'phone' => $data['phone'],
                    'cong_ty' => $data['company'],
                    'address' => $data['address'],
                    'customer_status_id' => 1,
                    'email_verified_at' => now(),
                ]
            );
            $clients[] = $client;
        }

        return $clients;
    }

    /**
     * Create admin user
     */
    private function createAdminUser()
    {
        return AdminUser::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'admin_user_status_id' => 1,
            ]
        );
    }

    /**
     * Create product groups and products
     */
    private function createProductsAndGroups(): array
    {
        $groups = [];
        $products = [];

        // Shared Hosting Group
        $hostingGroup = ProductGroup::firstOrCreate(
            ['name' => 'Shared Hosting'],
            [
                'description' => 'Gói hosting chia sẻ cho website cá nhân và doanh nghiệp nhỏ',
                'order' => 1,
            ]
        );
        $groups[] = $hostingGroup;

        $products[] = $this->createProductWithPricing([
            'name' => 'Hosting Basic',
            'description' => 'Gói hosting cơ bản cho website nhỏ. 1GB Disk, 10GB Bandwidth, 1 Email, Free SSL',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'basic',
            'auto_setup' => true,
            'status' => 'active',
            'config' => json_encode([
                'disk_limit' => 1024,
                'bandwidth_limit' => 10240,
                'email_accounts' => 1,
                'databases' => 1,
            ]),
        ], [
            ['cycle' => 'monthly', 'price' => 50000],
            ['cycle' => 'quarterly', 'price' => 135000],
            ['cycle' => 'semiannually', 'price' => 240000],
            ['cycle' => 'annually', 'price' => 450000],
        ]);

        $products[] = $this->createProductWithPricing([
            'name' => 'Hosting Standard',
            'description' => 'Gói hosting phổ biến nhất. 5GB Disk, 50GB Bandwidth, 10 Emails, Daily Backups',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'standard',
            'auto_setup' => true,
            'status' => 'active',
            'config' => json_encode([
                'disk_limit' => 5120,
                'bandwidth_limit' => 51200,
                'email_accounts' => 10,
                'databases' => 5,
            ]),
        ], [
            ['cycle' => 'monthly', 'price' => 100000],
            ['cycle' => 'quarterly', 'price' => 270000],
            ['cycle' => 'semiannually', 'price' => 480000],
            ['cycle' => 'annually', 'price' => 900000],
        ]);

        $products[] = $this->createProductWithPricing([
            'name' => 'Hosting Premium',
            'description' => 'Gói hosting cao cấp cho doanh nghiệp. 20GB Disk, 200GB Bandwidth, Unlimited Emails',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'premium',
            'auto_setup' => true,
            'status' => 'active',
            'config' => json_encode([
                'disk_limit' => 20480,
                'bandwidth_limit' => 204800,
                'email_accounts' => -1,
                'databases' => -1,
            ]),
        ], [
            ['cycle' => 'monthly', 'price' => 200000],
            ['cycle' => 'quarterly', 'price' => 540000],
            ['cycle' => 'semiannually', 'price' => 960000],
            ['cycle' => 'annually', 'price' => 1800000],
        ]);

        // VPS Group
        $vpsGroup = ProductGroup::firstOrCreate(
            ['name' => 'VPS Hosting'],
            [
                'description' => 'Máy chủ ảo VPS với hiệu năng cao',
                'order' => 2,
            ]
        );
        $groups[] = $vpsGroup;

        $products[] = $this->createProductWithPricing([
            'name' => 'VPS Starter',
            'description' => 'VPS nhập môn. 1 Core, 2GB RAM, 30GB SSD, Full Root Access',
            'type' => 'vps',
            'group_id' => $vpsGroup->id,
            'module' => 'virtualizor',
            'package_name' => 'vps-starter',
            'auto_setup' => false,
            'status' => 'active',
            'config' => json_encode([
                'cpu_cores' => 1,
                'ram' => 2048,
                'disk_limit' => 30720,
                'bandwidth_limit' => 1048576,
            ]),
        ], [
            ['cycle' => 'monthly', 'price' => 300000, 'setup_fee' => 100000],
            ['cycle' => 'quarterly', 'price' => 810000, 'setup_fee' => 100000],
            ['cycle' => 'annually', 'price' => 2700000, 'setup_fee' => 0],
        ]);

        $products[] = $this->createProductWithPricing([
            'name' => 'VPS Business',
            'description' => 'VPS mạnh mẽ. 2 Cores, 4GB RAM, 60GB SSD, Daily Backups',
            'type' => 'vps',
            'group_id' => $vpsGroup->id,
            'module' => 'virtualizor',
            'package_name' => 'vps-business',
            'auto_setup' => false,
            'status' => 'active',
            'config' => json_encode([
                'cpu_cores' => 2,
                'ram' => 4096,
                'disk_limit' => 61440,
                'bandwidth_limit' => 2097152,
            ]),
        ], [
            ['cycle' => 'monthly', 'price' => 600000, 'setup_fee' => 100000],
            ['cycle' => 'quarterly', 'price' => 1620000, 'setup_fee' => 100000],
            ['cycle' => 'annually', 'price' => 5400000, 'setup_fee' => 0],
        ]);

        // Domain Group
        $domainGroup = ProductGroup::firstOrCreate(
            ['name' => 'Domain Names'],
            [
                'description' => 'Đăng ký tên miền quốc tế và Việt Nam',
                'order' => 3,
            ]
        );
        $groups[] = $domainGroup;

        $products[] = $this->createProductWithPricing([
            'name' => 'Domain .com',
            'description' => 'Đăng ký tên miền .com quốc tế. Bao gồm WHOIS Privacy và DNS Management',
            'type' => 'domain',
            'group_id' => $domainGroup->id,
            'module' => null,
            'package_name' => null,
            'auto_setup' => false,
            'status' => 'active',
            'config' => json_encode([
                'tld' => '.com',
                'min_years' => 1,
                'max_years' => 10,
            ]),
        ], [
            ['cycle' => 'annually', 'price' => 300000],
            ['cycle' => 'biennially', 'price' => 580000],
        ]);

        $products[] = $this->createProductWithPricing([
            'name' => 'Domain .vn',
            'description' => 'Đăng ký tên miền .vn Việt Nam. Bao gồm DNS Management',
            'type' => 'domain',
            'group_id' => $domainGroup->id,
            'module' => null,
            'package_name' => null,
            'auto_setup' => false,
            'status' => 'active',
            'config' => json_encode([
                'tld' => '.vn',
                'min_years' => 1,
                'max_years' => 5,
            ]),
        ], [
            ['cycle' => 'annually', 'price' => 400000],
            ['cycle' => 'biennially', 'price' => 780000],
        ]);

        // SSL Certificates Group
        $sslGroup = ProductGroup::firstOrCreate(
            ['name' => 'SSL Certificates'],
            [
                'description' => 'Chứng chỉ SSL bảo mật website',
                'order' => 4,
            ]
        );
        $groups[] = $sslGroup;

        $products[] = $this->createProductWithPricing([
            'name' => 'SSL Basic',
            'description' => 'Chứng chỉ SSL cơ bản cho 1 domain',
            'type' => 'ssl',
            'group_id' => $sslGroup->id,
            'module' => null,
            'package_name' => null,
            'auto_setup' => false,
            'status' => 'active',
            'config' => json_encode([
                'type' => 'single',
                'validation' => 'domain',
            ]),
        ], [
            ['cycle' => 'annually', 'price' => 500000],
        ]);

        return [$groups, $products];
    }

    /**
     * Create servers
     */
    private function createServers(): array
    {
        $servers = [];

        $serversData = [
            [
                'name' => 'Server cPanel 01',
                'hostname' => 'cp1.hosting.vn',
                'ip_address' => '103.56.158.10',
                'type' => 'shared',
                'panel' => 'cpanel',
                'username' => 'root',
                'api_token' => bin2hex(random_bytes(32)),
                'max_accounts' => 100,
                'current_accounts' => 0,
                'status' => 'active',
            ],
            [
                'name' => 'Server cPanel 02',
                'hostname' => 'cp2.hosting.vn',
                'ip_address' => '103.56.158.11',
                'type' => 'shared',
                'panel' => 'cpanel',
                'username' => 'root',
                'api_token' => bin2hex(random_bytes(32)),
                'max_accounts' => 100,
                'current_accounts' => 0,
                'status' => 'active',
            ],
            [
                'name' => 'Server VPS 01',
                'hostname' => 'vps1.hosting.vn',
                'ip_address' => '103.56.158.20',
                'type' => 'vps',
                'panel' => 'virtualizor',
                'username' => 'admin',
                'api_token' => bin2hex(random_bytes(32)),
                'max_accounts' => 50,
                'current_accounts' => 0,
                'status' => 'active',
            ],
            [
                'name' => 'Server Backup',
                'hostname' => 'backup.hosting.vn',
                'ip_address' => '103.56.158.30',
                'type' => 'dedicated',
                'panel' => 'custom',
                'username' => 'backup',
                'api_token' => bin2hex(random_bytes(32)),
                'max_accounts' => 0,
                'current_accounts' => 0,
                'status' => 'active',
            ],
        ];

        foreach ($serversData as $data) {
            $server = Server::firstOrCreate(
                ['hostname' => $data['hostname']],
                $data
            );
            $servers[] = $server;
        }

        return $servers;
    }    /**
     * Create services for clients
     */
    private function createServices(array $clients, array $products, array $servers): array
    {
        $services = [];
        $statuses = ['active', 'active', 'active', 'suspended', 'pending'];
        $cpanelServers = array_filter($servers, fn($s) => $s->panel === 'cpanel');
        $vpsServers = array_filter($servers, fn($s) => $s->panel === 'virtualizor');

        // Client 1: 2 hosting services, 1 domain
        $client1 = $clients[0];
        $services[] = $this->createService([
            'user_id' => $client1->id,
            'product_id' => $products[0]->id, // Hosting Basic
            'server_id' => $cpanelServers[0]->id ?? null,
            'domain' => 'example1.com',
            'username' => 'client1_ex1',
            'payment_cycle' => 'annually',
            'recurring_amount' => 450000,
            'status' => 'active',
            'next_due_date' => now()->addYear(),
            'registration_date' => now()->subMonths(3),
        ]);

        $services[] = $this->createService([
            'user_id' => $client1->id,
            'product_id' => $products[6]->id, // Domain .com
            'server_id' => null,
            'domain' => 'example1.com',
            'username' => null,
            'payment_cycle' => 'annually',
            'recurring_amount' => 300000,
            'status' => 'active',
            'next_due_date' => now()->addYear(),
            'registration_date' => now()->subMonths(3),
        ]);

        // Client 2: 1 standard hosting, 1 VPS
        $client2 = $clients[1];
        $services[] = $this->createService([
            'user_id' => $client2->id,
            'product_id' => $products[1]->id, // Hosting Standard
            'server_id' => $cpanelServers[1]->id ?? null,
            'domain' => 'company-xyz.vn',
            'username' => 'client2_xyz',
            'payment_cycle' => 'semiannually',
            'recurring_amount' => 480000,
            'status' => 'active',
            'next_due_date' => now()->addMonths(6),
            'registration_date' => now()->subMonths(2),
        ]);

        $services[] = $this->createService([
            'user_id' => $client2->id,
            'product_id' => $products[3]->id, // VPS Starter
            'server_id' => $vpsServers[0]->id ?? null,
            'domain' => 'vps.company-xyz.vn',
            'username' => 'vps_client2',
            'payment_cycle' => 'monthly',
            'recurring_amount' => 300000,
            'status' => 'active',
            'next_due_date' => now()->addMonth(),
            'registration_date' => now()->subMonths(1),
        ]);

        // Client 3: Premium hosting
        $client3 = $clients[2];
        $services[] = $this->createService([
            'user_id' => $client3->id,
            'product_id' => $products[2]->id, // Hosting Premium
            'server_id' => $cpanelServers[0]->id ?? null,
            'domain' => 'mybusiness.vn',
            'username' => 'client3_bus',
            'payment_cycle' => 'annually',
            'recurring_amount' => 1800000,
            'status' => 'active',
            'next_due_date' => now()->addYear(),
            'registration_date' => now()->subMonths(6),
        ]);

        // Client 4: VPS Business (suspended)
        $client4 = $clients[3];
        $services[] = $this->createService([
            'user_id' => $client4->id,
            'product_id' => $products[4]->id, // VPS Business
            'server_id' => $vpsServers[0]->id ?? null,
            'domain' => 'vps-business.com',
            'username' => 'vps_client4',
            'payment_cycle' => 'monthly',
            'recurring_amount' => 600000,
            'status' => 'suspended',
            'next_due_date' => now()->subMonth(), // Overdue
            'registration_date' => now()->subMonths(4),
        ]);

        // Client 5: Domain + SSL
        $client5 = $clients[4];
        $services[] = $this->createService([
            'user_id' => $client5->id,
            'product_id' => $products[7]->id, // SSL Basic (index 7)
            'server_id' => null,
            'domain' => 'mycoolsite.vn',
            'username' => null,
            'payment_cycle' => 'annually',
            'recurring_amount' => 500000,
            'status' => 'active',
            'next_due_date' => now()->addYear(),
            'registration_date' => now()->subMonths(1),
        ]);

        return $services;
    }

    /**
     * Create invoices and transactions
     */
    private function createInvoicesAndTransactions(array $clients, array $products, array $services): array
    {
        $invoices = [];
        $transactions = [];

        // Invoice 1: Client 1 - Paid
        $invoice1 = Invoice::firstOrCreate(
            ['number' => 'INV-' . now()->format('Ym') . '-001'],
            [
                'user_id' => $clients[0]->id,
                'due_date' => now()->subMonths(3)->addDays(7),
                'subtotal' => 750000,
                'tax_total' => 75000,
                'total' => 825000,
                'credit_applied' => 825000,
                'status' => 'paid',
                'paid_at' => now()->subMonths(3)->addDays(2),
                'created_at' => now()->subMonths(3),
            ]
        );
        $invoices[] = $invoice1;

        InvoiceItem::create([
            'invoice_id' => $invoice1->id,
            'product_id' => $products[0]->id,
            'type' => 'product',
            'description' => 'Hosting Basic - Annually',
            'qty' => 1,
            'unit_price' => 450000,
            'total' => 450000,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice1->id,
            'product_id' => $products[6]->id,
            'type' => 'product',
            'description' => 'Domain .com - Annually',
            'qty' => 1,
            'unit_price' => 300000,
            'total' => 300000,
        ]);

        $transactions[] = Transaction::create([
            'user_id' => $clients[0]->id,
            'invoice_id' => $invoice1->id,
            'gateway' => 'bank_transfer',
            'transaction_id' => 'TXN-' . strtoupper(bin2hex(random_bytes(6))),
            'amount' => 825000,
            'currency' => 'VND',
            'status' => 'success',
            'notes' => 'Thanh toán chuyển khoản ngân hàng',
            'created_at' => now()->subMonths(3)->addDays(2),
        ]);

        // Invoice 2: Client 2 - Partially paid
        $invoice2 = Invoice::firstOrCreate(
            ['number' => 'INV-' . now()->format('Ym') . '-002'],
            [
                'user_id' => $clients[1]->id,
                'due_date' => now()->subMonths(2)->addDays(7),
                'subtotal' => 480000,
                'tax_total' => 48000,
                'total' => 528000,
                'credit_applied' => 300000,
                'status' => 'unpaid',
                'paid_at' => null,
                'created_at' => now()->subMonths(2),
            ]
        );
        $invoices[] = $invoice2;

        InvoiceItem::create([
            'invoice_id' => $invoice2->id,
            'product_id' => $products[1]->id,
            'type' => 'product',
            'description' => 'Hosting Standard - Semi-annually',
            'qty' => 1,
            'unit_price' => 480000,
            'total' => 480000,
        ]);

        $transactions[] = Transaction::create([
            'user_id' => $clients[1]->id,
            'invoice_id' => $invoice2->id,
            'gateway' => 'bank_transfer',
            'transaction_id' => 'TXN-' . strtoupper(bin2hex(random_bytes(6))),
            'amount' => 300000,
            'currency' => 'VND',
            'status' => 'success',
            'notes' => 'Thanh toán một phần',
            'created_at' => now()->subMonths(2)->addDays(3),
        ]);

        // Invoice 3: Client 3 - Paid
        $invoice3 = Invoice::firstOrCreate(
            ['number' => 'INV-' . now()->format('Ym') . '-003'],
            [
                'user_id' => $clients[2]->id,
                'due_date' => now()->subMonths(6)->addDays(7),
                'subtotal' => 1800000,
                'tax_total' => 180000,
                'total' => 1980000,
                'credit_applied' => 1980000,
                'status' => 'paid',
                'paid_at' => now()->subMonths(6)->addDays(1),
                'created_at' => now()->subMonths(6),
            ]
        );
        $invoices[] = $invoice3;

        InvoiceItem::create([
            'invoice_id' => $invoice3->id,
            'product_id' => $products[2]->id,
            'type' => 'product',
            'description' => 'Hosting Premium - Annually',
            'qty' => 1,
            'unit_price' => 1800000,
            'total' => 1800000,
        ]);

        $transactions[] = Transaction::create([
            'user_id' => $clients[2]->id,
            'invoice_id' => $invoice3->id,
            'gateway' => 'vnpay',
            'transaction_id' => 'VNPAY-' . strtoupper(bin2hex(random_bytes(6))),
            'amount' => 1980000,
            'currency' => 'VND',
            'status' => 'success',
            'notes' => 'Thanh toán qua VNPay',
            'created_at' => now()->subMonths(6)->addDays(1),
        ]);

        // Invoice 4: Client 4 - Unpaid (Overdue)
        $invoice4 = Invoice::firstOrCreate(
            ['number' => 'INV-' . now()->format('Ym') . '-004'],
            [
                'user_id' => $clients[3]->id,
                'due_date' => now()->subDays(7),
                'subtotal' => 600000,
                'tax_total' => 60000,
                'total' => 660000,
                'credit_applied' => 0,
                'status' => 'unpaid',
                'paid_at' => null,
                'created_at' => now()->subMonth(),
            ]
        );
        $invoices[] = $invoice4;

        InvoiceItem::create([
            'invoice_id' => $invoice4->id,
            'product_id' => $products[4]->id,
            'type' => 'product',
            'description' => 'VPS Business - Monthly',
            'qty' => 1,
            'unit_price' => 600000,
            'total' => 600000,
        ]);

        // Invoice 5: Client 5 - Pending
        $invoice5 = Invoice::firstOrCreate(
            ['number' => 'INV-' . now()->format('Ym') . '-005'],
            [
                'user_id' => $clients[4]->id,
                'due_date' => now()->addDays(7),
                'subtotal' => 500000,
                'tax_total' => 50000,
                'total' => 550000,
                'credit_applied' => 0,
                'status' => 'pending',
                'paid_at' => null,
                'created_at' => now(),
            ]
        );
        $invoices[] = $invoice5;

        InvoiceItem::create([
            'invoice_id' => $invoice5->id,
            'product_id' => $products[7]->id,
            'type' => 'product',
            'description' => 'SSL Basic - Annually',
            'qty' => 1,
            'unit_price' => 500000,
            'total' => 500000,
        ]);

        return [$invoices, $transactions];
    }

    /**
     * Create support tickets
     */
    private function createTickets(array $clients, $admin): array
    {
        $tickets = [];

        // Ticket 1: Client 1 - Open
        $ticket1 = Ticket::create([
            'user_id' => $clients[0]->id,
            'department' => 'support',
            'subject' => 'Không thể truy cập email',
            'status' => 'open',
            'priority' => 'medium',
            'last_reply_at' => now()->subHours(2),
            'created_at' => now()->subDays(1),
        ]);
        $tickets[] = $ticket1;

        $this->createTicketReply(
            $ticket1->id,
            $clients[0],
            'Em không thể đăng nhập vào email. Khi đăng nhập báo sai mật khẩu. Em đã thử reset password nhưng không nhận được email.',
            now()->subDays(1)
        );

        $this->createTicketReply(
            $ticket1->id,
            $admin,
            'Chào bạn, chúng tôi đã kiểm tra và reset lại mật khẩu email cho bạn. Mật khẩu mới đã được gửi vào email đăng ký của bạn.',
            now()->subHours(2)
        );

        // Ticket 2: Client 2 - In Progress
        $ticket2 = Ticket::create([
            'user_id' => $clients[1]->id,
            'department' => 'technical',
            'subject' => 'Website bị chậm',
            'status' => 'in_progress',
            'priority' => 'high',
            'last_reply_at' => now()->subHours(4),
            'created_at' => now()->subDays(2),
        ]);
        $tickets[] = $ticket2;

        $this->createTicketReply(
            $ticket2->id,
            $clients[1],
            'Website công ty tôi đang bị chậm rất nhiều. Đặc biệt là vào giờ cao điểm. Vui lòng kiểm tra giúp.',
            now()->subDays(2)
        );

        $this->createTicketReply(
            $ticket2->id,
            $admin,
            'Chúng tôi đã phát hiện vấn đề và đang xử lý. Sẽ cập nhật cho bạn trong ít phút.',
            now()->subHours(4)
        );

        // Ticket 3: Client 3 - Closed
        $ticket3 = Ticket::create([
            'user_id' => $clients[2]->id,
            'department' => 'billing',
            'subject' => 'Hỏi về hóa đơn',
            'status' => 'closed',
            'priority' => 'low',
            'last_reply_at' => now()->subDays(5),
            'created_at' => now()->subWeek(),
        ]);
        $tickets[] = $ticket3;

        $this->createTicketReply($ticket3->id, $clients[2], 'Tôi muốn xuất hóa đơn VAT cho dịch vụ hosting. Làm thế nào?', now()->subWeek());
        $this->createTicketReply($ticket3->id, $admin, 'Bạn vui lòng gửi thông tin công ty (Tên công ty, MST, Địa chỉ) để chúng tôi xuất hóa đơn.', now()->subDays(6));
        $this->createTicketReply($ticket3->id, $clients[2], 'Tên công ty: ABC Ltd, MST: 0123456789, Địa chỉ: 123 Lê Lợi Q1 TPHCM', now()->subDays(5));
        $this->createTicketReply($ticket3->id, $admin, 'Hóa đơn đã được xuất và gửi qua email. Cảm ơn bạn!', now()->subDays(5));

        // Ticket 4: Client 4 - Open (High priority)
        $ticket4 = Ticket::create([
            'user_id' => $clients[3]->id,
            'department' => 'support',
            'subject' => 'Dịch vụ bị suspend',
            'status' => 'open',
            'priority' => 'high',
            'last_reply_at' => now()->subHours(1),
            'created_at' => now()->subHours(3),
        ]);
        $tickets[] = $ticket4;

        $this->createTicketReply($ticket4->id, $clients[3], 'VPS của tôi bị suspend. Tôi cần sử dụng gấp. Vui lòng kích hoạt lại.', now()->subHours(3));
        $this->createTicketReply($ticket4->id, $admin, 'Dịch vụ của bạn bị suspend do chưa thanh toán hóa đơn INV-' . now()->format('Ym') . '-004. Vui lòng thanh toán để kích hoạt lại.', now()->subHours(1));

        // Ticket 5: Client 5 - Answered
        $ticket5 = Ticket::create([
            'user_id' => $clients[4]->id,
            'department' => 'sales',
            'subject' => 'Tư vấn nâng cấp hosting',
            'status' => 'answered',
            'priority' => 'low',
            'last_reply_at' => now()->subHours(6),
            'created_at' => now()->subDays(1),
        ]);
        $tickets[] = $ticket5;

        $this->createTicketReply($ticket5->id, $clients[4], 'Website của tôi đang tăng traffic. Tôi muốn nâng cấp lên gói cao hơn. Giá như thế nào?', now()->subDays(1));
        $this->createTicketReply($ticket5->id, $admin, 'Bạn có thể nâng cấp lên Hosting Standard (100k/tháng) hoặc Premium (200k/tháng). Chúng tôi sẽ tính theo tỷ lệ thời gian sử dụng.', now()->subHours(6));

        return $tickets;
    }

    /**
     * Create API keys
     */
    private function createApiKeys(array $clients, $admin): array
    {
        $apiKeys = [];

        // API Key 1: Client 1 - Active
        $apiKeys[] = ApiKey::create([
            'name' => 'Mobile App API',
            'key' => 'test_' . bin2hex(random_bytes(16)),
            'secret' => bin2hex(random_bytes(32)),
            'user_id' => $clients[0]->id,
            'admin_user_id' => null,
            'permissions' => json_encode(['read:services', 'read:invoices', 'create:tickets']),
            'allowed_ips' => null,
            'expires_at' => now()->addYear(),
            'status' => 'active',
            'last_used_at' => now()->subHours(2),
        ]);

        // API Key 2: Client 2 - Active
        $apiKeys[] = ApiKey::create([
            'name' => 'Website Integration',
            'key' => 'test_' . bin2hex(random_bytes(16)),
            'secret' => bin2hex(random_bytes(32)),
            'user_id' => $clients[1]->id,
            'admin_user_id' => null,
            'permissions' => json_encode(['read:services', 'read:invoices']),
            'allowed_ips' => '103.56.158.1',
            'expires_at' => now()->addMonths(6),
            'status' => 'active',
            'last_used_at' => now()->subDays(1),
        ]);

        // API Key 3: Admin - Full access
        $apiKeys[] = ApiKey::create([
            'name' => 'Admin Full Access',
            'key' => 'admin_' . bin2hex(random_bytes(16)),
            'secret' => bin2hex(random_bytes(32)),
            'user_id' => null,
            'admin_user_id' => $admin->id,
            'permissions' => json_encode(['*']),
            'allowed_ips' => null,
            'expires_at' => null,
            'status' => 'active',
            'last_used_at' => now()->subMinutes(30),
        ]);

        // API Key 4: Client 3 - Expired
        $apiKeys[] = ApiKey::create([
            'name' => 'Old Integration',
            'key' => 'test_' . bin2hex(random_bytes(16)),
            'secret' => bin2hex(random_bytes(32)),
            'user_id' => $clients[2]->id,
            'admin_user_id' => null,
            'permissions' => json_encode(['read:services']),
            'allowed_ips' => null,
            'expires_at' => now()->subMonth(),
            'status' => 'revoked',
            'last_used_at' => now()->subMonths(2),
        ]);

        return $apiKeys;
    }

    /**
     * Helper: Create product with pricing
     */
    private function createProductWithPricing(array $productData, array $pricingData)
    {
        $product = Product::firstOrCreate(
            ['name' => $productData['name']],
            $productData
        );

        foreach ($pricingData as $pricing) {
            DB::table('whmcs_product_pricing')->updateOrInsert(
                [
                    'product_id' => $product->id,
                    'cycle' => $pricing['cycle'],
                ],
                [
                    'price' => $pricing['price'],
                    'setup_fee' => $pricing['setup_fee'] ?? 0,
                    'currency' => 'VND',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        return $product;
    }

    /**
     * Helper: Create service
     */
    private function createService(array $data)
    {
        return Service::firstOrCreate(
            [
                'user_id' => $data['user_id'],
                'product_id' => $data['product_id'],
                'domain' => $data['domain'],
            ],
            $data
        );
    }

    /**
     * Helper: Create ticket reply from user or admin
     */
    private function createTicketReply(int $ticketId, $author, string $message, $createdAt = null)
    {
        $authorType = $author instanceof \App\Models\User ? 'App\Models\User' : 'App\Models\AdminUser';
        
        return TicketReply::create([
            'ticket_id' => $ticketId,
            'author_id' => $author->id,
            'author_type' => $authorType,
            'message' => $message,
            'created_at' => $createdAt ?? now(),
        ]);
    }
}
