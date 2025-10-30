<?php

namespace App\Http\Controllers\Admin;

use Adminer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\AdminUser;
use App\Models\Aitilen\HopDong;
use App\Models\User;
use App\Models\Web\Orders;
use App\Models\Web\Service;
use App\Models\Web\ServiceType;
use App\Models\Web\CustomerRequest;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\TemplateProcessor;


class DownloadController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $tableId)
    {

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function file(Request $request) {
        if(!empty($request->file_download)) {
            return Storage::download('download/hop-dong/' . $request->file_download . '.docx');
        }
    }

    public function hopDong(Request $request) {
        // validate
        if(empty($request->uid) && empty($request->file_download)) {
            return 'error';
        }

        // Hợp đồng khách hàng
        if($request->file_download == 'hd-khach-hang') {
            $this->generateHDService($request);
            return response()->download('hop-dong.docx');
        }

        // hop dong lao dong
        $this->generateHDLD($request);
        return response()->download('hop-dong.docx');
    }

    private function generateHDService($request)
    {
        $hopDong = HopDong::find($request->data_id);
        $user = User::find($hopDong->user_id);
        $serviceType = ServiceType::find($hopDong->service_type_id);
        $ma_hd = time();
        $dataWord = [
            'ma_hd' => $ma_hd,
            'a_cty' => $user->company_name,
            'a_daiDien' => $user->company_nguoi_dai_dien,
            'a_chucVu' => $user->company_chuc_vu,
            'a_diaChi' => $user->company_address,
            'a_mst' => $user->company_mst,
            'a_email' => $user->company_email,
            'a_phone' => $user->company_hotline,
            'a_mst' => $user->company_mst,
            'gia_chua_vat' => $hopDong->gia_chua_vat,
            'count' => $hopDong->count, // số lượng
            'vat_phan_tram' => $hopDong->vat_phantram,
            'vat' => $hopDong->vat,
            'price' => number_format($hopDong->price),
            'price_dk' => $hopDong->phi_dk,
            'price_duyTri' => $hopDong->phi_duy_tri,
            'price_dv' => $hopDong->phi_dv,
            'start_date' => date_format(date_create($hopDong->start_date),"d/m/Y"),
            'end_date' => date_format(date_create($hopDong->end_date),"d/m/Y"),
            'domain' => $hopDong->domain,
            'name' => $hopDong->name,
        ];

        $templateProcessor = new TemplateProcessor(public_path('files/download/template/'. $serviceType->code . '.docx'));
        $templateProcessor->setValues($dataWord);
        $templateProcessor->saveAs('hop-dong.docx');
    }

    private function generateHDLD($request)
    {
        $user = AdminUser::find($request->uid);
        $admin = \Auth::guard('admin_users')->user();
        $chucVu_admin = DB::table('chuc_vu')->where('id', $admin->chuc_vu_id)->first();
        $chucVu_nv = DB::table('chuc_vu')->where('id', $user->chuc_vu_id)->first();
        $dataWord = [
            'so_hd' => time(),
            'nguoi_dai_dien' => $admin->name,
            'a_chuc_vu' => $chucVu_admin->name,
            'a_phone' => $admin->phone,
            'a_cmtnd' => $admin->cmtnd,
            'a_ngay_cap' => $admin->ngay_cap,
            'a_noi_cap' => $admin->noi_cap,

            'b_name' => $user->name,
            'b_ngay_sinh' => $user->dob,
            'b_dia_chi' => $user->hktt,
            'b_cmt' => $user->cmtnd,
            'b_chuc_vu' => $chucVu_nv->name,
            'salary' => $user->salary - 730000,
        ];
        $templateProcessor = new TemplateProcessor(public_path('files/download/template/'. $request->file_download . '.docx'));
        $templateProcessor->setValues($dataWord);
        $templateProcessor->saveAs('hop-dong.docx');
    }
}
