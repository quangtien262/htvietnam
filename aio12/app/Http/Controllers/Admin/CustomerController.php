<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Card;
use App\Models\Admin\CardService;
use App\Models\Admin\HoaDon;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Auto\card as AutoCard;
use App\Models\User;
use App\Services\Admin\CardClass;
use App\Services\Admin\HimalayaService;
use App\Services\Admin\UserService;

class CustomerController extends Controller
{


    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        $users = User::select(
                'users.*','users.id as key',
                'gioi_tinh.name as gioi_tinh_name',
                'customer_group.name as customer_group_name',
            )
            ->leftJoin('gioi_tinh', 'gioi_tinh.id', 'users.gioi_tinh_id')
            ->leftJoin('customer_group', 'customer_group.id', 'users.customer_group_id')
            ->where('users.is_recycle_bin', 0)
            ->where('users.is_draft', '!=', 1);
        
        if(isset($request->customer_status_id)) {
            if($request->customer_status_id == 3) {
                $users = $users->where('users.is_recycle_bin', 1);
            } else {
                $users = $users->where('users.customer_status_id', $request->customer_status_id);
            }
        } else {
            $users = $users->where('users.customer_status_id', 1);
        }

        if(isset($request->is_recycle_bin)) {
            $users = $users->where('users.is_recycle_bin', $request->is_recycle_bin);
        } else {
            $users = $users->where('users.is_recycle_bin', 0);
        }
        
        $users = $users->paginate(20);

        $typeProduct = config('constant.type_product');
        $userSource = DB::table('user_source')->get();
        $customerGroup = DB::table('customer_group')->get();
        $gioiTinh = DB::table(table: 'gioi_tinh')->get();
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'users' => $users,
            'typeProduct' =>$typeProduct,
            'customerGroup' => $customerGroup,
            'gioiTinh' => $gioiTinh,
            'userSource' => $userSource
        ];
 
        return Inertia::render('Admin/Customer/index', $viewData);
    }

    public function detail(Request $request) {
        $khachHangData = UserService::khachHangInfo($request->id);
        return $this->sendSuccessResponse($khachHangData);
    }

    public function createOrUpdate(Request $rq)
    {
        if(empty($rq->id)) {
            $user = new User();
        } else {
            $user = User::find($rq->id);
        }
        $user->name = $rq->name;
        $user->cong_ty = !empty($rq->cong_ty) ? $rq->cong_ty : '';
        $user->mst = !empty($rq->mst) ? $rq->mst : '';
        $user->phone = !empty($rq->phone) ? $rq->phone : '';
        $user->phone02 = !empty($rq->phone02) ? $rq->phone02 : '';
        $user->gioi_tinh_id = !empty($rq->gioi_tinh_id) ? $rq->gioi_tinh_id : 0;
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


    public function lichSuMuaHang($id) {
        $hoaDon = HoaDon::baseQuery()->where('hoa_don.users_id', $id)->get();

        $result = [];
        foreach($hoaDon as $key => $nl) {
            $stt = $key +1;
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

    public function goiDichVu(Request $rq) {
        $goiDv = CardClass::getDVTrongGoi($rq->users_id);
        $result = [];
        foreach($goiDv as $key => $val) {
            $stt = $key +1;
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

    public function cardGT(Request $rq) {
        
        $goiDv = HimalayaService::getCardGTInfo($rq->users_id);
        // dd($goiDv);
        $result = [];
        foreach($goiDv as $key => $val) {
            $stt = $key +1;
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
        $users = User::select(
                'users.*','users.id as key',
                'gioi_tinh.name as gioi_tinh_name',
                'customer_group.name as customer_group_name',
            )
            ->leftJoin('gioi_tinh', 'gioi_tinh.id', 'users.gioi_tinh_id')
            ->leftJoin('customer_group', 'customer_group.id', 'users.customer_group_id');
        if(!empty($request->keyword)) {
            $users = $users->where('users.name', 'like', '%' . $request->keyword . '%');
        }
        if(!empty($request->customer_group_id)) {
            $users = $users->where('users.customer_group_id', $request->customer_group_id);
        }
        if(!empty($request->gioi_tinh_id)) {
            $users = $users->where('users.gioi_tinh_id', $request->gioi_tinh_id);
        }

        if(isset($request->customer_status_id)) {
            if($request->customer_status_id == 3) {
                $users = $users->where('users.is_recycle_bin', 1);
            } else {
                $users = $users->where('users.customer_status_id', $request->customer_status_id)
                                ->where('users.is_recycle_bin', 0);
            }
        } else {
            $users = $users->where('users.customer_status_id', 1);
        }

        // if(isset($request->is_recycle_bin)) {
        //     $users = $users->where('users.is_recycle_bin', $request->is_recycle_bin);
        // } else {
        //     $users = $users->where('users.is_recycle_bin', 0);
        // }
        $users = $users->paginate(20);
        return $this->sendSuccessResponse($users);
    }

    // public function goiDV(Request $rq) {
    //     if(empty($rq->khach_hang_id)) {
    //         return [];
    //     }

    //     $user = User::find($rq->khach_hang_id);
    //     if(empty($user)) {
    //         return [];
    //     }

    //     $cards= Card::select(
    //         'card.id as card_id',
    //             'card.product_id as product_id',
    //             'product.name as product_name',
    //         )
    //         ->leftJoin('product', 'product.id', 'card.product_id')
    //         ->where('users_id', $rq->khach_hang_id)
    //         ->where('card_group_id', 2)
    //         ->get();
    //     $service = [];
    //     foreach ($cards as $card) {
    //         $cardService = CardService::select(
    //             'card_service.so_luong as so_luong',
    //                 'card_service.product_id as product_id',
    //                 'product.name as product_name',
    //                 'product.name as product_name',
    //             )
    //             ->where('card_id', $card->id)
    //             ->leftJoin('product', 'product.id', 'card_service.product_id')
    //             ->get();
    //         $service[] = [
    //             'card' => $card,
    //             'cardService' => $cardService
    //         ];

    //     }
    //     return $this->sendSuccessResponse($service);
    // }
  

}

