<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Table;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Models\Web\NewsData;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Goutte\Client;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\DomCrawler\Crawler;
use App\Services\Admin\CrawlService;

class CrawlController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index()
    {
        $tables = TblService::getAdminMenu(0);
        $viewData = ['tables' => $tables];
        return Inertia::render('Admin/Crawl/index',$viewData );
    }

    public function crawlMenu(Request $request) {
        if(empty($request->menu)) {
            return $this->sendErrorResponse('error');
        }
        $result = CrawlService::crawlAll($request->menu);
        $msg = 'Success: ' . $result['success'] . '; Error: ' . $result['error'] . '; Duplicate (pending): ' . $result['duplicate'];
        return $this->sendSuccessResponse($result, $msg);
    }
}
