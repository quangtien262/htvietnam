<?php

namespace App\Services;
use Illuminate\Support\Facades\Route;
use App\Models\Web\Menu;
use App\Models\Web\Domain;

class HelperClass
{
    public function getMenuByParentId($parentId)
    {
        $menu = Menu::where('parent_id', $parentId)->where('active', 1)->orderBy('sort_order', 'asc');
        $menuTmp = $menu;
        return [
            'count' => $menuTmp->count(),
            'data' => $menu->get()
        ];
    }

    public function getLinkMenu($menu) {
        $link = '';
        $sluggable = self::formatText($menu->name);
        $displayType = $menu->display_type;
        $routeName = Route::getCurrentRoute()->getName();
        switch ($displayType) {
            case 'news':
                $link = route('news', [$sluggable, $menu->id]);
                break;
            case 'product':
                $link = route('product', [$sluggable, $menu->id]);
                break;
            case 'service':
                $link = route('service', [$sluggable, $menu->id]);
                break;
            case 'register_domain':
                $link = route('register_domain');
                break;
            case 'contact':
                $link = route('contact');
                break;
            case 'single':
                $link = route('single', [$sluggable, $menu->id]);
                break;
            case 'about':
                $link = route('about');
                break;
            case 'domain':
                $link = route('domain');
                break;
            default:
                break;
        }
        return $link;
    }

    public function getLinkNews($news)
    {
        $menu = Menu::find($news->menu_id);
        $sluggableMenu = self::formatText($menu->name);
        $sluggableNews = self::formatText($news->name);
        return route('news.detail', [$sluggableMenu, $sluggableNews, $news->id]);
    }

    public function getPriceDomain($domainType)
    {
        $domain = Domain::where('name', $domainType)->first();
        if(!empty($domain)) {
            return number_format($domain->price);
        }
        return '';
    }

    public function checkCart($videoId)
    {
        $user = \Auth::guard('web')->user();
        $countOrder = Orders::where('user_id', $user->id)->where('video_id', $videoId)->count();
        $checkInCart = \Cart::search(function ($cartItem, $rowId) use ($videoId) {
            return $cartItem->id === $videoId;
        });
        if (count($checkInCart) > 0 || $countOrder > 0) {
            return true;
        }
        return false;
    }

    protected function formatText($string, $ext = '')
    {
        // remove all characters that aren"t a-z, 0-9, dash, underscore or space
        $string = strip_tags(str_replace('&nbsp;', ' ', $string));
        $string = str_replace('&quot;', '', $string);

        $string = self::_utf8ToAscii($string);
        $NOT_acceptable_characters_regex = '#[^-a-zA-Z0-9_ /]#';
        $string = preg_replace($NOT_acceptable_characters_regex, '', $string);
        // remove all leading and trailing spaces
        $string = trim($string);
        // change all dashes, underscores and spaces to dashes
        $string = preg_replace('#[-_]+#', '-', $string);
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('#[-]+#', '-', $string);

        return strtolower($string.$ext);
    }

    protected function _utf8ToAscii($str)
    {
        $chars = array(
            'a' => array('ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ', 'á', 'à', 'ả', 'ã', 'ạ', 'â', 'ă', 'Á', 'À', 'Ả', 'Ã', 'Ạ', 'Â', 'Ă'),
            'e' => array('ế', 'ề', 'ể', 'ễ', 'ệ', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê'),
            'i' => array('í', 'ì', 'ỉ', 'ĩ', 'ị', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị'),
            'o' => array('ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'Ố', 'Ồ', 'Ổ', 'Ô', 'Ộ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ơ', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ơ'),
            'u' => array('ứ', 'ừ', 'ử', 'ữ', 'ự', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ', 'Ư'),
            'y' => array('ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ'),
            'd' => array('đ', 'Đ'),
        );
        foreach ($chars as $key => $arr) {
            $str = str_replace($arr, $key, $str);
        }

        return $str;
    }
}
