@php
    $langs = app('Helper')->getDataByConditions('languages', [], ['sort_order' => 'asc']);
@endphp
<div id="top-bar" class="header-top hide-for-sticky nav-dark hide-for-medium">
    <div class="flex-row container">
        <div class="flex-col hide-for-medium flex-left">
            <ul class="nav nav-left medium-nav-center nav-small nav-">
                <li class="header-contact-wrapper">
                    <ul id="header-contact" class="nav nav-divided nav-uppercase header-contact">
                        <li class="">
                            <a href="mailto:{{ $config->email }}" class="" title="{{ $config->email }}">
                                <i class="icon-envelop" style="font-size:16px;"></i> <span>
                                    <span class="__cf_email__">{{ $config->email }}</span>
                                </span>
                            </a>
                        </li>
                        <li class="">
                            <a href="tel:{{ $config->phone }}" class="" title="{{ $config->phone }}">
                                <i class="icon-phone" style="font-size:16px;"></i> <span>{{ $config->phone }}</span>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="flex-col hide-for-medium flex-right">

            <ul class="nav top-bar-nav nav-right nav-small  nav-">
                <li class="html header-social-icons ml-0">
                    <div class="social-icons follow-icons">
                @foreach ($langs as $lang)
                        &nbsp;&nbsp;&nbsp;
                        <a href="{{ route('change_language', [$lang->code]) }}" class=""
                            title="{{ $lang->name }}">
                            <img src="{{ $lang->icon }}" alt="{{ $lang->name }}" style="height:30px;">
                        </a>
                @endforeach
                
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>
