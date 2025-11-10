 <?php

    use App\Models\Admin\Table;
    use App\Services\MigrateService;
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('so_quy_type', function (Blueprint $table) {
                $table->id();
                MigrateService::createColumn2SettingTable($table);
                MigrateService::createBaseColumn($table);
                // Removed duplicate $table->timestamps() - already in createBaseColumn
            });


        }
        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('so_quy_type');
        }
    };
