@php
    $link = app('Helper')->getLinkProduct($product);
    $avatar = app('Helper')->getAvatarProduct($product);
@endphp
<li>
    <a href="{{ $link }}">
        <img width="100" height="100" src="{{ $avatar }}"
            class="attachment-woocommerce_gallery_thumbnail size-woocommerce_gallery_thumbnail" alt=""
            decoding="async" loading="lazy"
            srcset="{{ $avatar }} 100w, {{ $avatar }} 300w, {{ $avatar }} 150w, {{ $avatar }} 768w, {{ $avatar }} 600w, {{ $avatar }} 800w"
            sizes="(max-width: 100px) 100vw, 100px"> <span class="product-title">{{ $product->name_data }}</span>
    </a>
</li>
