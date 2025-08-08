<?php

namespace Database\Seeders;

use App\Models\Admin\Table;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Web\Menu;
use App\Models\Web\WebConfig;
use Illuminate\Support\Facades\DB;
use App\Services\Admin\CrawlService;
use App\Services\MigrateService;

class StatusSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $tableName = [
            'gioi_tinh'
        ];

        // foreach ($tableName as $table) {
        //      DB::table($table)->insert(['name'=>$table . ' - test' ]);
        // }
    }
}

