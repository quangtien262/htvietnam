<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use App\Models\Web\Contact;

class PagesController extends Controller
{
    /**
     * Search
     *
     * @param  \App\Models\Column  $tableId
     * @return \Illuminate\Http\Response
     */
    public function subDataProvinces(Request $request)
    {
        $data = DB::table($request->type);
        if($request->type == 'districts') {
            $data = $data->where('province_id', $request->id);
        }
        if($request->type == 'wards') {
            $data = $data->where('district_id', $request->id);
        }
        $data = $data->get();
        $result = '<option value="">Chọn</option>';
        foreach($data as $d) {
            $result .= '<option value="'.$d->id.'">'.$d->name.'</option>';
        }
        return $result;
    }

    public function contact() {
        $tableId = 5;
        $datas = Contact::orderBy('is_view', 'asc')->orderBy('id', 'desc')->paginate(config('constant.item_of_pages'));
        return view('admin.pages.contact', compact('datas'));
    }
}
