<?php

namespace App\Console\Commands;

use App\Models\Admin\AitilenDienNuoc;
use App\Models\Admin\AitilenService;
use App\Models\Admin\Contract;
use App\Models\Admin\ContractService;
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

        $this->info('Start import user..');
        $this->userSync();

        $this->info('Start import số điện nước..');
        $this->dienNuocSync02();

        $this->info('xóa service bị duplicate trong hợp đồng...');
        $this->removeDuplicateContractServices();
    }

    private function removeDuplicateContractServices()
    {
        $contracts = Contract::all();
        foreach ($contracts as $contract) {
            $services = ContractService::where('contract_id', $contract->id)->get();
            $seen = [];
            foreach ($services as $service) {
                $key = $service->service_id;
                if (isset($seen[$key])) {
                    // Duplicate found, delete this record
                    $service->delete();
                } else {
                    $seen[$key] = true;
                }
            }
        }
        $this->info('Đã xóa xong dịch vụ bị duplicate trong hợp đồng!');
    }

    public function hopDongSync02()
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

                $name = '';
                if (!empty($row[2])) {
                    $name = $this->ucwords_unicode($row[2]);
                }

                DB::table('contract')->insert([
                    'contract_status_id'   => 1,
                    'id'   => $row[0] ?? null,
                    'name'   => $name,
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

    public function hopDongSync()
    {
        DB::table('contract')->truncate();
        DB::table('contract_service')->truncate();
        $excelFilePath = storage_path('app/public/migrate/hopdong.xlsx');

        // Đọc file excel
        $rows = Excel::toArray([], $excelFilePath);

        // $rows[0] là sheet đầu tiên, mỗi phần tử là 1 dòng (array)
        $sheet = $rows[0];
        // Giả sử dòng đầu là header, bắt đầu từ dòng thứ 2
        try {
            foreach ($sheet as $index => $row) {
                if ($index === 0) continue; // bỏ header

                $name = '';
                if (!empty($row[2])) {
                    $name = $this->ucwords_unicode($row[2]);
                }

                DB::table('contract')->insert([
                    'contract_status_id'   => 1,
                    'id'   => $row[0] ?? null,
                    'name'   => $name,
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

            $serviceDefault = AitilenService::where('is_contract_default', 1)
                ->orderBy('sort_order', 'asc')->get()->toArray();

            $serviceData = [];
            foreach ($serviceDefault as $ser) {
                $total = 0;
                if ($ser['per_default'] == 'Người') {
                    $total = $ser['price_default']; // mặc định 1 người
                } elseif ($ser['per_default'] == 'Phòng') {
                    $total = $ser['price_default'];
                }
                $serviceData[] = [
                    'id' => $ser['id'],
                    'service_id' => $ser['id'],
                    'name' => $ser['name'],
                    'code' => $ser['code'],
                    'per_default' => $ser['per_default'],
                    'price_default' => $ser['price_default'],
                    'price_total' => $total,
                    // 'so_nguoi' => $contract->so_nguoi,
                    // $dataInsert['contract_id'] = $contract->id;
                ];
            }
            /////////////// create dv:
            $contracts = Contract::get();
            foreach ($contracts as $contract) {
                $dataInsert = [];
                $totalSer = 0;
                foreach ($serviceData as $ser) {
                    $item = $ser;
                    $total = $ser['price_total'];
                    if ($ser['per_default'] == 'Người') {
                        $total = $ser['price_default'] * intval($contract->so_nguoi);
                    }
                    $totalSer += intval($total);
                    $item['price_total'] = $total;
                    $item['so_nguoi'] = $contract->so_nguoi;
                    $item['contract_id'] = $contract->id;
                    $dataInsert[] = $item;

                    // save to database để tối ưu cho tìm kiếm và chuẩn hóa dữ liệu
                    $contractService = new ContractService();
                    $contractService->contract_id = $contract->id;
                    $contractService->so_nguoi = $contract->so_nguoi;
                    $contractService->service_id = $ser['id'];
                    $contractService->price = $ser['price_default'];
                    $contractService->per = $ser['per_default'];
                    $contractService->total = $total;
                    $contractService->save();
                    // dd($contractService);
                }
                // dd($dataInsert);
                $contract->services = $dataInsert;
                $contract->total = $totalSer + intval($contract->gia_thue) + intval($contract->tien_coc);
                $contract->total_service = $totalSer;
                $contract->total_phi_co_dinh = $totalSer + $contract->gia_thue;
                $contract->save();
            }
        } catch (\Throwable $th) {
            throw $th;
        }

        $this->info('Đã import xong hợp đồng!');
    }

    private function roomSync()
    {

        DB::table('room')->truncate();
        $csv = storage_path('app/public/migrate/aitilen_room_2.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header

        // Lặp qua từng dòng dữ liệu (bỏ dòng header)

        foreach (array_slice($rows, 1) as $data) {
            if (in_array($data[1], [4, 21, 22, 23, 24, 25])) {
                continue;
            }
            try {
                // $data = array_combine($header, $rows);
                // Insert vào bảng room (map đúng tên cột)
                $name = '';
                $apm = $data[1];
                switch ($apm) {
                    case 1:
                        $name = $data[2] . '/583';
                        break;
                    case 3:
                        $name = $data[2] . '/30/185';
                        break;
                    case 14:
                        $name = $data[2] . '/10C/115(122m2)';
                        break;
                    case 17:
                        $name = $data[2] . '/10B/115(65m2)';
                        break;
                    case 16:
                        $name = $data[2] . '/10D/115(85m2)';
                        break;
                    case 15:
                        $name = $data[2] . '/63(100m2)';
                        break;
                    case 8:
                        $name = $data[2] . '/8B';
                        break;
                    case 6:
                        $name = $data[2] . '/30/17TV';
                        break;
                    case 7:
                        $name = $data[2] . '/32/17TV';
                        break;
                    case 9:
                        $name = $data[2] . '/17/22Lụa';
                        break;
                    case 12:
                        $name = $data[2] . '/17/843QT';
                        break;
                    case 11:
                        $name = $data[2] . '/592QT';
                        break;
                    case 29:
                        $name = $data[2] . '/15A';
                        break;
                    case 5:
                        $name = $data[2] . '/15B';
                        break;
                    case 18:
                        $name = $data[2] . '/46PK';
                        break;
                    case 19:
                        $name = $data[2] . '/282DC';
                        break;
                    case 20:
                        $name = $data[2] . '/37KD';
                        break;
                    case 27:
                        $name = $data[2] . '/40LQD';
                        break;
                    case 26:
                        $name = $data[2] . '/25C';
                        break;
                    case 31:
                        $name = $data[2] . '/25B';
                        break;
                    case 28:
                        $name = $data[2] . '/65Van';
                        break;
                    case 10:
                        $name = $data[2] . '/02/16VP';
                        break;
                    default:
                        $apm = null;
                        break;
                }
                DB::table('room')->insert([
                    'id' => $data[0],
                    'apartment_id' => $data[1] ?? null,
                    'name'  => $name,
                    'room_status_id'  => 1,
                ]);
            } catch (\Throwable $th) {
                echo 'Header count: ' . count($header);
                echo "\n";
                echo 'Rows count: ' . count($data);
                echo "\n";
                echo $th->getMessage();
                dd($data);
                // $dataError[] = [
                //     'id' => $data['id'],
                //     'apartment_id' => $data['house_id'] ?? null,
                //     'name'  => $data['room_number'] ?? null,
                // ];
                throw $th;
            }
        }
        $this->info('Đã import xong room!');
    }

    private function hopDongService()
    {
        DB::table('contract_service')->truncate();
        $csv = storage_path('app/public/migrate/room_contract_fix_price_service.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header

        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        $per = [
            'per_person' => 'Person',
            'per_room' => 'Room',
        ];
        // save
        foreach (array_slice($rows, 1) as $row) {

            try {
                $data = array_combine($header, $row);

                if (empty($data['room_contract_id']) || $data['room_contract_id'] == 'NULL') {
                    continue;
                }

                DB::table('contract_service')->insert([
                    'contract_id' => $data['room_contract_id'] ?? null,
                    'service_id'  => $data['fix_price_service_id'] ?? null,
                    'price'  => $data['price'] ?? 0,
                    'per'  => $per[$data['type']] ?? '',
                ]);
            } catch (\Throwable $th) {
                echo 'Header count: ' . count($header);
                echo "\n";
                echo 'Rows count: ' . count($row);
                echo "\n";
                echo $th->getMessage();
                dd($row);
                // $dataError[] = [
                //     'id' => $data['id'],
                //     'apartment_id' => $data['house_id'] ?? null,
                //     'name'  => $data['room_number'] ?? null,
                // ];
                throw $th;
            }
        }

        $this->info('------ hợp đồng dịch vụ...');
        // update service 2 hdong
        $contacts = Contract::get();
        foreach ($contacts as $contract) {
            $services = ContractService::select(
                'contract_service.id as contract_service_id',
                'contract_service.contract_id',
                'contract_service.service_id',
                'aitilen_service.name',
                'contract_service.price',
                'contract_service.per',
                'aitilen_service.name as service_name',
            )
                ->where('contract_id', $contract->id)
                ->leftJoin('aitilen_service', 'aitilen_service.id', '=', 'contract_service.service_id')
                ->get()->toArray();

            // $serviceNames = [];
            // foreach($services as $service) {
            //     $svc = DB::table('aitilen_service')->where('id', $service['service_id'])->first();
            //     $serviceNames[] = $service;
            //     $serviceNames['service_name'] = $svc ? $svc->name : '';
            // }
            $hopdong = Contract::find($contract->id);
            $hopdong->services = $services;
            $hopdong->save();
        }

        $this->info('Đã import xong!');
        dd($hopdong->id);
    }

    private function dienNuocSync02()
    {
        DB::table('aitilen_dien_nuoc')->truncate();
        // $csv = storage_path('app/public/migrate/aitilen_consumption_meter_price_service.csv');
        $csv = storage_path('app/public/migrate/SoDienNuoc.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header


        $roomEmpty = [];
        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        // dd($rows);
        foreach ($rows as $idx => $row) {
            if ($idx == 0) {
                continue;
            }
            // try {


            if ($row[1] == '') {
                $roomEmpty[] = $row;
                continue;
            }

            $dienNuoc = AitilenDienNuoc::where('room_id', $row[1])->first();
            $room = DB::table('room')->where('id', $row[1])->first();
            if (empty($dienNuoc)) {
                $dienNuoc = new AitilenDienNuoc();
            }

            $dienNuoc->month = 10;
            $dienNuoc->year = 2025;

            $dienNuoc->room_id = $row[1] ?? null;
            $dienNuoc->apartment_id = $room->apartment_id ?? null;

            $dichVu = trim(mb_substr($row[3], 0, 3, 'UTF-8'));
            // dd($dichVu);
            switch ($dichVu) {
                case 'Điệ':
                    $dienNuoc->dien_start = $row[4] ?? 0;
                    $dienNuoc->dien_end = $row[5] ?? 0;
                    break;
                case 'Nướ':
                    $dienNuoc->nuoc_start = $row[4] ?? 0;
                    $dienNuoc->nuoc_end = $row[5] ?? 0;
                    break;
                case 'WC':
                    $dienNuoc->nonglanh_start = $row[4] ?? 0;
                    $dienNuoc->nonglanh_end = $row[5] ?? 0;
                    break;
                case 'ele':
                    $dienNuoc->maybom_start = $row[4] ?? 0;
                    $dienNuoc->maybom_end = $row[5] ?? 0;
                    break;

                default:
                    dd($dichVu);
                    break;
            }

            $dienNuoc->save();
            // } catch (\Throwable $th) {
            //     $this->info('Error.. ' . $row[1]);
            //     throw $th;
            // }
        }

        dd($roomEmpty);
        if (!empty($dataError)) {
            $this->error('OKKKK');
        } else {
            $this->info('Đã import xong room!');
        }
    }

    private function dienNuocSync()
    {
        DB::table('aitilen_dien_nuoc')->truncate();
        // $csv = storage_path('app/public/migrate/aitilen_consumption_meter_price_service.csv');
        $csv = storage_path('app/public/migrate/SoDienNuoc.csv');
        $dataError = [];
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header
        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        foreach (array_slice($rows, 1) as $row) {
            try {
                $data = array_combine($header, $row);

                if ($data['room_id'] == 'NULL') {
                    continue;
                }
                // Insert vào bảng room (map đúng tên cột)

                if (!empty($data['write_date'])) {
                    $date = \Carbon\Carbon::parse($data['write_date']);
                    if ($date->month != 9) {
                        continue;
                        // Chỉ insert khi đúng tháng 9/2025
                        // ...insert code ở đây...
                    }
                }


                $dienNuoc = AitilenDienNuoc::where('room_id', $data['room_id'])->first();
                $room = DB::table('room')->where('id', $data['room_id'])->first();
                if (empty($dienNuoc)) {
                    $dienNuoc = new AitilenDienNuoc();
                }

                $dienNuoc->month = 9;
                $dienNuoc->year = 2025;

                $dienNuoc->room_id = $data['room_id'] ?? null;
                $dienNuoc->apartment_id = $room->apartment_id ?? null;

                $dichVu = trim(mb_substr($data['name'], 0, 3, 'UTF-8'));
                // dd($dichVu);
                switch ($dichVu) {
                    case 'Điệ':
                        $dienNuoc->dien_start = $data['cur_number'] ?? 0;
                        $dienNuoc->dien_end = $data['new_number'] ?? 0;
                        break;
                    case 'Nướ':
                        $dienNuoc->nuoc_start = $data['cur_number'] ?? 0;
                        $dienNuoc->nuoc_end = $data['new_number'] ?? 0;
                        break;
                    case 'WC':
                        $dienNuoc->nonglanh_start = $data['cur_number'] ?? 0;
                        $dienNuoc->nonglanh_end = $data['new_number'] ?? 0;
                        break;
                    case 'ele':
                        $dienNuoc->maybom_start = $data['cur_number'] ?? 0;
                        $dienNuoc->maybom_end = $data['new_number'] ?? 0;
                        break;

                    default:
                        dd($dichVu);
                        break;
                }

                $dienNuoc->save();
            } catch (\Throwable $th) {

                throw $th;
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
        /////////////////////////////////////save user  /////////////////////////////////////

        // DB::table('users')->truncate();

        // reset auto increment
        DB::statement('ALTER TABLE users AUTO_INCREMENT = 1;');

        $csv = storage_path('app/public/migrate/user.csv');
        // Đọc file CSV thành mảng
        $rows = array_map('str_getcsv', file($csv));
        $header = array_map('trim', $rows[0]); // Dòng đầu là header
        // Lặp qua từng dòng dữ liệu (bỏ dòng header)
        // dd($header);
        // $password = bcrypt('abc123');
        $password = '123';
        $phoneError = [];
        foreach (array_slice($rows, 1) as $data) {

            // if (!$this->isValidVietnamPhone($data['phone'])) {
            //     $phoneError[] = $data['phone'];
            //     continue;
            // }

            if ($data[0] == 1) {
                continue;
            }

            try {
                $code = 'KHA' . TblService::formatNumberByLength($data[0], 5);
                $name = '';
                if (!empty($data[3])) {
                    $name = $this->ucwords_unicode($data[3]);
                }

                $dataInsert = [
                    'id' => $data[0], //
                    'code'  => $code, //
                    'name'  => $name, //
                    'require_changepw'  => 1, // bắt buộc đổi mk lần đầu
                    'user_type'  => 'Aitilen', //
                    'username'  => $data[4] ?? null, //
                    'password'  => $password, //
                    'ngay_sinh'  => empty($data[5]) || $data[5] == "NULL" ? null : $data[5], //
                    'user_status_id'  => 1, //
                    'phone'  => $data[4] ?? null, //
                    // 'email'  => $data[27] ?? null, //
                    'cccd'  => $data[6] ?? null, //
                    'ngay_cap'  => empty($data[8]) || $data[8] == "NULL" ? null : $data[8], //
                    'noi_cap'  => $data[7] ?? null, //
                    'hktt'  => $data[9] ?? null, //
                    'address'  => $data[9] ?? null, //
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];

                DB::table('users')->insert($dataInsert);
            } catch (\Throwable $th) {
                // dd($data);
                throw $th;
            }
        }
        $this->info('Đã import xong users!');
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

    private function ucwords_unicode($str)
    {
        return mb_convert_case($str, MB_CASE_TITLE, "UTF-8");
    }
}
