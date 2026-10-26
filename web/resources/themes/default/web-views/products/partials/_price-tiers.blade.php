@php
    use App\Utils\QuantityPricing;
    $priceTiers = QuantityPricing::enabled($product) ? QuantityPricing::tiers((int)$product['id']) : [];
    $whatsappConfig = getWebConfig(name: 'whatsapp');
    $whatsappPhone = preg_replace('/\D/', '', is_array($whatsappConfig) ? ($whatsappConfig['phone'] ?? '') : '');
    if (strlen(ltrim($whatsappPhone, '0')) < 7) {
        $whatsappPhone = preg_replace('/\D/', '', (string)getWebConfig(name: 'company_phone'));
    }
    $firstTierPrice = count($priceTiers) ? QuantityPricing::priceOfTier($product, $priceTiers[0]) : null;
    $whatsappTextBase = translate('Hello_I_want_to_order') . ': ' . $product['name'];
@endphp
@if(QuantityPricing::isSingle() || count($priceTiers) > 0)
    <div class="product-price-tiers" data-product-name="{{ $product['name'] }}" data-whatsapp="{{ $whatsappPhone }}"
         data-whatsapp-text="{{ translate('Hello_I_want_to_order') }}">
        @if(!QuantityPricing::isSingle())
        <div class="ppt-title">{{ translate('Price_by_quantity') }}</div>
        @php
            $pricedTierCount = collect($priceTiers)->filter(fn($t) => QuantityPricing::priceOfTier($product, $t) !== null)->count();
        @endphp
        <div class="ppt-grid" style="grid-template-columns:repeat({{ max(1, $pricedTierCount) }},1fr)">
            @foreach($priceTiers as $tier)
                @php
                    $tierPrice = QuantityPricing::priceOfTier($product, $tier);
                    $saving = ($tierPrice !== null && $firstTierPrice > 0) ? round((1 - $tierPrice / $firstTierPrice) * 100) : 0;
                    $label = $tier->max_qty === null ? '> ' . ($tier->min_qty - 1) : ($tier->min_qty == $tier->max_qty ? $tier->min_qty : $tier->min_qty . '–' . $tier->max_qty);
                @endphp
                @if($tierPrice !== null)
                    <button type="button" class="ppt-card price-tier-row" data-min="{{ $tier->min_qty }}" data-max="{{ $tier->max_qty ?? 999999 }}">
                        <span class="ppt-qty">{{ $label }} <small>{{ translate('pcs') }}</small></span>
                        <span class="ppt-price">{{ webCurrencyConverter(amount: $tierPrice) }}</span>
                    </button>
                @endif
            @endforeach
        </div>
        <div class="ppt-total d-none">
            <span class="ppt-total-calc"></span>
        </div>
        @endif
        <div class="product-whatsapp-notice d-none">
            <div class="mb-2">{{ translate('For_this_quantity_contact_us_on_WhatsApp') }}</div>
            <a href="#" target="_blank" rel="noopener" class="ppt-wa-btn product-whatsapp-link">
                <i class="fa fa-whatsapp"></i> {{ translate('Write_on_WhatsApp') }}
            </a>
        </div>
        @if(!QuantityPricing::isSingle())
        <a class="ppt-ask" target="_blank" rel="noopener"
           href="https://wa.me/{{ $whatsappPhone }}?text={{ rawurlencode($whatsappTextBase) }}">
            <i class="fa fa-whatsapp"></i> {{ translate('Order_on_WhatsApp') }}
        </a>
        @endif
    </div>
    <style>
        .product-price-tiers{margin-top:4px}
        .ppt-title{font-weight:700;color:#0b2a5b;margin-bottom:6px;font-size:13px;text-transform:uppercase;letter-spacing:.4px;display:flex;align-items:center;gap:6px}.ppt-title:before{content:"";width:4px;height:14px;background:#ff7a00;border-radius:2px}
        .ppt-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .ppt-card{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;border:1.5px solid #dfe5ee;border-radius:10px;background:#fff;cursor:pointer;text-decoration:none!important;transition:.15s;color:#0b2a5b;line-height:1.25}
        .ppt-card:hover{border-color:#ff7a00;box-shadow:0 2px 10px rgba(255,122,0,.18)}
        .ppt-card.active-tier{border-color:#ff7a00;background:#fff4e8;box-shadow:0 0 0 2px rgba(255,122,0,.25)}
        .ppt-qty{font-size:13px;color:#5b6b85;font-weight:600}
        .ppt-qty small{font-weight:400}
        .ppt-price{font-size:24px;font-weight:700;color:var(--web-primary,#1b7fed);line-height:1.15}
        .ppt-note{font-size:11.5px;color:#7b8aa3;text-align:center}
        .ppt-save{color:#fff;background:#17a34a;border-radius:20px;padding:1px 8px;font-size:11.5px}
        .ppt-wa{background:#f1fbf4;border-color:#bfe8cc}
        .ppt-wa:hover{border-color:#25d366;box-shadow:0 2px 10px rgba(37,211,102,.25)}
        .ppt-wa.active-tier{border-color:#25d366;background:#e3f8ea}
        .ppt-wa-price{font-size:15px;color:#128c4a}
        .ppt-total{margin-top:8px;padding:8px 12px;background:#f5f8fc;border-radius:8px;font-size:14px;color:#0b2a5b}
        .ppt-total b{font-size:16px}
        .product-whatsapp-notice{margin-top:8px;padding:10px 12px;background:#fff8e6;border:1px solid #ffe2a0;border-radius:8px;font-size:14px}
        .product-whatsapp-notice:not(.d-none) ~ .ppt-ask{display:none!important}
        .ppt-wa-btn,.ppt-ask{display:inline-flex;align-items:center;gap:6px;text-decoration:none!important}
        .ppt-wa-btn{background:#25d366;color:#fff!important;padding:9px 16px;border-radius:8px;font-weight:700}
        .ppt-ask{margin-top:10px;width:100%;justify-content:center;background:#25d366;color:#fff!important;font-weight:700;font-size:15px;padding:11px 14px;border-radius:10px;box-shadow:0 3px 10px rgba(37,211,102,.35);transition:.15s}.ppt-ask i{font-size:22px}.ppt-ask:hover{background:#1ebe5a;transform:translateY(-1px)}
        @media (max-width:575px){
            .ppt-grid{gap:5px}
            .ppt-card{padding:8px 3px;border-radius:8px;gap:1px}
            .ppt-qty{font-size:11px}.ppt-qty small{display:block;font-size:10px}
            .ppt-price{font-size:21px}
            .ppt-wa-price{font-size:10.5px;flex-direction:column;align-items:center;gap:0}
            .ppt-wa-price i{font-size:17px}
            .ppt-note{font-size:9.5px}
            .ppt-save{padding:0 5px;font-size:10px}
        }
    </style>
@endif
