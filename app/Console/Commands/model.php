<?php

namespace App\Console\Commands;

use App\Services\Admin\AutoGenService;
use Illuminate\Console\Command;

class model extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:model';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto create model';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            AutoGenService::genModel('./app/Models/Auto/');
            $this->info('create successfully!');
        } catch (\Throwable $th) {
            $this->error($th->getMessage());
        }
    }
}
