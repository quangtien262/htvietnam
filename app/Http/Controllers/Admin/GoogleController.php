<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Language;
use App\Models\Web\News;
use App\Models\Web\WebConfig;
use App\Services\Admin\TblService;
use Illuminate\Http\Request;
use Google\Cloud\Translate\V2\TranslateClient;
use Illuminate\Support\Facades\DB;

class GoogleController extends Controller
{
    /**
     * unactive
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function translateData(Request $request, $tableName)
    {
        if(empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        $tableData = $tableName . '_data';
        $datas = DB::table($tableName)->whereIn('id', $request->ids)->get();
        $baseLanguages = Language::find(1);
        $languages = Language::where('id', '!=', 1)->orderBy('id', 'asc')->get();

        // loop data
        foreach($datas as $data) {
            // base data
            $dataBase = DB::table($tableData)
                ->where('data_id', $data->id)
                ->where('languages_id', 1)
                ->first();
            $langDatas = DB::table($tableData)->where('data_id', $data->id)->orderBy('id', 'asc')->get();
            foreach($languages as $lang) {

                $dataUpdate = [
                    'name_data' => $this->translateText($dataBase->name_data, $lang->code),
                    'content' => $this->translateText($dataBase->content, $lang->code),
                    'description' => $this->translateText($dataBase->description, $lang->code),
                    'meta_keyword' => $this->translateText($dataBase->meta_keyword, $lang->code),
                    'meta_description' => $this->translateText($dataBase->meta_description, $lang->code),
                ];


                // get data
                $newsData = DB::table($tableData)
                    ->where('data_id', $data->id)
                    ->where('languages_id', $lang->id)
                    ->first();

                // insert
                if(empty($newsData)) {
                    $dataUpdate['created_at'] = date('Y-m-d h:i:s');
                    $dataUpdate['updated_at'] = $dataUpdate['created_at'];
                    $dataUpdate['languages_id'] = $lang->id;
                    $dataUpdate['data_id'] = $data->id;
                    DB::table($tableData)->insert($dataUpdate);
                    return $this->sendSuccessResponse([], 'insert Translation successfully', $code = 200);
                }

                // update
                TblService::updateData($tableData, $newsData->id, $dataUpdate);
            }
            // update status trans
            TblService::updateData($tableName, $data->id, ['is_translate' => 1]);
        }


        return $this->sendSuccessResponse([], 'Translation ok successfully', $code = 200);
    }

    private function translateText($text, $lang) {
        if(empty($text) || empty($lang)) {
            return '';
        }
        $config = WebConfig::query()->find(1);

        //AIzaSyCA6khpjFQuG2jIpm0y83cFB0JQI9W5g90
        $translate = new TranslateClient([
            'key' => $config->google_translate_api_key
        ]);

        // Translate text from english to french.
        $result = $translate->translate($text, [
            'target' => $lang
        ]);

        return $result['text'];
    }


    public function translateExample(Request $request)
    {
        $translate = new TranslateClient([
            'key' => 'AIzaSyCA6khpjFQuG2jIpm0y83cFB0JQI9W5g90'
        ]);

        // Translate text from english to french.
        $result = $translate->translate('Hello world!', [
            'target' => 'vi'
        ]);

        echo $result['text'] . "\n";

        // Detect the language of a string.
        $result = $translate->detectLanguage('Greetings from Michigan!');

        echo $result['languageCode'] . "\n";

        // Get the languages supported for translation specifically for your target language.
        $languages = $translate->localizedLanguages([
            'target' => 'en'
        ]);

        foreach ($languages as $language) {
            echo $language['name'] . "\n";
            echo $language['code'] . "\n";
        }

        // Get all languages supported for translation.
        $languages = $translate->languages();

        foreach ($languages as $language) {
            echo $language . "\n";
        }
    }

}
