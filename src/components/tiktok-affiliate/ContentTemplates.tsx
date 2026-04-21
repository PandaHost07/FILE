'use client'

import { useState } from 'react'
import { Copy, TrendingUp, Heart, Share2, MessageSquare, Eye } from 'lucide-react'

interface ContentTemplate {
    id: string
    name: string
    category: string
    hook: string
    caption: string
    hashtags: string[]
    engagement: {
        likes: string
        shares: string
        comments: string
        views: string
    }
    trending: boolean
}

const contentTemplates: ContentTemplate[] = [
    {
        id: '1',
        name: 'Fashion Haul Reveal',
        category: 'fashion',
        hook: 'POV: You found the perfect outfit for under $50! ',
        caption:
            "Just received my latest fashion haul and I'm obsessed! This entire outfit costs less than your daily coffee run. The quality is amazing and the fit is perfect. You need to see this! Tap link in bio to shop these exact pieces! ",
        hashtags: [
            '#fashionhaul',
            '#outfitinspo',
            '#budgetfashion',
            '#stylehacks',
            '#ootd',
            '#fashiontiktok',
            '#affiliatemarketing',
            '#tiktokmademebuyit',
        ],
        engagement: {
            likes: '45.2K',
            shares: '12.8K',
            comments: '3.2K',
            views: '234K',
        },
        trending: true,
    },
    {
        id: '2',
        name: 'Tech Gadget Review',
        category: 'tech',
        hook: 'This gadget changed my morning routine forever! ',
        caption:
            "I've been testing this for 2 weeks straight and I'm finally ready to share my honest review. This isn't just another tech gadget - it's actually solved a problem I've had for years. The battery life? Incredible. The features? Game-changing. Worth every penny! ",
        hashtags: [
            '#techreview',
            '#gadgets',
            '#techtips',
            '#productreview',
            '#amazonfinds',
            '#techtok',
            '#innovation',
            '#smartgadgets',
        ],
        engagement: {
            likes: '32.1K',
            shares: '8.5K',
            comments: '2.1K',
            views: '189K',
        },
        trending: false,
    },
    {
        id: '3',
        name: 'Beauty Skincare Routine',
        category: 'beauty',
        hook: 'The secret to glass skin in just 7 days! ',
        caption:
            "I've finally cracked the code to perfect skin! This routine has completely transformed my complexion and I had to share it with you all. These products are affordable, effective, and actually work! My skin has never looked better. ",
        hashtags: [
            '#skincare',
            '#beautytips',
            '#glowskin',
            '#skincareroutine',
            '#beautytok',
            '#affiliatemarketing',
            '#selfcare',
            '#skincarehacks',
        ],
        engagement: {
            likes: '67.8K',
            shares: '15.3K',
            comments: '4.7K',
            views: '456K',
        },
        trending: true,
    },
    {
        id: '4',
        name: 'Kitchen Must-Haves',
        category: 'home',
        hook: 'These kitchen tools will save you HOURS every week! ',
        caption:
            "If you spend time in the kitchen, you NEED these tools. I've tested dozens of gadgets and these are the ones that actually make a difference. From meal prep to cooking, these have saved me so much time. Your future self will thank you! ",
        hashtags: [
            '#kitchenhacks',
            '#cookingtips',
            '#homeorganization',
            '#kitchengadgets',
            '#mealprep',
            '#hometok',
            '#cookinghacks',
            '#kitchenmusthaves',
        ],
        engagement: {
            likes: '28.9K',
            shares: '6.2K',
            comments: '1.8K',
            views: '156K',
        },
        trending: false,
    },
    {
        id: '5',
        name: 'Fitness Transformation',
        category: 'health',
        hook: 'I lost 15 pounds using ONLY these 3 products! ',
        caption:
            'Real results from real products! No crazy diets, no extreme workouts - just these affordable items that actually work. The transformation speaks for itself. If I can do this, anyone can! Check the link in bio for my exact routine! ',
        hashtags: [
            '#fitnessjourney',
            '#weightloss',
            '#workout',
            '#healthtips',
            '#transformation',
            '#fitnesstok',
            '#gymhacks',
            '#motivation',
        ],
        engagement: {
            likes: '89.4K',
            shares: '22.1K',
            comments: '5.8K',
            views: '678K',
        },
        trending: true,
    },
]

export function ContentTemplates({ onSelectTemplate }: { onSelectTemplate: (template: ContentTemplate) => void }) {
    const [copiedId, setCopiedId] = useState('')

    const handleCopy = (template: ContentTemplate) => {
        const content = `${template.hook}\n\n${template.caption}\n\n${template.hashtags.join(' ')}`
        navigator.clipboard.writeText(content)
        setCopiedId(template.id)
        setTimeout(() => setCopiedId(''), 2000)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">Template viral</h3>
                <span className="flex items-center gap-1 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-300">
                    <TrendingUp className="size-3" />
                    Trending
                </span>
            </div>

            <div className="space-y-3">
                {contentTemplates.map((template) => (
                    <div
                        key={template.id}
                        className="group cursor-pointer rounded-2xl border border-[#1f1f24] bg-[#121214] p-4 shadow-lg shadow-black/20 transition-all hover:border-fuchsia-500/35 hover:shadow-fuchsia-500/10"
                        onClick={() => onSelectTemplate(template)}
                    >
                        <div className="mb-3 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h4 className="font-semibold text-zinc-100">{template.name}</h4>
                                    {template.trending && (
                                        <span className="flex items-center gap-1 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2 py-0.5 text-xs text-fuchsia-300">
                                            <TrendingUp className="size-3" />
                                            Hot
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs capitalize text-zinc-500">{template.category}</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(template)
                                }}
                                className="flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-sm font-medium text-fuchsia-300 opacity-0 transition hover:bg-fuchsia-500/20 group-hover:opacity-100"
                            >
                                {copiedId === template.id ? 'Disalin!' : (
                                    <>
                                        <Copy className="size-4" /> Salin
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mb-3 space-y-2">
                            <div className="line-clamp-2 text-sm text-zinc-300">
                                <span className="font-medium text-fuchsia-400/90">Hook:</span> {template.hook}
                            </div>
                            <div className="line-clamp-2 text-sm text-zinc-300">
                                <span className="font-medium text-cyan-400/90">Caption:</span> {template.caption}
                            </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-1">
                            {template.hashtags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="rounded-md border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-200/90">
                                    {tag}
                                </span>
                            ))}
                            <span className="text-xs text-zinc-500">+{template.hashtags.length - 3} lagi</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#1f1f24] pt-3">
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Eye className="size-3" />
                                    {template.engagement.views}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="size-3" />
                                    {template.engagement.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="size-3" />
                                    {template.engagement.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Share2 className="size-3" />
                                    {template.engagement.shares}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-fuchsia-400/90">Klik untuk pakai</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export type { ContentTemplate }
