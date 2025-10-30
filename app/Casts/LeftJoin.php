<?php

namespace App\Casts;

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class LeftJoin implements CastsAttributes
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
    public function get($model, $key, $value, $attributes) {
        $table = Table::where('name', $model->getTable())->first();
        $column = Column::where('table_id', $table->id)->where('name', $key)->first();

        $routeName = \Request::route()->getName();
        if($column->type_edit != 'select' || ($routeName == 'data.index' && $column->show_in_list != 1) || empty($column->select_table_id)) {
            return $value;
        }

        $tblSelect = Table::find($column->select_table_id);

        if(empty($value) || empty($column->select_table_id) || empty($tblSelect)) {
            return [
                'info' => [],
                'id' => $value
            ];
        }
        return [
            'info' => \DB::table($tblSelect->name)->find($value),
            'id' => $value
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
        return $value;
    }
}
