<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SMSCampaignController extends Controller
{
    public function index() { return $this->sendSuccessResponse([]); }
    public function store(Request $request) { return $this->sendSuccessResponse([]); }
    public function update(Request $request, $id) { return $this->sendSuccessResponse([]); }
    public function destroy($id) { return $this->sendSuccessResponse([]); }
    public function show($id) { return $this->sendSuccessResponse([]); }
}
