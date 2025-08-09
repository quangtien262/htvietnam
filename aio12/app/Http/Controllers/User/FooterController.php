<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CommonService;

use App\Models\Web\Image;
use App\Models\Web\LinkFooter;
use App\Models\Web\News;
use App\Models\Web\Product;
use App\Models\Web\Menu;
use App\Services\User\UserService;
use App\Models\Web\WebConfig;
use App\Models\Web\Tags;
use Illuminate\Support\Facades\App;

class FooterController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $sluggable, $footerId)
    {
        $config = WebConfig::query()->find(1);
        $footer = LinkFooter::query()->find($footerId);
        if(!empty($footer->link)) {
            return redirect($footer->link);
        }
        if(empty($footer)) {
            return redirect()->route('home')->with('error', 'Link footer');
        }
        $seo = [
            'title' => $footer->name,
            'keywords' => $footer->meta_keyword,
            'description' => $footer->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.footer.index', compact('footer',  'config', 'seo'));
    }

   
}

