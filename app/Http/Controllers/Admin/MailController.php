<?php

namespace App\Http\Controllers\Admin;

use Adminer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\SendMail;
use App\Models\AdminUser;
use App\Models\User;
use App\Models\Web\ServiceType;
use App\Services\Admin\TblService;
use App\Services\CommonService;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
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
    public function form(Request $request) {
        $serviceType = CommonService::formatDataSelect(['name'], ServiceType::orderBy('sort_order', 'asc')->get());
        $per = TblService::getPermission();
        $tables = TblService::getAdminMenu(0);
        return Inertia::render('Admin/Mail/form', [
            'per' => $per,
            'tables' => $tables,
            'serviceType' => $serviceType
        ]);
    }

    public function sendMail(Request $request) {
        $post = $request->all();

        $mail = new SendMail();
        $mail->mail_to = $request->mail_to;
        $mail->mail_cc = $request->mail_cc;
        $mail->name = $request->title;
        $mail->content = $request->content;
        $mail->service = $request->service;
        $mail->save();

        Mail::send('mail.send_mail', ['email' => $post], function($message) use ($post) {
            $message->to($post['mail_to'])->subject($post['title']);
        });

        return $this->sendSuccessResponse([], 'Update successfully', 200);
    }

}
