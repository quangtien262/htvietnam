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
            Schema::create('nhan_vien_thuc_hien', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();

                $table->integer('chung_tu_id')->nullable();
                $table->string('loai_chung_tu')->nullable(); // ten bang
                $table->string('ma_chung_tu')->nullable();

                $table->integer('nhan_vien_id')->nullable(); // convert
                $table->string('chung_tu_chi_tiet_id')->nullable(); // convert
                // $table->string('ID_CongViec')->nullable();
                $table->integer('TienChietKhau')->default(0)->nullable();
                $table->integer('phan_tram_chiet_khau')->nullable();
                $table->integer('LaPhanTram')->default(1)->nullable();
                $table->integer('LaNhanVienChinh')->nullable();
                $table->text('DienGiai')->nullable();
                $table->integer('DuocYeuCau')->default(0)->nullable();
                $table->integer('ChiPhiThucHien')->default(0)->nullable();
                $table->string('LaPTChiPhiThucHien')->nullable();

                $table->string('lucky_id')->nullable();


                MigrateService::createBaseColumn($table);
            });


        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('nhan_vien_thuc_hien');
        }
    };
