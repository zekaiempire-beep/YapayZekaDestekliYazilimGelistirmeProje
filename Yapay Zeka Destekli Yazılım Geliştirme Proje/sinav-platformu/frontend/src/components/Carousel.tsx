'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CarouselImage {
  id: number
  title: string
  imagePath: string
  description?: string
}

const images: CarouselImage[] = [
  {
    id: 1,
    title: 'Yapay Zeka ile Eğitim',
    imagePath: '/images/slide-1.jpg',
    description: 'Akıllı öğrenme teknolojisiyle eğitimin geleceği'
  },
  {
    id: 2,
    title: 'Akıllı Test Sistemi',
    imagePath: '/images/slide-2.jpg',
    description: 'Kişiselleştirilmiş test deneyimi'
  },
  {
    id: 3,
    title: 'Gerçek Zamanlı Analiz',
    imagePath: '/images/slide-3.jpg',
    description: 'Detaylı performans analizi ve raporlama'
  },
  {
    id: 4,
    title: 'Verimli Öğrenme',
    imagePath: '/images/slide-4.jpg',
    description: 'Etkili ve hızlı öğrenme yöntemleri'
  },
  {
    id: 5,
    title: 'Başarı Yolunda',
    imagePath: '/images/slide-5.jpg',
    description: 'Hedefine ulaşmada seni destekliyoruz'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleImageError = (id: number) => {
    setImageError((prev) => [...prev, id])
  }

  const isImageMissing = (id: number) => imageError.includes(id)

  return (
    <div className="fixed inset-0 z-0 w-full h-full">
      <div className="relative w-full h-full overflow-hidden">
        <div className="flex transition-transform duration-1000 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image) => (
            <div
              key={image.id}
              className={`w-full h-full flex-shrink-0 flex items-center justify-center relative`}
            >
              {!isImageMissing(image.id) ? (
                <>
                  <Image
                    src={image.imagePath}
                    alt={image.title}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(image.id)}
                    priority={currentIndex === image.id - 1}
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
              )}
            </div>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-10'
                  : 'bg-white/50 w-3 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition text-3xl"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition text-3xl"
        >
          →
        </button>
      </div>
    </div>
  )
}
