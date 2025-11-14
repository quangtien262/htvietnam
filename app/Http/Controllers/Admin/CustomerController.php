<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\HoaDon;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\User;
use App\Services\Admin\CardClass;
use App\Services\Admin\HimalayaService;
use App\Services\Admin\UserService;

class CustomerController extends Controller
{
    public function indexApi(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::where('name', 'users')->first();
        $users = User::getUsers($request->all());

        $typeProduct = config('constant.type_product');
        $userSource = DB::table('user_source')->get();

        $customerGroup = TblService::formatData('customer_group');
        $customerGroup_select = TblService::getDataSelect02('customer_group');

        $gioiTinh_select = TblService::getDataSelect02('gioi_tinh');
        // $gioiTinh = TblService::formatData('gioi_tinh');
        $props = [
            'tables' => $tables,
            'table' => $table,
            'users' => $users,
            'typeProduct' => $typeProduct,
            'customerGroup' => $customerGroup,
            'customerGroup_select' => $customerGroup_select,
            'gioiTinh_select' => $gioiTinh_select,
            'userSource' => $userSource,
            'searchData' => $request->all(),
        ];

        return $this->sendSuccessResponse($props);
    }

    public function detail(Request $request)
    {
        $khachHangData = UserService::khachHangInfo($request->id);
        return $this->sendSuccessResponse($khachHangData);
    }

    public function createOrUpdate(Request $rq)
    {
        if (empty($rq->id)) {
            $user = new User();
        } else {
            $user = User::find($rq->id);
        }
        $user->name = $rq->name;
        $user->email = $rq->email;
        $user->cong_ty = !empty($rq->cong_ty) ? $rq->cong_ty : '';
        $user->mst = !empty($rq->mst) ? $rq->mst : '';
        $user->phone = !empty($rq->phone) ? $rq->phone : '';
        $user->phone02 = !empty($rq->phone02) ? $rq->phone02 : '';
        $user->gioi_tinh_id = !empty($rq->gioi_tinh_id) ? $rq->gioi_tinh_id : 0;
        $user->user_source_id = !empty($rq->user_source_id) ? $rq->user_source_id :0;
        // $user->ngay_sinh = !empty($rq->ngay_sinh) ? $rq->ngay_sinh : '';
        $user->facebook = !empty($rq->facebook) ? $rq->facebook : '';
        $user->address = !empty($rq->address) ? $rq->address : '';
        $user->customer_status_id = !empty($rq->customer_status_id) ? intval($rq->customer_status_id) : 0;
        $user->customer_group_id = !empty($rq->customer_group_id) ? intval($rq->customer_group_id) : 0;
        $user->note = !empty($rq->note) ? intval($rq->note) : '';
        $user->save();
        $user->code = 'KH' . TblService::formatNumberByLength($user->id);
        $user->save();
        return $this->sendSuccessResponse($user);
    }


    public function lichSuMuaHang($id)
    {
        $hoaDon = HoaDon::baseQuery()->where('hoa_don.users_id', $id)->get();

        $result = [];
        foreach ($hoaDon as $key => $nl) {
            $stt = $key + 1;
            $result[] = [
                'key' => $nl->id,
                'code' => $nl->code,
                'id' => $nl->id,
                'stt' => $stt,
                'tong_tien' => $nl->tong_tien,
                'tien_tru_the' => $nl->tien_tru_the,
                'thanh_toan' => $nl->thanh_toan,
                'created_at' => $nl->created_at,
            ];
        }
        return $this->sendSuccessResponse($result);
    }

    public function goiDichVu(Request $rq)
    {
        $goiDv = CardClass::getDVTrongGoi($rq->users_id);
        $result = [];
        foreach ($goiDv as $key => $val) {
            $stt = $key + 1;
            $result[] = [
                'stt' => $stt,
                'key' => $val['card']->card_id,
                'id' => $val['card']->card_id,
                'code' => $val['card']->card_code,
                'product_name' => $val['card']->product_name,
                'product_id' => $val['card']->product_id,
                'so_luong' => $val['card']->so_luong,
                'created_at' => $val['card']->created_at,
                'cardService' => $val['cardService'],
            ];
        }
        return $this->sendSuccessResponse($result);
    }

    public function cardGT(Request $rq)
    {

        $goiDv = HimalayaService::getCardGTInfo($rq->users_id);
        // dd($goiDv);
        $result = [];
        foreach ($goiDv as $key => $val) {
            $stt = $key + 1;
            $result[] = [
                'stt' => $stt,
                'key' => $val->id,
                'code' => $val->code,
                'product_name' => $val->product_name,
                'product_gia_ban' => $val->product_gia_ban,
                'product_id' => $val->product_id,
                'menh_gia_the' => $val->menh_gia_the,
                'created_at' => $val->created_at,
            ];
        }
        return $this->sendSuccessResponse($result);
    }

    public function search(Request $request)
    {
        $users = User::getUsers($request->all());
        return $this->sendSuccessResponse($users);
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return $this->sendSuccessResponse(['message' => 'Xóa khách hàng thành công']);
        } catch (\Exception $e) {
            return $this->sendErrorResponse('Lỗi khi xóa khách hàng: ' . $e->getMessage());
        }
    }

    function apiSelectData()
    {
        try {
            $users = User::select(
                'id as value',
                'name as label',
                'code as code',
                'phone',
                'email',
                'diem_tich_luy as points'
            )
                ->orderBy('name', 'asc')
                ->get();
            return $this->sendSuccessResponse($users);
        } catch (\Exception $e) {
            return $this->sendErrorResponse('Lỗi khi lấy danh sách khách hàng: ' . $e->getMessage());
        }
    }
}
