<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Card;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
use App\Models\Admin\Log;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\PhieuThuChiTiet;
use App\Models\Admin\Product;
use App\Models\AdminUser;
use App\Models\Admin\CardHistory;
use App\Models\Admin\CardService;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Services\Admin\HimalayaService;

class HimalayaController extends Controller
{

    /**
     * Search
     *
     * @param  \App\Models\Column  $tableId
     * @return \Illuminate\Http\Response
     */
    public function mergeHistory(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::where('name', 'log')->first();
        $columns = Column::where('table_id', $table->id)->get();
        $logs = Log::where('is_merge', 1)->orderBy('id', 'desc')->get();

        return to_route('data.index', [$table->id, 'is_merge' => 1]);
    }

    /**
     * Search
     *
     * @param  \App\Models\Column  $tableId
     * @return \Illuminate\Http\Response
     */
    public function mergeCustomer(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::where('name', 'users')->first();
        $columns = Column::where('table_id', $table->id)->get();
        $users = User::select(
            'id as value',
            'name as label',
            'id as id',
            'name as name',
            'phone as phone',
            'phone02 as phone02',
            'code as code',
            'users.*',
        )->where('is_recycle_bin', '!=', 1)->get();

        $customers = [];
        foreach ($users as $user) {
            $label = $user->code . ' - ' . $user->name;
            if (!empty($user->phone)) {
                $label .= ' - ' . $user->phone;
            }
            if (!empty($user->phone02)) {
                $label .= ' - ' . $user->phone02;
            }
            $customers[] = [
                'label' => $label,
                'value' => $user->id,
                'key' => $user->id,
            ];
        }

        return Inertia::render(
            'Admin/Himalaya/merge_customer',
            [
                'tables' => $tables,
                'table' => $table,
                'users' => $users,
                'customers' => $customers,
                'columns' => $columns
            ]
        );
    }

    public function postMergeCustomer(Request $request)
    {
        if (empty($request->from) || empty($request->to)) {
            return $this->sendErrorResponse('Chưa chọn khách hàng hoạt động hoặc ngưng hoạt động', $errors = null, $code = 400);
        }
        $table = Table::where('name', 'users')->first();
        $columns = Column::where('table_id', $table->id)->get();

        $from = $fromOld = User::find($request->from);
        $to = $toOld = User::find($request->to);
        $merge_description = '';
        foreach ($columns as $col) {
            if (in_array($col->name, ['phone', 'phone02'])) {
                continue;
            }
            if (empty($to->{$col->name}) && !empty($from->{$col->name})) {
                $to->{$col->name} = $from->{$col->name};
            }
            if (!empty($to->{$col->name}) && !empty($from->{$col->name}) && $to->{$col->name} != $from->{$col->name}) {
                $merge_description .= $col->name . ' => ' . $from->{$col->name} . '<br/>';
            }
        }
        $phone = $this->checkPhone($to->phone, $to->phone02, $from->phone, $from->phone02);
        $to->phone = $phone['phone'];
        $to->phone02 = $phone['phone02'];

        $to->merge_description = $to->merge_description . $merge_description;

        //
        $to->save();

        //
        $from->is_recycle_bin = 1;
        $from->save();

        // chuyển khách bị gộp vào thùng rác
        $users = User::select(
            'id as value',
            'name as label',
            'id as id',
            'name as name',
            'users.*',
        )->where('is_recycle_bin', '!=', 1)->get();

        $auth = \Auth::guard('admin_users')->user();
        $date = date('d/m/Y H:i:s');
        // save log khách được gộp thêm: 
        $nameTO = "[{$date}] '{$auth->name}' khách hàng '{$to->name}' đã được gộp thêm từ '{$from->name}'";
        TblService::saveLog($table->id, $to->id, $fromOld, ['name' => $nameTO, 'is_merge' => 1]);
        TblService::saveLog($table->id, $to->id, $toOld);

        // save log khách bị gộp: 
        $nameFrom = "[{$date}] '{$auth->name}' khách hàng '{$from->name}' đã bị gộp vào '{$to->name}'. '{$from->name}' được chuyển sang thùng rác";
        TblService::saveLog($table->id, $from->id, $fromOld, ['name' => $nameFrom]);

        return $this->sendSuccessResponse($users);
    }

