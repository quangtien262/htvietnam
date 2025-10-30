<?php

namespace App\Casts;

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class ParentID implements CastsAttributes
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
        if(empty($value)) {
            return [
                'info' => [],
                'id' => $value
            ];
        }

        $parent = \DB::table($model->getTable())->where('id', $value)->first();
        return $parent;
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
