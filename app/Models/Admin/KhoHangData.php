<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class KhoHangData extends Model
{
    protected $table = 'kho_hang_data';

    static function baseQuery()
    {
        return self::where('is_recycle_bin', '!=', 1)->where('is_draft', 0);
    }

    /**
     * Summary of updateKhoHang
     * @param mixed $khoHangId
     * @param mixed $productId
     * @param mixed $soLuong
     * @param mixed $type: plus: công thêm, replace: replace theo $soLuong truyền vào
     * @return void
     */
    static function updateKhoHang($khoHangId, $productId, $soLuong, $type = 'plus')
    {
        $khoHang = self::where('kho_hang_id', $khoHangId)
            ->where('product_id', $productId)
            ->first();
        if ($khoHang) {
            if ($type === 'replace') {
                $khoHang->ton_kho = $soLuong;
            } else { // mặc định là 'add'
                $khoHang->ton_kho = $khoHang->ton_kho + $soLuong;
            }
            $khoHang->save();
        } else {
            // nếu chưa có thì tạo mới
            $khoHang = new self();
            $khoHang->kho_hang_id = $khoHangId;
            $khoHang->product_id = $productId;
            $khoHang->ton_kho = $soLuong;
            $khoHang->is_recycle_bin = 0;
            $khoHang->is_draft = 0;
            $khoHang->save();
        }

        // update lại toàn bộ số lượng trong product
        $khoHangs = self::where('product_id', $productId)->get();
        $tongTonKho = 0;
        $tonKhoDetail = [];
        foreach ($khoHangs as $kh) {
            $tongTonKho += $kh->ton_kho;
            $tonKhoDetail[$kh->kho_hang_id] = [
                'kho_hang_id' => $kh->kho_hang_id,
                'kho_hang_name' => $kh->kho_hang_name,
                'ton_kho' => $kh->ton_kho,
            ];
        }

        $product = Product::find($productId);
        $product->ton_kho_detail = $tonKhoDetail;
        $product->ton_kho = $tongTonKho;
        $product->save();
    }

}