    public function getCardByUser(Request $request)
    {
        if (empty($request->users_id)) {
            return $this->sendErrorResponse('Vui lòng chọn khách hàng');
        }

        $user = DB::table('users')->find($request->users_id);

        // get card GT
        $cardGTInfo = HimalayaService::getCardGTInfo($request->users_id);
 
        // type = 2, thẻ lần
        $cardTLInfo = HimalayaService::getCardTLInfo($request->users_id);
        $result = [
            'cardGTInfo' => $cardGTInfo,
            'cardTLInfo' => $cardTLInfo
        ];
        return $this->sendSuccessResponse($result, 'successfully');
    }

    public function getCardByUser_old(Request $request)
    {
        if (empty($request->users_id)) {
            return $this->sendErrorResponse('Vui lòng chọn khách hàng');
        }

        $user = DB::table('users')->find($request->users_id);

        // get card detail
        $card = DB::table('card')->where('users_id', $request->users_id);

        if ($request->type_hoa_don_id == 1) { // type = 1 là hóa đơn bán lẻ
            $card = $card->where('card_group_id', 12); //12 là ID thẻ giá trị
        } else { // type = 2 là hóa đơn thẻ lần
            $card = $card->where('card_group_id', '!=', 12); // thẻ lần
        }

        if (!empty($user->chi_nhanh_id)) {
            $chiNhanh = DB::table('chi_nhanh')->find($user->chi_nhanh_id);
        }

        $card = $card->get();
        $card_detail = [];
        $cardSelect = [];

        if ($request->type_hoa_don_id == 1) { // type = 1 thẻ giá trị
            $result = HimalayaService::getCardGT($card);
            $result['chi_nhanh'] = $chiNhanh;
            return $this->sendSuccessResponse($result, 'successfully');
        }
        // type = 2, thẻ lần
        $result = HimalayaService::getCardLT($card, $user);
        return $this->sendSuccessResponse($result, 'successfully');
    }

    private function checkPhone($to1, $to2, $from1, $from2)
    {
        if (empty($to1)) {
            if (!empty($from1)) {
                $to1 = $from1;
            }
            if (!empty($from2) && empty($to)) {
                $to = $from2;
            }
        }

        if (empty($to2)) {
            if (!empty($from1) && $from1 != $to1) {
                $to2 = $from1;
            }
            if (!empty($from2) && empty($to2)) {
                $to2 = $from2;
            }
        }
        return [
            'phone' => $to1,
            'phone02' => $to2
        ];
    }

    public function phieuThu(Request $request)
    {
        // https://ant.design/components/table

        $tables = TblService::getAdminMenu(0);
        $table = Table::find(237);
        $columns = [
            [
                'title' => 'STT',
                'dataIndex' => 'id',
                'key' => 'id',
            ],
            [
                'title' => 'Phiếu thu',
                'dataIndex' => 'phieu_thu',
                'key' => 'phieu_thu',
            ],
            [
                'title' => 'Tổng Tiền',
                'dataIndex' => 'money',
                'key' => 'money',
            ],
            [
                'title' => 'Ghi chú',
                'dataIndex' => 'note',
                'key' => 'note',
            ],
            [
                'title' => 'Chi tiết',
                'dataIndex' => 'detail',
                'key' => 'detail',
            ],
            [
                'title' => 'Nội dung',
                'dataIndex' => 'content',
                'key' => 'content',
            ],
        ];

        $phieuThu = PhieuThu::select(
            'phieu_thu.*',
            'admin_users.name as ten_nv'
        )
        ->leftJoin('admin_users', 'admin_users.id', 'phieu_thu.user_thu_id')
        ->orderBy('created_at', 'desc')
        ->paginate(30);

        $pageConfig = [
            'currentPage' => $phieuThu->currentPage(),
            'perPage' => $phieuThu->perPage(),
            'total' => $phieuThu->total(),
            'lastPage' => $phieuThu->lastPage(),
            'count' => count($phieuThu),
        ];

        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'phieuThu' => $phieuThu,
            'pageConfig' => $pageConfig,
            'tenChungTu' => config('constant.ten_loai_chung_tu')
        ];

        return Inertia::render('Admin/Himalaya/phieu_thu', $viewData);
    }

    
}
