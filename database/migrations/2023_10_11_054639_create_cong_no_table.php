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
            Schema::create('cong_no', function (Blueprint $table) {
                $table->id();

                $table->string('name')->nullable();
                $table->string('code')->nullable();

                $table->integer('users_id')->nullable();
                $table->integer('nha_cung_cap_id')->default(0)->nullable();

                // receivable: nợ cần thu (khách hàng nợ ta)
                // payable: nợ phải trả (ta nợ nhà cung cấp)
                $table->string('loai_cong_no')->nullable()->comment('receivable hoặc payable');

                // product_tra_hang_ncc, product_nhap_hang,
                // hoa_don, product_khach_tra_hang
                $table->string('loai_chung_tu')->nullable();
                $table->integer('chung_tu_id')->default(0)->nullable();
                $table->string('ma_chung_tu')->nullable();

                $table->integer('product_id')->default(0)->nullable();
                $table->string('product_code')->nullable();

                $table->integer('tong_tien_hoa_don')->default(0)->nullable();
                $table->integer('so_tien_da_thanh_toan')->default(0)->nullable();
                $table->integer('so_tien_no')->default(0)->nullable();
                $table->integer('cong_no_status_id')->default(0)->nullable();
                $table->date('ngay_hen_tat_toan')->nullable();
                $table->date('ngay_tat_toan')->nullable(); // ngay tất toán thực tế

                $table->text('info')->nullable();

                MigrateService::createBaseColumn($table);

            });



        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('cong_no');
        }
    };
