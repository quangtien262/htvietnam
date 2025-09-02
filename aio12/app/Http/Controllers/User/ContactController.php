<?php

namespace App\Http\Controllers\User;

use App\Models\Web\MailMaketting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CommonService;
use App\Models\Web\WebConfig;
use App\Models\Web\Contact;
use App\Http\Requests\User\ContactRequest;
use App\Models\Web\Landingpage;
use App\Models\Web\Menu;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $message = $request->session()->all();
        $menuContact = Menu::query()->where('menus.display_type', 'contact')->first();
        $param = [
            'config' => $config,
            'menuContact' => $menuContact,
            'message' => $message,
            'seo' => [
                'title' => $config->title,
                'keywords' => $config->meta_keyword,
                'description' => $config->meta_description,
            ],
        ];
        return View('layouts.layout' . $config->layout . '.contact.index', $param);
    }


    public function sendContact(Request $request)
    {
        Contact::create($request->all()['contact']);
        return redirect()->route('contact.result')->with('success', 'Gửi đăng ký thành công, Cảm ơn bạn, chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể!');
    }

    public function sendContact02(Request $request)
    {
        $config = WebConfig::query()->find(1);
        if (empty($request->contact['name'])) {
            return $this->sendErrorResponse(' .name_error', __('validation.full_name_is_empty'));
        }
        if (empty($request->contact['email'])) {
            return $this->sendErrorResponse(' .email_error', __('validation.email_is_empty'));
        }

        $email = $request->contact['email'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->sendErrorResponse(' .email_error', __('validation.email_format'));
        }

        if (empty($request->contact['phone'])) {
            return $this->sendErrorResponse(' .phone_error', __('validation.phone_is_empty'));
        }
        if (empty($request->contact['content'])) {
            return $this->sendErrorResponse(' .content_error', __('validation.content_is_empty'));
        }

        if (empty($request->contact['title'])) {
            return $this->sendErrorResponse(' .title_error', __('validation.title_is_empty'));
        }

        if (empty($request->contact['area'])) {
            return $this->sendErrorResponse(' .area_error', __('validation.area_is_empty'));
        }

        $post = $request->contact;
        Contact::create($post);

        if (!empty($config->email)) {
            $title = $post['name'];
            $email = $config->email;
            $ccEmails = [];
            if (!empty($config->email02)) {
                $ccEmails[] = $config->email02;
            }
            if (!empty($config->email_language)) {
                $ccEmails[] = $config->email_language;
            }
            Mail::send('mail.send_mail', ['post' => $post], function ($message) use ($title, $email, $ccEmails) {
                $message->to($email);
                if (!empty($ccEmails)) {
                    $message->cc($ccEmails);
                }
                $message->subject($title);
            });
        }

        return $this->sendSuccessResponse('success');
    }

    public function result(Request $request)
    {
        $message = $request->session()->all();
        if (empty($message['success'])) {
            return redirect()->route('contact');
        }
        $landingPage = Landingpage::orderBy('sort_order', 'asc')->get();
        $config = WebConfig::query()->find(1);
        $menuId = 0;
        return View('common.contact_success', compact('config', 'message', 'landingPage', 'menuId'));
    }
    public function sendMail(Request $request)
    {
        $data = [];
        $config = WebConfig::find(1);
        $data['name'] = $request->input('mailMess');
        MailMaketting::create($data);
        return View('common.contact_success', compact('config'));
    }
}
