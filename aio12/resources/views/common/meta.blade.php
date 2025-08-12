@php
    $logo114 = 'https://' . $_SERVER['SERVER_NAME'] . '/logo/114.png';
    $logo = 'https://' . $_SERVER['SERVER_NAME'] . '/logo/logo.png';
    $banner = 'https://' . $_SERVER['SERVER_NAME'] . '/images/banner.png';
@endphp
<meta charset="utf-8" data-n-head="ssr" />
<meta data-n-head="ssr" name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="canonical" href="https://{{ $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] }}"/>
<link data-n-head="ssr" rel="alternate" hreflang="en"
    href="https://{{ $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] }}"/>

@if(!empty($config->address))
    <meta name="geo.placename" content="{{ $config->address }}" />
@endif


<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="-1" />
<meta http-equiv="Cache-Control" content="no-cache" />
<meta name="HandheldFriendly" content="true"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="keywords" content="{{ !empty($seo['keywords']) ? $seo['keywords'] : $config->meta_keyword }}" />
<meta name="description"
    content="{{ !empty($seo['description']) ? $seo['description'] : $config->meta_description }}" />
<meta name="Robots" content="NOYDIR,NOODP" />
<meta name="generator" content="{{ $seo['title'] ?? $config->name }}" />
<meta name="rating" content="General"/>

{{--
<meta itemprop="image" content="{{ $seo['avatar'] ?? $banner }}?v={{ config('app.version') }}"> --}}
<meta property="og:image" content="{{ $seo['avatar'] ?? $banner }}?v={{ config('app.version') }}" data-n-head="ssr" />
<meta name="twitter:image" content="{{ $seo['avatar'] ?? $banner }}?v={{ config('app.version') }}" />
<meta property="twitter:image" data-n-head="ssr"
    content="{{ $seo['avatar'] ?? $banner }}?v={{ config('app.version') }}"/>

<meta property="article:section" content="{{ $seo['title'] ?? $config->name }}" />
<meta property="article:tag" content="{{ $seo['keywords'] ?? $config->meta_keyword }}" />
<meta property="article:author" content="https://{{ $_SERVER['SERVER_NAME'] }}" />

<!-- META FOR FACEBOOK -->
<meta property="og:site_name" content="{{ $config->name_company }}" />
<meta property="og:rich_attachment" content="true" />
<meta property="og:type" content="article" />
<meta property="article:publisher" content="https://www.facebook.com/{{ $config->facebook_id }}/" />
<meta property="og:url" itemprop="url" content="https://{{ $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] }}" />

<meta property="og:title" content="{{ $seo['title'] ?? $config->name }}" itemprop="headline" />
<meta property="og:description" content="{{ $seo['description'] ?? $config->meta_description }}"
    itemprop="description" />
{{--
<meta property="og:creator" data-n-head="ssr" content="@{{ $config->name_company }}"> --}}

<meta content="news" itemprop="genre" name="medium" />

<meta name="source" content="{{ $seo['title'] ?? $config->name }}" itemprop="sourceOrganization" />
<meta name="copyright" content="{{ $seo['title'] ?? $config->name }}" />
<meta name="author" content="{{ $seo['title'] ?? $config->name }}" />

<meta name="revisit-after" content="days" />

{{-- tw --}}
<meta name="twitter:title" data-n-head="ssr" content="{{ $seo['title'] ?? $config->title }}" />
<meta name="twitter:description" data-n-head="ssr" content="{{ $seo['description'] ?? $config->meta_description }}" />
<meta property="twitter:url" data-n-head="ssr"
    content="https://{{ $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] }}" />
<meta name="twitter:card" data-n-head="ssr" content="{{ $seo['description'] ?? $config->meta_description }}"/>
<meta property="twitter:domain" data-n-head="ssr" content="https://{{ $_SERVER['SERVER_NAME'] }}"/>

<meta property="twitter:site" data-n-head="ssr" content="@{{ $config->name_company }}"/>
<meta property="twitter:creator" data-n-head="ssr" content="@{{ $config->name_company }}"/>

{{-- csrf-token --}}
<meta name="csrf-token" content="{{ csrf_token() }}" />

<title>{{ $seo['title'] ?? $config->name }}</title>

<link rel="icon" type="image/x-icon"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png?v={{ config('app.version') }}" />
<link rel="shotcut" type="image/x-icon" href="{{ $config->logo }}?v={{ config('app.version') }}" />
<link rel="image_src" type="image/jpeg"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png?v={{ config('app.version') }}" />

<!-- iPad icons -->
<link rel="apple-touch-icon-precomposed"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/1.png?v={{ config('app.version') }}" sizes="72x72"/>
<link rel="apple-touch-icon-precomposed"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png?v={{ config('app.version') }}" sizes="144x144"/>
<!-- iPhone and iPod touch icons -->
<link rel="apple-touch-icon-precomposed"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/57.png?v={{ config('app.version') }}" sizes="57x57"/>
<link rel="apple-touch-icon-precomposed"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png?v={{ config('app.version') }}" sizes="114x114"/>
<!-- Nokia Symbian -->
<link rel="nokia-touch-icon" href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/1.png"/>
<!-- Android icon precomposed so it takes precedence -->
<link rel="apple-touch-icon-precomposed" href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/1.png" sizes="1x1"/>
<link data-n-head="ssr" rel="apple-touch-icon" sizes="180x180"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png"/>

<link rel="apple-touch-icon" href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png" />
<meta name="msapplication-TileImage" content="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png" />


<meta data-n-head="ssr" charset="utf-8"/>
<meta data-n-head="ssr" name="viewport" content="width=device-width, initial-scale=1"/>
<meta data-n-head="ssr" name="apple-mobile-web-app-title" content="{{ $config->name_company }}"/>
<meta data-n-head=" ssr" name="application-name" content="{{ $config->name_company }}"/>
<meta data-n-head="ssr" name="msapplication-TileImage" content="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png"/>
<meta data-n-head="ssr" name="telegram:channel" content="@{{ $config->name_company }}"/>


<link data-n-head="ssr" rel="icon" type="image/png" sizes="16x16"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/57.png"/>
<link data-n-head="ssr" rel="icon" type="image/png" sizes="32x32"
    href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/57.png"/>
<link data-n-head="ssr" rel="mask-icon" href="https://{{ $_SERVER['SERVER_NAME'] }}/logo/114.png" color="#1a1b1d"/>
<link data-n-head="ssr" rel="shortcut icon" href="https://{{ $_SERVER['SERVER_NAME'] }}/favicon.ico"/>
<meta data-n-head="ssr" property="twitter:card" content="summary_large_image"/>