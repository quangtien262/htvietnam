<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
class GmailController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(17);

        return Inertia::render('Admin/Gmail/index', ['tables', $tables]);
    }

    public function create(Request $request)
    {
        $tables = TblService::getAdminMenu();

        return Inertia::render('Admin/Gmail/create', ['tables', $tables]);
    }

    public function changePassword(Request $request)
    {
        $tables = TblService::getAdminMenu();

    }

    public function delete(Request $request)
    {
        $tables = TblService::getAdminMenu();

    }

}
