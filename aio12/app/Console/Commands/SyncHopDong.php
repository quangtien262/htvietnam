<?php

namespace App\Console\Commands;

use App\Services\Admin\AutoGenService;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class SyncHopDong extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Start import hợp đồng...');
        $this->hopDongSync();

        $this->info('Start import phòng...');
        $this->roomSync();

        $this->info('Start import số điện nước..');
        $this->dienNuocSync();

        $this->info('Start import service..');
        $this->serviceSync();

        $this->info('Start import user..');
        $this->userSync();
    }

    public function hopDongSync()
    {
        DB::table('contract')->truncate();
        $excelFilePath = storage_path('app/public/migrate/hopdong.xlsx');

        // Đọc file excel
        $rows = Excel::toArray([], $excelFilePath);

        // $rows[0] là sheet đầu tiên, mỗi phần tử là 1 dòng (array)
        $sheet = $rows[0];
        // Giả sử dòng đầu là header, bắt đầu từ dòng thứ 2
        foreach ($sheet as $index => $row) {
            if ($index === 0) continue; // bỏ header

            try {
                DB::table('contract')->insert([
                    'id'   => $row[0] ?? null,
                    'name'   => $row[2] ?? null,
                    'code' => $row[1] ?? null,
                    'room_id' => $row[4] ?? null,
                    'apartment_id' => $row[3] ?? null,
                    'user_id' => $row[5] ?? null,

                    'ho_ten' => $row[6] ?? '',
                    'phone' => $row[9] ?? '',
                    'email' => $row[7] ?? '',
                    'cccd' => $row[10] ?? '',
                    'ngay_cap' => $this->excelDateToDate($row[12] ?? null),
                    'noi_cap' => $row[11] ?? null,
                    'dob' => $this->excelDateToDate($row[8] ?? null),
                    'hktt' => $row[13] ?? '',

                    'ngay_ky' => $this->excelDateToDate($row[15] ?? null),
                    'ngay_bat_dau' => $this->excelDateToDate($row[15] ?? null),
                    'ngay_ket_thuc' => $this->excelDateToDate($row[16] ?? null),
                    'gia_thue' => $row[18] ?? '',
                    'tien_coc' => $row[17] ?? '',
                    'ky_thanh_toan' => $row[19] ?? 1,
                    'so_luong' => $row[14] ?? '',
                    'ngay_thanh_toan' => $row[20] ?? '',

                    'phi_moi_gioi' => $row[21] ?? '',
                    'phi_quan_ly' => $row[22] ?? '',

                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            } catch (\Throwable $th) {
                dd($row);
            }
        }

        $this->info('Đã import xong hợp đồng!');
    }

    private function roomSync()
    {

        DB::table('room')->truncate();
        $csv = storage_path('app/public/migrate/aitilen_room.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header

        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        foreach (array_slice($rows, 1) as $row) {
            try {
                $data = array_combine($header, $row);
                // Insert vào bảng room (map đúng tên cột)
                DB::table('room')->insert([
                    'id' => $data['id'],
                    'apartment_id' => $data['house_id'] ?? null,
                    'name'  => $data['room_number'] ?? null,
                ]);
            } catch (\Throwable $th) {
                $dataError[] = [
                    'id' => $data['id'],
                    'apartment_id' => $data['house_id'] ?? null,
                    'name'  => $data['room_number'] ?? null,
                ];
                // throw $th;
            }
        }
        if (!empty($dataError)) {

            $this->error('OKKKK');
        } else {
            $this->info('Đã import xong room!');
        }
    }

    private function dienNuocSync()
    {
        DB::table('room_dien_nuoc')->truncate();
        $csv = storage_path('app/public/migrate/aitilen_consumption_meter_price_service.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header

        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        foreach (array_slice($rows, 1) as $row) {
            try {
                $data = array_combine($header, $row);
                // Insert vào bảng room (map đúng tên cột)
                $dataInsert = [
                    'id' => $data['id'],
                    'name'  => $data['room_number'] ?? null,
                    'room_id'  => $data['room_id'] ?? null,
                    'apartment_id'  => $data['house_id'] ?? null,
                    'hop_dong_id'  => $data['room_contract_id'] ?? null,
                    'cur_number'  => $data['cur_number'] ?? null,
                    'new_number'  => $data['new_number'] ?? null,
                ];

                DB::table('room_dien_nuoc')->insert($dataInsert);
            } catch (\Throwable $th) {
                $dataError[] = [
                    'id' => $data['id'],
                    'name'  => $data['room_number'] ?? null,
                    'room_id'  => $data['room_id'] ?? null,
                ];
                // throw $th;
            }
        }
        if (!empty($dataError)) {

            $this->error('OKKKK');
        } else {
            $this->info('Đã import xong room!');
        }
    }

    private function serviceSync()
    {
        DB::table('aitilen_service')->truncate();
        $csv = storage_path('app/public/migrate/aitilen_fix_price_service.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header

        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        foreach (array_slice($rows, 1) as $row) {
            try {
                $data = array_combine($header, $row);
                // dd($data);
                // Insert vào bảng room (map đúng tên cột)
                $dataInsert = [
                    'id' => $data['id'],
                    'name'  => $data['name'] ?? '',
                    'price_default'  => $data['price'] ?? 0,
                    'fix_price_service_id'  => $data['price'] ?? 0,
                ];

                DB::table('aitilen_service')->insert($dataInsert);
            } catch (\Throwable $th) {
                $dataError[] = [
                    'id' => $data['id'],
                    'name'  => $data['name'] ?? null,
                    'price_default'  => $data['house_id'] ?? null,
                ];
                // throw $th;
            }
        }
        if (!empty($dataError)) {
            $this->error('OKKKK');
        } else {
            $this->info('Đã import xong room!');
        }
    }

    private function userSync()
    {
        DB::table('contract')->truncate();
        $excelFilePath = storage_path('app/public/migrate/hopdong.xlsx');

        // Đọc file excel
        $rows = Excel::toArray([], $excelFilePath);

        // $rows[0] là sheet đầu tiên, mỗi phần tử là 1 dòng (array)
        $sheet = $rows[0];
        // Giả sử dòng đầu là header, bắt đầu từ dòng thứ 2
        foreach ($sheet as $index => $row) {
            if ($index === 0) continue; // bỏ header

            try {
                DB::table('contract')->insert([
                    'id'   => $row[0] ?? null,
                    'name'   => $row[2] ?? null,
                    'code' => $row[1] ?? null,
                    'room_id' => $row[4] ?? null,
                    'apartment_id' => $row[3] ?? null,
                    'user_id' => $row[5] ?? null,

                    'ho_ten' => $row[6] ?? '',
                    'phone' => $row[9] ?? '',
                    'email' => $row[7] ?? '',
                    'cccd' => $row[10] ?? '',
                    'ngay_cap' => $this->excelDateToDate($row[12] ?? null),
                    'noi_cap' => $row[11] ?? null,
                    'dob' => $this->excelDateToDate($row[8] ?? null),
                    'hktt' => $row[13] ?? '',

                    'ngay_ky' => $this->excelDateToDate($row[15] ?? null),
                    'ngay_bat_dau' => $this->excelDateToDate($row[15] ?? null),
                    'ngay_ket_thuc' => $this->excelDateToDate($row[16] ?? null),
                    'gia_thue' => $row[18] ?? '',
                    'tien_coc' => $row[17] ?? '',
                    'ky_thanh_toan' => $row[19] ?? 1,
                    'so_luong' => $row[14] ?? '',
                    'ngay_thanh_toan' => $row[20] ?? '',

                    'phi_moi_gioi' => $row[21] ?? '',
                    'phi_quan_ly' => $row[22] ?? '',

                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            } catch (\Throwable $th) {
                dd($row);
            }
        }


        DB::table('users')->truncate();
        $csv = storage_path('app/public/migrate/res_partner.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header
        // Lặp qua từng dòng dữ liệu (bỏ dòng header)

        $password = bcrypt('abc123');
        foreach (array_slice($rows, 1) as $row) {
            // Bỏ qua dòng không đủ cột
            if (count($row) !== count($header)) {
                continue;
            }
            try {
                $data = array_combine($header, $row);
                // dd($data);
                // Insert vào bảng room (map đúng tên cột)
                // if ($data['active'] == False) {
                //     continue;
                // }

                $dataInsert = [
                    'id' => $data['id'],
                    'name'  => $data['name'] ?? '',
                    'username'  => $data['phone'] ?? null,
                    'password'  => $password,
                    'ngay_sinh'  => $data['p_birthday'] ?? null,
                    'user_status_id'  => 1,
                    'phone'  => $data['phone'] ?? null,
                    'email'  => $data['email'] ?? null,
                    'cccd'  => $data['p_id_number'] ?? null,
                    'ngay_cap'  => $data['p_id_issued_date'] ?? null,
                    'noi_cap'  => $data['p_id_issued_by'] ?? null,
                    'hktt'  => $data['p_id_permanent_residence'] ?? null,
                ];

                DB::table('users')->insert($dataInsert);
            } catch (\Throwable $th) {
                $dataError[] = [
                    'id' => $data['id'],
                    'name'  => $data['room_number'] ?? null,
                    'room_id'  => $data['room_id'] ?? null,
                ];
                // throw $th;
            }
        }
        if (!empty($dataError)) {
            // dd($dataError);
            $this->error('OKKKK');
        } else {
            $this->info('Đã import xong room!');
        }
    }

    private function excelDateToDate($excelDate)
    {
        if (is_numeric($excelDate)) {
            return date('Y-m-d', ($excelDate - 25569) * 86400);
        }
        return $excelDate;
    }

    private function extractNameFromSignature($html)
    {
        // Loại bỏ thẻ <p> và <br>
        $text = strip_tags($html);
        // Loại bỏ dấu -- nếu có
        $text = trim(str_replace('--', '', $text));
        // Loại bỏ khoảng trắng thừa
        return trim($text);
    }
}
