import React, { useState, useEffect } from 'react';

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrls, setShortUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [totalClicks, setTotalClicks] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('shortUrls');
    if (saved) {
      const urls = JSON.parse(saved);
      setShortUrls(urls);
      setTotalClicks(urls.reduce((sum, url) => sum + url.clicks, 0));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shortUrls', JSON.stringify(shortUrls));
    setTotalClicks(shortUrls.reduce((sum, url) => sum + url.clicks, 0));
  }, [shortUrls]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!originalUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    let urlToProcess = originalUrl.trim();
    if (!urlToProcess.startsWith('http://') && !urlToProcess.startsWith('https://')) {
      urlToProcess = 'https://' + urlToProcess;
    }

    if (!isValidUrl(urlToProcess)) {
      alert('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        url: urlToProcess,
        validity: validityMinutes || 30
      };

      if (customCode.trim()) {
        payload.shortcode = customCode.trim();
      }

      const response = await fetch('http://localhost:3000/shorturls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data = await response.json();

      const newShortUrl = {
        id: Date.now(),
        original: urlToProcess,
        short: data.shortLink,
        expiry: data.expiry,
        clicks: 0,
        created: new Date().toLocaleDateString(),
        isCustom: !!customCode.trim()
      };

      setShortUrls(prev => [newShortUrl, ...prev]);
      setOriginalUrl('');
      setCustomCode('');
      setShowCustom(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
      .then(() => setCopySuccess('Copied to clipboard!'))
      .catch(() => setCopySuccess('Failed to copy!'));

    setTimeout(() => setCopySuccess(''), 2000); // hide after 2s
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to delete all URLs?')) {
      setShortUrls([]);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(shortUrls, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shortened-urls.json';
    link.click();
  };

  const filteredUrls = shortUrls
    .filter(url =>
      url.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.short.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.timestamp - b.timestamp;
        case 'clicks': return b.clicks - a.clicks;
        case 'alphabetical': return a.original.localeCompare(b.original);
        default: return b.timestamp - a.timestamp;
      }
    });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔗 URL Shortener</h1>

        <div style={styles.inputSection}>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter your long URL here..."
            style={styles.input}
          />

          <button onClick={() => setShowCustom(!showCustom)} style={styles.customButton}>⚙️</button>

          {showCustom && (
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="Custom code (optional)"
              style={styles.customInput}
              maxLength="10"
            />
          )}

          <input
            type="number"
            value={validityMinutes}
            onChange={(e) => setValidityMinutes(e.target.value)}
            placeholder="Validity (minutes)"
            style={styles.validityInput}
          />

          <button onClick={handleShorten} disabled={isLoading} style={styles.button}>
            {isLoading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>

        {copySuccess && <p>{copySuccess}</p>}

        {shortUrls.length > 0 && (
          <div>
            <h3>Your Shortened URLs</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search..."
              style={styles.searchInput}
            />
            <button onClick={exportData} style={styles.exportButton}>Export</button>
            <button onClick={clearAll} style={styles.clearButton}>Clear All</button>

            {filteredUrls.map(url => (
              <div key={url.id} style={styles.urlCard}>
                <div>{url.original}</div>
                <a href={url.short} target="_blank" rel="noreferrer">{url.short}</a>
                <p>Expiry: {new Date(url.expiry).toLocaleString()}</p>
                <button onClick={() => handleCopy(url.short)}>Copy</button>
              </div>
            ))}

            {filteredUrls.length === 0 && searchTerm && (
              <p>No URLs found matching "{searchTerm}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '10px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '@media (min-width: 768px)': {
      padding: '20px'
    }
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    marginTop: '20px',
    '@media (min-width: 768px)': {
      padding: '40px',
      marginTop: '40px'
    }
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 8px 0',
    '@media (min-width: 768px)': {
      fontSize: '2.5rem'
    }
  },
  subtitle: {
    color: '#718096',
    fontSize: '1rem',
    margin: '0',
    '@media (min-width: 768px)': {
      fontSize: '1.1rem'
    }
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '24px',
    padding: '16px',
    background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
    borderRadius: '12px'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#667eea'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  inputSection: {
    marginBottom: '24px'
  },
  mainInput: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  input: {
    flex: '1',
    padding: '16px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  customButton: {
    padding: '16px',
    background: '#f7fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  customInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    marginBottom: '12px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '@media (min-width: 768px)': {
      width: 'auto'
    }
  },
  buttonDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed'
  },
  copyNotification: {
    background: '#48bb78',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '16px',
    fontWeight: '500'
  },
  resultsSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '24px'
  },
  controlsBar: {
    marginBottom: '16px'
  },
  resultsTitle: {
    fontSize: '1.3rem',
    color: '#2d3748',
    marginBottom: '16px',
    fontWeight: '600'
  },
  controls: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
    '@media (min-width: 768px)': {
      flexDirection: 'row'
    }
  },
  searchInput: {
    flex: '1',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem'
  },
  sortSelect: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'white'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  actionButtonDanger: {
    padding: '8px 16px',
    background: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  urlsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  urlCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    background: '#f7fafc',
    transition: 'all 0.2s ease'
  },
  urlInfo: {
    width: '100%'
  },
  shortUrlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  shortUrl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    color: '#667eea',
    flex: '1',
    minWidth: '0'
  },
  customBadge: {
    background: '#ed8936',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500'
  },
  urlActions: {
    display: 'flex',
    gap: '4px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background 0.2s ease'
  },
  iconButtonDanger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background 0.2s ease'
  },
  originalUrl: {
    color: '#718096',
    fontSize: '0.9rem',
    marginBottom: '8px',
    wordBreak: 'break-all'
  },
  urlMeta: {
    color: '#a0aec0',
    fontSize: '0.8rem'
  },
  noResults: {
    textAlign: 'center',
    color: '#718096',
    padding: '20px',
    fontStyle: 'italic'
  },
  emptyState: {
    textAlign: 'center',
    color: '#718096',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px'
  }
};