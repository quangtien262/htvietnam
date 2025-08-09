<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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

        $this->call(HimalayaSeeder::class);
        $this->call(StatusSeeder::class);

        if(!empty(env('APP_LAYOUT'))) {
            $this->call('Database\Seeders\TablesLayout'.env('APP_LAYOUT').'Seeder');
        }

    }
}
