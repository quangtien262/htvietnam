<?php

namespace App\Http\Controllers\Telesale;

use App\Http\Controllers\Controller;
use App\Models\Telesale\DataKhachHangTelesale;
use App\Services\Telesale\TelesaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DataKhachHangController extends Controller
{
    protected $telesaleService;

    public function __construct(TelesaleService $telesaleService)
    {
        $this->telesaleService = $telesaleService;
    }

    public function index(Request $request)
    {
        $query = DataKhachHangTelesale::with('nhanVienTelesale');

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->phan_loai) {
            $query->where('phan_loai', $request->phan_loai);
        }

        if ($request->nhan_vien_id) {
            $query->where('nhan_vien_telesale_id', $request->nhan_vien_id);
        }

        $data = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function store(Request $request)
    {
        $data = DataKhachHangTelesale::create($request->all());
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $data = DataKhachHangTelesale::findOrFail($id);
        $data->update($request->all());
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function destroy($id)
    {
        DataKhachHangTelesale::findOrFail($id)->delete();
        return response()->json(['message' => 'success']);
    }

    public function phanBo(Request $request)
    {
        $this->telesaleService->phanBoData($request->data_ids, $request->nhan_vien_id);
        return response()->json(['message' => 'Phân bổ data thành công']);
    }

    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'File không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Bỏ qua dòng tiêu đề (row 0)
            $imported = 0;
            $errors = [];

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                // Kiểm tra dòng rỗng
                if (empty($row[0]) && empty($row[1])) {
                    continue;
                }

                try {
                    DataKhachHangTelesale::create([
                        'ten_khach_hang' => $row[0] ?? '',
                        'sdt' => $row[1] ?? '',
                        'email' => $row[2] ?? null,
                        'dia_chi' => $row[3] ?? null,
                        'nguon_data' => $row[4] ?? 'mua_data',
                        'phan_loai' => $row[5] ?? 'lanh',
                        'trang_thai' => 'moi',
                        'ghi_chu' => $row[6] ?? null,
                    ]);
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Dòng " . ($i + 1) . ": " . $e->getMessage();
                }
            }

            $message = "Import thành công {$imported} bản ghi";
            if (count($errors) > 0) {
                $message .= ". Có " . count($errors) . " lỗi.";
            }

            return response()->json([
                'message' => $message,
                'imported' => $imported,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi đọc file: ' . $e->getMessage()], 500);
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Tiêu đề cột
        $sheet->setCellValue('A1', 'Tên khách hàng (*)');
        $sheet->setCellValue('B1', 'Số điện thoại (*)');
        $sheet->setCellValue('C1', 'Email');
        $sheet->setCellValue('D1', 'Địa chỉ');
        $sheet->setCellValue('E1', 'Nguồn data');
        $sheet->setCellValue('F1', 'Phân loại');
        $sheet->setCellValue('G1', 'Ghi chú');

        // Dữ liệu mẫu
        $sheet->setCellValue('A2', 'Nguyễn Văn A');
        $sheet->setCellValue('B2', '0901234567');
        $sheet->setCellValue('C2', 'nguyenvana@example.com');
        $sheet->setCellValue('D2', 'Hà Nội');
        $sheet->setCellValue('E2', 'website');
        $sheet->setCellValue('F2', 'nong');
        $sheet->setCellValue('G2', 'Khách hàng tiềm năng');

        // Ghi chú hướng dẫn
        $sheet->setCellValue('A4', 'Hướng dẫn:');
        $sheet->setCellValue('A5', '- Cột có dấu (*) là bắt buộc');
        $sheet->setCellValue('A6', '- Nguồn data: mua_data, website, facebook, landing_page, gioi_thieu');
        $sheet->setCellValue('A7', '- Phân loại: nong (Đỏ), am (Vàng), lanh (Xanh)');

        // Format tiêu đề
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        $sheet->getStyle('A1:G1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE0E0E0');

        // Tự động điều chỉnh độ rộng cột
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Xuất file
        $writer = new Xlsx($spreadsheet);
        $filename = 'template_data_khach_hang_telesale.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }
}
