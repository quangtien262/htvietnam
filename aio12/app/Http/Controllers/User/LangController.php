<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Web\WebConfig;
use App\Models\Web\Contact;
use App\Http\Requests\User\ContactRequest;
use App\Models\Web\Landingpage;
use Illuminate\Support\Facades\App;

class LangController extends Controller
{


    /**
     * Display a listing of the resource.
     * lang = en / vi
     * @return \Illuminate\Http\Response
    */
    public function change(Request $request)
    {
        if(empty($request->lang)) {
            return redirect()->back();
        }
        App::setLocale($request->lang);
        session()->put('locale', $request->lang);
        return redirect()->back();
    }

}

