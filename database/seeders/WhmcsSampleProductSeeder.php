<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductGroup;
use Illuminate\Support\Facades\DB;

class WhmcsSampleProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if products already exist
        if (Product::count() > 0) {
            $this->command->info('Products already exist, skipping...');
            return;
        }

        // Tạo product groups trước
        $hostingGroup = ProductGroup::firstOrCreate(
            ['name' => 'Web Hosting'],
            [
                'description' => 'Shared hosting packages for websites',
                'order' => 1,
            ]
        );

        $vpsGroup = ProductGroup::firstOrCreate(
            ['name' => 'VPS Hosting'],
            [
                'description' => 'Virtual Private Server packages',
                'order' => 2,
            ]
        );

        $domainGroup = ProductGroup::firstOrCreate(
            ['name' => 'Domain Names'],
            [
                'description' => 'Domain registration services',
                'order' => 3,
            ]
        );

        // Tạo hosting products với pricing
        $this->createProductWithPricing([
            'name' => 'Shared Hosting - Basic',
            'description' => 'Perfect for small websites and blogs. 1GB Disk, 10GB Bandwidth, 1 Email, Free SSL',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'basic',
            'auto_setup' => true,
            'status' => 'active',
            'config' => [
                'disk_limit' => 1024,
                'bandwidth_limit' => 10240,
                'email_accounts' => 1,
                'databases' => 1,
            ],
        ], [
            ['cycle' => 'monthly', 'price' => 50000, 'setup_fee' => 0],
            ['cycle' => 'quarterly', 'price' => 135000, 'setup_fee' => 0],
            ['cycle' => 'semiannually', 'price' => 240000, 'setup_fee' => 0],
            ['cycle' => 'annually', 'price' => 450000, 'setup_fee' => 0],
        ]);

        $this->createProductWithPricing([
            'name' => 'Shared Hosting - Standard',
            'description' => 'Great for growing websites. 5GB Disk, 50GB Bandwidth, 10 Emails, Daily Backups',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'standard',
            'auto_setup' => true,
            'status' => 'active',
            'config' => [
                'disk_limit' => 5120,
                'bandwidth_limit' => 51200,
                'email_accounts' => 10,
                'databases' => 5,
            ],
        ], [
            ['cycle' => 'monthly', 'price' => 100000, 'setup_fee' => 0],
            ['cycle' => 'quarterly', 'price' => 270000, 'setup_fee' => 0],
            ['cycle' => 'semiannually', 'price' => 480000, 'setup_fee' => 0],
            ['cycle' => 'annually', 'price' => 900000, 'setup_fee' => 0],
        ]);

        $this->createProductWithPricing([
            'name' => 'Shared Hosting - Premium',
            'description' => 'Best for business websites. 20GB Disk, 200GB Bandwidth, Unlimited Emails, Priority Support',
            'type' => 'hosting',
            'group_id' => $hostingGroup->id,
            'module' => 'cpanel',
            'package_name' => 'premium',
            'auto_setup' => true,
            'status' => 'active',
            'config' => [
                'disk_limit' => 20480,
                'bandwidth_limit' => 204800,
                'email_accounts' => -1,
                'databases' => -1,
            ],
        ], [
            ['cycle' => 'monthly', 'price' => 200000, 'setup_fee' => 0],
            ['cycle' => 'quarterly', 'price' => 540000, 'setup_fee' => 0],
            ['cycle' => 'semiannually', 'price' => 960000, 'setup_fee' => 0],
            ['cycle' => 'annually', 'price' => 1800000, 'setup_fee' => 0],
        ]);

        // Tạo VPS products
        $this->createProductWithPricing([
            'name' => 'VPS - Starter',
            'description' => 'Entry-level VPS. 1 Core, 2GB RAM, 30GB SSD, Full Root Access',
            'type' => 'vps',
            'group_id' => $vpsGroup->id,
            'module' => 'virtualizor',
            'package_name' => 'vps-starter',
            'auto_setup' => false,
            'status' => 'active',
            'config' => [
                'cpu_cores' => 1,
                'ram' => 2048,
                'disk_limit' => 30720,
                'bandwidth_limit' => 1048576,
            ],
        ], [
            ['cycle' => 'monthly', 'price' => 300000, 'setup_fee' => 100000],
            ['cycle' => 'quarterly', 'price' => 810000, 'setup_fee' => 100000],
            ['cycle' => 'annually', 'price' => 2700000, 'setup_fee' => 0],
        ]);

        $this->createProductWithPricing([
            'name' => 'VPS - Business',
            'description' => 'Powerful VPS. 2 Cores, 4GB RAM, 60GB SSD, Daily Backups',
            'type' => 'vps',
            'group_id' => $vpsGroup->id,
            'module' => 'virtualizor',
            'package_name' => 'vps-business',
            'auto_setup' => false,
            'status' => 'active',
            'config' => [
                'cpu_cores' => 2,
                'ram' => 4096,
                'disk_limit' => 61440,
                'bandwidth_limit' => 2097152,
            ],
        ], [
            ['cycle' => 'monthly', 'price' => 600000, 'setup_fee' => 100000],
            ['cycle' => 'quarterly', 'price' => 1620000, 'setup_fee' => 100000],
            ['cycle' => 'annually', 'price' => 5400000, 'setup_fee' => 0],
        ]);

        // Tạo domain products
        $this->createProductWithPricing([
            'name' => 'Domain Registration - .com',
            'description' => 'Register .com domain with WHOIS Privacy, DNS Management',
            'type' => 'domain',
            'group_id' => $domainGroup->id,
            'module' => null,
            'package_name' => null,
            'auto_setup' => false,
            'status' => 'active',
            'config' => [
                'tld' => '.com',
                'min_years' => 1,
                'max_years' => 10,
            ],
        ], [
            ['cycle' => 'annually', 'price' => 300000, 'setup_fee' => 0],
            ['cycle' => 'biennially', 'price' => 580000, 'setup_fee' => 0],
        ]);

        $this->createProductWithPricing([
            'name' => 'Domain Registration - .vn',
            'description' => 'Register .vn domain with DNS Management, Email Forwarding',
            'type' => 'domain',
            'group_id' => $domainGroup->id,
            'module' => null,
            'package_name' => null,
            'auto_setup' => false,
            'status' => 'active',
            'config' => [
                'tld' => '.vn',
                'min_years' => 1,
                'max_years' => 5,
            ],
        ], [
            ['cycle' => 'annually', 'price' => 400000, 'setup_fee' => 0],
            ['cycle' => 'biennially', 'price' => 780000, 'setup_fee' => 0],
        ]);

        $this->command->info('Sample products created successfully!');
        $this->command->info('Total products: ' . Product::count());
    }

    /**
     * Helper để tạo product kèm pricing
     */
    private function createProductWithPricing(array $productData, array $pricingData): void
    {
        $product = Product::create($productData);

        foreach ($pricingData as $pricing) {
            DB::table('whmcs_product_pricing')->insert([
                'product_id' => $product->id,
                'cycle' => $pricing['cycle'],
                'price' => $pricing['price'],
                'setup_fee' => $pricing['setup_fee'] ?? 0,
                'currency' => 'VND',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

