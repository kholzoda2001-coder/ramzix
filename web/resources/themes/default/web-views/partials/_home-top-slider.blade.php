@if(count($bannerTypeMainBanner) > 0)
<style>
    /* phone: banner edge to edge like a shop app, dots on top of the picture */
    @media (max-width: 767.98px) {
        .home-top-banner{padding-top:0!important}
        .home-top-banner > .container{padding-left:0;padding-right:0;max-width:100%}
        .home-top-banner .__top-slider-images > div{padding:0!important}
        /* the header floats on top of the banner and turns white when the page scrolls (like SHEIN) */
        body.home-overlay-header header .navbar-sticky.mobile-head{position:fixed!important;top:0;left:0;right:0;z-index:1031;background:transparent!important;box-shadow:none!important;transition:background .2s,box-shadow .2s}
        body.home-overlay-header header .navbar-sticky.mobile-head .navbar{background:transparent!important;box-shadow:none!important}
        body.home-overlay-header.hdr-solid header .navbar-sticky.mobile-head{background:#fff!important;box-shadow:0 2px 10px rgba(11,42,91,.10)!important}
        .home-top-banner .hero-slider .__slide-img{height:215px!important;min-height:0!important;object-fit:cover;object-position:center;border-radius:0!important}
        .home-top-banner .hero-slider .owl-nav{display:none!important}
        .home-top-banner .hero-slider .owl-dots{position:absolute;left:0;right:0;bottom:10px;text-align:center;display:flex;justify-content:center;gap:5px}
        .home-top-banner .hero-slider .owl-dots .owl-dot{margin:0}
        .home-top-banner .hero-slider .owl-dots .owl-dot span{display:block;width:6px;height:6px;margin:0;background:rgba(255,255,255,.65);border-radius:50%;transition:.2s}
        .home-top-banner .hero-slider .owl-dots .owl-dot.active span{width:18px;border-radius:4px;background:#fff}
    }
</style>
<script>
    document.body.classList.add('home-overlay-header');
    (function () {
        var f = function () { document.body.classList.toggle('hdr-solid', (window.pageYOffset || document.documentElement.scrollTop) > 30); };
        window.addEventListener('scroll', f, {passive: true}); f();
    })();
</script>
<section class="bg-transparent pt-3 home-top-banner">
    <div class="container position-relative">
        <div class="row no-gutters position-relative rtl">
            @if ($categories->count() > 0 )
                <div class="col-xl-3 position-static d-none d-xl-block __top-slider-cate">
                    <div class="category-menu-wrap position-static">
                        <ul class="category-menu mt-0">
                            @foreach ($categories as $key=>$category)
                                <li>
                                    <a href="{{route('products',['category_id'=> $category['id'],'data_from'=>'category','page'=>1])}}">
                                        <span class="d-flex gap-10px justify-content-start align-items-center">
                                            <img class="aspect-1 rounded-circle" width="20" src="{{ getStorageImages(path: $category?->icon_full_url, type: 'category') }}" alt="{{ $category['name'] }}">
                                            <span class="line--limit-2">{{ $category->name }}</span>
                                        </span>
                                    </a>
                                    @if ($category->childes->count() > 0)
                                        <div class="mega_menu z-2">
                                            @foreach ($category->childes as $sub_category)
                                                <div class="mega_menu_inner">
                                                    <h6><a href="{{route('products',['sub_category_id'=> $sub_category['id'],'data_from'=>'category','page'=>1])}}">{{$sub_category->name}}</a></h6>
                                                    @if ($sub_category->childes->count() >0)
                                                        @foreach ($sub_category->childes as $sub_sub_category)
                                                            <div><a href="{{route('products',['sub_sub_category_id'=> $sub_sub_category['id'],'data_from'=>'category','page'=>1])}}">{{$sub_sub_category->name}}</a></div>
                                                        @endforeach
                                                    @endif
                                                </div>
                                            @endforeach
                                        </div>
                                    @endif
                                </li>
                            @endforeach
                            <li class="text-center">
                                <a href="{{route('categories')}}" class="text-primary font-weight-bold justify-content-center text-capitalize">
                                    {{translate('view_all')}}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            @endif

            <div class="col-12 col-xl-9 __top-slider-images">
                <div class="{{Session::get('direction') === "rtl" ? 'pr-xl-2' : 'pl-xl-2'}}">
                    <div class="owl-theme owl-carousel hero-slider" data-loop="{{ count($bannerTypeMainBanner) > 1 ? 1 : 0 }}">
                        @foreach($bannerTypeMainBanner as $key=>$banner)
                            @php
                                $phoneName = preg_replace('/\.webp$/', '-m.webp', (string)$banner->photo);
                                $phoneSrc = file_exists(storage_path('app/public/banner/' . $phoneName)) ? asset('storage/banner/' . $phoneName) : null;
                            @endphp
                            <a href="{{$banner['url']}}" class="d-block">
                                <picture>
                                    @if($phoneSrc)
                                        <source media="(max-width: 767.98px)" srcset="{{ $phoneSrc }}">
                                    @endif
                                    <img class="w-100 __slide-img __slide-img-170" alt=""
                                        src="{{ getStorageImages(path: $banner->photo_full_url, type: 'banner') }}">
                                </picture>
                            </a>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

{{-- shop by country: flag chips under the banner --}}
@php
    $countryChips = [
        ['code' => 'ae', 'name' => 'UAE', 'tag' => 'from-uae'],
        ['code' => 'cn', 'name' => 'China', 'tag' => 'from-china'],
        ['code' => 'tr', 'name' => 'Turkey', 'tag' => 'from-turkey'],
        ['code' => 'tj', 'name' => 'Tajikistan', 'tag' => 'from-tajikistan'],
    ];
@endphp
<div class="container country-strip-wrap">
    <div class="country-strip">
        <span class="country-strip-title">{{ translate('Shop_by_country') }}</span>
        <div class="country-strip-row">
            @foreach($countryChips as $chip)
                <a class="country-chip" title="{{ translate($chip['name']) }}" aria-label="{{ translate($chip['name']) }}" href="{{ route('products', ['name' => $chip['tag'], 'data_from' => 'search', 'page' => 1]) }}">
                    <span class="country-flag"><img src="{{ asset('assets/front-end/img/flags/clean/' . $chip['code'] . ($chip['code'] === 'tj' ? '.png' : '.svg')) }}" alt="{{ $chip['name'] }}"></span>
                </a>
            @endforeach
        </div>
    </div>
</div>
<style>
    .country-strip{background:#f0f6ff;border-radius:14px;padding:10px 12px;margin-top:12px}
    .country-strip-title{display:block;text-align:center;font-size:13px;font-weight:700;color:#0b2a5b;margin-bottom:10px}
    .country-flag{display:flex;align-items:center;justify-content:center;height:22px}
    .country-flag img{height:20px;width:auto;border-radius:3px;box-shadow:0 0 0 1px rgba(11,42,91,.18)}
    .country-strip-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    .country-strip-row::-webkit-scrollbar{display:none}
    .country-chip{flex:1 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:8px 14px;background:#fff;border:1.5px solid #dfe5ee;border-radius:30px;color:#0b2a5b!important;font-size:14px;font-weight:700;text-decoration:none!important;white-space:nowrap;transition:.15s}
    .country-chip:hover{border-color:var(--web-primary,#1b7fed);box-shadow:0 2px 8px rgba(27,127,237,.18)}
    .country-flag{height:28px}.country-flag img{height:26px}
    /* phone: no big gaps between the home sections */
    @media (max-width:767.98px){.__inline-61{gap:6px!important}.home-top-banner{padding-bottom:0!important}.country-strip{margin-top:0!important}}
    @media (max-width:767.98px){.country-strip-wrap{padding-left:12px;padding-right:12px}.country-strip{padding:8px 10px}.country-strip-title{margin-bottom:8px}.country-strip-row{overflow:visible;gap:6px}.country-chip{flex:1 1 0;min-width:0;padding:8px 2px;border-radius:12px}}
</style>
@endif
