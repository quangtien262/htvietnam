   @php
       $types = app('Helper')->getDataLang('product_type');
       $applications = app('Helper')->getDataLang('product_application');
   @endphp

   <aside id="search-2" class="widget widget_search">
       <span class="widget-title shop-sidebar">{{ __('user.search_product') }}</span>
       <div class="is-divider small"></div>
       <form method="get" class="searchform" action="{{ route('searchProduct') }}" role="search">
           <div class="flex-row relative">
               <div class="flex-col flex-grow">
                   <input type="search" class="search-field mb-0" name="keyword" value="" id="s"
                       placeholder="Search…">
               </div>
               <div class="flex-col">
                   <button type="submit" class="ux-search-submit submit-button secondary button icon mb-0"
                       aria-label="Submit">
                       <i class="icon-search"></i> </button>
               </div>
           </div>
           <div class="live-search-results text-left z-top"></div>
       </form>
   </aside>

   <aside id="woocommerce_layered_nav-2" class="widget woocommerce widget_layered_nav woocommerce-widget-layered-nav">
       <span class="widget-title shop-sidebar">Loại nhựa nền</span>
       <div class="is-divider small"></div>
       <ul class="woocommerce-widget-layered-nav-list">
        @foreach ($types as $type)
           <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                   href="{{ route('searchProduct', ['type' => $type->data_id]) }}">{{ $type->name_data }}</a></li>

        @endforeach
       </ul>
   </aside>
   <aside id="woocommerce_layered_nav-3" class="widget woocommerce widget_layered_nav woocommerce-widget-layered-nav">
       <span class="widget-title shop-sidebar">Ứng dụng</span>
       <div class="is-divider small"></div>
       <ul class="woocommerce-widget-layered-nav-list">
            @foreach ($applications as $app)
                <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                   href="{{ route('searchProduct', ['application' => $app->data_id]) }}">{{ $app->name_data }}</a></li>
            @endforeach
            
           {{-- <li class="woocommerce-widget-layered-nav-list__item wc-layered-nav-term "><a rel="nofollow"
                   href="#">Vải
                   không dệt</a>
               <span class="count">(0)</span>
           </li> --}}
       </ul>
   </aside>
