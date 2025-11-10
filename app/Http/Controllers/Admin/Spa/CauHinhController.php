<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CauHinhController extends Controller
{
    public function index() { return $this->sendSuccessResponse([]); }
    public function update(Request $request) { return $this->sendSuccessResponse([]); }
}
