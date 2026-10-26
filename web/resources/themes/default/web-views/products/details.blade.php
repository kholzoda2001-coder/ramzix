@extends('layouts.front-end.app')

@section('title', $product['name'])

@push('css_or_js')
    @include(VIEW_FILE_NAMES['product_seo_meta_content_partials'], ['metaContentData' => $product?->seoInfo, 'productDetails' => $product])
    <link rel="stylesheet" href="{{ theme_asset(path: 'public/assets/front-end/css/product-details.css') }}"/>
@endpush

@section('content')
    <div class="__inline-23">
        <div class="container my-4 rtl text-align-direction">
            <div class="row g-3 {{Session::get('direction') === "rtl" ? '__dir-rtl' : ''}}">
                <div class="col-lg-9">
                    <div class="h-100 d-flex flex-column gap-4 pb-2">
                        <div class="card card-body flex-grow-0">
                            <div class="row g-3">
                                <div class="col-lg-5 col-md-4">
                                    <div class="pd-img-wrap position-relative">
                                        <div class="swiper-container quickviewSlider2 border rounded aspect-1">
                                            <div class="swiper-wrapper">
                                                @php
                                                    $imageSources = ($product->product_type === 'physical' && !empty($product->color_image) && count($product->color_images_full_url) > 0)
                                                        ? $product->color_images_full_url
                                                        : $product->images_full_url;
                                                @endphp

                                                @foreach ($imageSources as $key => $photo)
                                                    @php
                                                        $imagePath = isset($photo['image_name'])
                                                            ? getStorageImages(path: $photo['image_name'], type: 'backend-product')
                                                            : getStorageImages(path: $photo, type: 'backend-product');

                                                        $colorCode = $photo['color'] ?? '';
                                                    @endphp
                                                    <div class="swiper-slide position-relative" data-color="{{ $colorCode }}">
                                                        <div class="easyzoom easyzoom--overlay is-ready">
                                                            <a href="{{ $imagePath }}">
                                                                <img class="rounded h-100 aspect-1" alt="" src="{{ $imagePath }}">
                                                            </a>
                                                        </div>
                                                    </div>
                                                @endforeach

                                            </div>
                                        </div>
                                        <div class="pdp-top d-md-none">
                                            <button type="button" class="pdp-round pdp-back" aria-label="back" onclick="history.length > 1 ? history.back() : (location.href='{{ route('home') }}')"><i class="czi-arrow-left"></i></button>
                                            <a href="{{ route('shop-cart') }}" class="pdp-round pdp-cart" aria-label="cart"><i class="czi-cart"></i><?php $pdpCartCount = \App\Utils\CartManager::getCartListQuery()->count(); ?>@if($pdpCartCount > 0)<b class="pdp-cart-count">{{ $pdpCartCount }}</b>@endif</a>
                                        </div>
                                        <style>
                                            /* phone: the picture starts right under the header, edge to edge */
                                            @media (max-width: 767.98px) {
                                                .__inline-23 > .container{margin-top:0!important;margin-bottom:8px!important;padding-left:0;padding-right:0}
                                                .__inline-23 .card.card-body{padding:0 0 10px!important;border:0;border-radius:0}
                                                .__inline-23 .card.card-body > .row{margin:0;--bs-gutter-x:0}
                                                .__inline-23 .card.card-body > .row > [class*="col-"]:last-child{padding:0 14px}
                                                .quickviewSlider2{border:0!important;border-radius:0!important}
                                                .quickviewSlider2 img{border-radius:0!important}
                                                .__inline-23 .h-100.d-flex.flex-column.gap-4{gap:8px!important}
                                                .pd-img-wrap .cz-product-gallery-icons{top:10px}
                                                .__inline-23{margin-top:0!important;padding-top:0!important}
                                                /* one bottom bar: heart | Add to cart | Buy now (the same buttons in the page and the second heart are hidden) */
                                                .add-to-cart-details-form .product-add-and-buy-section,.add-to-cart-details-form .product-action-add-wishlist,.pd-img-wrap .wishList-pos-btn{display:none!important}
                                                .product-details-sticky-section{padding:10px 12px calc(10px + env(safe-area-inset-bottom))!important;box-shadow:0 -4px 16px rgba(11,42,91,.12);border-radius:0!important}
                                                .product-details-sticky-section .product-details-sticky-top,.product-details-sticky-section .product-details-sticky-collapse-btn,.product-details-sticky-section .product-details-sticky-bottom > .media,.product-details-sticky-section .quantity-box{display:none!important}
                                                .product-details-sticky-section .product-details-sticky-bottom{width:100%;gap:0!important}
                                                .product-details-sticky-section .product-details-sticky-bottom > div:last-child{width:100%;display:flex!important;gap:8px!important;align-items:center}
                                                .product-details-sticky-section .product-add-and-buy-section{flex:1;display:flex!important;gap:8px}
                                                .product-details-sticky-section .product-add-and-buy-section .btn{flex:1;height:46px;border-radius:12px;font-weight:700;font-size:15px;padding:0 6px}
                                                .product-details-sticky-section .product-buy-now-button{background:#ff6a00!important;border:1.5px solid #ff6a00!important;color:#fff!important}
                                                .product-details-sticky-section .product-add-to-cart-button{background:#fff!important;border:1.5px solid #0b2a5b!important;color:#0b2a5b!important}
                                                .bar-wishlist-btn{flex:0 0 46px;width:46px;height:46px;border-radius:12px;border:1.5px solid #dfe5ee;background:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;padding:0}
                                                .product-details-sticky-section{opacity:1!important;visibility:visible!important;transform:none!important;z-index:1029!important}
                                                .product-details-sticky-section .product-add-to-cart-button{order:1}
                                                .product-details-sticky-section .product-buy-now-button{order:2}
                                                body{padding-bottom:78px}
                                                .floating-btn-grp{bottom:86px!important}
                                                /* phone: no header on the product page, only small floating buttons over the picture */
                                                header, .navbar-stuck-menu{display:none!important}
                                                /* the "physical product" cube icon means nothing to a buyer */
                                                .cz-product-gallery-icons .btn-circle[title]{display:none!important}
                                                /* round floating buttons over the picture: back (left), cart + share (right) */
                                                .pdp-round{position:fixed;top:12px;z-index:1030;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(11,42,91,.22);display:flex;align-items:center;justify-content:center;color:#0b2a5b!important;font-size:19px;text-decoration:none!important;padding:0}
                                                .pdp-back{left:12px}
                                                .pdp-cart{right:62px}
                                                .pdp-cart-count{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;background:#ff6a00;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px}
                                                .cz-product-gallery-icons{position:fixed!important;top:12px!important;right:12px!important;left:auto!important;z-index:1030}
                                                .cz-product-gallery-icons > div{padding-top:0!important}
                                                .cz-product-gallery-icons .share_btn{width:40px!important;height:40px!important;border:0!important;background:rgba(255,255,255,.95)!important;box-shadow:0 2px 10px rgba(11,42,91,.22);color:#0b2a5b!important}
                                                /* bottom bar polish */
                                                .product-details-sticky-section .product-add-and-buy-section .btn{height:48px;border-radius:14px;font-size:15.5px;letter-spacing:.2px}
                                                .product-details-sticky-section .product-buy-now-button{background:linear-gradient(135deg,#ff8a00,#ff5a00)!important;border:0!important;box-shadow:0 4px 12px rgba(255,106,0,.40)}
                                                .product-details-sticky-section .product-add-to-cart-button{border-radius:14px}
                                                .bar-wishlist-btn{flex:0 0 48px;width:48px;height:48px;border-radius:14px}
                                                .bar-wishlist-btn .fa-heart{color:#ff3b5c!important}
                                                /* quantity stepper */
                                                .add-to-cart-details-form .quantity-box{border-radius:24px!important;height:42px!important;width:140px!important;box-shadow:0 1px 4px rgba(11,42,91,.10)}
                                                .add-to-cart-details-form .quantity-box .btn-number{width:42px!important;font-size:20px;font-weight:700}
                                            }
                                            /* touch screens: no zoom on tap / long press, the image only swipes */
                                            @media (hover: none), (max-width: 991.98px) {
                                                .quickviewSlider2 .easyzoom{pointer-events:none}
                                                .easyzoom-flyout,.easyzoom-notice{display:none!important}
                                                .quickviewSlider2 img{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
                                            }
                                        </style>
                                        @if(count($imageSources) > 1)
                                            <div class="product-gallery-dots d-md-none" id="productGalleryDots">
                                                @foreach($imageSources as $dotKey => $dotPhoto)
                                                    <span class="{{ $loop->first ? 'active' : '' }}"></span>
                                                @endforeach
                                            </div>
                                            <style>
                                                .product-gallery-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}
                                                .product-gallery-dots span{width:7px;height:7px;border-radius:50%;background:#cfd6e2;transition:.2s}
                                                .product-gallery-dots span.active{width:20px;border-radius:4px;background:var(--web-primary,#1b7fed)}
                                                @media (max-width:767.98px){.quickviewSliderThumb2{display:none!important}.quickviewSliderThumb2 + *{display:none}.product-gallery-thumbs-wrap{display:none!important}}
                                            </style>
                                            <script>
                                                window.addEventListener('load', function () {
                                                    var el = document.querySelector('.quickviewSlider2'), dots = document.querySelectorAll('#productGalleryDots span');
                                                    if (!el || !el.swiper || !dots.length) return;
                                                    var sync = function () { dots.forEach(function (d, i) { d.classList.toggle('active', i === el.swiper.realIndex); }); };
                                                    el.swiper.on('slideChange', sync);
                                                    sync();
                                                });
                                            </script>
                                        @endif
                                        <div class="cz-product-gallery-icons">
                                            <div class="d-flex flex-column gap-12px pt-3">
                                                @if($product->product_type == "physical")
                                                <div class="bg-white btn-circle border" style="--size: 35px" data-toggle="tooltip" title="{{ translate('Physical_Product') }}" data-placement="left">
                                                    <img class="h-16px aspect-1 svg" src="{{theme_asset(path: "public/assets/front-end/img/icons/physical-product.svg")}}" alt="">
                                                </div>
                                                @else
                                                    <div class="bg-white btn-circle border" style="--size: 35px" data-toggle="tooltip" title="{{ translate('Digital_Product') }}" data-placement="left">
                                                        <img class="h-16px aspect-1 svg" src="{{theme_asset(path: "public/assets/front-end/img/icons/digital-product.svg")}}" alt="">
                                                    </div>
                                                @endif
                                                <button type="button" data-product-id="{{ $product['id'] }}"
                                                    class="btn __text-18px border position-static rounded-circle wishList-pos-btn d-sm-none product-action-add-wishlist">
                                                    <i class="fa {{($wishlistStatus == 1?'fa-heart':'fa-heart-o') }} wishlist_icon_{{ $product['id'] }} web-text-primary"
                                                    aria-hidden="true"></i>
                                                    <div class="wishlist-tooltip" x-placement="top">
                                                        <div class="arrow"></div>
                                                        <div class="inner">
                                                            <span class="add">{{ translate('added_to_wishlist') }}</span>
                                                            <span class="remove">{{ translate('removed_from_wishlist') }}</span>
                                                        </div>
                                                    </div>
                                                </button>

                                                <div class="share_dropdown_wrapper">
                                                    <button type="button" class="btn btn-outline-primary btn-circle p-0 share_btn" style="--size: 35px" tabindex="0">
                                                        <i class="fa fa-share-alt"></i>
                                                    </button>
                                                    <div class="share_dropdown bg-white d-flex gap-3 align-items-center flex-column">
                                                        <a href="#"  class="flex-shrink-0 btn btn-circle p-0 bg-facebook text-white share-on-social-media share_btn facebook" style="--size: 20px"   data-action="{{route('product',$product->slug)}}"    data-social-media-name="facebook.com/sharer/sharer.php?u=">
                                                            <i class="czi-facebook lh-1 fs-10"></i>
                                                        </a>
                                                        <a href="#" class="flex-shrink-0 btn btn-circle p-0 bg-twitter text-white share-on-social-media share_btn twitter" style="--size: 20px"    data-action="{{route('product',$product->slug)}}" data-social-media-name="twitter.com/intent/tweet?text=">
                                                            <i class="czi-twitter lh-1 fs-10"></i>
                                                        </a>
                                                        <a href="#" class="flex-shrink-0 btn btn-circle p-0 bg-linkedin text-white share-on-social-media share_btn linkedin" style="--size: 20px"  data-action="{{route('product',$product->slug)}}" data-social-media-name="linkedin.com/shareArticle?mini=true&url=">
                                                            <i class="czi-linkedin lh-1 fs-10"></i>
                                                        </a>
                                                        <a href="#" class="flex-shrink-0 btn btn-circle p-0 bg-whatsapp text-white share-on-social-media share_btn whatsapp" style="--size: 20px"  data-action="{{route('product',$product->slug)}}" data-social-media-name="api.whatsapp.com/send?text=">
                                                            <i class="fa fa-whatsapp lh-1 fs-10"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-3 user-select-none product-gallery-thumbs-wrap" @if(count($imageSources) <= 1) style="display:none" @endif>
                                            <div class="quickviewSliderThumb2 swiper-container position-relative active-border">
                                                <div class="swiper-wrapper auto-item-width justify-content-start">
                                                    @foreach ($imageSources as $key => $photo)
                                                        @php
                                                            $imagePath = isset($photo['image_name'])
                                                                ? getStorageImages(path: $photo['image_name'], type: 'backend-product')
                                                                : getStorageImages(path: $photo, type: 'backend-product');
                                                        @endphp
                                                        <div class="swiper-slide position-relative rounded border" role="group">
                                                            <img class="aspect-1" alt="" src="{{ $imagePath }}">
                                                        </div>
                                                    @endforeach
                                                </div>

                                                <div class="swiper-button-next swiper-quickview-button-next"></div>
                                                <div class="swiper-button-prev swiper-quickview-button-prev"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-7 col-md-8 mt-md-0 mt-sm-3 web-direction">
                                    <div class="details __h-100 product-cart-option-container p-0">
                                        <div class="mb-3 product-title-box">
                                            <h2 class="mb-0 __inline-24 product-title-clamp" id="productTitleClamp">{{ $product->name }}</h2>
                                            <button type="button" class="product-title-toggle d-none" id="productTitleToggle"
                                                    data-more="{{ translate('Show_more') }} ▾" data-less="{{ translate('Show_less') }} ▴">{{ translate('Show_more') }} ▾</button>
                                        </div>
                                        <style>
                                            .product-title-clamp{font-size:14px!important;line-height:1.35!important;font-weight:700;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
                                            .product-title-clamp.expanded{display:block;-webkit-line-clamp:unset;overflow:visible}
                                            .product-title-toggle{background:none;border:0;padding:2px 0;color:var(--web-primary,#1b7fed);font-size:13px;font-weight:600;cursor:pointer}
                                        </style>
                                        <script>
                                            (function () {
                                                var t = document.getElementById('productTitleClamp'), b = document.getElementById('productTitleToggle');
                                                if (!t || !b) return;
                                                if (t.scrollHeight > t.clientHeight + 2) b.classList.remove('d-none');
                                                b.addEventListener('click', function () {
                                                    var open = t.classList.toggle('expanded');
                                                    b.textContent = open ? b.dataset.less : b.dataset.more;
                                                });
                                            })();
                                        </script>
                                        <div class="d-flex flex-wrap align-items-center gap-3 mb-4 pro" @if($overallRating[0] == 0 && (int)$countOrder <= 0 && (int)$countWishlist <= 0) style="display:none!important" @endif>
                                            @if($overallRating[0] !=0)
                                            <div class="star-rating me-2">
                                                @for($inc=1;$inc<=5;$inc++)
                                                    @if ($inc <= (int)$overallRating[0])
                                                        <i class="tio-star text-warning"></i>
                                                    @elseif ($overallRating[0] != 0 && $inc <= (int)$overallRating[0] + 1.1 && $overallRating[0] > ((int)$overallRating[0]))
                                                        <i class="tio-star-half text-warning"></i>
                                                    @else
                                                        <i class="tio-star-outlined text-warning"></i>
                                                    @endif
                                                @endfor
                                            </div>
                                                <span
                                                    class="d-inline-block  align-middle fs-14 text-muted">({{ $overallRating[0] }})</span>
                                                <span
                                                    class="font-weight-normal fs-14 font-for-tab d-inline-block font-size-sm text-body align-middle">
                                                   <a href="#reviews"
                                                      class="font-weight-normal fs-14 font-for-tab d-inline-block font-size-sm text-body align-middle"
                                                      data-toggle="tab"
                                                      role="tab">
                                                        <span class="web-text-primary fw-semibold">{{ $overallRating[1] }}</span> {{ translate('reviews') }}
                                                    </a>
                                                </span>
                                                <span class="border-middle-14px"></span>
                                               @endif
                                            {{-- counters are shown only when they are above zero (a new shop with "0 orders | 0 wish listed" looks empty) --}}
                                            @if((int)$countOrder > 0)
                                            <span
                                                class="font-weight-normal fs-14 font-for-tab d-inline-block font-size-sm text-body align-middle">
                                                <span class="web-text-primary fw-semibold fw-semibold">{{ $countOrder}}</span>
                                                    {{ translate('orders') }}
                                                </span>
                                            @endif
                                            @if((int)$countOrder > 0 && (int)$countWishlist > 0)<span class="border-middle-14px"></span>@endif
                                            <span
                                                class="font-weight-normal fs-14 font-for-tab d-inline-block font-size-sm text-body align-middle text-capitalize" @if((int)$countWishlist <= 0) style="display:none" @endif>
                                                <span class="web-text-primary fw-semibold countWishlist-{{ $product->id }}"> {{ $countWishlist}}</span> {{ translate('wish_listed') }}
                                            </span>
                                        </div>

                                        @if($product['product_type'] == 'digital')
                                            <div class="digital-product-authors mb-2">
                                                @if(count($productPublishingHouseInfo['data']) > 0)
                                                    <div class="d-flex align-items-center g-2 me-2">
                                                        <span class="text-capitalize digital-product-author-title">{{ translate('Publishing_House') }} :</span>
                                                        <div class="item-list">
                                                            @foreach($productPublishingHouseInfo['data'] as $publishingHouseName)
                                                                <a href="{{ route('products', ['publishing_house_id' => $publishingHouseName['id'], 'product_type' => 'digital', 'page'=>1]) }}"
                                                                   class="text-base">
                                                                    {{ $publishingHouseName['name'] }}
                                                                </a>
                                                            @endforeach
                                                        </div>
                                                    </div>
                                                @endif

                                                @if(count($productAuthorsInfo['data']) > 0)
                                                    <div class="d-flex align-items-center g-2 me-2">
                                                        <span class="text-capitalize digital-product-author-title">{{ translate('Author') }} :</span>
                                                        <div class="item-list">
                                                            @foreach($productAuthorsInfo['data'] as $productAuthor)
                                                                <a href="{{ route('products',['author_id' => $productAuthor['id'], 'product_type' => 'digital', 'page' => 1]) }}"
                                                                   class="text-base">
                                                                    {{ $productAuthor['name'] }}
                                                                </a>
                                                            @endforeach
                                                        </div>
                                                    </div>
                                                @endif
                                            </div>
                                        @endif

                                        <form class="addToCartDynamicForm add-to-cart-details-form d-flex flex-column gap-4">

                                            <div class="pdp-price-row">
                                                <h3 class="font-weight-normal text-accent {{ \App\Utils\QuantityPricing::isSingle() ? 'd-flex' : 'd-none' }} align-items-end gap-2 mb-0">
                                                    @if(getProductPriceByType(product: $product, type: 'discount', result: 'value') > 0)
                                                        <del
                                                            class="product-total-unit-price align-middle text-muted fs-18 font-semibold">
                                                            {{ webCurrencyConverter(amount: $product->unit_price) }}
                                                        </del>
                                                    @endif
                                                    <span class="discounted-unit-price fs-24 font-bold">
                                                        {{ getProductPriceByType(product: $product, type: 'discounted_unit_price', result: 'string') }}
                                                    </span>
                                                </h3>
                                                @if(\App\Utils\QuantityPricing::isSingle())
                                                    @include('web-views.products.partials._wholesale-button', ['product' => $product])
                                                @endif
                                            </div>
                                            @include('web-views.products.partials._price-tiers', ['product' => $product])

                                            @csrf
                                            <input type="hidden" name="id" value="{{ $product->id }}">
                                            <div
                                                class="position-relative">
                                                @if (count(json_decode($product->colors)) > 0)
                                                    <div class="d-flex align-items-center gap-3 my-2">
                                                        <div class="product-description-label m-0 text-dark">
                                                            {{ translate('color') }}
                                                        </div>
                                                        <div>
                                                            <ul class="list-inline checkbox-color mb-0 p-0 flex-start gap-2">
                                                                @foreach (json_decode($product->colors) as $key => $color)
                                                                    <li>
                                                                        <input type="radio"
                                                                               id="{{ str_replace(' ', '', ($product->id. '-color-'. str_replace('#','',$color))) }}"
                                                                               name="color" value="{{ $color }}"
                                                                               @if($key == 0) checked @endif>
                                                                        <label style="background: {{ $color }};"
                                                                               class="focus-preview-image-by-color shadow-border"
                                                                               for="{{ str_replace(' ', '', ($product->id. '-color-'. str_replace('#','',$color))) }}"
                                                                               data-toggle="tooltip"
                                                                               data-key="{{ str_replace('#','',$color) }}"
                                                                               data-colorid="preview-box-{{ str_replace('#','',$color) }}"
                                                                               data-title="{{ getColorNameByCode(code: $color) }}">
                                                                            <span class="outline"></span></label>
                                                                    </li>
                                                                @endforeach
                                                            </ul>
                                                        </div>
                                                    </div>
                                                @endif
                                                @php
                                                    $qty = 0;
                                                    if(!empty($product->variation)){
                                                    foreach (json_decode($product->variation) as $key => $variation) {
                                                            $qty += $variation->qty;
                                                        }
                                                    }
                                                @endphp
                                            </div>

                                            @php($extensionIndex=0)
                                            @if($product['product_type'] == 'digital' && $product['digital_product_file_types'] && count($product['digital_product_file_types']) > 0 && $product['digital_product_extensions'])
                                                @foreach($product['digital_product_extensions'] as $extensionKey => $extensionGroup)
                                                    <div class="row flex-start mx-0 align-items-center gap-3 flex-nowrap">
                                                        <div
                                                            class="product-description-label text-dark text-capitalize flex-shrink-0">
                                                            {{ translate($extensionKey) }}
                                                        </div>
                                                        <div>
                                                            @if(count($extensionGroup) > 0)
                                                                <div
                                                                    class="list-inline checkbox-alphanumeric checkbox-alphanumeric--style-1 mb-0 mx-1 flex-start ps-0">
                                                                    @foreach($extensionGroup as $index => $extension)
                                                                        <div class="user-select-none">
                                                                            <div class="for-mobile-capacity">
                                                                                <input type="radio" hidden
                                                                                       id="extension_{{ str_replace(' ', '-', $extension) }}"
                                                                                       name="variant_key"
                                                                                       value="{{ $extensionKey.'-'.preg_replace('/\s+/', '-', $extension) }}"
                                                                                    {{ $extensionIndex == 0 ? 'checked' : ''}}>
                                                                                <label
                                                                                    for="extension_{{ str_replace(' ', '-', $extension) }}"
                                                                                    class="__text-12px">
                                                                                    <span class="text-nowrap max-w-180 line--limit-1">{{ $extension }}</span>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        @php($extensionIndex++)
                                                                    @endforeach
                                                                </div>
                                                            @endif
                                                        </div>
                                                    </div>
                                                @endforeach
                                            @endif

                                            @foreach (json_decode($product->choice_options) as $key => $choice)
                                                <div class="row flex-start mx-0 align-items-center gap-3 flex-nowrap">
                                                    <div
                                                        class="product-description-label text-dark text-capitalize flex-shrink-0">{{ $choice->title === 'Option' ? '' : $choice->title }}
                                                    </div>
                                                    <div>
                                                        <div
                                                            class="list-inline checkbox-alphanumeric checkbox-alphanumeric--style-1 mb-0 mx-1 flex-start row ps-0">
                                                            <?php
                                                                $optVariations = json_decode($product->variation, true) ?: [];
                                                                $optGallery = array_map(fn($g) => is_array($g) ? ($g['image_name'] ?? '') : $g, json_decode($product->getRawOriginal('images') ?? '[]', true) ?: []);
                                                            ?>
                                                            @foreach ($choice->options as $index => $option)
                                                                <?php
                                                                    $optImage = collect($optVariations)->firstWhere('type', str_replace(' ', '', $option))['image'] ?? null;
                                                                    $optImageIndex = $optImage ? array_search($optImage, $optGallery, true) : false;
                                                                ?>
                                                                <div class="user-select-none">
                                                                    <div class="for-mobile-capacity">
                                                                        <input type="radio"
                                                                               id="{{ str_replace(' ', '', ($choice->name. '-'. $option)) }}"
                                                                               name="{{ $choice->name }}" value="{{ $option }}"
                                                                               @if($optImageIndex !== false) data-image-index="{{ $optImageIndex }}" @endif
                                                                               @if($index == 0) checked @endif >
                                                                        <label class="__text-12px {{ $optImage ? 'has-opt-img' : '' }}"
                                                                               for="{{ str_replace(' ', '', ($choice->name. '-'. $option)) }}">
                                                                                @if($optImage)
                                                                                    <img class="opt-img" loading="lazy" alt="{{ $option }}" src="{{ asset('storage/product/' . $optImage) }}">
                                                                                @endif
                                                                                <span class="text-nowrap max-w-180 line--limit-1">{{ $option }}</span>
                                                                            </label>
                                                                    </div>
                                                                </div>
                                                            @endforeach
                                                        </div>
                                                    </div>
                                                </div>
                                            @endforeach

                                            <style>
                                                /* order inside the form: variants (colour / option) first, then the price + wholesale button, then quantity */
                                                .add-to-cart-details-form > *{order:4}
                                                /* variants sit right under the title */
                                                .product-title-box{margin-bottom:4px!important}
                                                .add-to-cart-details-form{gap:12px!important}
                                                .add-to-cart-details-form > .row{margin-top:0!important}
                                                .add-to-cart-details-form > .position-relative{margin:0!important}
                                                .add-to-cart-details-form > .position-relative,.add-to-cart-details-form > .row{order:1}
                                                .add-to-cart-details-form > .pdp-price-row{order:2}
                                                .add-to-cart-details-form > .product-price-tiers{order:3}
                                                .checkbox-alphanumeric label.has-opt-img{display:flex!important;flex-direction:column;align-items:center;gap:4px;padding:5px!important;min-width:68px;height:auto!important}
                                                .row:has(> div > .checkbox-alphanumeric .has-opt-img) > .product-description-label:empty{display:none}
                                                .opt-img{width:54px;height:54px;object-fit:cover;border-radius:6px;display:block}
                                                /* options with pictures: one swipeable line */
                                                .row:has(> div > .checkbox-alphanumeric .has-opt-img) > div:last-child{flex:1 1 0;min-width:0}
                                                .checkbox-alphanumeric:has(.has-opt-img){flex-wrap:nowrap!important;overflow-x:auto;gap:6px;margin:0!important;padding:2px 2px 2px!important;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch}
                                                .checkbox-alphanumeric:has(.has-opt-img)::-webkit-scrollbar{display:none;width:0;height:0}
                                                .checkbox-alphanumeric:has(.has-opt-img) > div{flex:0 0 auto;padding:0!important;width:auto!important;max-width:none!important}
                                            </style>
                                            <script>
                                                // choosing an option with its own picture moves the gallery to that picture
                                                document.addEventListener('change', function (e) {
                                                    var t = e.target;
                                                    if (!t.matches || !t.matches('input[type=radio][data-image-index]')) return;
                                                    var el = document.querySelector('.quickviewSlider2');
                                                    if (el && el.swiper) el.swiper.slideTo(parseInt(t.dataset.imageIndex, 10), 300);
                                                });
                                            </script>
                                            <div class="">
                                                <div class="product-quantity d-flex flex-column __gap-15">
                                                    <div class="d-flex align-items-center gap-4">
                                                        <div class="product-description-label text-dark">
                                                            {{ translate('qty') }}
                                                        </div>
                                                        <div
                                                            class="d-flex justify-content-between align-items-center quantity-box border rounded border-base web-text-primary w-130px h-40px overflow-hidden">
                                                            <span class="input-group-btn h-100">
                                                                <button class="btn btn-number __p-10 web-text-primary bg-ECF1F6 rounded-0 h-100 w-32px"
                                                                        type="button"
                                                                        data-type="minus" data-field="quantity"
                                                                        disabled="disabled">
                                                                    -
                                                                </button>
                                                            </span>
                                                            <input type="text" name="quantity"
                                                                   class="form-control input-number text-center product-details-cart-qty __inline-29 border-0 w-100 fs-12"
                                                                   placeholder="{{ translate('1') }}"
                                                                   value="{{ $initialProductConfig['quantity'] ?? 1 }}"
                                                                   data-producttype="{{ $product->product_type }}"
                                                                   min="{{ $product->minimum_order_qty ?? 1 }}"
                                                                   max="{{ $product['product_type'] == 'physical' ? $product->current_stock : 100}}">
                                                            <span class="input-group-btn h-100">
                                                                <button class="btn btn-number __p-10 web-text-primary bg-ECF1F6 rounded-0 h-100 w-32px"
                                                                        type="button"
                                                                        data-producttype="{{ $product->product_type }}"
                                                                        data-type="plus" data-field="quantity">
                                                                        +
                                                                </button>
                                                            </span>
                                                        </div>
                                                        <input type="hidden" class="product-generated-variation-code"
                                                               name="product_variation_code"
                                                               data-product-id="{{ $product['id'] }}">
                                                        <input type="hidden" value=""
                                                               class="product-exist-in-cart-list form-control w-50" name="key">
                                                    </div>
                                                    <div class="product-details-chosen-price-section">
                                                        <div
                                                            class="d-none d-sm-flex justify-content-start align-items-center me-2">
                                                            <div
                                                                class="product-description-label fs-20 text-dark font-bold text-capitalize">
                                                                <strong>{{ translate('total_price') }}</strong>:
                                                            </div>
                                                            &nbsp; <strong
                                                                class="text-base product-details-chosen-price-amount fs-20">
                                                                {{ webCurrencyConverter(amount: $initialProductConfig['total_quantity_price']) }}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="__btn-grp product-add-and-buy-section-parent">

                                                <?php


                                                $isTemporaryClose = false;
                                                $isVacationMode = false;
                                                $authorType = $product->added_by == 'admin' ? 'inhouse' : ($product->added_by == 'seller' ? 'vendor' : '');

                                                if ($authorType === 'vendor') {
                                                    $isTemporaryClose = checkVendorAbility(type: $authorType, status: 'temporary_close', vendor: $product->seller->shop);
                                                    $isVacationMode = !$isTemporaryClose ? checkVendorAbility(type: $authorType, status: 'vacation_status', vendor: $product->seller->shop) : false;
                                                } else {
                                                    $isTemporaryClose = checkVendorAbility(type: $authorType, status: 'temporary_close');
                                                    $isVacationMode = !$isTemporaryClose ? checkVendorAbility(type: $authorType, status: 'vacation_status') : false;
                                                }
                                                ?>

                                                <div
                                                    class="product-add-and-buy-section gap-2 {!! $firstVariationQuantity <= 0 ? '' : 'd-flex' !!}"
                                                    {!! $firstVariationQuantity <= 0 ? 'style="display: none;"' : '' !!}>

                                                    @if($isTemporaryClose || $isVacationMode)
                                                        <button class="btn btn-secondary" type="button" disabled>
                                                            {{ translate('buy_now') }}
                                                        </button>
                                                        <button class="btn btn--primary string-limit" type="button" disabled>
                                                            {{ translate('add_to_cart') }}
                                                        </button>
                                                    @else
                                                        <button type="button"
                                                                class="btn btn-secondary element-center btn-gap-{{ Session::get('direction') === 'rtl' ? 'left' : 'right' }} product-buy-now-button"
                                                                data-form=".add-to-cart-details-form"
                                                                data-auth="{{ (getWebConfig(name: 'guest_checkout') == 1 || Auth::guard('customer')->check()) ? 'true' : 'false' }}"
                                                                data-route="{{ route('shop-cart') }}"
                                                        >
                                                            <span class="string-limit">{{ translate('buy_now') }}</span>
                                                        </button>
                                                        <button
                                                            class="btn btn--primary element-center product-add-to-cart-button"
                                                            type="button"
                                                            data-form=".add-to-cart-details-form"
                                                            data-update="{{ translate('update_cart') }}"
                                                            data-add="{{ translate('add_to_cart') }}"
                                                        >
                                                            <span class="string-limit">
                                                                {{ $initialProductConfig['first_variant_in_cart'] ? translate('update_cart') : translate('add_to_cart') }}
                                                            </span>
                                                        </button>
                                                    @endif
                                                </div>

                                                @if(($product['product_type'] == 'physical'))
                                                    <div
                                                        class="product-restock-request-section collapse" {!! $firstVariationQuantity <= 0 ? 'style="display: block;"' : '' !!}>
                                                        <button type="button"
                                                                class="btn request-restock-btn btn-outline-primary fw-semibold product-restock-request-button"
                                                                data-auth="{{ auth('customer')->check() }}"
                                                                data-form=".addToCartDynamicForm"
                                                                data-default="{{ translate('Request_Restock') }}"
                                                                data-requested="{{ translate('Request_Sent') }}"
                                                        >
                                                            {{ translate('Request_Restock') }}
                                                        </button>
                                                    </div>
                                                @endif
                                                <button type="button" data-product-id="{{ $product['id'] }}"
                                                        class="btn __text-18px border product-action-add-wishlist">
                                                    <i class="fa {{($wishlistStatus == 1?'fa-heart':'fa-heart-o') }} wishlist_icon_{{ $product['id'] }} web-text-primary"
                                                       aria-hidden="true"></i>
                                                    <span
                                                        class="fs-14 text-muted align-bottom countWishlist-{{ $product['id'] }}">{{ $countWishlist}}</span>
                                                    <div class="wishlist-tooltip" x-placement="top">
                                                        <div class="arrow"></div>
                                                        <div class="inner">
                                                            <span class="add">{{ translate('added_to_wishlist') }}</span>
                                                            <span class="remove">{{ translate('removed_from_wishlist') }}</span>
                                                        </div>
                                                    </div>
                                                </button>

                                                @if($product->added_by == 'admin')
                                                    @if(checkVendorAbility(type: 'inhouse', status: 'temporary_close') || checkVendorAbility(type: 'inhouse', status: 'vacation_status'))
                                                        <div class="alert alert-danger mt-2" role="alert">
                                                            {{ translate('this_shop_is_temporary_closed_or_on_vacation._You_cannot_add_product_to_cart_from_this_shop_for_now') }}
                                                        </div>
                                                    @endif
                                                @elseif($product->added_by == 'seller')
                                                    @if(checkVendorAbility(type: 'vendor', status: 'temporary_close', vendor: $product->seller->shop) || checkVendorAbility(type: 'vendor', status: 'vacation_status', vendor: $product->seller->shop))
                                                        <div class="alert alert-danger mt-2" role="alert">
                                                            {{ translate('this_shop_is_temporary_closed_or_on_vacation._You_cannot_add_product_to_cart_from_this_shop_for_now') }}
                                                        </div>
                                                    @endif
                                                @endif
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="rtl text-align-direction flex-grow-1">
                            <div class="__review-overview card card-body h-100">
                                <ul class="nav nav-tabs nav--tabs d-flex justify-content-center gap-2"
                                    role="tablist">
                                    <li class="nav-item">
                                        <h2 class="nav-link __inline-27 mb-0 tab_link active" href="#overview"
                                            data-toggle="tab" role="tab">
                                            {{ translate('overview') }}
                                        </h2>
                                    </li>
                                    <li class="nav-item">
                                        <h2 class="nav-link __inline-27 mb-0 tab_link" href="#reviews" data-toggle="tab"
                                            role="tab">
                                            {{ translate('reviews') }}
                                        </h2>
                                    </li>
                                </ul>
                                <div class="tab-content px-lg-3">
                                    <div class="tab-pane fade show active text-justify" id="overview"
                                         role="tabpanel">
                                        <div class="row pt-2 specification">

                                            @if($product->video_url != null && (str_contains($product->video_url, "youtube.com/embed/")))
                                                <div class="col-12 mb-4">
                                                    <iframe width="420" height="315"
                                                            src="{{ $product->video_url}}">
                                                    </iframe>
                                                </div>
                                            @endif
                                            @if ($product['details'])
                                                <h4 class="fs-16 fw-bold mb-3">{{ translate('Detail_Description') }}</h4>
                                                <div
                                                    class="text-body col-lg-12 col-md-12 overflow-y-auto max-height-500px fs-14 text-justify details-text-justify rich-editor-html-content">
                                                    {!! $product['details'] !!}
                                                </div>
                                            @endif

                                        </div>
                                        @if (!$product['details'] && ($product->video_url == null || !(str_contains($product->video_url, "youtube.com/embed/"))))
                                            <div>
                                                <div class="text-center text-capitalize py-5">
                                                    <img class="mw-90"
                                                         src="{{ theme_asset(path: 'public/assets/front-end/img/icons/nodata.svg') }}"
                                                         alt="">
                                                    <p class="text-capitalize mt-2">
                                                        <small>{{ translate('product_details_not_found') }}
                                                            !</small>
                                                    </p>
                                                </div>
                                            </div>
                                        @endif
                                    </div>

                                    <div class="tab-pane fade" id="reviews" role="tabpanel">
                                        @if(count($product->reviews)==0 && $productReviews->total() == 0)
                                            <div>
                                                <div class="text-center text-capitalize">
                                                    <img class="mw-100"
                                                         src="{{ theme_asset(path: 'public/assets/front-end/img/icons/empty-review.svg') }}"
                                                         alt="">
                                                    <p class="text-capitalize">
                                                        <small>{{ translate('No_review_given_yet') }}!</small>
                                                    </p>
                                                </div>
                                            </div>
                                        @else
                                            <div class="row pt-2 pb-3">
                                                <div class="col-lg-4 col-md-5 ">
                                                    <div
                                                        class=" row d-flex justify-content-center align-items-center">
                                                        <div
                                                            class="col-12 d-flex justify-content-center align-items-center">
                                                            <h2 class="overall_review mb-2 __inline-28">
                                                                {{ $overallRating[0] }}
                                                            </h2>
                                                        </div>
                                                        <div
                                                            class="d-flex justify-content-center align-items-center star-rating ">
                                                            @for($inc=1;$inc<=5;$inc++)
                                                                @if ($inc <= (int)$overallRating[0])
                                                                    <i class="tio-star text-warning"></i>
                                                                @elseif ($overallRating[0] != 0 && $inc <= (int)$overallRating[0] + 1.1 && $overallRating[0] > ((int)$overallRating[0]))
                                                                    <i class="tio-star-half text-warning"></i>
                                                                @else
                                                                    <i class="tio-star-outlined text-warning"></i>
                                                                @endif
                                                            @endfor
                                                        </div>
                                                        <div
                                                            class="col-12 d-flex justify-content-center align-items-center mt-2">
                                                            <span class="text-center">
                                                                {{ $productReviews->total() }} {{ translate('ratings') }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-lg-8 col-md-7 pt-sm-3 pt-md-0">
                                                    <div
                                                        class="d-flex align-items-center mb-2 font-size-sm">
                                                        <div
                                                            class="__rev-txt"><span
                                                                class="d-inline-block align-middle text-body">{{ translate('excellent') }}</span>
                                                        </div>
                                                        <div class="w-0 flex-grow">
                                                            <div class="progress text-body __h-5px">
                                                                <div class="progress-bar web--bg-primary"
                                                                     role="progressbar"
                                                                     style="width: <?php echo $widthRating = ($rating[0] != 0) ? ($rating[0] / $overallRating[1]) * 100 : (0); ?>%;"
                                                                     aria-valuenow="60" aria-valuemin="0"
                                                                     aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div class="col-1 text-body">
                                                            <span
                                                                class=" {{Session::get('direction') === "rtl" ? 'me-3 float-left' : 'ml-3 float-right'}} ">
                                                                {{ $rating[0] }}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="d-flex align-items-center mb-2 text-body font-size-sm">
                                                        <div
                                                            class="__rev-txt"><span
                                                                class="d-inline-block align-middle ">{{ translate('good') }}</span>
                                                        </div>
                                                        <div class="w-0 flex-grow">
                                                            <div class="progress __h-5px">
                                                                <div class="progress-bar web--bg-primary" role="progressbar"
                                                                     style="width: <?php echo $widthRating = ($rating[1] != 0) ? ($rating[1] / $overallRating[1]) * 100 : (0); ?>%; background-color: #a7e453;"
                                                                     aria-valuenow="27" aria-valuemin="0"
                                                                     aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div class="col-1">
                                                            <span
                                                                class="{{Session::get('direction') === "rtl" ? 'me-3 float-left' : 'ml-3 float-right'}}">
                                                                    {{ $rating[1] }}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="d-flex align-items-center mb-2 text-body font-size-sm">
                                                        <div
                                                            class="__rev-txt"><span
                                                                class="d-inline-block align-middle ">{{ translate('average') }}</span>
                                                        </div>
                                                        <div class="w-0 flex-grow">
                                                            <div class="progress __h-5px">
                                                                <div class="progress-bar web--bg-primary" role="progressbar"
                                                                     style="width: <?php echo $widthRating = ($rating[2] != 0) ? ($rating[2] / $overallRating[1]) * 100 : (0); ?>%; background-color: #ffda75;"
                                                                     aria-valuenow="17" aria-valuemin="0"
                                                                     aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div class="col-1">
                                                            <span
                                                                class="{{Session::get('direction') === "rtl" ? 'me-3 float-left' : 'ml-3 float-right'}}">
                                                                {{ $rating[2] }}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="d-flex align-items-center mb-2 text-body font-size-sm">
                                                        <div
                                                            class="__rev-txt "><span
                                                                class="d-inline-block align-middle">{{ translate('below_Average') }}</span>
                                                        </div>
                                                        <div class="w-0 flex-grow">
                                                            <div class="progress __h-5px">
                                                                <div class="progress-bar web--bg-primary" role="progressbar"
                                                                     style="width: <?php echo $widthRating = ($rating[3] != 0) ? ($rating[3] / $overallRating[1]) * 100 : (0); ?>%; background-color: #fea569;"
                                                                     aria-valuenow="9" aria-valuemin="0"
                                                                     aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div class="col-1">
                                                            <span
                                                                class="{{Session::get('direction') === "rtl" ? 'me-3 float-left' : 'ml-3 float-right'}}">
                                                                {{ $rating[3] }}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="d-flex align-items-center text-body font-size-sm">
                                                        <div
                                                            class="__rev-txt"><span
                                                                class="d-inline-block align-middle ">{{ translate('poor') }}</span>
                                                        </div>
                                                        <div class="w-0 flex-grow">
                                                            <div class="progress __h-5px">
                                                                <div class="progress-bar web--bg-primary" role="progressbar"
                                                                     style="width: <?php echo $widthRating = ($rating[4] != 0) ? ($rating[4] / $overallRating[1]) * 100 : (0); ?>%;"
                                                                     aria-valuenow="4" aria-valuemin="0"
                                                                     aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div class="col-1">
                                                            <span
                                                                class="{{Session::get('direction') === "rtl" ? 'me-3 float-left' : 'ml-3 float-right'}}">
                                                                    {{ $rating[4] }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="row pb-4 mb-3">
                                                <div class="__inline-30">
                                                    <span
                                                        class="text-capitalize">{{ translate('Product_review') }}</span>
                                                </div>
                                            </div>
                                        @endif

                                        <div class="row pb-4">
                                            <div class="col-12" id="product-review-list">
                                                @include('web-views.partials._product-reviews')
                                            </div>

                                            @if(count($product->reviews) > 2)
                                                <div class="col-12">
                                                    <div
                                                        class="card-footer d-flex justify-content-center align-items-center">
                                                        <button class="btn text-white view_more_button web--bg-primary">
                                                            {{ translate('view_more') }}
                                                        </button>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3">
                    @php($companyReliability = getWebConfig('company_reliability'))
                    @if($companyReliability != null)
                        <div class="product-details-shipping-details">
                            @foreach ($companyReliability as $key=>$value)
                                @if ($value['status'] == 1 && !empty($value['title']))
                                    <div class="shipping-details-bottom-border">
                                        <div class="px-3 py-3">
                                            <img
                                                class="{{Session::get('direction') === "rtl" ? 'float-right ml-2' : 'mr-2'}} __img-20"
                                                src="{{ getStorageImages(path: imagePathProcessing(imageData: $value['image'],path: 'company-reliability'), type: 'source', source: 'public/assets/front-end/img'.'/'.$value['item'].'.png') }}"
                                                alt="">
                                            <span>{{ translate($value['title']) }}</span>
                                        </div>
                                    </div>
                                @endif
                            @endforeach
                        </div>
                    @endif

                    @if(getWebConfig(name: 'business_mode')=='multi')
                        <div class="__inline-31">

                            @if($product->added_by=='seller')
                                @if(isset($product->seller->shop))
                                    <div class="row position-relative">
                                        <div class="col-12 position-relative">
                                            <a href="{{route('shopView',['slug'=> $product?->seller?->shop->slug]) }}"
                                               class="d-block">
                                                <div class="d-flex __seller-author align-items-center">
                                                    <div>
                                                        <img class="__img-60 img-circle" alt=""
                                                             src="{{ getStorageImages(path: $product?->seller?->shop->image_full_url, type: 'shop') }}">
                                                    </div>
                                                    <div
                                                        class="ms-2 w-0 flex-grow">
                                                        <h2 class="fs-15 mb-2">
                                                            {{ $product->seller->shop->name }}
                                                        </h2>
                                                        @if(checkVendorAbility(type: 'vendor', status: 'temporary_close', vendor: $product->seller->shop))
                                                            <span class="badge-danger fs-12 px-3 rounded-full small">
                                                                <span>{{ translate('Temporary_OFF') }}</span>
                                                            </span>
                                                        @elseif(checkVendorAbility(type: 'vendor', status: 'vacation_status', vendor: $product->seller->shop))
                                                            <span class="badge-danger fs-12 px-3 rounded-full small">
                                                                <span>{{ translate('closed_Now') }}</span>
                                                            </span>
                                                        @endif
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="col-12 mt-2">
                                            <div class="row d-flex justify-content-between">
                                                <div class="col-6 ">
                                                    <div
                                                        class="d-flex justify-content-center align-items-center rounded __h-79px hr-right-before">
                                                        <div class="text-center">
                                                            <img
                                                                src="{{ theme_asset(path: 'public/assets/front-end/img/rating.svg') }}"
                                                                class="mb-2" alt="">
                                                            <div class="__text-12px text-base">
                                                                <strong>{{ $totalReviews }}</strong>
                                                                {{ translate('reviews') }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div
                                                        class="d-flex justify-content-center align-items-center rounded __h-79px">
                                                        <div class="text-center">
                                                            <img
                                                                src="{{ theme_asset(path: 'public/assets/front-end/img/products.svg') }}"
                                                                class="mb-2" alt="">
                                                            <div class="__text-12px text-base">
                                                                <strong>{{ $productsForReview->total() }}</strong>
                                                                {{ translate('products') }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 position-static mt-3">
                                            <div class="chat_with_seller-buttons">
                                                @if (auth('customer')->id())
                                                    <button
                                                        class="btn w-100 d-block text-center web--bg-primary text-white"
                                                        data-toggle="modal"
                                                        data-target="#chatting_modal"
                                                        @if(checkVendorAbility(type: 'vendor', status: 'temporary_close', vendor: $product->seller->shop))
                                                            disabled
                                                        @endif
                                                    >
                                                        <img class="mb-1" alt=""
                                                             src="{{ theme_asset(path: 'public/assets/front-end/img/chat-16-filled-icon.png') }}">
                                                        <span class="d-none d-sm-inline-block text-capitalize">
                                                        {{ translate('chat_with_vendor') }}
                                                    </span>
                                                    </button>
                                                @else
                                                    <a href="{{ route('customer.auth.login') }}"
                                                       class="btn w-100 d-block text-center web--bg-primary text-white">
                                                        <img
                                                            src="{{ theme_asset(path: 'public/assets/front-end/img/chat-16-filled-icon.png') }}"
                                                            class="mb-1" alt="">
                                                        <span class="d-none d-sm-inline-block text-capitalize">
                                                        {{ translate('chat_with_vendor') }}
                                                    </span>
                                                    </a>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            @else
                                <div class="row position-relative d-flex justify-content-between">
                                    <div class="col-9">
                                        <a href="{{route('shopView',['slug' => getInHouseShopConfig(key:'slug')]) }}" class="row d-flex align-items-center">
                                            <div>
                                                <img class="__inline-32" alt=""
                                                     src="{{ getStorageImages(path: getInHouseShopConfig(key:'image_full_url'), type: 'shop') }}">
                                            </div>
                                            <div>
                                                <div
                                                    class="{{ session('direction') === "rtl" ? 'right' : 'ml-2' }} get-view-by-onclick"
                                                    data-link="{{ route('shopView',['slug' => getInHouseShopConfig(key:'slug')]) }}">
                                                    <h2 class="font-bold __text-16px mb-1">
                                                        {{ getInHouseShopConfig(key: 'name') }}
                                                    </h2>
                                                    @if(checkVendorAbility(type: 'inhouse', status: 'temporary_close'))
                                                        <span class="badge-danger fs-12 px-3 rounded-full small">
                                                            <span>{{ translate('Temporary_OFF') }}</span>
                                                        </span>
                                                    @elseif(checkVendorAbility(type: 'inhouse', status: 'vacation_status'))
                                                        <span class="badge-danger fs-12 px-3 rounded-full small">
                                                            <span>{{ translate('closed_Now') }}</span>
                                                        </span>
                                                    @endif
                                                </div>
                                                <div class="fs-12 {{ session('direction') === "rtl" ? 'right' : 'ml-2' }}">{{ translate('Seller_info') }}</div>
                                            </div>
                                        </a>
                                    </div>

                                    <div class="col-12 mt-2">
                                        <div class="row d-flex justify-content-between">
                                            <div class="col-6 ">
                                                <div
                                                    class="d-flex justify-content-center align-items-center rounded __h-79px hr-right-before">
                                                    <div class="text-center">
                                                        <img
                                                            src="{{ theme_asset(path: 'public/assets/front-end/img/rating.svg') }}"
                                                            class="mb-2" alt="">
                                                        <div class="__text-12px text-base">
                                                            <strong>{{ $totalReviews}}</strong>
                                                            {{ translate('reviews') }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div
                                                    class="d-flex justify-content-center align-items-center rounded __h-79px">
                                                    <div class="text-center">
                                                        <img
                                                            src="{{ theme_asset(path: 'public/assets/front-end/img/products.svg') }}"
                                                            class="mb-2" alt="">
                                                        <div class="__text-12px text-base">
                                                            <strong>{{ $productsForReview->total() }}</strong>
                                                            {{ translate('products') }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 position-static mt-3">
                                        <div class="chat_with_seller-buttons">
                                            @if (auth('customer')->id())
                                                <button class="btn w-100 d-block text-center web--bg-primary text-white"
                                                        data-toggle="modal" data-target="#chatting_modal"
                                                    {{ checkVendorAbility(type: 'inhouse', status: 'temporary_close') ? 'disabled' : '' }}
                                                >
                                                    <img class="mb-1" alt=""
                                                         src="{{ theme_asset(path: 'public/assets/front-end/img/chat-16-filled-icon.png') }}">
                                                    <span class="d-none d-sm-inline-block text-capitalize">
                                                        {{ translate('chat_with_vendor') }}
                                                </span>
                                                </button>
                                            @else
                                                <a href="{{ route('shopView', ['slug' => getInHouseShopConfig(key:'slug')]) }}"
                                                   class="btn w-100 d-block text-center web--bg-primary text-white">
                                                    <img class="mb-1" alt=""
                                                         src="{{ theme_asset(path: 'public/assets/front-end/img/chat-16-filled-icon.png') }}">
                                                    <span class="d-none d-sm-inline-block text-capitalize">
                                                        {{ translate('chat_with_vendor') }}
                                                    </span>
                                                </a>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                    @endif

                    <div class="pt-4 pb-3 d-flex justify-content-between align-items-center">
                        <h2 class="__text-16px font-bold text-capitalize mb-0">
                            @if(getWebConfig(name: 'business_mode') == 'multi')
                                {{ translate('more_from_the_store') }}
                            @else
                                {{ translate('you_may_also_like') }}
                            @endif
                        </h2>
                        @if($product->added_by == 'seller' && isset($product->seller->shop))
                        <a href="{{route('shopView',['slug'=> $product->seller->shop->slug]) }}" class="text-primary font-bold __text-14px">
                            {{ translate('view_all') }}
                            <i class="czi-arrow-{{Session::get('direction') === "rtl" ? 'left mr-1 ml-n1 mt-1 ' : 'right ml-1 mr-n1'}}"></i>
                        </a>
                        @else
                            <a href="{{route('shopView',['slug'=> getInHouseShopConfig(key: 'slug')]) }}" class="text-primary font-bold __text-14px">
                                {{ translate('view_all') }}
                                <i class="czi-arrow-{{Session::get('direction') === "rtl" ? 'left mr-1 ml-n1 mt-1 ' : 'right ml-1 mr-n1'}}"></i>
                            </a>
                        @endif
                    </div>
                    <div>
                        @foreach($moreProductFromSeller as $item)
                            @include('web-views.partials._seller-products-product-details',['product' => $item, 'decimal_point_settings' => $decimalPointSettings])
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        @if (count($relatedProducts)>0)
            <div class="container rtl text-align-direction">
                <div class="card __card border-0 mb-4">
                    <div class="card-body">
                        <div class="row flex-between align-items-center mb-2">
                            <div class="ms-1">
                                <h2 class="text-capitalize font-bold fs-16 mb-0">{{ translate('similar_products') }}</h2>
                            </div>
                            <div class="view_all d-flex justify-content-center align-items-center">
                                <div>
                                    @if($product['category_id'])
                                        <a class="text-capitalize view-all-text web-text-primary me-1"
                                           href="{{route('products',['category_id'=> $product['category_id'],'data_from'=>'category','page'=>1]) }}">{{ translate('view_all') }}
                                            <i class="czi-arrow-{{Session::get('direction') === "rtl" ? 'left mr-1 ml-n1 mt-1 ' : 'right ml-1 mr-n1'}}"></i>
                                        </a>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="row g-3 mt-1">
                            @foreach($relatedProducts as $key => $relatedProduct)
                                <div class="col-xl-2 col-sm-3 col-6">
                                    @include('web-views.partials._inline-single-product-without-eye',['product'=>$relatedProduct,'decimal_point_settings'=>$decimalPointSettings])
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <div class="modal fade rtl text-align-direction" id="show-modal-view" tabindex="-1" role="dialog"
             aria-labelledby="show-modal-image"
             aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body flex justify-content-center">
                        <button class="btn btn-default __inline-33 dir-end-minus-7px"
                                data-dismiss="modal">
                            <i class="fa fa-close"></i>
                        </button>
                        <img class="element-center" id="attachment-view" src="" alt="">
                    </div>
                </div>
            </div>
        </div>

    </div>

    @include("web-views.products._product-details-sticky", ['productDetails' => $product])

    @if($product?->preview_file_full_url['path'])
        @include('web-views.partials._product-preview-modal', ['previewFileInfo' => $previewFileInfo])
    @endif

    @include('layouts.front-end.partials.modal._chatting',['seller'=>$product->seller, 'user_type'=>$product->added_by])

    <span id="route-review-list-product" data-url="{{ route('review-list-product') }}"></span>
    <span id="products-details-page-data" data-id="{{ $product['id'] }}"></span>
@endsection

@push('script')
    <script>
        $(document).on('change', 'input[name="color"]', function() {
            const selectedColor = $(this).val();
            const colors = @json(json_decode($product->colors));
            console.log(colors);
            const colorIndex = colors.indexOf(selectedColor);
            if (colorIndex !== -1) {
                const mainSwiper = document.querySelector('.quickviewSlider2').swiper;
                const thumbSwiper = document.querySelector('.quickviewSliderThumb2').swiper;
                mainSwiper.slideTo(colorIndex);
                thumbSwiper.slideTo(colorIndex);
            }
        });
    </script>
    <script src="{{ theme_asset(path: 'public/assets/front-end/js/product-details.js') }}"></script>
    <script type="text/javascript" async="async"
            src="https://platform-api.sharethis.com/js/sharethis.js#property=5f55f75bde227f0012147049&product=sticky-share-buttons"></script>
@endpush
