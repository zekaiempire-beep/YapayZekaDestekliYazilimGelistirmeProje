// Web Search Fonksiyonu - DuckDuckGo API ile

export const searchWeb = async (query) => {
  try {
    // DuckDuckGo API (API key gerektirmez, ücretsiz)
    const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '',
      },
    }).catch(() => null)

    // Brave API başarısız olursa, alternatif metod (scraping yok, basit API)
    if (!response || !response.ok) {
      return await searchWithDuckDuckGo(query)
    }

    const data = await response.json()
    return data.results?.slice(0, 3).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    })) || []
  } catch (error) {
    console.error('Web search hatası:', error.message)
    return []
  }
}

// DuckDuckGo üzerinden basit arama (API key gerektirmez)
async function searchWithDuckDuckGo(query) {
  try {
    // HTML scraping yerine, DuckDuckGo'nun JSON API'sini kullan
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_redirect=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) return []

    const data = await response.json()

    // DuckDuckGo sonuçlarını format et
    const results = []

    // Instant answers varsa ekle
    if (data.AbstractText) {
      results.push({
        title: data.Heading || 'Sonuç',
        snippet: data.AbstractText,
        url: data.AbstractURL || '',
      })
    }

    // Related topics ekle
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 2).forEach(topic => {
        if (topic.Text) {
          results.push({
            title: topic.Text.split('\n')[0] || 'Başlık yok',
            snippet: topic.Text.replace(/\n/g, ' ').substring(0, 200),
            url: topic.FirstURL || '',
          })
        }
      })
    }

    return results.slice(0, 3)
  } catch (error) {
    console.error('DuckDuckGo arama hatası:', error.message)
    return []
  }
}

// Sorunun cevabını web araması ile zenginleştir
export const enrichAnswerWithWebSearch = async (question, topic) => {
  try {
    const searchQuery = `${topic} ${question}`.substring(0, 100)
    const results = await searchWeb(searchQuery)

    if (results.length === 0) return ''

    let enrichedInfo = '\n\n📚 WEB KAYNAKLAR:\n'
    results.forEach((result, i) => {
      enrichedInfo += `${i + 1}. ${result.title}\n`
      if (result.snippet) {
        enrichedInfo += `   ${result.snippet.substring(0, 150)}...\n`
      }
    })

    return enrichedInfo
  } catch (error) {
    console.error('Web enrichment hatası:', error.message)
    return ''
  }
}
