<?php

namespace App\Casts;

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\Admin\TblModel;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class JoinMultiple implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return array
     */
    public function get($model, $key, $value, $attributes)
    {
        if(empty($value)) {
            return $value;
        }
        $value = json_decode($value, true);

        if(!is_array($value)) {
            return $value;
        }

        $table = Table::where('name', $model->getTable())->first();
        $column = Column::where('table_id', $table->id)->where('name', $key)->first();

        $routeName = \Request::route()->getName();
        if(!in_array($column->type_edit,['selects', 'selects_table']) || // ko fai la selects
            empty($column->select_table_id) ||  // chua config select table
            ($routeName == 'data.index' && $column->show_in_list != 1)) { // route la index & k dc show in list
            return $value;
        }

        $tblSelect = Table::find($column->select_table_id);
        $columnSelect = Column::where('table_id', $tblSelect->id)->get();

        if(empty($tblSelect)) {
            return $value;
        }

        try {
            $datas = \DB::table($tblSelect->name)->whereIn('id', $value)->get();
        } catch (\Throwable $th) {
            return $value;
        }
        
        // dd($datas);
        $result = [];
        foreach($datas as $data) {
            $tmp = [
                'id' => $data->id,
                'value' => $data->id,
                'label' => $data->name,
            ];
            if(isset($data->color)) {
                $tmp['color'] = $data->color;
            }
            $result[] = $tmp;
        }
        return [
            'info' => $result,
            'ids' => $value
        ];

    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        return json_encode($value);
    }
}
