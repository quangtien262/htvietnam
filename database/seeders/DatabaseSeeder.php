<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // $this->call(TablesTableSeeder::class);
        $this->call(DefaultSeeder::class);
        $this->call(AdminUserTableSeeder::class);
        $this->call(CountriesTableSeeder::class);

        $this->call(ProjectSeeder::class);

        $this->call(StatusSeeder::class);

        $this->call(AdminMenuSeeder::class);

        $this->call(HimalayaSeeder::class);

        if(!empty(env('APP_LAYOUT'))) {
            $this->call('Database\Seeders\TablesLayout'.env('APP_LAYOUT').'Seeder');
        }

        // WHMCS test data
        $this->call(WhmcsCompleteTestDataSeeder::class);
    }
};
