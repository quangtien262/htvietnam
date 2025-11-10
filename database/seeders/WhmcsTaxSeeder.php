<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WhmcsTaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxRules = [
            // Vietnam VAT
            [
                'name' => 'VAT Vietnam (10%)',
                'type' => 'vat',
                'rate' => 10.00,
                'country' => 'VN',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Vietnam VAT Reduced
            [
                'name' => 'VAT Vietnam Reduced (5%)',
                'type' => 'vat',
                'rate' => 5.00,
                'country' => 'VN',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Singapore GST
            [
                'name' => 'GST Singapore (8%)',
                'type' => 'gst',
                'rate' => 8.00,
                'country' => 'SG',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // US Sales Tax - California
            [
                'name' => 'Sales Tax California (7.25%)',
                'type' => 'sales_tax',
                'rate' => 7.25,
                'country' => 'US',
                'state' => 'CA',
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // US Sales Tax - New York
            [
                'name' => 'Sales Tax New York (4%)',
                'type' => 'sales_tax',
                'rate' => 4.00,
                'country' => 'US',
                'state' => 'NY',
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // EU VAT - Germany
            [
                'name' => 'VAT Germany (19%)',
                'type' => 'vat',
                'rate' => 19.00,
                'country' => 'DE',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // EU VAT - France
            [
                'name' => 'VAT France (20%)',
                'type' => 'vat',
                'rate' => 20.00,
                'country' => 'FR',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // UK VAT
            [
                'name' => 'VAT United Kingdom (20%)',
                'type' => 'vat',
                'rate' => 20.00,
                'country' => 'GB',
                'state' => null,
                'is_compound' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('whmcs_tax_rules')->insert($taxRules);
    }
}
