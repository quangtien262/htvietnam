<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Services\CommonService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\AdminUser;
use App\Models\Admin\ChamCong;
use App\Models\Web\Languages;
use App\Models\Web\News;
use Illuminate\Support\Facades\DB;

class ApiController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function createDataChamCong(Request $request) {
        if(empty($request->table_id) && empty($request->month) && empty($request->year)) {
            return $this->sendErrorResponse('input is empty');
        }
        $users = AdminUser::where('salary', '>', 0)->where('admin_user_status_id', 1)->get();
        $datas = [];
        $cong_full = $this->getMonthData($request->all());
        if (!empty($request->data)) {
            $datas = explode("\n", $request->data);
        }


        DB::beginTransaction();
        try {
            foreach ($users as $user) {
                $this->chamCongCurrentUser($user, $datas, $request, $cong_full);
            }
            DB::commit();
        } catch (\Throwable $th) {
            return $this->sendErrorResponse($th->getMessage());
            DB::rollBack();
        }
        return Inertia::location(route('data.index', [$request->table_id]));
        // return $this->sendSuccessResponse([], 'Update successfully', 200);
    }

    public function updateChamCong(Request $request ,$chamCongId) {
        $table = Table::where('name', 'admin_users')->first();
        $chamCong = DB::table('cham_cong')->where('id', $chamCongId)->first();
        $user = AdminUser::find($chamCong->admin_user_id);
        if(!$user) {
            return Inertia::location(route('data.index', [$table->id]));
        }
        $cong_full = $this->getMonthData($request);
        // cần phải truyền thêm data chấm công
        // $this->chamCongCurrentUser($user, $datas, $request, $cong_full);
        DB::commit();
    }

    private function chamCongCurrentUser($user, $datas, $request, $cong_full) {
        $chamcong_user = $this->getDataChamCong($datas, $request, $user, $cong_full['count']);
        $total = intval($user->salary) + $chamcong_user['luong_nghi_ca_ngay'] + $chamcong_user['luong_nghi_nua_ngay'] - ($chamcong_user['kpi']*20000) ;
        //save
        $salary1day = intval($user->salary) / $cong_full['count'];
        $chamCong = new ChamCong();
        $chamCong->name = 'Bảng lương ' . $user->name . ' Tháng ' . $request->month . '/' . $request->year;
        $chamCong->admin_user_id = $user->id;
        $chamCong->salary = intval($user->salary);
        $chamCong->total = $total;
        $chamCong->van_tay_id = $user->van_tay_id;
        $chamCong->month = $request->month;
        $chamCong->year = $request->year;
        $chamCong->cham_cong = json_encode($chamcong_user['date']);
        $chamCong->salary1day = $salary1day;
        $chamCong->luong_nghi_nua_ngay = $chamcong_user['luong_nghi_nua_ngay'];
        $chamCong->luong_nghi_ca_ngay = $chamcong_user['luong_nghi_ca_ngay'];
        $chamCong->create_by = $user->id;
        $chamCong->save();
    }

    private function getDataChamCong($datas, $request, $user, $soNgayLamViec)
    {
        $salary1day = intval($user->salary/ $soNgayLamViec);
        $salary1_2day = intval($salary1day/2);
        $start = $end = strtotime($request->year . '-' . $request->month . '-01');
        $end = strtotime("+1 month", $end);
        $result = [];
        $luong_nghi_nua_ngay_total = 0;
        $luong_nghi_ca_ngay_total = 0;
        $kpi_total = 0;
        while ($start < $end) {
            $thu = $ymd = date('l', $start);
            $ymd = date('Ymd', $start);
            $kpi = 0;
            $luong_nghi_nua_ngay = 0;
            $luong_nghi_ca_ngay = 0;
            // check ngày cuối tuần 
            if (in_array($thu, ['Saturday', 'Sunday'])) {
                $result[$ymd] = [
                    'checkin_h' => '',
                    'checkin_m' => '',
                    'checkout_h' => '',
                    'checkout_m' => '',
                    'note' => 'Nghỉ cuối tuần',
                    'kpi' => 0,
                    'luong_nghi_nua_ngay' => 0,
                    'luong_nghi_ca_ngay' => 0,
                    'type' => config('constant.type_cham_cong.nghi_cuoi_tuan')
                ];
                $start = strtotime("+1 day", $start);
                continue;
            }

            // get kết quả chấm công trong ngày
            $vantay = $this->checkVanTay($datas, $user->van_tay_id, $start);
            
            // trường hợp nghỉ làm
            if ($vantay['timeStart'] == '') {
                $luong_nghi_ca_ngay = -$salary1day;
                $result[$ymd] = [
                    'checkin_h' => '',
                    'checkin_m' => '',
                    'checkout_h' => '',
                    'checkout_m' => '',
                    'note' => 'Không có data chấm công',
                    'kpi' => 0,
                    'luong_nghi_nua_ngay' => 0,
                    'luong_nghi_ca_ngay' => $luong_nghi_ca_ngay,
                    'type' => config('constant.type_cham_cong.nghi_cuoi_tuan')
                ];
                
                $luong_nghi_ca_ngay_total += $luong_nghi_ca_ngay;
                $start = strtotime("+1 day", $start);
                continue;
            }

            // Đi làm
            $note = "";
            
            if ($vantay['timeStart'] > 845) {
                $kpi = -1;
                $note = "Đi muộn";
            }

            if ($vantay['timeStart'] > 1030) {
                $kpi = 0;
                $luong_nghi_nua_ngay = -$salary1_2day;
                $note = "Nghỉ nửa ngày";
            }

            if ($vantay['timeEnd'] < 1715) {
                $kpi = -1;
                $note = "Về sớm";
            }

            if ($vantay['timeEnd'] < 1530) {
                $kpi = 0;
                $luong_nghi_nua_ngay = -$salary1_2day;
            }
            $result[$ymd] = [
                'checkin_h' => $vantay['checkin_h'],
                'checkin_m' => $vantay['checkin_m'],
                'checkout_h' => $vantay['checkout_h'],
                'checkout_m' => $vantay['checkout_m'],
                'note' => $note,
                'kpi' => $kpi,
                'luong_nghi_nua_ngay' => $luong_nghi_nua_ngay,
                'luong_nghi_ca_ngay' => $luong_nghi_ca_ngay,
                'type' => config('constant.type_cham_cong.di_lam')
            ];
            
            $kpi_total += $kpi;
            $luong_nghi_nua_ngay_total += $luong_nghi_nua_ngay;
            $luong_nghi_ca_ngay_total += $luong_nghi_ca_ngay;

            // next
            $start = strtotime("+1 day", $start);
        }
        return [
            'date' => $result,
            'luong_nghi_ca_ngay' => $luong_nghi_ca_ngay_total,
            'luong_nghi_nua_ngay' => $luong_nghi_nua_ngay_total,
            'kpi' => $kpi_total,
        ];
    }

    private function checkVanTay($datas, $vantayID, $day)
    {
        $day_str = date('Ymd', $day);
        $timeStart = $timeEnd = $checkin_h = $checkin_i = $checkout_h = $checkout_i = '';
        foreach ($datas as $data) {
            // convert data ngày sang mảng
            $data_arr = explode("\t", $data);

            // kiểm tra vân tay id
            if (intval($data_arr[0]) != $vantayID) {
                continue;
            }

            // check thời gian xem có cùng ngày ko
            $ymd = date('Ymd', strtotime($data_arr[1]));
            if ($day_str != $ymd) {
                continue;
            }

            // 
            if ($timeStart == '') {
                $timeStart =  date('Hi', strtotime($data_arr[1]));
                $checkin_h = date('H', strtotime($data_arr[1]));
                $checkin_i = date('i', strtotime($data_arr[1]));
            }
            $timeEnd =  date('Hi', strtotime($data_arr[1]));
            $checkout_h = date('H', strtotime($data_arr[1]));
            $checkout_i = date('i', strtotime($data_arr[1]));
        }

        return [
            'timeStart' => $timeStart,
            'timeEnd' => $timeEnd,
            'checkin_h' => $checkin_h,
            'checkin_m' => $checkin_i,
            'checkout_h' => $checkout_h,
            'checkout_m' => $checkout_i,
        ];
    }

    private function getMonthData($request)
    {
        $start = $end = strtotime($request['year'] . '-' . $request['month'] . '-01');
        $end = strtotime("+1 month", $end);

        $result = [];
        $soNgayLamViec = 1;
        while ($start < $end) {
            $thu = $ymd = date('l', $start);
            $ymd = date('Ymd', $start);
            // check ngày cuối tuần 
            if (in_array($thu, ['Saturday', 'Sunday'])) {
                $result[$ymd] = [
                    'checkin_h' => '',
                    'checkin_m' => '',
                    'checkout_h' => '',
                    'checkout_m' => '',
                    'note' => 'Nghỉ cuối tuần',
                    'kpi' => 0,
                    'luong_nghi_nua_ngay' => 0,
                    'luong_nghi_ca_ngay' => 0,
                    'type' => config('constant.type_cham_cong.nghi_cuoi_tuan')
                ];
                $start = strtotime("+1 day", $start);
                continue;
            }

            $soNgayLamViec++;
            $result[$ymd] = [
                'checkin_h' => '08',
                'checkin_m' => '30',
                'checkout_h' => '17',
                'checkout_m' => '30',
                'note' => '',
                'kpi' => 0,
                'luong_nghi_nua_ngay' => 0,
                'luong_nghi_ca_ngay' => 0,
                'type' => config('constant.type_cham_cong.di_lam')
            ];
            $start = strtotime("+1 day", $start);
        }
        return [
            'count' => $soNgayLamViec,
            'date' => json_encode($result)
        ];
    }
}
