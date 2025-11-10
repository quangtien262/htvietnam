<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WhmcsCurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if currencies already exist
        if (DB::table('whmcs_currencies')->count() > 0) {
            $this->command->info('Currencies already seeded, skipping...');
            return;
        }

        $currencies = [
            [
                'code' => 'VND',
                'name' => 'Vietnamese Dong',
                'symbol' => '₫',
                'format' => '{amount} {symbol}',
                'exchange_rate' => 24000.000000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 0,
                'position' => 'after',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 1.000000, // Base currency
                'is_base' => true,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 0.920000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 0.790000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 149.500000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 0,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'CNY',
                'name' => 'Chinese Yuan',
                'symbol' => '¥',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 7.250000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SGD',
                'name' => 'Singapore Dollar',
                'symbol' => 'S$',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 1.340000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'THB',
                'name' => 'Thai Baht',
                'symbol' => '฿',
                'format' => '{symbol}{amount}',
                'exchange_rate' => 35.500000,
                'is_base' => false,
                'is_active' => true,
                'decimal_places' => 2,
                'position' => 'before',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('whmcs_currencies')->insert($currencies);
    }
}
