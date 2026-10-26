<?php

namespace Modules\AI\app\Services;

use App\Traits\FileManagerTrait;
use Modules\AI\AIProviders\AIProviderManager;
use Modules\AI\AIProviders\ClaudeProvider;
use Modules\AI\AIProviders\OpenAIProvider;
use Modules\AI\app\Exceptions\AIProviderException;
use Modules\AI\app\Exceptions\ImageValidationException;
use Modules\AI\app\Exceptions\UsageLimitException;
use Modules\AI\app\Exceptions\ValidationException;
use Modules\AI\app\PromptTemplates\GeneralSetupTemplates;
use Modules\AI\app\PromptTemplates\GenerateProductTitleSuggestionTemplate;
use Modules\AI\app\PromptTemplates\GenerateTitleFromImageTemplate;
use Modules\AI\app\PromptTemplates\PricingTemplate;
use Modules\AI\app\PromptTemplates\ProductDescriptionTemplate;
use Modules\AI\app\PromptTemplates\ProductNameTemplate;
use Modules\AI\app\PromptTemplates\ProductVariationSetup;
use Modules\AI\app\PromptTemplates\SeoSectionTemplate;

class AIContentGeneratorService
{
    use FileManagerTrait;

    protected array $templates = [];
    protected array $providers;

    public function __construct()
    {
        $this->loadTemplates();
        $this->providers = [new OpenAIProvider(), new ClaudeProvider()];
    }

    protected function loadTemplates(): void
    {
        $templateClasses = [
            'product_name' => ProductNameTemplate::class,
            'product_description' => ProductDescriptionTemplate::class,
            'general_setup' => GeneralSetupTemplates::class,
            'pricing_and_others' => PricingTemplate::class,
            'variation_setup' => ProductVariationSetup::class,
            'seo_section' => SeoSectionTemplate::class,
            'generate_product_title_suggestion' => GenerateProductTitleSuggestionTemplate::class,
            'generate_title_from_image' => GenerateTitleFromImageTemplate::class,
        ];
        foreach ($templateClasses as $type => $class) {
            if (class_exists($class)) {
                $this->templates[$type] = new $class();
            }
        }
    }

    /**
     * @throws ImageValidationException
     * @throws AIProviderException
     * @throws ValidationException
     * @throws UsageLimitException
     */
    public function generateContent(string $contentType, mixed $context = null, string $langCode = 'en', ?string $description = null, ?string $imageUrl = null): string
    {
        $template = $this->templates[$contentType];
        $prompt = $template->build(context: $context, langCode: $langCode, description: $description);
        $providerManager = new AIProviderManager($this->providers);
        return $providerManager->generate(prompt: $prompt, imageUrl: $imageUrl, options: ['section' => $contentType, 'context' => $context, 'description' => $description]);
    }

    public function getAnalyizeImagePath($image): array
    {
        $extension = $image->getClientOriginalExtension();
        $imageName = $this->fileUpload(dir: 'product/ai_product_image/', format: $extension, file: $image);
        return $this->aiProductImageFullPath($imageName);

    }

    public function aiProductImageFullPath($image_name): array
    {
        if (in_array(request()->ip(), ['127.0.0.1', '::1'])) {
            return [
                'imageName' => $image_name,
                'imageFullPath' => "https://www.notebookcheck.net/fileadmin/_processed_/5/e/csm_IMG_7625_d5ec5f95a9.jpg",
            ];
        }

        return [
            'imageName' => $image_name,
            'imageFullPath' => dynamicStorage(path: 'storage/app/public/product/ai_product_image/' . $image_name)
        ];
    }

    public function deleteAiImage($imageName): void
    {
        $this->delete('product/ai_product_image/' . $imageName);
    }
}
