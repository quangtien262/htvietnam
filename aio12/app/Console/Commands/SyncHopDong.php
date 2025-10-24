<?php

namespace App\Console\Commands;

use App\Services\Admin\AutoGenService;
use App\Services\Admin\TblService;
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

        // $this->info('Start import service..');
        // $this->serviceSync();

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
        try {
            foreach ($sheet as $index => $row) {
                if ($index === 0) continue; // bỏ header


                DB::table('contract')->insert([
                    'contract_status_id'   => 1,
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

                    'start_date' => $this->excelDateToDate($row[15] ?? null),
                    'end_date' => $this->excelDateToDate($row[16] ?? null),
                    'gia_thue' => $row[18] ?? '',
                    'tien_coc' => $row[17] ?? '',
                    'ky_thanh_toan' => $row[19] ?? 1,
                    'so_nguoi' => $row[14] ?? '',
                    'ngay_hen_dong_tien' => $row[20] ?? '',

                    'phi_moi_gioi' => $row[21] ?? '',

                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        } catch (\Throwable $th) {
            throw $th;
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
        try {
            foreach (array_slice($rows, 1) as $row) {
                $data = array_combine($header, $row);
                // Insert vào bảng room (map đúng tên cột)
                $name = '';
                $apm = $data['house_id'];
                switch ($apm) {
                    case 1:
                        $name = $data['room_number'] . '/583';
                        break;
                    case 3:
                        $name = $data['room_number'] . '/30/185';
                        break;
                    case 14:
                        $name = $data['room_number'] . '/10C/115(122m2)';
                        break;
                    case 17:
                        $name = $data['room_number'] . '/10B/115(65m2)';
                        break;
                    case 16:
                        $name = $data['room_number'] . '/10D/115(85m2)';
                        break;
                    case 15:
                        $name = $data['room_number'] . '/63(100m2)';
                        break;
                    case 8:
                        $name = $data['room_number'] . '/8B';
                        break;
                    case 6:
                        $name = $data['room_number'] . '/30/17TV';
                        break;
                    case 7:
                        $name = $data['room_number'] . '/32/17TV';
                        break;
                    case 9:
                        $name = $data['room_number'] . '/17/22Lụa';
                        break;
                    case 12:
                        $name = $data['room_number'] . '/17/843QT';
                        break;
                    case 11:
                        $name = $data['room_number'] . '/592QT';
                        break;
                    case 29:
                        $name = $data['room_number'] . '/15A';
                        break;
                    case 11:
                        $name = $data['room_number'] . '/15B';
                        break;
                    case 5:
                        $name = $data['room_number'] . '/592QT';
                        break;
                    case 18:
                        $name = $data['room_number'] . '/46PK';
                        break;
                    case 19:
                        $name = $data['room_number'] . '/282DC';
                        break;
                    case 20:
                        $name = $data['room_number'] . '/37KD';
                        break;
                    case 27:
                        $name = $data['room_number'] . '/40LQD';
                        break;
                    case 26:
                        $name = $data['room_number'] . '/25C';
                        break;
                    case 31:
                        $name = $data['room_number'] . '/25B';
                        break;
                    case 28:
                        $name = $data['room_number'] . '/65Van';
                        break;
                    default:
                        $apm = null;
                        break;
                }
                DB::table('room')->insert([
                    'id' => $data['id'],
                    'apartment_id' => $data['house_id'] ?? null,
                    'name'  => $name,
                    'room_status_id'  => 1,
                ]);
            }
        } catch (\Throwable $th) {
            $dataError[] = [
                'id' => $data['id'],
                'apartment_id' => $data['house_id'] ?? null,
                'name'  => $data['room_number'] ?? null,
            ];
            // throw $th;
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
                // Insert vào bảng room (map đúng tên cột)
                $dataInsert = [
                    'id' => $data['id'],
                    'name'  => $data['name'] ?? '',
                    'price_default'  => $data['price'] ?? 0,
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
        DB::table('users')->truncate();
        // reset auto increment
        DB::statement('ALTER TABLE users AUTO_INCREMENT = 1;');
        $csv = storage_path('app/public/migrate/res_partner.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header
        // Lặp qua từng dòng dữ liệu (bỏ dòng header)

        $password = bcrypt('abc123');
        $phoneError = [];
        foreach (array_slice($rows, 1) as $row) {
            // Bỏ qua dòng không đủ cột
            if (count($row) !== count($header)) {
                continue;
            }
            $data = array_combine($header, $row);

            // if (!$this->isValidVietnamPhone($data['phone'])) {
            //     $phoneError[] = $data['phone'];
            //     continue;
            // }

            try {
                $code = 'KHA' . TblService::formatNumberByLength($data['id'], 5);
                $dataInsert = [
                    'id' => $data['id'],
                    'code'  => $code,
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
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];

                DB::table('users')->insert($dataInsert);
            } catch (\Throwable $th) {
            }
        }
        $this->info('Đã import xong room!');
    }

    private function excelDateToDate($excelDate)
    {
        if (is_numeric($excelDate)) {
            return date('Y-m-d', ($excelDate - 25569) * 86400);
        }
        return $excelDate;
    }


    private function isValidVietnamPhone($phone)
    {
        // Chuẩn hóa: bỏ khoảng trắng, dấu +84 về 0
        $phone = preg_replace('/\s+/', '', $phone);
        if (strpos($phone, '+84') === 0) {
            $phone = '0' . substr($phone, 3);
        }
        // Regex: bắt đầu bằng 0, tiếp theo là 9 hoặc 10 số
        return preg_match('/^0[1-9][0-9]{8,9}$/', $phone);
    }
}
