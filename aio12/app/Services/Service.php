<?php

namespace App\Services;

use Exception;

abstract class Service
{
    protected function callableFunctions()
    {
        return property_exists($this, 'staticFunctions') ? $this->staticFunctions : [];
    }

    protected function loadConfig($name)
    {
        $config = config($name);
        if ($config === null) {
            throw new Exception('Can not load config');
        }

        return $config;
    }

    public function __call($method, $parameters)
    {
        if (in_array($method, $this->callableFunctions())) {
            return $this->{$method}(...$parameters);
        }

        throw new Exception('Call undefined method');
    }

    public static function __callStatic($method, $parameters)
    {
        return (new static)->$method(...$parameters);
    }
}
