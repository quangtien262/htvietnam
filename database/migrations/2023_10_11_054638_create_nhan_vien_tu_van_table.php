 <?php

    use App\Models\Admin\Column;
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
            Schema::create('nhan_vien_tu_van', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->integer('nhan_vien_id')->nullable();

                $table->integer('chung_tu_id')->nullable();
                $table->string('loai_chung_tu')->nullable(); // ten bang
                $table->string('ma_chung_tu')->nullable();
                $table->integer('chung_tu_chi_tiet_id')->nullable();
                
                $table->integer('TienChietKhau')->nullable();
                $table->integer('phan_tram_chiet_khau')->nullable();
                $table->integer('LaPhanTram')->default(1)->nullable();
                $table->text('DienGiai')->nullable();
                
                MigrateService::createBaseColumn($table);
            });
            
            
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('nhan_vien_tu_van');
        }
    };
