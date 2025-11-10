<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class WhmcsPhase3Seeder extends Seeder
{
    /**
     * Run WHMCS Phase 3 seeders
     */
    public function run(): void
    {
        $this->call([
            WhmcsCurrencySeeder::class,
            WhmcsTaxSeeder::class,
            WhmcsKnowledgeBaseSeeder::class,
        ]);

        $this->command->info('✅ WHMCS Phase 3 data seeded successfully!');
        $this->command->info('📊 Seeded:');
        $this->command->info('   - 8 Currencies (VND, USD, EUR, GBP, JPY, CNY, SGD, THB)');
        $this->command->info('   - 8 Tax Rules (Vietnam VAT, Singapore GST, US Sales Tax, EU VAT)');
        $this->command->info('   - 5 KB Categories + 5 Articles');
    }
}
