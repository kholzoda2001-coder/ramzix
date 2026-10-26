@php
    use App\Models\Brand;
    use App\Models\Product;
    use App\Utils\QuantityPricing;

    $shopBase = Product::active()->where('thumbnail', '!=', 'def.png');
    $dealProducts = (clone $shopBase)->orderBy('unit_price')->limit(2)->get();
    $newProducts = (clone $shopBase)->orderByDesc('id')->limit(2)->get();
    $allBrands = Brand::where('status', 1)->orderBy('id')->get();
    $feedProducts = (clone $shopBase)->orderByDesc('id')->limit(30)->get();
    $thumb = fn($p) => getStorageImages(path: $p->thumbnail_full_url, type: 'thumbnail');
    $price = fn($p) => webCurrencyConverter(amount: $p['unit_price']);
@endphp
<div class="d-md-none home-shop">
    {{-- Best prices + New in: two cards side by side --}}
    <div class="hs-two">
        @foreach([['title' => translate('Best_prices'), 'items' => $dealProducts, 'link' => route('products', ['data_from' => 'latest', 'page' => 1])], ['title' => translate('New_in'), 'items' => $newProducts, 'link' => route('products', ['data_from' => 'latest', 'page' => 1])]] as $block)
            <div class="hs-card">
                <a class="hs-head" href="{{ $block['link'] }}"><span>{{ $block['title'] }}</span><i class="czi-arrow-right"></i></a>
                <div class="hs-pair">
                    @foreach($block['items'] as $p)
                        <a class="hs-mini" href="{{ route('product', $p['slug']) }}">
                            <img loading="lazy" src="{{ $thumb($p) }}" alt="{{ $p['name'] }}">
                            <b>{{ $price($p) }}</b>
                        </a>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>

    {{-- Brands: every active brand --}}
    @if($allBrands->count() > 0)
        <div class="hs-card hs-brands">
            <a class="hs-head" href="{{ route('brands') }}"><span>{{ translate('Brand_zone') }}</span><i class="czi-arrow-right"></i></a>
            <div class="hs-brand-grid">
                @foreach($allBrands as $shopBrand)
                    <a class="hs-brand" title="{{ $shopBrand['name'] }}" href="{{ route('products', ['brand_id' => $shopBrand['id'], 'data_from' => 'brand', 'page' => 1]) }}">
                        <img loading="lazy" src="{{ getStorageImages(path: $shopBrand->image_full_url, type: 'brand') }}" alt="{{ $shopBrand['name'] }}">
                    </a>
                @endforeach
            </div>
        </div>
    @endif

    {{-- Product feed: two columns --}}
    <div class="hs-feed-title">{{ translate('Today_for_you') }}</div>
    <div class="hs-feed">
        @foreach($feedProducts as $p)
            @php
                $tiers = QuantityPricing::enabled($p) ? QuantityPricing::tiers((int)$p['id']) : [];
                $bulk = (!QuantityPricing::isSingle() && count($tiers) > 1) ? QuantityPricing::priceOfTier($p, $tiers[1]) : null;
            @endphp
            <a class="hs-item" href="{{ route('product', $p['slug']) }}">
                <span class="hs-item-img"><img loading="lazy" src="{{ $thumb($p) }}" alt="{{ $p['name'] }}"></span>
                <span class="hs-item-name">{{ $p['name'] }}</span>
                <span class="hs-item-price">{{ $price($p) }}</span>
                @if($bulk)
                    <span class="hs-item-bulk">{{ $tiers[1]->min_qty }}+ {{ translate('pcs') }}: {{ webCurrencyConverter(amount: $bulk) }}</span>
                @endif
            </a>
        @endforeach
    </div>
    <div class="text-center py-3">
        <a class="hs-more" href="{{ route('products', ['data_from' => 'latest', 'page' => 1]) }}">{{ translate('view_all') }}</a>
    </div>
</div>
<style>
    .home-shop{padding:0 8px}
    .hs-two{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}
    .hs-card{background:#fff;border-radius:12px;padding:10px}
    .hs-head{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:15px;color:#0b2a5b!important;text-decoration:none!important;margin-bottom:8px}
    .hs-head i{font-size:12px;color:#5b6b85}
    .hs-pair{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .hs-four{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    .hs-mini{display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none!important;min-width:0}
    .hs-mini img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#f4f6fa}
    .hs-mini b{font-size:15px;color:#ff6a00;font-weight:800;line-height:1.1}
    .hs-brands{margin-bottom:6px}
    .hs-brand-grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,auto);grid-auto-columns:calc((100% - 18px) / 4);gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    .hs-brand-grid::-webkit-scrollbar{display:none}
    .hs-brand{scroll-snap-align:start;display:block;background:#fff;border:1px solid #e6ebf3;border-radius:10px;overflow:hidden;aspect-ratio:1/1}
    .hs-brand img{width:100%;height:100%;object-fit:contain;display:block}
    .hs-brand-name{font-size:11px;color:#0b2a5b;font-weight:700;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hs-brands .hs-mini b{font-size:13px}
    .hs-feed-title{font-weight:800;font-size:16px;color:#0b2a5b;margin:10px 4px 8px}
    .hs-feed{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .hs-item{display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;text-decoration:none!important;padding-bottom:10px}
    .hs-item-img img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:#f4f6fa}
    .hs-item-name{font-size:13px;line-height:1.3;color:#1d2a44;padding:8px 10px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .hs-item-price{font-size:19px;font-weight:800;color:#ff6a00;padding:4px 10px 0}
    .hs-item-bulk{margin:4px 10px 0;align-self:flex-start;font-size:11px;font-weight:700;color:#0b8a4a;background:#e7f7ee;border-radius:6px;padding:2px 7px}
    .hs-more{display:inline-block;padding:9px 28px;border:1.5px solid #0b2a5b;border-radius:24px;color:#0b2a5b!important;font-weight:700;text-decoration:none!important}
    @media (max-width:767.98px){.home-old-sections,.home-old-featured{display:none!important}}
</style>
