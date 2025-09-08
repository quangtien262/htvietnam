@if ($page->block_type == 'products')

@php
   $products = app('Helper')->getProducts(['products.is_hot' => 1]);
   if(count($products) < 1){
      $products = app('Helper')->getProducts();
   }
@endphp

<section class="section section1" id="section_800775673">
   
   {!! app('Helper')->editTitle($page) !!}

   <div class="bg section-bg fill bg-fill  bg-loaded">
   </div>
   <div class="section-content relative">
      <div class="row" id="row-1441222159">
         <div id="col-1206659778" class="col small-12 large-12">
            <div class="col-inner">
               <div class="tieu-de">
                  <h2 style="text-align: center; font-size: 28px;">{{ $page->name_data }}</h2>
                  <p style="text-align: center;">{{ $page->description }}</p>
               </div>
               <p style="text-align: center;">
                  <span style="color: #808080; font-size: 95%;"><em>{!! $page->content !!}</em></span>
               </p>
            </div>
         </div>

         <div class="related related-products-wrapper product-section">
            <div
               class="row has-equal-box-heights equalize-box large-columns-3 medium-columns-3 small-columns-2 row-small slider row-slider slider-nav-reveal slider-nav-push"
               data-flickity-options='{"imagesLoaded": true, "groupCells": "100%", "dragThreshold" : 5, "cellAlign": "left","wrapAround": true,"prevNextButtons": true,"percentPosition": true,"pageDots": false, "rightToLeft": false, "autoPlay" : false}'>

               @foreach ($products as $product)
               @include('layouts.layout01.elements.product.item_product_slide', ['product' => $product])
            @endforeach
            </div>
         </div>

      </div>
   </div>
   <style>
      #section_800775673 {
         padding-top: 80px;
         padding-bottom: 80px;
      }

      #section_800775673 .ux-shape-divider--top svg {
         height: 150px;
         --divider-top-width: 100%;
      }

      #section_800775673 .ux-shape-divider--bottom svg {
         height: 150px;
         --divider-width: 100%;
      }
   </style>
</section>

@endif