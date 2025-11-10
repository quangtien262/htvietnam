<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function renew($id) { return $this->sendSuccessResponse([]); }
    public function upgrade($id) { return $this->sendSuccessResponse([]); }
}
